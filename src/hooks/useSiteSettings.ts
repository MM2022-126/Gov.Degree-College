'use client'

import { useState, useEffect } from 'react'

interface SiteSettings {
  contact_address: string
  contact_phone: string
  contact_email: string
  contact_hours: string
  [key: string]: string
}

const defaults: SiteSettings = {
  contact_address: 'Ravi Road, Shahdara, Lahore, Punjab 54000',
  contact_phone: '+92-42-XXXXXXX',
  contact_email: 'info@ggc.edu.pk',
  contact_hours: 'Mon - Sat: 8:00 AM - 3:00 PM',
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(defaults)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && typeof data === 'object') {
          const map: SiteSettings = { ...defaults }
          if (Array.isArray(data)) {
            data.forEach((row: { key: string; value: string }) => { map[row.key] = row.value })
          } else {
            Object.entries(data).forEach(([key, value]) => { map[key] = String(value) })
          }
          setSettings(map)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const updateSetting = async (key: string, value: string) => {
    try {
      const response = await fetch(`/api/settings/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ value }),
      })
      if (response.ok) {
        setSettings((prev) => ({ ...prev, [key]: value }))
        return { error: null }
      }
      return { error: await response.json() }
    } catch (error) {
      return { error }
    }
  }

  return { settings, loading, updateSetting }
}
