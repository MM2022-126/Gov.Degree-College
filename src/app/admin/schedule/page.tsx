import ProtectedRoute from '@/components/layout/ProtectedRoute'
import AdminSchedule from '@/views/admin/AdminSchedule'
export default function Page() {
  return <ProtectedRoute><AdminSchedule /></ProtectedRoute>
}
