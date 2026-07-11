'use client'

/** Legacy SEO component — metadata is now handled by Next.js App Router generateMetadata */
interface PageSEOProps {
  title?: string
  description?: string
  path?: string
  keywords?: string
  type?: string
}

export default function PageSEO(_props: PageSEOProps) {
  return null
}
