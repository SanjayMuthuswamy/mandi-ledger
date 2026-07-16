import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'

import { Login } from '@/pages/Login'
import { Dashboard } from '@/pages/Dashboard'
import { Stock } from '@/pages/Stock'
import { Suppliers } from '@/pages/Suppliers'
import { Purchases } from '@/pages/Purchases'
import { Sales } from '@/pages/Sales'
import { Inventory } from '@/pages/Inventory'
import { Reports } from '@/pages/Reports'
import { Customers } from '@/pages/Customers'
import { Settings } from '@/pages/Settings'

function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/stock" element={<Stock />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/purchases" element={<Purchases />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </Router>
  )
}

export default App
