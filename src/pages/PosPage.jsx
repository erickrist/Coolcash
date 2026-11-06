import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, PackageSearch, Search, Sparkles } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import CartPanel from '../components/CartPanel'
import FilterPill from '../components/FilterPill'
import { CATEGORIES } from '../lib/constants'
import { calculateTotals } from '../lib/pricing'
import { inputClass } from '../lib/styles'
import { seedDummyProducts, subscribeToProducts } from '../services/productService'
import { createSale } from '../services/salesService'

const ALL_CATEGORY = 'All'

function PosPage() {
  const [products, setProducts] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(ALL_CATEGORY)
  const [cart, setCart] = useState([])
  const [customerName, setCustomerName] = useState('')
  const [discount, setDiscount] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSeeding, setIsSeeding] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')
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

  const stockById = useMemo(
    () => Object.fromEntries((products ?? []).map((product) => [product.id, product.stock])),
    [products],
  )

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase()
    return (products ?? []).filter(
      (product) =>
        (category === ALL_CATEGORY || product.category === category) &&
        product.name.toLowerCase().includes(query),
    )
  }, [products, search, category])

  const cartRows = cart.map((line) => ({ ...line, stock: stockById[line.productId] ?? 0 }))
  const totals = calculateTotals(cart, discount)

  function addToCart(product) {
    setCart((previous) => {
      const existing = previous.find((line) => line.productId === product.id)
      if (!existing) {
        return [
          ...previous,
          {
            productId: product.id,
            name: product.name,
            price: product.sellPrice,
            buyPrice: product.buyPrice ?? 0,
            qty: 1,
          },
        ]
      }
      if (existing.qty >= product.stock) return previous
      return previous.map((line) =>
        line.productId === product.id ? { ...line, qty: line.qty + 1 } : line,
      )
    })
  }

  function adjustQuantity(productId, delta) {
    setCart((previous) =>
      previous.flatMap((line) => {
        if (line.productId !== productId) return [line]
        const qty = line.qty + delta
        if (qty <= 0) return []
        if (qty > (stockById[productId] ?? 0)) return [line]
        return [{ ...line, qty }]
      }),
    )
  }

  function removeFromCart(productId) {
    setCart((previous) => previous.filter((line) => line.productId !== productId))
  }

  async function handleSeedDummy() {
    setIsSeeding(true)
    setCheckoutError('')
    try {
      await seedDummyProducts()
      setNotice('10 produk contoh makanan & minuman berhasil ditambahkan!')
    } catch {
      setCheckoutError('Gagal memuat produk contoh. Silakan coba lagi.')
    } finally {
      setIsSeeding(false)
    }
  }

  async function handleProcessTransaction() {
    if (cart.length === 0 || isProcessing) return
    setIsProcessing(true)
    setCheckoutError('')
    try {
      await createSale({
        customerName: customerName.trim() || 'Guest',
        items: cart,
        ...calculateTotals(cart, discount),
      })
      setCart([])
      setCustomerName('')
      setDiscount('')
      setNotice('Transaksi berhasil dicatat ke riwayat.')
    } catch (error) {
      setCheckoutError(error.message || 'Gagal menyimpan transaksi. Silakan coba lagi.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="min-w-0 space-y-5">
          <div className="relative">
            <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products..."
              className={`${inputClass} py-3 pl-10`}
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {[ALL_CATEGORY, ...CATEGORIES].map((item) => (
              <FilterPill key={item} active={category === item} onClick={() => setCategory(item)}>
                {item === ALL_CATEGORY ? 'Show all' : item}
              </FilterPill>
            ))}
          </div>

          {loadError ? (
            <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {loadError}
            </p>
          ) : products === null ? (
            <p className="py-16 text-center text-sm text-stone-500">Loading products...</p>
          ) : visibleProducts.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-stone-300 bg-white py-16 px-4 text-center text-stone-500">
              <PackageSearch size={36} strokeWidth={1.5} />
              <p className="text-sm">
                {products.length === 0
                  ? 'Belum ada produk. Tambah manual di menu Product atau muat 10 contoh menu makanan & minuman.'
                  : 'Tidak ada produk yang cocok dengan pencarian Anda.'}
              </p>
              {products.length === 0 && (
                <button
                  type="button"
                  onClick={handleSeedDummy}
                  disabled={isSeeding}
                  className="mt-2 inline-flex items-center gap-2 rounded-xl bg-primary-800 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 disabled:bg-primary-300"
                >
                  <Sparkles size={16} />
                  {isSeeding ? 'Memuat Data Dummy...' : 'Muat 10 Menu Contoh (Dummy)'}
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {visibleProducts.map((product) => (
                <ProductCard key={product.id} product={product} onAdd={addToCart} />
              ))}
            </div>
          )}
        </section>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <CartPanel
            cartRows={cartRows}
            totals={totals}
            customerName={customerName}
            onCustomerNameChange={setCustomerName}
            discount={discount}
            onDiscountChange={setDiscount}
            onIncrement={(productId) => adjustQuantity(productId, 1)}
            onDecrement={(productId) => adjustQuantity(productId, -1)}
            onRemove={removeFromCart}
            onProcess={handleProcessTransaction}
            isProcessing={isProcessing}
            error={checkoutError}
          />
        </aside>
      </div>

      {notice && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 flex animate-fade-in-up items-center gap-2.5 rounded-xl bg-primary-800 px-4 py-3 text-sm font-medium text-white shadow-lg"
        >
          <CheckCircle2 size={18} />
          {notice}
        </div>
      )}
    </>
  )
}

export default PosPage
