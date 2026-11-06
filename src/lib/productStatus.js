import { LOW_STOCK_THRESHOLD } from './constants'

export function getStockStatus(stock) {
  if (stock <= 0) return { label: 'Sold Out', tone: 'soldOut' }
  if (stock <= LOW_STOCK_THRESHOLD) return { label: 'Last 5 Items', tone: 'warning' }
  return { label: 'Available', tone: 'available' }
}
