import { useState } from 'react'
import { Minus, Plus, Trash2 } from 'lucide-react'
import Modal from './Modal'
import { formatRupiah } from '../lib/format'
import { inputClass, primaryButtonClass, secondaryButtonClass } from '../lib/styles'
import { updateSale } from '../services/salesService'

function EditSaleModal({ sale, onClose, onSuccess }) {
  const [customerName, setCustomerName] = useState(sale?.customerName ?? '')
  const [discount, setDiscount] = useState(sale?.discount ? String(sale.discount) : '')
  const [items, setItems] = useState(() => (sale?.items ?? []).map((it) => ({ ...it })))
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0)
  const appliedDiscount = Math.min(Math.max(0, Math.round(Number(discount) || 0)), subtotal)
  const total = subtotal - appliedDiscount

  function handleQtyChange(index, delta) {
    setItems((prev) => {
      const next = [...prev]
      const current = next[index]
      const newQty = current.qty + delta
      if (newQty < 1) return prev
      next[index] = { ...current, qty: newQty }
      return next
    })
  }

  function handleRemoveItem(index) {
    if (items.length <= 1) {
      setError('Transaksi minimal harus memiliki 1 produk.')
      return
    }
    setItems((prev) => prev.filter((_, idx) => idx !== index))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (items.length === 0) {
      return setError('Transaksi harus memiliki minimal 1 produk.')
    }

    setIsSaving(true)
    setError('')
    try {
      await updateSale(sale.id, {
        customerName,
        discount,
        items,
        originalItems: sale.items,
      })
      onSuccess?.('Transaksi berhasil diperbarui.')
      onClose()
    } catch (err) {
      setError(err.message || 'Gagal memperbarui transaksi. Silakan coba lagi.')
      setIsSaving(false)
    }
  }

  return (
    <Modal title="Edit Transaksi Penjualan" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-stone-700">
          Nama Pelanggan / Catatan
          <input
            type="text"
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            placeholder="Umum / Guest"
            className={inputClass}
          />
        </label>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-stone-700">
            Daftar Produk yang Dibeli
          </label>
          <div className="max-h-56 space-y-2 overflow-y-auto rounded-xl border border-stone-200 p-2.5">
            {items.map((item, idx) => (
              <div
                key={item.productId || idx}
                className="flex items-center justify-between gap-2 rounded-lg bg-stone-50 p-2 text-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-stone-800">{item.name}</p>
                  <p className="text-xs text-stone-500">{formatRupiah(item.price)}</p>
                </div>
                <div className="flex items-center rounded-lg border border-stone-200 bg-white">
                  <button
                    type="button"
                    onClick={() => handleQtyChange(idx, -1)}
                    disabled={item.qty <= 1}
                    className="p-1 text-stone-600 transition hover:text-stone-900 disabled:opacity-40"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-7 text-center text-xs font-semibold">{item.qty}</span>
                  <button
                    type="button"
                    onClick={() => handleQtyChange(idx, 1)}
                    className="p-1 text-stone-600 transition hover:text-stone-900"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <span className="w-20 text-right text-xs font-semibold text-stone-800">
                  {formatRupiah(item.price * item.qty)}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(idx)}
                  disabled={items.length <= 1}
                  className="rounded p-1 text-stone-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                  title="Hapus produk dari pesanan"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3.5 space-y-2.5">
          <label className="flex items-center justify-between gap-3 text-sm font-medium text-stone-700">
            Potongan / Diskon (Rp)
            <input
              type="number"
              min="0"
              value={discount}
              onChange={(event) => setDiscount(event.target.value)}
              placeholder="0"
              className={`${inputClass} max-w-36 text-right py-1.5`}
            />
          </label>
          <div className="flex justify-between text-xs text-stone-600">
            <span>Subtotal</span>
            <span>{formatRupiah(subtotal)}</span>
          </div>
          {appliedDiscount > 0 && (
            <div className="flex justify-between text-xs text-amber-700 font-medium">
              <span>Diskon</span>
              <span>- {formatRupiah(appliedDiscount)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-dashed border-stone-200 pt-2 text-sm font-semibold text-stone-900">
            <span>Total Akhir</span>
            <span className="text-primary-800">{formatRupiah(total)}</span>
          </div>
        </div>

        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className={secondaryButtonClass}>
            Batal
          </button>
          <button type="submit" disabled={isSaving} className={primaryButtonClass}>
            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default EditSaleModal

