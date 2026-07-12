'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * Legacy reset-link page. Password changes now use OTP on /admin/forgot-password.
 */
export default function ResetPasswordPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/admin/forgot-password')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>
            Password reset now uses email verification codes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/admin/forgot-password" className="text-sm text-primary hover:underline">
            Continue to forgot password
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
