export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ggc-shahdara.edu.pk'
export const SITE_NAME = 'Government Graduate College Shahdara, Ravi Road, Lahore'
export const SITE_DESCRIPTION =
  'Government Graduate College Shahdara (GGC Shahdara) on Ravi Road, Lahore — quality higher education since 1970. Admissions, departments, faculty, news, events, and academic programs.'
export const SITE_KEYWORDS = [
  'Government Graduate College Shahdara',
  'GGC Shahdara Lahore',
  'college Ravi Road Lahore',
  'government college Lahore admissions',
  'intermediate FA FSc Lahore',
  'BS programs Lahore college',
  'Shahdara college Lahore',
  'higher education Punjab',
].join(', ')

export const defaultMetadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  openGraph: {
    type: 'website' as const,
    locale: 'en_PK',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large' as const,
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
}

export function collegeJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollegeOrUniversity',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Ravi Road, Shahdara',
      addressLocality: 'Lahore',
      addressRegion: 'Punjab',
      postalCode: '54000',
      addressCountry: 'PK',
    },
    foundingDate: '1970',
    sameAs: [],
  }
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
