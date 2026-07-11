import type { Metadata } from 'next'
import HomePage from '@/views/Index'

export const metadata: Metadata = {
  title: 'Government Graduate College Shahdara, Ravi Road Lahore',
  description:
    'Official website of Government Graduate College Shahdara on Ravi Road, Lahore. Admissions, departments, faculty, news, events, and academic excellence since 1970.',
  alternates: { canonical: '/' },
}

export default function Page() {
  return <HomePage />
}
