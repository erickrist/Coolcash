import { useEffect, useMemo, useState } from 'react'
import { FileText, PackagePlus, Plus, Receipt, ReceiptText, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import StatCard from '../components/StatCard'
import ExpenseFormModal from '../components/ExpenseFormModal'
import { formatDateTime, formatRupiah } from '../lib/format'
import { PERIODS, getPeriodStart } from '../lib/period'
import { exportPdfReport } from '../lib/pdfReport'
import { summarizeFinances } from '../lib/pricing'
import { primaryButtonClass, secondaryButtonClass, inputClass } from '../lib/styles'
import { subscribeToExpenses } from '../services/expenseService'
import { subscribeToSales } from '../services/salesService'

const RECENT_LIMIT = 5

function DashboardPage() {
  const [period, setPeriod] = useState(PERIODS[0].key)
  const since = useMemo(() => getPeriodStart(period), [period])
  const [sales, setSales] = useState(null)
  const [expenses, setExpenses] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false)

  useEffect(() => {
    setSales(null)
    setExpenses(null)
    setLoadError('')
    const loadFailed = () => setLoadError('Could not load dashboard data. Please check your Firebase settings.')
    const unsubscribeSales = subscribeToSales({ since, onData: setSales, onError: loadFailed })
    const unsubscribeExpenses = subscribeToExpenses({ since, onData: setExpenses, onError: loadFailed })
    return () => {
      unsubscribeSales()
      unsubscribeExpenses()
    }
  }, [since])

  const isLoading = sales === null || expenses === null
  const totals = useMemo(
    () => summarizeFinances(sales ?? [], expenses ?? []),
    [sales, expenses],
  )
  const recentSales = (sales ?? []).slice(0, RECENT_LIMIT)
  const recentExpenses = (expenses ?? []).slice(0, RECENT_LIMIT)
  const periodLabel = PERIODS.find((item) => item.key === period).label

  function handleDownloadReport() {
    exportPdfReport({
      periodLabel,
      totals,
      sales: sales ?? [],
      expenses: expenses ?? [],
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Dashboard</h1>
          <p className="text-sm text-stone-500">Ringkasan keuangan untuk periode {periodLabel.toLowerCase()}.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            aria-label="Time period"
            className={`${inputClass} sm:w-44`}
          >
            {PERIODS.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setIsExpenseFormOpen(true)}
            className={secondaryButtonClass}
          >
            <Plus size={18} />
            Catat Pengeluaran
          </button>
          <button
            type="button"
            onClick={handleDownloadReport}
            disabled={isLoading || Boolean(loadError)}
            className={primaryButtonClass}
          >
            <FileText size={18} />
            Download Laporan (PDF)
          </button>
        </div>
      </div>

      {loadError && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          label="Uang Masuk (Income)"
          value={formatRupiah(totals.income)}
          subtitle={`${totals.transactions} transaksi`}
          icon={TrendingUp}
          tone="income"
        />
        <StatCard
          label="Uang Keluar (Outcome)"
          value={formatRupiah(totals.outcome)}
          subtitle="Total semua pengeluaran"
          icon={TrendingDown}
          tone="outcome"
        />
        <StatCard
          label="Kulakan / Beli Stok"
          value={formatRupiah(totals.restockExpense)}
          subtitle={
            totals.outcome > 0
              ? `${Math.round((totals.restockExpense / totals.outcome) * 100)}% dari pengeluaran`
              : 'Belanja stok barang'
          }
          icon={PackagePlus}
          tone="restock"
        />
        <StatCard
          label="Beban Operasional"
          value={formatRupiah(totals.operationalExpense)}
          subtitle="Listrik, sewa, gaji, dll"
          icon={Receipt}
          tone="neutral"
        />
        <StatCard
          label="Sisa Kas (Net)"
          value={formatRupiah(totals.net)}
          subtitle={totals.net >= 0 ? 'Surplus kas' : 'Defisit kas'}
          icon={Wallet}
          tone={totals.net >= 0 ? 'net' : 'outcome'}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-stone-200 bg-white shadow-sm">
          <div className="border-b border-stone-100 px-5 py-4">
            <h2 className="font-semibold text-stone-800">Penjualan Terakhir</h2>
          </div>
          {isLoading && !loadError ? (
            <p className="px-5 py-10 text-center text-sm text-stone-500">Memuat data...</p>
          ) : recentSales.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-stone-500">Belum ada penjualan di periode ini.</p>
          ) : (
            <ul className="divide-y divide-stone-100">
              {recentSales.map((sale) => (
                <li
                  key={sale.id}
                  className="flex flex-col gap-1 px-5 py-3.5 transition-colors hover:bg-stone-50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-stone-800">{sale.customerName || 'Umum'}</p>
                    <p className="text-sm text-stone-500">
                      {sale.orderType ? `${sale.orderType} · ` : ''}{formatDateTime(sale.createdAt)}
                    </p>
                  </div>
                  <p className="font-semibold text-primary-800">{formatRupiah(sale.total)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white shadow-sm">
          <div className="border-b border-stone-100 px-5 py-4">
            <h2 className="font-semibold text-stone-800">Pengeluaran & Kulakan Terakhir</h2>
          </div>
          {isLoading && !loadError ? (
            <p className="px-5 py-10 text-center text-sm text-stone-500">Memuat data...</p>
          ) : recentExpenses.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-stone-500">Belum ada pengeluaran di periode ini.</p>
          ) : (
            <ul className="divide-y divide-stone-100">
              {recentExpenses.map((expense) => {
                const isRestock = expense.category === 'Stock Purchase' || expense.category === 'Belanja Stok'
                return (
                  <li
                    key={expense.id}
                    className="flex flex-col gap-1 px-5 py-3.5 transition-colors hover:bg-stone-50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                            isRestock ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {isRestock ? 'Kulakan / Restock' : expense.category}
                        </span>
                        <p className="truncate font-medium text-stone-800">{expense.description}</p>
                      </div>
                      <p className="text-sm text-stone-500">{formatDateTime(expense.createdAt)}</p>
                    </div>
                    <p className="shrink-0 font-semibold text-red-600">- {formatRupiah(expense.amount)}</p>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>

      {isExpenseFormOpen && <ExpenseFormModal onClose={() => setIsExpenseFormOpen(false)} />}
    </div>
  )
}

export default DashboardPage
