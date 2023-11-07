'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import * as Sentry from '@sentry/nextjs'
import { isAuthApiError } from '@supabase/supabase-js'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'

import { Icons } from '@/components/Icons'
import { authSchema } from '@/components/forms/validations/schema'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { siteConfig } from '@/config/site'
import { DashboardAuthError } from '@/errors/errors'
import { useSupabase } from '@/lib/supabase/SupabaseProvider'
import { AuthMessageSignUpNotAllowed } from '@/lib/supabase/constants'

type Inputs = z.infer<typeof authSchema>

export function SignInForm() {
  const { toast } = useToast()
  const router = useRouter()
  const [isPending, setPending] = useState(false)
  const { supabase } = useSupabase()
  const searchParams = useSearchParams()
  const originalPath = searchParams.get('original_path') || ''

  const form = useForm<Inputs>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (data: Inputs) => {
    setPending(true)
    const authURL = siteConfig.auth.callbackURL({
      ...(originalPath && {
        query: new URLSearchParams({ original_path: originalPath }),
      }),
    })
    try {
      if (data.password) {
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        })

        if (error) {
          throw error
        }
        router.push('/home')
        return
      }
      const { error } = await supabase.auth.signInWithOtp({
        email: data.email,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: authURL,
        },
      })
      if (error) {
        throw error
      }
      toast({
        title: 'Check your email',
        description:
          'We sent you an email! Click the link there to sign in. You may close this tab.',
      })
    } catch (error) {
      if (error instanceof Error) {
        if (isAuthApiError(error)) {
          Sentry.captureException(
            new DashboardAuthError({
              message: error.message,
              options: {
                annotations: {
                  supabase_http_status: error.status,
                },
              },
            })
          )

          if (error.message === AuthMessageSignUpNotAllowed) {
            toast({
              variant: 'destructive',
              title: 'Invalid email',
              description: `This email does not have access yet. Please contact your administrator for access.`,
            })
          }
        } else {
          Sentry.captureException(error)
          toast({
            variant: 'destructive',
            title: 'Email sign in failed',
            description: `Something went wrong, please try again`,
          })
        }
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <Form {...form}>
      <form
        className="grid gap-4"
        onSubmit={(...args) => void form.handleSubmit(onSubmit)(...args)}
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* <FormField */}
        {/*   control={form.control} */}
        {/*   name="password" */}
        {/*   render={({ field }) => ( */}
        {/*     <FormItem> */}
        {/*       <FormLabel>Password</FormLabel> */}
        {/*       <FormControl> */}
        {/*         <PasswordInput placeholder="**********" {...field} /> */}
        {/*       </FormControl> */}
        {/*       <FormMessage /> */}
        {/*     </FormItem> */}
        {/*   )} */}
        {/* /> */}
        <Button disabled={isPending}>
          {isPending && (
            <Icons.spinner
              className="mr-2 h-4 w-4 animate-spin"
              aria-hidden="true"
            />
          )}
          Sign in
          <span className="sr-only hidden">Sign in</span>
        </Button>
      </form>
    </Form>
  )
}
