import type { Metadata } from 'next'
import Schedule from '@/views/Schedule'
export const metadata: Metadata = { title: 'Schedule', description: 'Academic schedule GGC Shahdara.', alternates: { canonical: '/schedule' } }
export default function Page() { return <Schedule /> }
