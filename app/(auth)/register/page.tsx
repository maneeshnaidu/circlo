'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { createOrgAndUser } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const SECTORS = [
  'Food & Beverage',
  'Construction',
  'Retail',
  'Manufacturing',
  'Logistics',
  'Agriculture',
  'Professional Services',
  'Other',
]

const schema = z
  .object({
    orgName: z.string().min(2, 'Organisation name is required'),
    sector: z.string().min(1, 'Please select a sector'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  })

type RegisterForm = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: RegisterForm) => {
    setError(null)
    const supabase = createClient()

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { firstName: data.firstName, lastName: data.lastName } },
    })

    if (signUpError || !authData.user) {
      setError(signUpError?.message ?? 'Registration failed')
      return
    }

    try {
      await createOrgAndUser({
        supabaseId: authData.user.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        orgName: data.orgName,
        sector: data.sector,
      })
    } catch {
      setError('Failed to create organisation. Please try again.')
      return
    }

    // Supabase may require email confirmation before a session is issued
    if (!authData.session) {
      setEmailSent(true)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  if (emailSent) {
    return (
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <span className="text-3xl font-bold" style={{ color: '#1D9E75' }}>circlo</span>
          </div>
          <CardTitle className="text-2xl">Check your email</CardTitle>
          <CardDescription>
            We sent a confirmation link to your email address. Click the link to activate your account and sign in.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Link href="/login" className="text-sm font-medium hover:underline" style={{ color: '#1D9E75' }}>
            Back to sign in
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <span className="text-3xl font-bold" style={{ color: '#1D9E75' }}>circlo</span>
        </div>
        <CardTitle className="text-2xl">Create your account</CardTitle>
        <CardDescription>Start your supplier circularity journey</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" {...register('firstName')} />
              {errors.firstName && <p className="text-sm text-red-600">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" {...register('lastName')} />
              {errors.lastName && <p className="text-sm text-red-600">{errors.lastName.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="orgName">Organisation name</Label>
            <Input id="orgName" placeholder="Acme Corp" {...register('orgName')} />
            {errors.orgName && <p className="text-sm text-red-600">{errors.orgName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Industry sector</Label>
            <Select onValueChange={(v) => setValue('sector', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a sector" />
              </SelectTrigger>
              <SelectContent>
                {SECTORS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.sector && <p className="text-sm text-red-600">{errors.sector.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Work email</Label>
            <Input id="email" type="email" placeholder="you@company.com" {...register('email')} />
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register('password')} />
            {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm password</Label>
            <Input id="confirm" type="password" {...register('confirm')} />
            {errors.confirm && <p className="text-sm text-red-600">{errors.confirm.message}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting} style={{ backgroundColor: '#1D9E75' }}>
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-medium hover:underline" style={{ color: '#1D9E75' }}>
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
