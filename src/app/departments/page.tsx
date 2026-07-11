import type { Metadata } from 'next'
import Departments from '@/views/Departments'
export const metadata: Metadata = { title: 'Departments', description: 'Academic departments at GGC Shahdara Lahore.', alternates: { canonical: '/departments' } }
export default function Page() { return <Departments /> }
