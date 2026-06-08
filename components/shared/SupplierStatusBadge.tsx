import { cn } from '@/lib/utils'

type SupplierStatus = 'PENDING' | 'SENT' | 'OPENED' | 'IN_PROGRESS' | 'COMPLETED'

const STATUS_STYLES: Record<SupplierStatus, string> = {
  PENDING: 'bg-gray-100 text-gray-600 border-gray-200',
  SENT: 'bg-blue-100 text-blue-700 border-blue-200',
  OPENED: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  IN_PROGRESS: 'bg-purple-100 text-purple-700 border-purple-200',
  COMPLETED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
}

const STATUS_LABEL: Record<SupplierStatus, string> = {
  PENDING: 'Pending',
  SENT: 'Sent',
  OPENED: 'Opened',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
}

interface Props {
  status: SupplierStatus
}

export function SupplierStatusBadge({ status }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        STATUS_STYLES[status]
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  )
}
