import type { Metadata } from 'next'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import AdminDashboard from '@/views/admin/AdminDashboard'
export const metadata: Metadata = { title: 'Admin Dashboard', robots: { index: false } }
export default function Page() {
  return <ProtectedRoute><AdminDashboard /></ProtectedRoute>
}
