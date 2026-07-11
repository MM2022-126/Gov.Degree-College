import type { Metadata } from 'next'
import Contact from '@/views/Contact'
export const metadata: Metadata = { title: 'Contact', description: 'Contact GGC Shahdara, Ravi Road Lahore.', alternates: { canonical: '/contact' } }
export default function Page() { return <Contact /> }
