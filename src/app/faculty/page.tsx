import type { Metadata } from 'next'
import Faculty from '@/views/Faculty'
export const metadata: Metadata = { title: 'Faculty', description: 'Faculty at GGC Shahdara Lahore.', alternates: { canonical: '/faculty' } }
export default function Page() { return <Faculty /> }
