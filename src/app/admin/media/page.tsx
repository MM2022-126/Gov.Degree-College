import ProtectedRoute from '@/components/layout/ProtectedRoute'
import AdminMedia from '@/views/admin/AdminMedia'
export default function Page() {
  return <ProtectedRoute><AdminMedia /></ProtectedRoute>
}
