import type { Metadata } from 'next'
import SearchPage from '@/views/SearchPage'
export const metadata: Metadata = { title: 'Search', description: 'Search GGC Shahdara.', alternates: { canonical: '/search' }, robots: { index: false } }
export default function Page() { return <SearchPage /> }
