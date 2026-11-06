import { useState } from 'react'
import Modal from './Modal'
import { EXPENSE_CATEGORIES } from '../lib/constants'
import { inputClass, primaryButtonClass, secondaryButtonClass } from '../lib/styles'
import { saveExpense } from '../services/expenseService'

function ExpenseFormModal({ expense, onClose }) {
  const [description, setDescription] = useState(expense?.description ?? '')
  const [category, setCategory] = useState(expense?.category ?? EXPENSE_CATEGORIES[0])
  const [amount, setAmount] = useState(expense?.amount ? String(expense.amount) : '')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const value = Number(amount)

    if (!description.trim()) return setError('Please describe the expense.')
    if (amount === '' || !Number.isFinite(value) || value <= 0) {
      return setError('Amount must be greater than 0.')
    }

    setIsSaving(true)
    setError('')
    try {
      await saveExpense(expense?.id, { description: description.trim(), category, amount: value })
      onClose()
    } catch {
      setError('Could not save the expense. Please try again.')
      setIsSaving(false)
    }
  }

  return (
    <Modal title={expense ? 'Edit Pengeluaran' : 'Add Expense'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-stone-700">
          Description
          <input
            type="text"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="e.g. Electricity bill"
            className={inputClass}
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-stone-700">
            Category
            <select value={category} onChange={(event) => setCategory(event.target.value)} className={inputClass}>
              {EXPENSE_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-stone-700">
            Amount (Rp)
            <input
              type="number"
              min="0"
              step="100"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
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
            {isSaving ? 'Menyimpan...' : expense ? 'Simpan Perubahan' : 'Save Expense'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default ExpenseFormModal
