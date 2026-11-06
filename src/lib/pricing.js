export function calculateTotals(items, discount) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0)
  const appliedDiscount = Math.min(Math.max(0, Math.round(Number(discount) || 0)), subtotal)
  return { subtotal, discount: appliedDiscount, total: subtotal - appliedDiscount }
}

export function summarizeFinances(sales, expenses) {
  const income = sales.reduce((sum, sale) => sum + (Number(sale.total) || 0), 0)

  let restockExpense = 0
  let operationalExpense = 0

  for (const expense of expenses) {
    const amount = Number(expense.amount) || 0
    if (expense.category === 'Stock Purchase' || expense.category === 'Belanja Stok') {
      restockExpense += amount
    } else {
      operationalExpense += amount
    }
  }

  const outcome = restockExpense + operationalExpense
  const net = income - outcome

  return {
    income,
    outcome,
    restockExpense,
    operationalExpense,
    net,
    transactions: sales.length,
  }
}
