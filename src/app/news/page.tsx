import type { Metadata } from 'next'
import News from '@/views/News'
export const metadata: Metadata = { title: 'News', description: 'News from GGC Shahdara Lahore.', alternates: { canonical: '/news' } }
export default function Page() { return <News /> }
