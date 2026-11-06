import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, Pencil, Trash2 } from 'lucide-react'
import FilterPill from '../components/FilterPill'
import Modal from '../components/Modal'
import EditSaleModal from '../components/EditSaleModal'
import ExpenseFormModal from '../components/ExpenseFormModal'
import { formatDateTime, formatRupiah } from '../lib/format'
import { secondaryButtonClass } from '../lib/styles'
import { clearAllExpenses, deleteExpense, subscribeToExpenses } from '../services/expenseService'
import { clearAllSales, deleteSale, subscribeToSales } from '../services/salesService'
import { clearAllStockIn, deleteStockIn, subscribeToStockIn } from '../services/stockService'

const HISTORY_TABS = [
  {
    key: 'sales',
    label: 'Purchases (Penjualan)',
    subscribe: subscribeToSales,
    emptyText: 'Belum ada transaksi penjualan yang tercatat.',
    deleteHandler: deleteSale,
    clearHandler: clearAllSales,
    columns: [
      { header: 'Date', render: (row) => formatDateTime(row.createdAt) },
      { header: 'Customer', render: (row) => row.customerName || 'Umum' },
      {
        header: 'Items',
        render: (row) => (row.items ?? []).map((item) => `${item.name} x${item.qty}`).join(', '),
      },
      { header: 'Diskon', render: (row) => (row.discount ? formatRupiah(row.discount) : '-'), align: 'right' },
      { header: 'Total', render: (row) => formatRupiah(row.total), align: 'right' },
    ],
  },
  {
    key: 'stockIn',
    label: 'Incoming Stock (Stock Masuk)',
    subscribe: subscribeToStockIn,
    emptyText: 'Belum ada riwayat penambahan stok.',
    deleteHandler: (row) => deleteStockIn(row.id),
    clearHandler: clearAllStockIn,
    columns: [
      { header: 'Date', render: (row) => formatDateTime(row.createdAt) },
      { header: 'Product', render: (row) => row.productName },
      { header: 'Quantity', render: (row) => `${row.quantity} pcs`, align: 'right' },
      { header: 'Unit Cost', render: (row) => formatRupiah(row.unitCost), align: 'right' },
      { header: 'Total Cost', render: (row) => formatRupiah(row.totalCost), align: 'right' },
    ],
  },
  {
    key: 'expenses',
    label: 'Expenses (Pengeluaran)',
    subscribe: subscribeToExpenses,
    emptyText: 'Belum ada catatan pengeluaran.',
    deleteHandler: (row) => deleteExpense(row.id),
    clearHandler: clearAllExpenses,
    columns: [
      { header: 'Date', render: (row) => formatDateTime(row.createdAt) },
      { header: 'Category', render: (row) => row.category },
      { header: 'Description', render: (row) => row.description },
      { header: 'Amount', render: (row) => formatRupiah(row.amount), align: 'right' },
    ],
  },
]

