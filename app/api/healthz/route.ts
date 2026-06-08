import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const checks: Record<string, string> = {}

  checks.DATABASE_URL = process.env.DATABASE_URL ? 'set' : 'MISSING'
  checks.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'MISSING'
  checks.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'set' : 'MISSING'

  try {
    await prisma.$queryRaw`SELECT 1`
    checks.db = 'ok'
  } catch (err) {
    checks.db = `error: ${err instanceof Error ? err.message : String(err)}`
  }

  const ok = Object.values(checks).every((v) => v === 'set' || v === 'ok')
  return NextResponse.json(checks, { status: ok ? 200 : 500 })
}
