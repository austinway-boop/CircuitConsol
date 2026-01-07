'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTheme } from '@/components/theme-provider'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  // Profile state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  
  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/settings/profile')
      if (res.ok) {
        const data = await res.json()
        setName(data.name)
        setEmail(data.email)
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    }
  }

  const showMessage = (text: string) => {
    setMessage(text)
    setTimeout(() => setMessage(''), 3000)
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const res = await fetch('/api/settings/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email })
      })
      
      if (res.ok) {
        showMessage('Profile updated successfully')
      } else {
        const data = await res.json()
        showMessage(data.error || 'Failed to update profile')
      }
    } catch (error) {
      showMessage('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      showMessage('Passwords do not match')
      return
    }
    
    if (newPassword.length < 8) {
      showMessage('Password must be at least 8 characters')
      return
    }
    
    setLoading(true)
    
    try {
      const res = await fetch('/api/settings/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      })
      
      if (res.ok) {
        showMessage('Password changed successfully')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        const data = await res.json()
        showMessage(data.error || 'Failed to change password')
      }
    } catch (error) {
      showMessage('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-12">
        <h1 className="text-3xl font-normal mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences
        </p>
      </div>

      {message && (
        <div className="mb-8 p-4 border rounded-md bg-muted/50">
          {message}
        </div>
      )}

      <div className="space-y-12">
        {/* Appearance */}
        <section>
          <h2 className="text-lg font-medium mb-6">Appearance</h2>
          <div className="space-y-4">
            <div>
              <Label className="text-sm text-muted-foreground font-normal">
                Theme
              </Label>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setTheme('light')}
                  className={`px-4 py-2 rounded border transition-colors ${
                    theme === 'light'
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border hover:border-foreground'
                  }`}
                >
                  Light
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`px-4 py-2 rounded border transition-colors ${
                    theme === 'dark'
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border hover:border-foreground'
                  }`}
                >
                  Dark
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={`px-4 py-2 rounded border transition-colors ${
                    theme === 'system'
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border hover:border-foreground'
                  }`}
                >
                  System
                </button>
              </div>
            </div>
          </div>
        </section>

        <hr className="border-border" />

        {/* Profile */}
        <section>
          <h2 className="text-lg font-medium mb-6">Profile</h2>
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-normal">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="max-w-md"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-normal">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="max-w-md"
                required
              />
            </div>

            <Button type="submit" disabled={loading} variant="outline">
              {loading ? 'Saving...' : 'Save changes'}
            </Button>
          </form>
        </section>

        <hr className="border-border" />

        {/* Password */}
        <section>
          <h2 className="text-lg font-medium mb-6">Password</h2>
          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="current-password" className="text-sm font-normal">
                Current password
              </Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="max-w-md"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-sm font-normal">
                New password
              </Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="max-w-md"
                required
              />
              <p className="text-sm text-muted-foreground">
                Must be at least 8 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-sm font-normal">
                Confirm new password
              </Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="max-w-md"
                required
              />
            </div>

            <Button type="submit" disabled={loading} variant="outline">
              {loading ? 'Changing...' : 'Change password'}
            </Button>
          </form>
        </section>
      </div>
    </div>
  )
}
