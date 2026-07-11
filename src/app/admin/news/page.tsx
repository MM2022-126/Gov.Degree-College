import ProtectedRoute from '@/components/layout/ProtectedRoute'
import AdminNews from '@/views/admin/AdminNews'
export default function Page() {
  return <ProtectedRoute><AdminNews /></ProtectedRoute>
}
