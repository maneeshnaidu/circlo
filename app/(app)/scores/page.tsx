import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { BarChart3 } from 'lucide-react'

export default function ScoresPage() {
  return (
    <div>
      <PageHeader title="Scores" description="Circularity scores across your supplier base" />
      <EmptyState
        icon={BarChart3}
        title="No scores yet"
        description="Scores appear here once suppliers complete their assessments."
      />
    </div>
  )
}
