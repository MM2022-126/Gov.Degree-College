import type { Metadata } from 'next'
import TermsOfUse from '@/views/TermsOfUse'
export const metadata: Metadata = { title: 'Terms of Use', alternates: { canonical: '/terms-of-use' } }
export default function Page() { return <TermsOfUse /> }
