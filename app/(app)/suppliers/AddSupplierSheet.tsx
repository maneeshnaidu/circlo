'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X, Plus } from 'lucide-react'

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

const COUNTRIES = [
  { value: 'NZ', label: 'New Zealand' },
  { value: 'AU', label: 'Australia' },
]

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  contactEmail: z.string().email('Valid email required'),
  contactName: z.string().optional(),
  sector: z.string().min(1, 'Sector is required'),
  country: z.string().default('NZ'),
})

type SupplierForm = z.infer<typeof schema>

export function AddSupplierSheet() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SupplierForm>({ resolver: zodResolver(schema), defaultValues: { country: 'NZ' } })

  const addTag = () => {
    const t = tagInput.trim()
    if (t && !tags.includes(t)) setTags([...tags, t])
    setTagInput('')
  }

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag))

  const onSubmit = async (data: SupplierForm) => {
    setError(null)
    const res = await fetch('/api/suppliers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, tags }),
    })
    if (!res.ok) {
      setError('Failed to add supplier. Please try again.')
      return
    }
    reset()
    setTags([])
    setOpen(false)
    router.refresh()
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button style={{ backgroundColor: '#1D9E75' }}>
          <Plus className="h-4 w-4 mr-2" />
          Add supplier
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add supplier</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Supplier name *</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactEmail">Contact email *</Label>
            <Input id="contactEmail" type="email" {...register('contactEmail')} />
            {errors.contactEmail && (
              <p className="text-sm text-red-600">{errors.contactEmail.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactName">Contact name</Label>
            <Input id="contactName" {...register('contactName')} />
          </div>

          <div className="space-y-2">
            <Label>Sector *</Label>
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
            <Label>Country</Label>
            <Select defaultValue="NZ" onValueChange={(v) => setValue('country', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTag()
                  }
                }}
                placeholder="Type and press Enter"
              />
              <Button type="button" variant="outline" onClick={addTag}>Add</Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full" disabled={isSubmitting} style={{ backgroundColor: '#1D9E75' }}>
              {isSubmitting ? 'Adding…' : 'Add supplier'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
