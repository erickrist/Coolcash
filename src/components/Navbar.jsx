import { LayoutDashboard } from 'lucide-react'

function Navbar({ items, activeKey, onNavigate }) {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <div className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-800 text-white">
            <LayoutDashboard size={18} />
          </span>
          <span className="text-lg font-semibold text-primary-900">Coolcash</span>
        </div>
        <nav className="flex min-w-0 flex-1 gap-1 overflow-x-auto">
          {items.map(({ key, label, icon: Icon }) => {
            const isActive = key === activeKey
            return (
              <button
                key={key}
                type="button"
                onClick={() => onNavigate(key)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? 'bg-primary-50 text-primary-800'
                    : 'text-stone-500 hover:bg-stone-100 hover:text-stone-800'
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            )
          })}
        </nav>
      </div>
    </header>
  )
}

export default Navbar
