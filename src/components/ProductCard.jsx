import { Coffee, Cookie, Package, Plus, Utensils } from 'lucide-react'
import StatusBadge from './StatusBadge'
import { formatRupiah } from '../lib/format'
import { getStockStatus } from '../lib/productStatus'

const CATEGORY_ICONS = { Meals: Utensils, Drinks: Coffee, Snacks: Cookie }

function ProductCard({ product, onAdd }) {
  const Icon = CATEGORY_ICONS[product.category] ?? Package
  const isSoldOut = product.stock <= 0

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex h-32 items-center justify-center bg-primary-50 text-primary-600 transition-colors duration-300 group-hover:bg-primary-100">
        <Icon size={40} strokeWidth={1.5} />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-semibold leading-snug text-stone-800">{product.name}</h3>
            <p className="text-sm text-stone-500">{product.category}</p>
          </div>
          <StatusBadge status={getStockStatus(product.stock)} />
        </div>
        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="font-semibold text-primary-800">{formatRupiah(product.sellPrice)}</span>
          <button
            type="button"
            onClick={() => onAdd(product)}
            disabled={isSoldOut}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary-800 px-3 py-2 text-sm font-medium text-white transition duration-200 hover:bg-primary-700 active:scale-95 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500"
          >
            <Plus size={16} />
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  )
}

export default ProductCard
