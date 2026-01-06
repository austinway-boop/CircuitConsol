'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Building, Plus } from 'lucide-react'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<'choice' | 'create' | 'request'>('choice')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Create org
  const [orgName, setOrgName] = useState('')
  
  // Request to join
  const [requestOrgName, setRequestOrgName] = useState('')
  const [requestMessage, setRequestMessage] = useState('')

  const handleCreateOrg = async () => {
    if (!orgName.trim()) return
    
    setLoading(true)
    setError('')
    
    try {
      const res = await fetch('/api/orgs/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: orgName }),
      })

      if (res.ok) {
        router.push('/app/organizations')
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to create organization')
      }
    } catch (err) {
      setError('Failed to create organization')
    } finally {
      setLoading(false)
    }
  }

  const handleRequestToJoin = async () => {
    if (!requestOrgName.trim()) return
    
    setLoading(true)
    setError('')
    
    try {
      const res = await fetch('/api/orgs/request-join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orgName: requestOrgName,
          message: requestMessage 
        }),
      })

      if (res.ok) {
        router.push('/app/organizations?requested=true')
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to send request')
      }
    } catch (err) {
      setError('Failed to send request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-xl animate-scale-in">
        {step === 'choice' && (
          <div className="space-y-4">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Welcome to Circuit!</h1>
              <p className="text-muted-foreground text-lg">
                Let's set up your workspace
              </p>
            </div>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setStep('create')}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-orange-500/10 flex items-center justify-center flex-shrink-0">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">Create an organization</h3>
                    <p className="text-sm text-muted-foreground">
                      Start fresh and invite your team members
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setStep('request')}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-orange-500/10 flex items-center justify-center flex-shrink-0">
                    <Building className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">Request to join an organization</h3>
                    <p className="text-sm text-muted-foreground">
                      Ask an admin for access to an existing organization
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'create' && (
          <Card className="border-0 shadow-xl animate-fade-in">
            <CardHeader>
              <CardTitle className="text-2xl">Create your organization</CardTitle>
              <CardDescription className="text-base">
                Choose a name for your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="p-3 text-sm bg-red-50 border border-red-200 rounded-xl text-red-700 animate-slide-in">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="org-name" className="text-sm font-medium">Organization name</Label>
                <Input
                  id="org-name"
                  placeholder="Acme Corp"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="h-11 text-base"
                  autoFocus
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setStep('choice')}
                  className="flex-1 h-11"
                >
                  Back
                </Button>
                <Button
                  onClick={handleCreateOrg}
                  disabled={loading || !orgName.trim()}
                  className="flex-1 h-11"
                >
                  {loading ? 'Creating...' : 'Create organization'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'request' && (
          <Card className="border-0 shadow-xl animate-fade-in">
            <CardHeader>
              <CardTitle className="text-2xl">Request to join</CardTitle>
              <CardDescription className="text-base">
                Send a request to an organization admin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="p-3 text-sm bg-red-50 border border-red-200 rounded-xl text-red-700 animate-slide-in">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="request-org-name" className="text-sm font-medium">Organization name</Label>
                <Input
                  id="request-org-name"
                  placeholder="Which organization do you want to join?"
                  value={requestOrgName}
                  onChange={(e) => setRequestOrgName(e.target.value)}
                  className="h-11 text-base"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="request-message" className="text-sm font-medium">Message (optional)</Label>
                <Input
                  id="request-message"
                  placeholder="Why would you like to join?"
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setStep('choice')}
                  className="flex-1 h-11"
                >
                  Back
                </Button>
                <Button
                  onClick={handleRequestToJoin}
                  disabled={loading || !requestOrgName.trim()}
                  className="flex-1 h-11"
                >
                  {loading ? 'Sending...' : 'Send request'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
