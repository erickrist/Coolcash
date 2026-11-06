import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { COLLECTIONS, subscribeToCollection } from '../lib/firestore'
import { db } from '../lib/firebase'

export const DUMMY_PRODUCTS = [
  {
    name: 'Nasi Goreng Spesial',
    category: 'Meals',
    stock: 25,
    buyPrice: 12000,
    sellPrice: 20000,
  },
  {
    name: 'Ayam Geprek Sambal Bawang',
    category: 'Meals',
    stock: 20,
    buyPrice: 10000,
    sellPrice: 18000,
  },
  {
    name: 'Mie Goreng Seafood',
    category: 'Meals',
    stock: 15,
    buyPrice: 13000,
    sellPrice: 22000,
  },
  {
    name: 'Es Teh Manis',
    category: 'Drinks',
    stock: 50,
    buyPrice: 2000,
    sellPrice: 5000,
  },
  {
    name: 'Kopi Susu Gula Aren',
    category: 'Drinks',
    stock: 40,
    buyPrice: 6000,
    sellPrice: 15000,
  },
  {
    name: 'Jus Alpukat',
    category: 'Drinks',
    stock: 20,
    buyPrice: 8000,
    sellPrice: 16000,
  },
  {
    name: 'Kentang Goreng Crispy',
    category: 'Snacks',
    stock: 30,
    buyPrice: 6000,
    sellPrice: 12000,
  },
  {
    name: 'Pisang Goreng Keju',
    category: 'Snacks',
    stock: 25,
    buyPrice: 5000,
    sellPrice: 10000,
  },
  {
    name: 'Roti Bakar Cokelat',
    category: 'Snacks',
    stock: 20,
    buyPrice: 6000,
    sellPrice: 12000,
  },
  {
    name: 'Air Mineral 600ml',
    category: 'Other',
    stock: 48,
    buyPrice: 2000,
    sellPrice: 4000,
  },
]

export function subscribeToProducts({ onData, onError }) {
  return subscribeToCollection(COLLECTIONS.products, {
    orderField: 'name',
    direction: 'asc',
    onData,
    onError,
  })
}

export function saveProduct(productId, values) {
  if (productId) return updateDoc(doc(db, COLLECTIONS.products, productId), values)
  return addDoc(collection(db, COLLECTIONS.products), { ...values, createdAt: serverTimestamp() })
}

export function deleteProduct(productId) {
  return deleteDoc(doc(db, COLLECTIONS.products, productId))
}

export async function seedDummyProducts() {
  const batch = writeBatch(db)
  for (const item of DUMMY_PRODUCTS) {
    const docRef = doc(collection(db, COLLECTIONS.products))
    batch.set(docRef, {
      ...item,
      createdAt: serverTimestamp(),
    })
  }
  return batch.commit()
}
