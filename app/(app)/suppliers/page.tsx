import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { AddSupplierSheet } from './AddSupplierSheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Building2, Upload } from 'lucide-react'

type ScoreBand = 'DEVELOPING' | 'PROGRESSING' | 'ADVANCING' | 'LEADING'

interface SupplierRow {
  id: string
  name: string
  contactName: string | null
  contactEmail: string
  sector: string
  country: string
  tags: string[]
  campaignSuppliers: Array<{
    response: {
      score: { overallScore: { toString(): string } | number; band: ScoreBand } | null
    } | null
  }>
}

export default async function SuppliersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } })
  if (!dbUser) redirect('/login')

  const suppliers = await prisma.supplier.findMany({
    where: { organisationId: dbUser.organisationId },
    include: {
      campaignSuppliers: {
        orderBy: { completedAt: 'desc' },
        take: 1,
        include: { response: { include: { score: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <PageHeader
        title="Suppliers"
        description="Manage your supplier network"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/suppliers/import">
                <Upload className="h-4 w-4 mr-2" />
                Import CSV
              </Link>
            </Button>
            <AddSupplierSheet />
          </div>
        }
      />

      {suppliers.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No suppliers yet"
          description="Add your first supplier manually or import a CSV file."
          action={<AddSupplierSheet />}
        />
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Latest score</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(suppliers as SupplierRow[]).map((supplier) => {
                const latestCS = supplier.campaignSuppliers[0]
                const score = latestCS?.response?.score

                return (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell>
                      <div>{supplier.contactName}</div>
                      <div className="text-xs text-muted-foreground">{supplier.contactEmail}</div>
                    </TableCell>
                    <TableCell>{supplier.sector}</TableCell>
                    <TableCell>{supplier.country}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {supplier.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {score ? (
                        <span className="text-sm font-medium">
                          {Number(score.overallScore).toFixed(0)} · {score.band}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/suppliers/${supplier.id}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
