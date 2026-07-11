import ProtectedRoute from '@/components/layout/ProtectedRoute'
import AdminAnnouncements from '@/views/admin/AdminAnnouncements'
export default function Page() {
  return <ProtectedRoute><AdminAnnouncements /></ProtectedRoute>
}
