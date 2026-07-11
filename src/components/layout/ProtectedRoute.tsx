'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { verifyAuth } from '@/lib/api'
import { Loader2 } from 'lucide-react'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<'loading' | 'valid' | 'invalid'>('loading')
  const router = useRouter()

  useEffect(() => {
    verifyAuth().then((isValid) => {
      setAuthState(isValid ? 'valid' : 'invalid')
      if (!isValid) router.replace('/admin/login')
    })
  }, [router])

  if (authState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (authState === 'invalid') return null

  return <>{children}</>
}

export default ProtectedRoute
