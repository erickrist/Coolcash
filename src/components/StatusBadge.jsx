const TONE_CLASSES = {
  available: 'bg-primary-50 text-primary-700 ring-primary-200',
  warning: 'bg-amber-50 text-amber-800 ring-amber-200',
  soldOut: 'bg-red-50 text-red-700 ring-red-200',
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${TONE_CLASSES[status.tone]}`}
    >
      {status.label}
    </span>
  )
}

export default StatusBadge
