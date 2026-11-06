import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { COLLECTIONS, subscribeToCollection } from '../lib/firestore'
import { db } from '../lib/firebase'

export function subscribeToExpenses({ since, onData, onError }) {
  return subscribeToCollection(COLLECTIONS.expenses, { since, onData, onError })
}

export function addExpense({ description, category, amount }) {
  return addDoc(collection(db, COLLECTIONS.expenses), {
    description,
    category,
    amount,
    createdAt: serverTimestamp(),
  })
}

export function saveExpense(expenseId, { description, category, amount }) {
  if (expenseId) {
    return updateDoc(doc(db, COLLECTIONS.expenses, expenseId), {
      description,
      category,
      amount,
      updatedAt: serverTimestamp(),
    })
  }
  return addExpense({ description, category, amount })
}

export function deleteExpense(expenseId) {
  return deleteDoc(doc(db, COLLECTIONS.expenses, expenseId))
}

export async function clearAllExpenses() {
  const snapshot = await getDocs(collection(db, COLLECTIONS.expenses))
  if (snapshot.empty) return
  const batch = writeBatch(db)
  snapshot.docs.forEach((docSnap) => batch.delete(docSnap.ref))
  return batch.commit()
}
