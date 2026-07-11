import type { Metadata } from 'next'
import EventDetail from '@/views/EventDetail'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  return {
    title: `Event — ${slug.replace(/-/g, ' ')}`,
    description: `Event details at Government Graduate College Shahdara, Lahore.`,
    alternates: { canonical: `/events/${slug}` },
  }
}

export default function EventDetailPage() {
  return <EventDetail />
}
