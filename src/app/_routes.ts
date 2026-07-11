import type { Metadata } from 'next'

const meta = (title: string, description: string, path: string): Metadata => ({
  title,
  description,
  alternates: { canonical: path },
  openGraph: { title, description },
})

const routes = [
  { path: 'about', title: 'About Us', desc: 'History and mission of GGC Shahdara Lahore since 1970.', import: '@/views/About' },
  { path: 'departments', title: 'Departments', desc: 'Academic departments and programs at GGC Shahdara.', import: '@/views/Departments' },
  { path: 'faculty', title: 'Faculty', desc: 'Faculty members at Government Graduate College Shahdara.', import: '@/views/Faculty' },
  { path: 'admissions', title: 'Admissions', desc: 'How to apply to GGC Shahdara Lahore.', import: '@/views/Admissions' },
  { path: 'news', title: 'News', desc: 'Latest news from GGC Shahdara.', import: '@/views/News' },
  { path: 'events', title: 'Events', desc: 'College events at GGC Shahdara Lahore.', import: '@/views/Events' },
  { path: 'contact', title: 'Contact', desc: 'Contact GGC Shahdara, Ravi Road Lahore.', import: '@/views/Contact' },
  { path: 'gallery', title: 'Gallery', desc: 'Photo gallery of GGC Shahdara campus.', import: '@/views/Gallery' },
  { path: 'schedule', title: 'Schedule', desc: 'Academic schedule at GGC Shahdara.', import: '@/views/Schedule' },
  { path: 'search', title: 'Search', desc: 'Search GGC Shahdara website.', import: '@/views/SearchPage' },
  { path: 'privacy-policy', title: 'Privacy Policy', desc: 'Privacy policy.', import: '@/views/PrivacyPolicy' },
  { path: 'terms-of-use', title: 'Terms of Use', desc: 'Terms of use.', import: '@/views/TermsOfUse' },
] as const

// Generate page files via script output - writing admin pages separately

export { meta, routes }
