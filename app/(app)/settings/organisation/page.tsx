import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function OrganisationSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    include: { organisation: true },
  })
  if (!dbUser) redirect('/login')

  const { organisation } = dbUser

  return (
    <div>
      <PageHeader title="Organisation Settings" />
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Organisation Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Name</p>
              <p className="font-medium">{organisation.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Sector</p>
              <p className="font-medium">{organisation.sector}</p>
            </div>
            {organisation.abn && (
              <div>
                <p className="text-muted-foreground">ABN</p>
                <p className="font-medium">{organisation.abn}</p>
              </div>
            )}
            {organisation.nzbn && (
              <div>
                <p className="text-muted-foreground">NZBN</p>
                <p className="font-medium">{organisation.nzbn}</p>
              </div>
            )}
            <div>
              <p className="text-muted-foreground">Plan</p>
              <p className="font-medium capitalize">{organisation.planTier.toLowerCase()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
