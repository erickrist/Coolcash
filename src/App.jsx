import { useState } from 'react'
import { History, LayoutDashboard, Package, ReceiptText, Warehouse } from 'lucide-react'
import Navbar from './components/Navbar'
import PosPage from './pages/PosPage'
import DashboardPage from './pages/DashboardPage'
import ProductsPage from './pages/ProductsPage'
import HistoryPage from './pages/HistoryPage'
import StockPage from './pages/StockPage'

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, Page: DashboardPage },
  { key: 'product', label: 'Product', icon: Package, Page: ProductsPage },
  { key: 'history', label: 'History', icon: History, Page: HistoryPage },
  { key: 'transaction', label: 'Transaction', icon: ReceiptText, Page: PosPage },
  { key: 'stock', label: 'Stock', icon: Warehouse, Page: StockPage },
]

function App() {
  const [activeKey, setActiveKey] = useState('transaction')
  const activeItem = NAV_ITEMS.find((item) => item.key === activeKey)
  const ActivePage = activeItem.Page

  return (
    <div className="min-h-screen">
      <Navbar items={NAV_ITEMS} activeKey={activeKey} onNavigate={setActiveKey} />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <ActivePage />
      </main>
    </div>
  )
}

export default App
