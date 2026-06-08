import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { CircloScoreBadge } from '@/components/shared/CircloScoreBadge'
import { SupplierStatusBadge } from '@/components/shared/SupplierStatusBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FileText } from 'lucide-react'

type SupplierStatus = 'PENDING' | 'SENT' | 'OPENED' | 'IN_PROGRESS' | 'COMPLETED'
type ScoreBand = 'DEVELOPING' | 'PROGRESSING' | 'ADVANCING' | 'LEADING'

interface CampaignSupplierRow {
  id: string
  status: SupplierStatus
  sentAt: Date | null
  completedAt: Date | null
  campaign: { name: string }
  response: {
    score: {
      overallScore: { toString(): string } | string | number
      band: ScoreBand
    } | null
  } | null
  documents: { id: string; fileName: string }[]
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function SupplierDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } })
  if (!dbUser) redirect('/login')

  const supplier = await prisma.supplier.findFirst({
    where: { id, organisationId: dbUser.organisationId },
    include: {
      campaignSuppliers: {
        orderBy: { sentAt: 'desc' },
        include: {
          campaign: true,
          response: { include: { score: true } },
          documents: true,
        },
      },
    },
  })

  if (!supplier) notFound()

  const latestCS = supplier.campaignSuppliers[0]
  const latestScore = latestCS?.response?.score

  return (
    <div>
      <PageHeader title={supplier.name} description={supplier.sector} />

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Supplier info</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Contact email</p>
                <p className="font-medium">{supplier.contactEmail}</p>
              </div>
              {supplier.contactName && (
                <div>
                  <p className="text-muted-foreground">Contact name</p>
                  <p className="font-medium">{supplier.contactName}</p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground">Country</p>
                <p className="font-medium">{supplier.country}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Tags</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {supplier.tags.length > 0 ? (
                    supplier.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Campaign history</CardTitle>
            </CardHeader>
            <CardContent>
              {supplier.campaignSuppliers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No campaigns yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Completed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {supplier.campaignSuppliers.map((cs: CampaignSupplierRow) => (
                      <TableRow key={cs.id}>
                        <TableCell className="font-medium">{cs.campaign.name}</TableCell>
                        <TableCell>
                          <SupplierStatusBadge status={cs.status} />
                        </TableCell>
                        <TableCell>
                          {cs.response?.score ? (
                            <CircloScoreBadge
                              score={cs.response.score.overallScore.toString()}
                              band={cs.response.score.band}
                              size="sm"
                            />
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {cs.completedAt
                            ? new Date(cs.completedAt).toLocaleDateString('en-NZ')
                            : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current score</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              {latestScore ? (
                <CircloScoreBadge
                  score={latestScore.overallScore.toString()}
                  band={latestScore.band}
                  size="lg"
                />
              ) : (
                <p className="text-sm text-muted-foreground py-4">No score yet</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {latestCS?.documents.length ? (
                <ul className="space-y-2">
                  {latestCS.documents.map((doc: { id: string; fileName: string }) => (
                    <li key={doc.id} className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="truncate">{doc.fileName}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No documents uploaded</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
