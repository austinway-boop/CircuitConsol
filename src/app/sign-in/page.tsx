'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowRight, Sparkles } from 'lucide-react'

export default function SignInPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to sign in')
      }

      router.push('/app/organizations')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left side - Form */}
      <div className="flex items-center justify-center p-8 relative overflow-hidden">
        {/* Decorative background shapes */}
        <div className="absolute inset-0 bg-shapes" />
        
        <div className="w-full max-w-md animate-fade-in relative z-10">
          {/* Logo */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-3 mb-3">
              <div className="w-11 h-11 btn-gradient-orange rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-3xl font-bold tracking-tight">Circuit</span>
            </div>
            <p className="text-muted-foreground text-lg">Welcome back to your workspace</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 text-sm bg-red-50 border border-red-200 rounded-xl text-red-700 animate-slide-in">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="h-11 text-base border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <button type="button" className="text-sm text-primary hover:underline font-medium">
                  Forgot password?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="h-11 text-base border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 text-base font-semibold mt-6 btn-gradient-orange border-0" 
              disabled={loading}
            >
              {loading ? (
                'Signing in...'
              ) : (
                <>
                  Sign in
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-3 text-muted-foreground font-medium">
                  New to Circuit?
                </span>
              </div>
            </div>

            <Link href="/sign-up">
              <Button 
                type="button" 
                variant="outline"
                className="w-full h-11 text-base font-semibold hover:bg-accent hover:border-primary/50"
              >
                Create an account
              </Button>
            </Link>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            By signing in, you agree to our{' '}
            <button className="text-primary hover:underline font-medium">Terms</button>
            {' '}and{' '}
            <button className="text-primary hover:underline font-medium">Privacy Policy</button>
          </p>
        </div>
      </div>

      {/* Right side - Hero */}
      <div className="hidden lg:flex items-center justify-center p-8 bg-gradient-to-br from-orange-50 via-amber-50/50 to-emerald-50/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-50" />
        
        {/* Floating decorative circles */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-primary/20 to-orange-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-br from-secondary/20 to-emerald-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        
        <div className="relative z-10 max-w-lg">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-orange-200/50 mb-6 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-sm font-medium text-foreground/90">Live collaboration</span>
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-6 leading-tight text-foreground">
            Build together,
            <br />
            <span className="text-gradient-orange">
              ship faster
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Circuit brings your team together with powerful organization tools, 
            seamless collaboration, and everything you need to ship great products.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl btn-gradient-green flex items-center justify-center shadow-sm">
                <span className="text-sm text-white">✓</span>
              </div>
              <span className="text-base text-foreground/90">Team management & permissions</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl btn-gradient-green flex items-center justify-center shadow-sm">
                <span className="text-sm text-white">✓</span>
              </div>
              <span className="text-base text-foreground/90">Real-time collaboration</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl btn-gradient-green flex items-center justify-center shadow-sm">
                <span className="text-sm text-white">✓</span>
              </div>
              <span className="text-base text-foreground/90">Secure & compliant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
