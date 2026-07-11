import type { Metadata } from 'next'
import Admissions from '@/views/Admissions'
export const metadata: Metadata = { title: 'Admissions', description: 'Admissions at GGC Shahdara Lahore.', alternates: { canonical: '/admissions' } }
export default function Page() { return <Admissions /> }
