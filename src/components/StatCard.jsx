function StatCard({ label, value, subtitle, icon: Icon, tone = 'neutral' }) {
  const toneClasses = {
    income: 'bg-primary-50 text-primary-700',
    outcome: 'bg-red-50 text-red-600',
    restock: 'bg-amber-50 text-amber-700',
    net: 'bg-emerald-50 text-emerald-700',
    neutral: 'bg-stone-100 text-stone-600',
  }

  return (
    <div className="group flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${toneClasses[tone] ?? toneClasses.neutral}`}>
        <Icon size={22} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-stone-500">{label}</p>
        <p className="truncate text-xl font-semibold text-stone-900">{value}</p>
        {subtitle && <p className="mt-0.5 truncate text-xs text-stone-400">{subtitle}</p>}
      </div>
    </div>
  )
}

export default StatCard
