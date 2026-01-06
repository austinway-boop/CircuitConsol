'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Building, Plus } from 'lucide-react'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<'choice' | 'create' | 'request'>('choice')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [orgName, setOrgName] = useState('')
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
        router.push('/app/organization')
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
        router.push('/app/organization?requested=true')
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg animate-fade-in">
        {step === 'choice' && (
          <div className="space-y-4">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold mb-2">Set up your workspace</h1>
              <p className="text-sm text-muted-foreground">Choose how you'd like to get started</p>
            </div>

            <button
              onClick={() => setStep('create')}
              className="w-full p-6 border rounded-xl hover:border-primary/50 hover:bg-accent/50 transition-all text-left"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Plus className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Create organization</h3>
                  <p className="text-sm text-muted-foreground">Start fresh with your own workspace</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setStep('request')}
              className="w-full p-6 border rounded-xl hover:border-primary/50 hover:bg-accent/50 transition-all text-left"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Request to join</h3>
                  <p className="text-sm text-muted-foreground">Ask to join an existing organization</p>
                </div>
              </div>
            </button>
          </div>
        )}

        {step === 'create' && (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-semibold mb-2">Create organization</h1>
              <p className="text-sm text-muted-foreground">Choose a name for your workspace</p>
            </div>

            {error && (
              <div className="p-3 text-sm bg-red-50 border border-red-200 rounded-lg text-red-700 mb-4">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="org-name">Organization name</Label>
                <Input
                  id="org-name"
                  placeholder="Acme Corp"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep('choice')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleCreateOrg}
                  disabled={loading || !orgName.trim()}
                  className="flex-1"
                >
                  {loading ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 'request' && (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-semibold mb-2">Request to join</h1>
              <p className="text-sm text-muted-foreground">Send a request to an organization</p>
            </div>

            {error && (
              <div className="p-3 text-sm bg-red-50 border border-red-200 rounded-lg text-red-700 mb-4">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="request-org-name">Organization name</Label>
                <Input
                  id="request-org-name"
                  placeholder="Which organization?"
                  value={requestOrgName}
                  onChange={(e) => setRequestOrgName(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="request-message">Message (optional)</Label>
                <Input
                  id="request-message"
                  placeholder="Why would you like to join?"
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep('choice')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleRequestToJoin}
                  disabled={loading || !requestOrgName.trim()}
                  className="flex-1"
                >
                  {loading ? 'Sending...' : 'Send request'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
