import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Pencil, Plus, Search, Sparkles, Trash2 } from 'lucide-react'
import Modal from '../components/Modal'
import ProductFormModal from '../components/ProductFormModal'
import StatusBadge from '../components/StatusBadge'
import { formatRupiah } from '../lib/format'
import { getStockStatus } from '../lib/productStatus'
import { inputClass, primaryButtonClass, secondaryButtonClass } from '../lib/styles'
import { deleteProduct, seedDummyProducts, subscribeToProducts } from '../services/productService'

function ProductsPage() {
  const [products, setProducts] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [search, setSearch] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSeeding, setIsSeeding] = useState(false)
  const [actionError, setActionError] = useState('')
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

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase()
    return (products ?? []).filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query),
    )
  }, [products, search])

  function openCreateForm() {
    setEditingProduct(null)
    setIsFormOpen(true)
  }

  function openEditForm(product) {
    setEditingProduct(product)
    setIsFormOpen(true)
  }

  function closeForm() {
    setIsFormOpen(false)
    setEditingProduct(null)
  }

  async function handleSeedDummy() {
    setIsSeeding(true)
    setActionError('')
    try {
      await seedDummyProducts()
      setNotice('10 produk contoh makanan & minuman berhasil ditambahkan!')
    } catch {
      setActionError('Gagal memuat produk contoh. Pastikan koneksi dan pengaturan Firebase aktif.')
    } finally {
      setIsSeeding(false)
    }
  }

  async function confirmDelete() {
    setIsDeleting(true)
    setActionError('')
    try {
      await deleteProduct(deleteTarget.id)
      setDeleteTarget(null)
    } catch {
      setActionError('Could not delete the product. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Products</h1>
          <p className="text-sm text-stone-500">Kelola menu makanan & minuman, harga, dan stok.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {/* <button
            type="button"
            onClick={handleSeedDummy}
            disabled={isSeeding}
            className={secondaryButtonClass}
          >
            <Sparkles size={18} className="text-amber-500" />
            {isSeeding ? 'Memuat Contoh...' : 'Isi Contoh Produk (Dummy)'}
          </button> */}
          <button type="button" onClick={openCreateForm} className={primaryButtonClass}>
            <Plus size={18} />
            Add Product
          </button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name or category..."
          className={`${inputClass} py-2.5 pl-10`}
        />
      </div>

      {loadError ? (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </p>
      ) : products === null ? (
        <p className="py-16 text-center text-sm text-stone-500">Loading products...</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-stone-500">
              <tr>
                <th className="px-5 py-3 font-medium">Product Name</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 text-right font-medium">Stock</th>
                <th className="px-5 py-3 text-right font-medium">Buy Price</th>
                <th className="px-5 py-3 text-right font-medium">Sell Price</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {visibleProducts.map((product) => (
                <tr key={product.id} className="transition-colors hover:bg-stone-50">
                  <td className="px-5 py-3.5 font-medium text-stone-800">{product.name}</td>
                  <td className="px-5 py-3.5 text-stone-600">{product.category}</td>
                  <td className="px-5 py-3.5 text-right tabular-nums text-stone-700">{product.stock}</td>
                  <td className="px-5 py-3.5 text-right tabular-nums text-stone-700">{formatRupiah(product.buyPrice)}</td>
                  <td className="px-5 py-3.5 text-right tabular-nums text-stone-700">{formatRupiah(product.sellPrice)}</td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={getStockStatus(product.stock)} />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openEditForm(product)}
                        aria-label={`Edit ${product.name}`}
                        className="rounded-lg p-2 text-stone-500 transition hover:bg-primary-50 hover:text-primary-800"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(product)}
                        aria-label={`Delete ${product.name}`}
                        className="rounded-lg p-2 text-stone-500 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visibleProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-14 px-4 text-center">
              <p className="text-sm text-stone-500">
                {products.length === 0
                  ? 'Belum ada produk. Tambah manual atau muat 10 contoh menu makanan & minuman otomatis.'
                  : 'Tidak ada produk yang cocok dengan pencarian Anda.'}
              </p>
              {products.length === 0 && (
                <button
                  type="button"
                  onClick={handleSeedDummy}
                  disabled={isSeeding}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary-800 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700"
                >
                  <Sparkles size={16} />
                  {isSeeding ? 'Memuat Data...' : 'Muat 10 Produk Contoh (Dummy)'}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {isFormOpen && <ProductFormModal product={editingProduct} onClose={closeForm} />}

      {deleteTarget && (
        <Modal title="Delete Product" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm text-stone-600">
            Delete <span className="font-semibold text-stone-800">{deleteTarget.name}</span>? Past
            transactions will keep their records.
          </p>
          {actionError && (
            <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              {actionError}
            </p>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={() => setDeleteTarget(null)} className={secondaryButtonClass}>
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              disabled={isDeleting}
              className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 active:scale-[0.98] disabled:bg-red-300"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </Modal>
      )}

      {notice && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 flex animate-fade-in-up items-center gap-2.5 rounded-xl bg-primary-800 px-4 py-3 text-sm font-medium text-white shadow-lg"
        >
          <CheckCircle2 size={18} />
          {notice}
        </div>
      )}
    </div>
  )
}

export default ProductsPage
