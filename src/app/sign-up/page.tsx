'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowRight, Sparkles } from 'lucide-react'

export default function SignUpPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to sign up')
      }

      router.push('/onboarding')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left side - Hero */}
      <div className="hidden lg:flex items-center justify-center p-8 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-50/30 relative overflow-hidden border-r">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="relative z-10 max-w-lg">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 backdrop-blur-sm border border-orange-200/50 mb-6 shadow-sm">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground/90">Join thousands of teams</span>
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-6 leading-tight text-foreground">
            Start building
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">
              something great
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Create your Circuit account and get instant access to powerful 
            team collaboration tools designed for modern teams.
          </p>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <div className="text-3xl font-bold text-primary">10k+</div>
              <div className="text-sm text-muted-foreground">Active teams</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-primary">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">Support</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-primary">150+</div>
              <div className="text-sm text-muted-foreground">Countries</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in">
          {/* Logo */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-3 mb-3">
              <div className="w-11 h-11 bg-gradient-to-br from-primary to-orange-500 rounded-2xl flex items-center justify-center shadow-sm">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-3xl font-bold tracking-tight">Circuit</span>
            </div>
            <p className="text-muted-foreground text-lg">Create your account to get started</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 text-sm bg-red-50 border border-red-200 rounded-xl text-red-700 animate-slide-in">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Full name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="h-11 text-base border-border focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="h-11 text-base border-border focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={8}
                className="h-11 text-base border-border focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
              <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 text-base font-semibold mt-6" 
              disabled={loading}
            >
              {loading ? (
                'Creating account...'
              ) : (
                <>
                  Create account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground font-medium">
                  Already have an account?
                </span>
              </div>
            </div>

            <Link href="/sign-in">
              <Button 
                type="button" 
                variant="outline"
                className="w-full h-11 text-base font-semibold border-2 hover:bg-accent"
              >
                Sign in instead
              </Button>
            </Link>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            By signing up, you agree to our{' '}
            <button className="text-primary hover:underline font-medium">Terms</button>
            {' '}and{' '}
            <button className="text-primary hover:underline font-medium">Privacy Policy</button>
          </p>
        </div>
      </div>
    </div>
  )
}
