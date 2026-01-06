'use client'

import { useState, useEffect } from 'react'
import { UserPlus, Copy, Check, Crown, User as UserIcon, MoreVertical } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'

interface Member {
  userId: string
  userName: string
  userEmail: string
  role: 'manager' | 'member'
  joinedAt: string
}

interface Organization {
  id: string
  name: string
  yourRole: 'manager' | 'member'
}

export default function OrganizationPage() {
  const [org, setOrg] = useState<Organization | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const res = await fetch('/api/org/details')
      const data = await res.json()
      setOrg(data.org || null)
      setMembers(data.members || [])
    } catch (error) {
      console.error('Failed to load organization:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateInvite = async () => {
    try {
      const res = await fetch('/api/org/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (res.ok) {
        const data = await res.json()
        const link = `${window.location.origin}/accept-invite?token=${data.token}`
        setInviteLink(link)
      }
    } catch (error) {
      console.error('Failed to create invite:', error)
    }
  }

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleChangeRole = async (userId: string, newRole: 'manager' | 'member') => {
    try {
      await fetch('/api/org/members/change-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      })
      await loadData()
      setActiveMenu(null)
    } catch (error) {
      console.error('Failed to change role:', error)
    }
  }

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Remove this member from the organization?')) return
    
    try {
      await fetch(`/api/org/members/${userId}`, { method: 'DELETE' })
      await loadData()
      setActiveMenu(null)
    } catch (error) {
      console.error('Failed to remove member:', error)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">Loading...</div>
  }

  if (!org) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="font-semibold mb-2">No organization</h3>
            <p className="text-sm text-muted-foreground mb-4">You need to create or join an organization</p>
            <Button onClick={() => window.location.href = '/onboarding'}>Get started</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isManager = org.yourRole === 'manager'

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-1">{org.name}</h1>
          <p className="text-sm text-muted-foreground">{members.length} {members.length === 1 ? 'member' : 'members'}</p>
        </div>
        {isManager && (
          <Button onClick={() => setInviteDialogOpen(true)} size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Invite
          </Button>
        )}
      </div>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {members.map((member) => (
              <div key={member.userId} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {member.userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{member.userName}</p>
                    <p className="text-xs text-muted-foreground">{member.userEmail}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {member.role === 'manager' ? (
                      <>
                        <Crown className="h-3 w-3 mr-1" />
                        Organization Manager
                      </>
                    ) : (
                      <>
                        <UserIcon className="h-3 w-3 mr-1" />
                        Member
                      </>
                    )}
                  </Badge>
                  
                  {isManager && (
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveMenu(activeMenu === member.userId ? null : member.userId)
                        }}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                      
                      {activeMenu === member.userId && (
                        <div className="absolute right-0 top-full mt-1 bg-card border rounded-lg shadow-lg overflow-hidden z-10 min-w-[180px]">
                          <button
                            onClick={() => handleChangeRole(member.userId, member.role === 'manager' ? 'member' : 'manager')}
                            className="flex items-center gap-2 px-3 py-2 hover:bg-accent transition-colors text-sm w-full text-left"
                          >
                            {member.role === 'manager' ? 'Change to Member' : 'Make Manager'}
                          </button>
                          <button
                            onClick={() => handleRemoveMember(member.userId)}
                            className="flex items-center gap-2 px-3 py-2 hover:bg-destructive/10 hover:text-destructive transition-colors text-sm w-full text-left"
                          >
                            Remove from org
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Invite Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite to organization</DialogTitle>
            <DialogDescription>Share this link to invite someone to {org.name}</DialogDescription>
          </DialogHeader>
          
          {!inviteLink ? (
            <div className="py-4">
              <Button onClick={handleCreateInvite} className="w-full">
                Generate invite link
              </Button>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="p-3 bg-accent rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">Share this link:</p>
                <code className="text-xs break-all block mb-3">{inviteLink}</code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyInviteLink}
                  className="w-full"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy link
                    </>
                  )}
                </Button>
              </div>
              <Button variant="outline" onClick={() => {
                setInviteDialogOpen(false)
                setInviteLink('')
                setCopied(false)
              }} className="w-full">
                Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
