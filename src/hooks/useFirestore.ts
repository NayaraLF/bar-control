import { useState, useEffect } from 'react'
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
  limit,
  type QueryConstraint,
} from 'firebase/firestore'
import { db } from '../services/firebase'

export function useCollection<T>(collectionPath: string, orderField?: string) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const constraints: QueryConstraint[] = []
    if (orderField) constraints.push(orderBy(orderField))
    const q = query(collection(db, collectionPath), ...constraints)
    return onSnapshot(q, (snap) => {
      setData(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T))
      setLoading(false)
    })
  }, [collectionPath, orderField])

  return { data, loading }
}

export function useRecentMovements(itemType: string, maxItems = 20) {
  const [data, setData] = useState<unknown[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(
      collection(db, 'stockMovements'),
      where('type', '==', itemType),
      orderBy('createdAt', 'desc'),
      limit(maxItems)
    )
    return onSnapshot(q, (snap) => {
      setData(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
  }, [itemType, maxItems])

  return { data, loading }
}
