import ProtectedRoute from '@/components/layout/ProtectedRoute'
import AdminEvents from '@/views/admin/AdminEventsNew'
export default function Page() {
  return <ProtectedRoute><AdminEvents /></ProtectedRoute>
}
