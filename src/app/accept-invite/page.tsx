'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle } from 'lucide-react'

export default function AcceptInvitePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Invalid invitation link')
      return
    }

    acceptInvite()
  }, [token])

  const acceptInvite = async () => {
    try {
      const res = await fetch('/api/invites/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      const data = await res.json()

      if (res.ok) {
        setStatus('success')
        setMessage('Invitation accepted successfully!')
        setTimeout(() => {
          router.push('/app/organization')
        }, 2000)
      } else {
        setStatus('error')
        setMessage(data.error || 'Failed to accept invitation')
      }
    } catch (error) {
      setStatus('error')
      setMessage('An error occurred while accepting the invitation')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {status === 'loading' && 'Processing Invitation...'}
            {status === 'success' && (
              <>
                <CheckCircle className="h-6 w-6 text-green-500" />
                Success!
              </>
            )}
            {status === 'error' && (
              <>
                <XCircle className="h-6 w-6 text-destructive" />
                Error
              </>
            )}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {status === 'success' && (
            <p className="text-sm text-muted-foreground">
              Redirecting you to the dashboard...
            </p>
          )}
          {status === 'error' && (
            <Button onClick={() => router.push('/sign-in')} className="mt-4">
              Go to Sign In
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

