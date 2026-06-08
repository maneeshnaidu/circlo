'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Papa from 'papaparse'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Upload, Download, CheckCircle, XCircle } from 'lucide-react'

interface SupplierRow {
  name: string
  contactEmail: string
  contactName?: string
  sector: string
  country?: string
  tags?: string
}

interface ParsedRow extends SupplierRow {
  _errors?: string[]
}

const REQUIRED = ['name', 'contactEmail', 'sector'] as const

function validateRow(row: Record<string, string>): ParsedRow {
  const errors: string[] = []
  for (const field of REQUIRED) {
    if (!row[field]?.trim()) errors.push(`${field} is required`)
  }
  if (row.contactEmail && !/\S+@\S+\.\S+/.test(row.contactEmail)) {
    errors.push('contactEmail is invalid')
  }
  return {
    name: row.name ?? '',
    contactEmail: row.contactEmail ?? '',
    contactName: row.contactName,
    sector: row.sector ?? '',
    country: row.country || 'NZ',
    tags: row.tags,
    _errors: errors.length ? errors : undefined,
  }
}

const CSV_TEMPLATE = `name,contactEmail,contactName,sector,country,tags
Acme Packaging,supplier@acme.com,Jane Smith,Manufacturing,NZ,packaging;recycled
`

export default function ImportSuppliersPage() {
  const router = useRouter()
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const parsed = (result.data as Record<string, string>[])
          .slice(0, 5)
          .map(validateRow)
        setRows(parsed)
      },
    })
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file?.name.endsWith('.csv')) handleFile(file)
  }, [])

  const validRows = rows.filter((r) => !r._errors?.length)
  const invalidRows = rows.filter((r) => r._errors?.length)

  const handleImport = async () => {
    setImporting(true)
    let success = 0
    let failed = 0

    for (const row of validRows) {
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...row,
          tags: row.tags ? row.tags.split(';').map((t) => t.trim()) : [],
        }),
      })
      if (res.ok) success++
      else failed++
    }

    setImportResult({ success, failed })
    setImporting(false)
    if (success > 0) setTimeout(() => router.push('/suppliers'), 2000)
  }

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'circlo-suppliers-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-4xl">
      <PageHeader title="Import Suppliers" description="Bulk-add suppliers from a CSV file" />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Step 1 — Download the template</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download CSV template
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Step 2 — Upload your file</CardTitle>
          </CardHeader>
          <CardContent>
            <label
              className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                isDragging ? 'border-primary bg-accent' : 'border-border hover:bg-accent/50'
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
            >
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Drag & drop a CSV file here, or{' '}
                <span className="font-medium" style={{ color: '#1D9E75' }}>browse</span>
              </p>
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </label>
          </CardContent>
        </Card>

        {rows.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Step 3 — Preview ({rows.length} row{rows.length !== 1 ? 's' : ''} shown)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {invalidRows.length > 0 && (
                <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                  {invalidRows.length} row{invalidRows.length !== 1 ? 's' : ''} have validation errors and will be skipped.
                </div>
              )}

              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8"></TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Sector</TableHead>
                      <TableHead>Country</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row, i) => (
                      <TableRow key={i} className={row._errors?.length ? 'bg-red-50' : ''}>
                        <TableCell>
                          {row._errors?.length ? (
                            <XCircle className="h-4 w-4 text-red-500" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                          )}
                        </TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.contactEmail}</TableCell>
                        <TableCell>{row.sector}</TableCell>
                        <TableCell>{row.country}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {importResult ? (
                <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-700">
                  Imported {importResult.success} supplier{importResult.success !== 1 ? 's' : ''}.
                  {importResult.failed > 0 && ` ${importResult.failed} failed.`}
                </div>
              ) : (
                <Button
                  onClick={handleImport}
                  disabled={validRows.length === 0 || importing}
                  style={{ backgroundColor: '#1D9E75' }}
                >
                  {importing ? 'Importing…' : `Import ${validRows.length} supplier${validRows.length !== 1 ? 's' : ''}`}
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
