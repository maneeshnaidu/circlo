import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { FileText } from 'lucide-react'

export default function ReportsPage() {
  return (
    <div>
      <PageHeader title="Reports" description="Download and share circularity reports" />
      <EmptyState
        icon={FileText}
        title="No reports available"
        description="Reports will be generated once you have supplier scores."
      />
    </div>
  )
}
