import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  runTransaction,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'
import { COLLECTIONS, subscribeToCollection } from '../lib/firestore'
import { db } from '../lib/firebase'

export function subscribeToSales({ since, onData, onError }) {
  return subscribeToCollection(COLLECTIONS.sales, { since, onData, onError })
}

export function createSale({ customerName, items, subtotal, discount, total }) {
  const saleRef = doc(collection(db, COLLECTIONS.sales))

  return runTransaction(db, async (transaction) => {
    const productRefs = items.map((item) => doc(db, COLLECTIONS.products, item.productId))
    const snapshots = await Promise.all(productRefs.map((ref) => transaction.get(ref)))

    snapshots.forEach((snapshot, index) => {
      const item = items[index]
      if (!snapshot.exists()) throw new Error(`${item.name} is no longer available.`)
      if ((snapshot.data().stock ?? 0) < item.qty) {
        throw new Error(`Not enough stock for ${item.name}.`)
      }
    })

    snapshots.forEach((snapshot, index) => {
      transaction.update(productRefs[index], { stock: snapshot.data().stock - items[index].qty })
    })

    transaction.set(saleRef, {
      customerName,
      items: items.map(({ productId, name, price, buyPrice, qty }) => ({
        productId,
        name,
        price,
        buyPrice: buyPrice ?? 0,
        qty,
      })),
      subtotal,
      discount,
      total,
      createdAt: serverTimestamp(),
    })
  })
}

export function deleteSale(sale, restoreStock = true) {
  const saleRef = doc(db, COLLECTIONS.sales, sale.id)

  if (!restoreStock || !sale.items || sale.items.length === 0) {
    return deleteDoc(saleRef)
  }

  return runTransaction(db, async (transaction) => {
    const validItems = (sale.items ?? []).filter((item) => item.productId)
    const productRefs = validItems.map((item) => doc(db, COLLECTIONS.products, item.productId))
    const snapshots = await Promise.all(productRefs.map((ref) => transaction.get(ref)))

    snapshots.forEach((snap, idx) => {
      if (snap.exists()) {
        const currentStock = snap.data().stock ?? 0
        transaction.update(productRefs[idx], {
          stock: currentStock + validItems[idx].qty,
        })
      }
    })

    transaction.delete(saleRef)
  })
}

export function updateSale(saleId, { customerName, discount, items, originalItems }) {
  const saleRef = doc(db, COLLECTIONS.sales, saleId)

  return runTransaction(db, async (transaction) => {
    if (items && originalItems) {
      const oldQtyMap = {}
      originalItems.forEach((it) => {
        if (it.productId) oldQtyMap[it.productId] = (oldQtyMap[it.productId] ?? 0) + it.qty
      })

      const newQtyMap = {}
      items.forEach((it) => {
        if (it.productId) newQtyMap[it.productId] = (newQtyMap[it.productId] ?? 0) + it.qty
      })

      const allProductIds = Array.from(new Set([...Object.keys(oldQtyMap), ...Object.keys(newQtyMap)]))
      const productRefs = allProductIds.map((id) => doc(db, COLLECTIONS.products, id))
      const snapshots = await Promise.all(productRefs.map((ref) => transaction.get(ref)))

      snapshots.forEach((snap, idx) => {
        if (snap.exists()) {
          const pId = allProductIds[idx]
          const oldQty = oldQtyMap[pId] ?? 0
          const newQty = newQtyMap[pId] ?? 0
          const delta = oldQty - newQty
          if (delta !== 0) {
            const currentStock = snap.data().stock ?? 0
            if (currentStock + delta < 0) {
              throw new Error(`Stok produk "${snap.data().name}" tidak mencukupi untuk penambahan pesanan.`)
            }
            transaction.update(productRefs[idx], { stock: currentStock + delta })
          }
        }
      })
    }

    const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0)
    const appliedDiscount = Math.min(Math.max(0, Math.round(Number(discount) || 0)), subtotal)
    const total = subtotal - appliedDiscount

    transaction.update(saleRef, {
      customerName: customerName.trim() || 'Umum',
      items: items.map(({ productId, name, price, buyPrice, qty }) => ({
        productId,
        name,
        price,
        buyPrice: buyPrice ?? 0,
        qty,
      })),
      discount: appliedDiscount,
      subtotal,
      total,
      updatedAt: serverTimestamp(),
    })
  })
}

export async function clearAllSales(restoreStock = false) {
  const snapshot = await getDocs(collection(db, COLLECTIONS.sales))
  if (snapshot.empty) return

  if (!restoreStock) {
    const batch = writeBatch(db)
    snapshot.docs.forEach((docSnap) => batch.delete(docSnap.ref))
    return batch.commit()
  }

  return runTransaction(db, async (transaction) => {
    const returnQtyMap = {}
    snapshot.docs.forEach((docSnap) => {
      const data = docSnap.data()
      ;(data.items ?? []).forEach((item) => {
        if (item.productId && item.qty) {
          returnQtyMap[item.productId] = (returnQtyMap[item.productId] ?? 0) + item.qty
        }
      })
    })

    const productIds = Object.keys(returnQtyMap)
    const productRefs = productIds.map((id) => doc(db, COLLECTIONS.products, id))
    const snapshots = await Promise.all(productRefs.map((ref) => transaction.get(ref)))

    snapshots.forEach((snap, idx) => {
      if (snap.exists()) {
        const pId = productIds[idx]
        const currentStock = snap.data().stock ?? 0
        transaction.update(productRefs[idx], { stock: currentStock + returnQtyMap[pId] })
      }
    })

    snapshot.docs.forEach((docSnap) => transaction.delete(docSnap.ref))
  })
}
