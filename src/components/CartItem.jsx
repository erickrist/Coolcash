import { Minus, Plus, Trash2 } from 'lucide-react'
import { formatRupiah } from '../lib/format'

function CartItem({ item, maxQty, onIncrement, onDecrement, onRemove }) {
  return (
    <li className="flex items-center gap-3 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-stone-800">{item.name}</p>
        <p className="text-sm text-stone-500">{formatRupiah(item.price)}</p>
      </div>
      <div className="flex items-center rounded-lg border border-stone-200 bg-white">
        <button
          type="button"
          onClick={() => onDecrement(item.productId)}
          disabled={item.qty <= 1}
          aria-label="Decrease quantity"
          className="p-1.5 text-stone-600 transition hover:text-primary-800 disabled:cursor-not-allowed disabled:text-stone-300"
        >
          <Minus size={14} />
        </button>
        <span className="w-7 text-center text-sm font-semibold text-stone-800">{item.qty}</span>
        <button
          type="button"
          onClick={() => onIncrement(item.productId)}
          disabled={item.qty >= maxQty}
          aria-label="Increase quantity"
          className="p-1.5 text-stone-600 transition hover:text-primary-800 disabled:cursor-not-allowed disabled:text-stone-300"
        >
          <Plus size={14} />
        </button>
      </div>
      <p className="w-24 text-right text-sm font-semibold text-stone-800">
        {formatRupiah(item.price * item.qty)}
      </p>
      <button
        type="button"
        onClick={() => onRemove(item.productId)}
        aria-label="Remove item"
        className="rounded-lg p-1.5 text-stone-400 transition hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 size={16} />
      </button>
    </li>
  )
}

export default CartItem
