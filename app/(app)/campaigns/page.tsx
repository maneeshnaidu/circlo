import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'

export default function CampaignsPage() {
  return (
    <div>
      <PageHeader
        title="Campaigns"
        description="Dispatch questionnaires to your suppliers"
        actions={<Button style={{ backgroundColor: '#1D9E75' }}>New Campaign</Button>}
      />
      <EmptyState
        icon={Send}
        title="No campaigns yet"
        description="Create your first campaign to start collecting supplier circularity data."
        action={<Button style={{ backgroundColor: '#1D9E75' }}>Create campaign</Button>}
      />
    </div>
  )
}
