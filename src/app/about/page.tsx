import type { Metadata } from 'next'
import About from '@/views/About'
export const metadata: Metadata = { title: 'About Us', description: 'About Government Graduate College Shahdara, Ravi Road Lahore.', alternates: { canonical: '/about' } }
export default function Page() { return <About /> }
