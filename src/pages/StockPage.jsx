import { useEffect, useMemo, useState } from 'react'
import { PackagePlus } from 'lucide-react'
import StatusBadge from '../components/StatusBadge'
import { formatRupiah } from '../lib/format'
import { getStockStatus } from '../lib/productStatus'
import { inputClass, primaryButtonClass } from '../lib/styles'
import { subscribeToProducts } from '../services/productService'
import { restockProduct } from '../services/stockService'

function StockPage() {
  const [products, setProducts] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [productId, setProductId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unitCost, setUnitCost] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(
    () =>
      subscribeToProducts({
        onData: setProducts,
        onError: () => setLoadError('Could not load products. Please check your Firebase settings.'),
      }),
    [],
  )

  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(''), 3500)
    return () => clearTimeout(timer)
  }, [notice])

  const selectedProduct = useMemo(
    () => (products ?? []).find((product) => product.id === productId),
    [products, productId],
  )
  const totalCost = (Number(quantity) || 0) * (Number(unitCost) || 0)

  function handleProductChange(nextId) {
    setProductId(nextId)
    const product = (products ?? []).find((item) => item.id === nextId)
    setUnitCost(product ? String(product.buyPrice) : '')
  }

  async function handleRestock(event) {
    event.preventDefault()
    const quantityValue = Number(quantity)
    const unitCostValue = Number(unitCost)

    if (!selectedProduct) return setFormError('Please choose a product.')
    if (quantity === '' || !Number.isInteger(quantityValue) || quantityValue < 1) {
      return setFormError('Quantity must be a whole number greater than 0.')
    }
    if (unitCost === '' || !Number.isFinite(unitCostValue) || unitCostValue < 0) {
      return setFormError('Unit cost must be 0 or more.')
    }

    setIsSaving(true)
    setFormError('')
    try {
      await restockProduct({ product: selectedProduct, quantity: quantityValue, unitCost: unitCostValue })
      setNotice(`Added ${quantityValue} pcs to ${selectedProduct.name}.`)
      setProductId('')
      setQuantity('')
      setUnitCost('')
    } catch {
      setFormError('Could not add stock. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-stone-900">Stock</h1>
        <p className="text-sm text-stone-500">Add incoming stock and keep an eye on current levels.</p>
      </div>

      {loadError && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <form
          onSubmit={handleRestock}
          className="h-fit space-y-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
        >
          <h2 className="flex items-center gap-2 font-semibold text-stone-800">
            <PackagePlus size={18} className="text-primary-700" />
            Add Incoming Stock
          </h2>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-stone-700">
            Product
            <select
              value={productId}
              onChange={(event) => handleProductChange(event.target.value)}
              disabled={!products}
              className={inputClass}
            >
              <option value="">Select a product</option>
              {(products ?? []).map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-stone-700">
              Quantity
              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-stone-700">
              Unit cost (Rp)
              <input
                type="number"
                min="0"
                step="100"
                value={unitCost}
                onChange={(event) => setUnitCost(event.target.value)}
                className={inputClass}
              />
            </label>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-stone-50 px-4 py-3 text-sm">
            <span className="text-stone-600">Total cost</span>
            <span className="font-semibold text-stone-900">{formatRupiah(totalCost)}</span>
          </div>

          {formError && (
            <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              {formError}
            </p>
          )}
          {notice && (
            <p role="status" className="rounded-xl bg-primary-50 px-3.5 py-2.5 text-sm text-primary-800">
              {notice}
            </p>
          )}

          <button type="submit" disabled={isSaving || !products} className={`${primaryButtonClass} w-full`}>
            {isSaving ? 'Adding...' : 'Add Stock'}
          </button>
          <p className="text-xs text-stone-500">Stock purchases are also recorded as expenses when a cost is entered.</p>
        </form>

        <section className="min-w-0 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          <div className="border-b border-stone-100 px-5 py-4">
            <h2 className="font-semibold text-stone-800">Current Stock Levels</h2>
          </div>
          {products === null && !loadError ? (
            <p className="px-5 py-10 text-center text-sm text-stone-500">Loading...</p>
          ) : products?.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-stone-500">No products yet. Add products first.</p>
          ) : (
            <ul className="divide-y divide-stone-100">
              {(products ?? []).map((product) => (
                <li
                  key={product.id}
                  className={`flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-stone-50 ${
                    product.id === productId ? 'bg-primary-50/60' : ''
                  }`}
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-stone-800">{product.name}</p>
                    <p className="text-sm text-stone-500">{product.category}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-right text-sm tabular-nums text-stone-700">
                      <span className="text-lg font-semibold text-stone-900">{product.stock}</span> pcs
                    </span>
                    <StatusBadge status={getStockStatus(product.stock)} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}

export default StockPage
