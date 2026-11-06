import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'
import { COLLECTIONS, subscribeToCollection } from '../lib/firestore'
import { db } from '../lib/firebase'

export function subscribeToStockIn({ since, onData, onError }) {
  return subscribeToCollection(COLLECTIONS.stockIn, { since, onData, onError })
}

export function restockProduct({ product, quantity, unitCost }) {
  const totalCost = quantity * unitCost
  const batch = writeBatch(db)

  batch.update(doc(db, COLLECTIONS.products, product.id), { stock: increment(quantity) })

  batch.set(doc(collection(db, COLLECTIONS.stockIn)), {
    productId: product.id,
    productName: product.name,
    quantity,
    unitCost,
    totalCost,
    createdAt: serverTimestamp(),
  })

  if (totalCost > 0) {
    batch.set(doc(collection(db, COLLECTIONS.expenses)), {
      description: `Restock: ${product.name} (${quantity} pcs)`,
      category: 'Stock Purchase',
      amount: totalCost,
      createdAt: serverTimestamp(),
    })
  }

  return batch.commit()
}

export function deleteStockIn(stockInId) {
  return deleteDoc(doc(db, COLLECTIONS.stockIn, stockInId))
}

export async function clearAllStockIn() {
  const snapshot = await getDocs(collection(db, COLLECTIONS.stockIn))
  if (snapshot.empty) return
  const batch = writeBatch(db)
  snapshot.docs.forEach((docSnap) => batch.delete(docSnap.ref))
  return batch.commit()
}
