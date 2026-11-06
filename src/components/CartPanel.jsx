import { Receipt, ShoppingBag } from 'lucide-react'
import CartItem from './CartItem'
import { formatRupiah } from '../lib/format'
import { inputClass, primaryButtonClass } from '../lib/styles'

function SummaryRow({ label, value, emphasis = false }) {
  return (
    <div className={`flex items-center justify-between ${emphasis ? 'text-base font-semibold text-stone-900' : 'text-sm text-stone-600'}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}

function CartPanel({
  cartRows,
  totals,
  customerName,
  onCustomerNameChange,
  discount,
  onDiscountChange,
  onIncrement,
  onDecrement,
  onRemove,
  onProcess,
  isProcessing,
  error,
}) {
  const itemCount = cartRows.reduce((sum, row) => sum + row.qty, 0)

  return (
    <div className="flex flex-col rounded-2xl border border-stone-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
        <h2 className="flex items-center gap-2 font-semibold text-stone-800">
          <Receipt size={18} className="text-primary-700" />
          Detail Transaksi
        </h2>
        <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-800">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </span>
      </div>

      <div className="border-b border-stone-100 px-5 py-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-stone-700">
          Nama Pelanggan / Catatan
          <input
            type="text"
            value={customerName}
            onChange={(event) => onCustomerNameChange(event.target.value)}
            placeholder="Umum / Guest"
            className={inputClass}
          />
        </label>
      </div>

      <div className="max-h-72 min-h-24 overflow-y-auto px-5">
        {cartRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-stone-400">
            <ShoppingBag size={32} strokeWidth={1.5} />
            <p className="text-sm">Belum ada item. Tambahkan produk ke keranjang.</p>
          </div>
        ) : (
          <ul className="divide-y divide-stone-100">
            {cartRows.map((row) => (
              <CartItem
                key={row.productId}
                item={row}
                maxQty={row.stock}
                onIncrement={onIncrement}
                onDecrement={onDecrement}
                onRemove={onRemove}
              />
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-3 border-t border-stone-100 px-5 py-4">
        <label className="flex items-center justify-between gap-3 text-sm font-medium text-stone-700">
          Potongan / Diskon (Rp)
          <input
            type="number"
            min="0"
            inputMode="numeric"
            value={discount}
            onChange={(event) => onDiscountChange(event.target.value)}
            placeholder="0"
            className={`${inputClass} max-w-40 text-right`}
          />
        </label>
        <SummaryRow label="Subtotal" value={formatRupiah(totals.subtotal)} />
        {totals.discount > 0 && (
          <SummaryRow label="Diskon" value={`- ${formatRupiah(totals.discount)}`} />
        )}
        <div className="border-t border-dashed border-stone-200 pt-3">
          <SummaryRow label="Total" value={formatRupiah(totals.total)} emphasis />
        </div>
      </div>

      <div className="space-y-3 px-5 pb-5">
        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={onProcess}
          disabled={cartRows.length === 0 || isProcessing}
          className={`${primaryButtonClass} w-full py-3.5 text-base`}
        >
          {isProcessing ? 'Memproses...' : 'Simpan Transaksi'}
        </button>
      </div>
    </div>
  )
}

export default CartPanel
