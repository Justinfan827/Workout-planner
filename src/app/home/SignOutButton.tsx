'use client'
import { Icons } from '@/components/Icons'
import { Button, buttonVariants } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useSupabase } from '@/lib/supabase/SupabaseProvider'
import { VariantProps } from 'class-variance-authority'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

export interface SignOutButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export default function SignOutButton({
  className,
  variant = 'ghost',
}: SignOutButtonProps) {
  const [isLoading, setLoading] = useState(false)
  const router = useRouter()
  const { supabase, session } = useSupabase()
  const { toast } = useToast()
  if (!session) return null
  const handleOnClick = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast({
        variant: 'destructive',
        description: error.message,
      })
    }
    router.push('/')
  }
  return (
    <Button className={className} variant={variant} onClick={handleOnClick}>
      {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
      Sign out
    </Button>
  )
}
