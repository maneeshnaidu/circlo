import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

const supplierSchema = z.object({
  name: z.string().min(1),
  contactEmail: z.string().email(),
  contactName: z.string().optional(),
  sector: z.string().min(1),
  country: z.string().default('NZ'),
  tags: z.array(z.string()).default([]),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } })
  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const body = await request.json()
  const parsed = supplierSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const supplier = await prisma.supplier.create({
    data: {
      ...parsed.data,
      organisationId: dbUser.organisationId,
    },
  })

  revalidatePath('/suppliers')
  return NextResponse.json(supplier, { status: 201 })
}