function HistoryPage() {
  const [activeKey, setActiveKey] = useState(HISTORY_TABS[0].key)
  const [rows, setRows] = useState(null)
  const [loadError, setLoadError] = useState('')
  const tab = HISTORY_TABS.find((item) => item.key === activeKey)

  const [editingSale, setEditingSale] = useState(null)
  const [editingExpense, setEditingExpense] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [restoreStockOnDelete, setRestoreStockOnDelete] = useState(true)

  const [isClearAllOpen, setIsClearAllOpen] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [restoreStockOnClear, setRestoreStockOnClear] = useState(true)

  const [actionError, setActionError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    setRows(null)
    setLoadError('')
    return tab.subscribe({
      onData: setRows,
      onError: () => setLoadError('Could not load history. Please check your Firebase settings.'),
    })
  }, [tab])

  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(''), 3500)
    return () => clearTimeout(timer)
  }, [notice])

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    setActionError('')
    try {
      if (deleteTarget.type === 'sales') {
        await deleteSale(deleteTarget.data, restoreStockOnDelete)
        setNotice('Transaksi penjualan berhasil dihapus.')
      } else if (deleteTarget.type === 'expenses') {
        await deleteExpense(deleteTarget.data.id)
        setNotice('Catatan pengeluaran berhasil dihapus.')
      } else if (deleteTarget.type === 'stockIn') {
        await deleteStockIn(deleteTarget.data.id)
        setNotice('Catatan stok masuk berhasil dihapus.')
      }
      setDeleteTarget(null)
    } catch (err) {
      setActionError(err.message || 'Gagal menghapus data. Silakan coba lagi.')
    } finally {
      setIsDeleting(false)
    }
  }

  async function handleConfirmClearAll() {
    setIsClearing(true)
    setActionError('')
    try {
      if (activeKey === 'sales') {
        await clearAllSales(restoreStockOnClear)
        setNotice('Seluruh riwayat transaksi penjualan berhasil dikosongkan.')
      } else if (activeKey === 'expenses') {
        await clearAllExpenses()
        setNotice('Seluruh catatan pengeluaran berhasil dikosongkan.')
      } else if (activeKey === 'stockIn') {
        await clearAllStockIn()
        setNotice('Seluruh riwayat stok masuk berhasil dikosongkan.')
      }
      setIsClearAllOpen(false)
    } catch (err) {
      setActionError(err.message || 'Gagal mengosongkan riwayat. Silakan coba lagi.')
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">History</h1>
          <p className="text-sm text-stone-500">Catatan riwayat transaksi penjualan, stok masuk, dan pengeluaran.</p>
        </div>
        {/* <button
          type="button"
          onClick={() => {
            setActionError('')
            setIsClearAllOpen(true)
          }}
          disabled={!rows || rows.length === 0}
          className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50/70 px-3.5 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Trash2 size={16} />
          Kosongkan Semua {tab.label.split(' ')[0]}
        </button> */}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {HISTORY_TABS.map((item) => (
          <FilterPill key={item.key} active={item.key === activeKey} onClick={() => setActiveKey(item.key)}>
            {item.label}
          </FilterPill>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
        {loadError ? (
          <p role="alert" className="px-5 py-10 text-center text-sm text-red-700">
            {loadError}
          </p>
        ) : rows === null ? (
          <p className="px-5 py-10 text-center text-sm text-stone-500">Loading...</p>
        ) : (
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-stone-500">
              <tr>
                {tab.columns.map((column) => (
                  <th
                    key={column.header}
                    className={`px-5 py-3 font-medium ${column.align === 'right' ? 'text-right' : ''}`}
                  >
                    {column.header}
                  </th>
                ))}
                <th className="px-5 py-3 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {rows.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-stone-50">
                  {tab.columns.map((column) => (
                    <td
                      key={column.header}
                      className={`px-5 py-3.5 text-stone-700 ${column.align === 'right' ? 'text-right tabular-nums' : ''}`}
                    >
                      {column.render(row)}
                    </td>
                  ))}
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {activeKey === 'sales' && (
                        <button
                          type="button"
                          onClick={() => setEditingSale(row)}
                          title="Edit transaksi"
                          className="rounded-lg p-1.5 text-stone-500 transition hover:bg-primary-50 hover:text-primary-800"
                        >
                          <Pencil size={15} />
                        </button>
                      )}
                      {activeKey === 'expenses' && (
                        <button
                          type="button"
                          onClick={() => setEditingExpense(row)}
                          title="Edit pengeluaran"
                          className="rounded-lg p-1.5 text-stone-500 transition hover:bg-primary-50 hover:text-primary-800"
                        >
                          <Pencil size={15} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setActionError('')
                          setDeleteTarget({ type: activeKey, data: row })
                        }}
                        title="Hapus data ini"
                        className="rounded-lg p-1.5 text-stone-400 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loadError && rows?.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-stone-500">{tab.emptyText}</p>
        )}
      </div>

      {editingSale && (
        <EditSaleModal
          sale={editingSale}
          onClose={() => setEditingSale(null)}
          onSuccess={(msg) => setNotice(msg)}
        />
      )}

      {editingExpense && (
        <ExpenseFormModal
          expense={editingExpense}
          onClose={() => {
            setEditingExpense(null)
            setNotice('Pengeluaran berhasil diperbarui.')
          }}
        />
      )}

      {deleteTarget && (
        <Modal title="Konfirmasi Hapus" onClose={() => setDeleteTarget(null)}>
          <div className="space-y-4">
            <p className="text-sm text-stone-600">
              Apakah Anda yakin ingin menghapus data{' '}
              <span className="font-semibold text-stone-800">
                {deleteTarget.type === 'sales'
                  ? `transaksi ${deleteTarget.data.customerName || 'Umum'} (${formatRupiah(deleteTarget.data.total)})`
                  : deleteTarget.type === 'expenses'
                  ? `pengeluaran "${deleteTarget.data.description}" (${formatRupiah(deleteTarget.data.amount)})`
                  : `stok masuk "${deleteTarget.data.productName}" (${deleteTarget.data.quantity} pcs)`}
              </span>
              ?
            </p>

            {deleteTarget.type === 'sales' && (
              <label className="flex items-center gap-2.5 rounded-xl border border-stone-200 bg-stone-50 p-3 text-sm text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={restoreStockOnDelete}
                  onChange={(e) => setRestoreStockOnDelete(e.target.checked)}
                  className="rounded border-stone-300 text-primary-800 focus:ring-primary-700"
                />
                <span>Kembalikan stok produk yang dibeli ke inventaris</span>
              </label>
            )}

            {actionError && (
              <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                {actionError}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className={secondaryButtonClass}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 active:scale-[0.98] disabled:bg-red-300"
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {isClearAllOpen && (
        <Modal title={`Kosongkan Semua ${tab.label}`} onClose={() => setIsClearAllOpen(false)}>
          <div className="space-y-4">
            <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-sm text-amber-900">
              <AlertTriangle size={20} className="shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="font-semibold">Peringatan: Tindakan ini permanen</p>
                <p className="mt-0.5 text-xs text-amber-800">
                  Seluruh data riwayat pada tab {tab.label} akan dihapus bersih dari database.
                </p>
              </div>
            </div>

            {activeKey === 'sales' && (
              <label className="flex items-center gap-2.5 rounded-xl border border-stone-200 bg-stone-50 p-3 text-sm text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={restoreStockOnClear}
                  onChange={(e) => setRestoreStockOnClear(e.target.checked)}
                  className="rounded border-stone-300 text-primary-800 focus:ring-primary-700"
                />
                <span>Kembalikan seluruh stok barang yang pernah terjual ke inventaris</span>
              </label>
            )}

            {actionError && (
              <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                {actionError}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsClearAllOpen(false)}
                className={secondaryButtonClass}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmClearAll}
                disabled={isClearing}
                className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 active:scale-[0.98] disabled:bg-red-300"
              >
                {isClearing ? 'Mengosongkan...' : 'Ya, Kosongkan Semua'}
              </button>
            </div>
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

export default HistoryPage
