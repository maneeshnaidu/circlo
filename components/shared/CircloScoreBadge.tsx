import { cn } from '@/lib/utils'

type ScoreBand = 'DEVELOPING' | 'PROGRESSING' | 'ADVANCING' | 'LEADING'

const BAND_STYLES: Record<ScoreBand, string> = {
  DEVELOPING: 'bg-red-100 text-red-700 border-red-200',
  PROGRESSING: 'bg-amber-100 text-amber-700 border-amber-200',
  ADVANCING: 'bg-blue-100 text-blue-700 border-blue-200',
  LEADING: 'bg-emerald-100 text-emerald-700 border-emerald-200',
}

const BAND_LABEL: Record<ScoreBand, string> = {
  DEVELOPING: 'Developing',
  PROGRESSING: 'Progressing',
  ADVANCING: 'Advancing',
  LEADING: 'Leading',
}

interface Props {
  score: number | string
  band: ScoreBand
  size?: 'sm' | 'md' | 'lg'
}

export function CircloScoreBadge({ score, band, size = 'md' }: Props) {
  const numericScore = typeof score === 'string' ? parseFloat(score) : score

  if (size === 'sm') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
          BAND_STYLES[band]
        )}
      >
        {numericScore.toFixed(0)}
        <span className="opacity-70">· {BAND_LABEL[band]}</span>
      </span>
    )
  }

  if (size === 'lg') {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-2xl border-2 p-6 gap-1',
          BAND_STYLES[band]
        )}
      >
        <span className="text-5xl font-bold">{numericScore.toFixed(0)}</span>
        <span className="text-sm font-medium">{BAND_LABEL[band]}</span>
      </div>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium',
        BAND_STYLES[band]
      )}
    >
      <span className="font-bold">{numericScore.toFixed(0)}</span>
      {BAND_LABEL[band]}
    </span>
  )
}
