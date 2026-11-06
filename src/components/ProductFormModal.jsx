import { useState } from 'react'
import Modal from './Modal'
import { CATEGORIES } from '../lib/constants'
import { inputClass, primaryButtonClass, secondaryButtonClass } from '../lib/styles'
import { saveProduct } from '../services/productService'

const isFilled = (value) => value !== '' && Number.isFinite(Number(value))

function ProductFormModal({ product, onClose }) {
  const [name, setName] = useState(product?.name ?? '')
  const [category, setCategory] = useState(product?.category ?? CATEGORIES[0])
  const [stock, setStock] = useState(product?.stock ?? '')
  const [buyPrice, setBuyPrice] = useState(product?.buyPrice ?? '')
  const [sellPrice, setSellPrice] = useState(product?.sellPrice ?? '')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const values = {
      name: name.trim(),
      category,
      stock: Number(stock),
      buyPrice: Number(buyPrice),
      sellPrice: Number(sellPrice),
    }

    if (!values.name) return setError('Product name is required.')
    if (!isFilled(stock) || !Number.isInteger(values.stock) || values.stock < 0) {
      return setError('Stock must be a whole number, 0 or more.')
    }
    if (!isFilled(buyPrice) || values.buyPrice < 0) return setError('Buy price must be 0 or more.')
    if (!isFilled(sellPrice) || values.sellPrice < 0) return setError('Sell price must be 0 or more.')

    setIsSaving(true)
    setError('')
    try {
      await saveProduct(product?.id, values)
      onClose()
    } catch {
      setError('Could not save the product. Please try again.')
      setIsSaving(false)
    }
  }

  return (
    <Modal title={product ? 'Edit Product' : 'Add Product'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-stone-700">
          Product name
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Iced Latte"
            className={inputClass}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-stone-700">
            Category
            <select value={category} onChange={(event) => setCategory(event.target.value)} className={inputClass}>
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-stone-700">
            Stock quantity
            <input
              type="number"
              min="0"
              step="1"
              value={stock}
              onChange={(event) => setStock(event.target.value)}
              className={inputClass}
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-stone-700">
            Buy price (Harga Beli)
            <input
              type="number"
              min="0"
              step="100"
              value={buyPrice}
              onChange={(event) => setBuyPrice(event.target.value)}
              placeholder="Rp"
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-stone-700">
            Sell price (Harga Jual)
            <input
              type="number"
              min="0"
              step="100"
              value={sellPrice}
              onChange={(event) => setSellPrice(event.target.value)}
              placeholder="Rp"
              className={inputClass}
            />
          </label>
        </div>

        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className={secondaryButtonClass}>
            Cancel
          </button>
          <button type="submit" disabled={isSaving} className={primaryButtonClass}>
            {isSaving ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default ProductFormModal
