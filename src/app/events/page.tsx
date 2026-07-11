import type { Metadata } from 'next'
import Events from '@/views/Events'
export const metadata: Metadata = { title: 'Events', description: 'Events at GGC Shahdara Lahore.', alternates: { canonical: '/events' } }
export default function Page() { return <Events /> }
