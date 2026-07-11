import ProtectedRoute from '@/components/layout/ProtectedRoute'
import AdminDepartments from '@/views/admin/AdminDepartments'
export default function Page() {
  return <ProtectedRoute><AdminDepartments /></ProtectedRoute>
}
