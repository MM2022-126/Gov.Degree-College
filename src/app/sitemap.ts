import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    '', 'about', 'departments', 'faculty', 'admissions', 'news', 'events',
    'contact', 'gallery', 'schedule', 'privacy-policy', 'terms-of-use',
  ]

  return staticRoutes.map((route) => ({
    url: `${SITE_URL}/${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' || route === 'news' || route === 'events' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : route === 'admissions' || route === 'departments' ? 0.9 : 0.7,
  }))
}
