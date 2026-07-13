'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Loader2, Lock, ArrowLeft, Mail, Eye, EyeOff } from 'lucide-react'
import { requestAdminLoginOtp, verifyAdminLoginOtp } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

type Step = 'credentials' | 'otp'

const AdminLogin = () => {
  const [step, setStep] = useState<Step>('credentials')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [otp, setOtp] = useState('')
  const [devOtp, setDevOtp] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setDevOtp(null)
    try {
      const data = await requestAdminLoginOtp(email, password)
      if (data.devOtp) setDevOtp(data.devOtp)
      toast({
        title: 'Verification code sent',
        description: data.emailSent
          ? 'Check your admin email for the 6-digit code.'
          : data.devOtp
            ? `Dev mode code: ${data.devOtp}`
            : data.message,
      })
      setStep('otp')
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Invalid credentials',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6) {
      toast({ title: 'Enter the 6-digit code', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      await verifyAdminLoginOtp(email, otp)
      toast({ title: 'Login successful', description: 'Welcome to Admin Panel' })
      router.push('/admin')
    } catch (error) {
      toast({
        title: 'Verification failed',
        description: error instanceof Error ? error.message : 'Invalid code',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 left-4"
        onClick={() => router.push('/')}
        title="Go back to home"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <Card className="w-full max-w-md border border-border">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            {step === 'otp' ? (
              <Mail className="h-6 w-6 text-primary" />
            ) : (
              <Lock className="h-6 w-6 text-primary" />
            )}
          </div>
          <CardTitle className="font-display text-2xl">
            {step === 'otp' ? 'Email verification' : 'Admin Panel'}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {step === 'otp'
              ? `Enter the 6-digit code sent to ${email}`
              : 'Govt. Graduate College Ravi Road, Shahdara'}
          </p>
        </CardHeader>
        <CardContent>
          {step === 'credentials' ? (
            <form onSubmit={handleCredentials} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter admin email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    minLength={6}
                    autoComplete="current-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Continue
              </Button>
              <Link
                href="/admin/forgot-password"
                className="text-sm text-primary hover:underline block text-center"
              >
                Forgot password?
              </Link>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              {devOtp && (
                <p className="text-xs text-muted-foreground text-center">
                  Dev OTP (SMTP not configured): <span className="font-mono font-semibold">{devOtp}</span>
                </p>
              )}
              <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Verify & Sign In
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                disabled={loading}
                onClick={() => {
                  setStep('credentials')
                  setOtp('')
                  setDevOtp(null)
                }}
              >
                Back
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminLogin
