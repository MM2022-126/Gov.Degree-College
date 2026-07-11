import ProtectedRoute from '@/components/layout/ProtectedRoute'
import AdminChat from '@/views/admin/AdminChat'
export default function Page() {
  return <ProtectedRoute><AdminChat /></ProtectedRoute>
}
