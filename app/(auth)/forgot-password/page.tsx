'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const schema = z.object({ email: z.string().email('Please enter a valid email') })
type Form = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: Form) => {
    const supabase = createClient()
    await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
    })
    setSuccess(true)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <span className="text-3xl font-bold" style={{ color: '#1D9E75' }}>circlo</span>
        </div>
        <CardTitle className="text-2xl">Reset your password</CardTitle>
        <CardDescription>We&apos;ll send you a link to reset your password</CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="space-y-4">
            <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
              Check your email — we sent a password reset link.
            </div>
            <Link href="/login">
              <Button variant="outline" className="w-full">Back to login</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@company.com" {...register('email')} />
              {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting} style={{ backgroundColor: '#1D9E75' }}>
              {isSubmitting ? 'Sending…' : 'Send reset link'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              <Link href="/login" className="hover:underline">Back to login</Link>
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
