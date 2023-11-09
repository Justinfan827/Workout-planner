import { type Metadata } from 'next'

import { SignInForm } from '@/components/forms/signin-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthErrorCodeInvalidCodeExchange } from '@/lib/supabase/constants'
import { serverRedirectIfAuthorized } from '@/lib/supabase/serverComponentUtils'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your account',
}

type ErrorParams = {
  error: string
  error_code: string
  error_description: string
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams?: ErrorParams
}) {
  await serverRedirectIfAuthorized('/home')
  const signInError = searchParams?.error
  const signInErrMessage = () => {
    switch (signInError) {
      case AuthErrorCodeInvalidCodeExchange:
        return 'Please use the same browser to open the sign in link.'
      default:
        return 'Something went wrong. Please try again or reach out to support@getansa.com if your problem persists.'
    }
  }
  return (
    <div className='m-4'>
      <div className="space-y-4 text-center mx-auto max-w-[500px]">
      <h1 className='text-xl'>Welcome to the frontend template!</h1>
      <p className='text-lg'>This is a template for building frontend apps with Next.js, TailwindCSS, ShadCN UI components, and Supabase for auth</p>
        <Card className='text-left'>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Sign in</CardTitle>
            <CardDescription className={signInError ? 'text-destructive' : ''}>
              {signInError
                ? signInErrMessage()
                : 'Enter your email below to sign in to your account.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <SignInForm />
          </CardContent>
          <CardFooter className="flex flex-col flex-wrap items-center justify-center space-x-2 sm:flex-row"></CardFooter>
        </Card>
      </div>
    </div>
  )
}
