import type { Metadata } from 'next'
import Gallery from '@/views/Gallery'
export const metadata: Metadata = { title: 'Gallery', description: 'Photo gallery GGC Shahdara.', alternates: { canonical: '/gallery' } }
export default function Page() { return <Gallery /> }
