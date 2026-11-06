import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { db } from './firebase'

export const COLLECTIONS = {
  products: 'products',
  sales: 'sales',
  stockIn: 'stockIn',
  expenses: 'expenses',
}

function toDate(value) {
  return value?.toDate ? value.toDate() : new Date()
}

export function subscribeToCollection(
  name,
  { orderField = 'createdAt', direction = 'desc', since, onData, onError },
) {
  const constraints = []
  if (since) constraints.push(where('createdAt', '>=', since))
  constraints.push(orderBy(orderField, direction))

  return onSnapshot(
    query(collection(db, name), ...constraints),
    (snapshot) =>
      onData(
        snapshot.docs.map((docSnap) => {
          const data = docSnap.data()
          return { ...data, id: docSnap.id, createdAt: toDate(data.createdAt) }
        }),
      ),
    onError,
  )
}
