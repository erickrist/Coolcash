function FilterPill({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition duration-200 active:scale-95 ${
        active
          ? 'border-primary-800 bg-primary-800 text-white'
          : 'border-stone-200 bg-white text-stone-600 hover:border-primary-400 hover:text-primary-800'
      }`}
    >
      {children}
    </button>
  )
}

export default FilterPill
