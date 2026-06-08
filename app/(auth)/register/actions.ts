'use server'

import { prisma } from '@/lib/prisma'

export async function createOrgAndUser({
  supabaseId,
  email,
  firstName,
  lastName,
  orgName,
  sector,
}: {
  supabaseId: string
  email: string
  firstName: string
  lastName: string
  orgName: string
  sector: string
}) {
  const org = await prisma.organisation.create({
    data: {
      name: orgName,
      sector,
      planTier: 'DEMO',
      users: {
        create: {
          supabaseId,
          email,
          firstName,
          lastName,
          role: 'BUYER_ADMIN',
        },
      },
    },
  })
  return org
}
