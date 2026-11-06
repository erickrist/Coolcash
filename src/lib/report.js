export function buildDashboardReport({ periodLabel, totals, sales, expenses }) {
  return [
    ['Coolcash Dashboard Report'],
    ['Period', periodLabel],
    ['Generated At', new Date().toISOString()],
    [],
    ['Summary'],
    ['Total Income (Uang Masuk)', totals.income],
    ['Total Outcome (Uang Keluar)', totals.outcome],
    ['  - Kulakan / Restock Stok', totals.restockExpense ?? 0],
    ['  - Beban Operasional', totals.operationalExpense ?? 0],
    ['Net Balance (Sisa Kas)', totals.net],
    ['Transactions', totals.transactions],
    [],
    ['Sales'],
    ['Date', 'Customer', 'Items', 'Discount', 'Total'],
    ...sales.map((sale) => [
      sale.createdAt.toISOString(),
      sale.customerName || 'Umum',
      sale.items.map((item) => `${item.name} x${item.qty}`).join('; '),
      sale.discount || 0,
      sale.total,
    ]),
    [],
    ['Expenses'],
    ['Date', 'Category', 'Description', 'Amount'],
    ...expenses.map((expense) => [
      expense.createdAt.toISOString(),
      expense.category,
      expense.description,
      expense.amount,
    ]),
  ]
}
