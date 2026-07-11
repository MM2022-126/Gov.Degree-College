import ProtectedRoute from '@/components/layout/ProtectedRoute'
import AdminFaculty from '@/views/admin/AdminFaculty'
export default function Page() {
  return <ProtectedRoute><AdminFaculty /></ProtectedRoute>
}
