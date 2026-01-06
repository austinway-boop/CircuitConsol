'use client'

import { useState, useEffect } from 'react'
import { Building, Users, Crown, Shield, Code, Eye, UserPlus, Copy, Check, Plus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'

interface Organization {
  id: string
  name: string
  role: 'owner' | 'admin' | 'developer' | 'viewer'
  memberCount: number
  pendingRequests?: number
}

interface JoinRequest {
  id: string
  userId: string
  userName: string
  userEmail: string
  message?: string
  createdAt: string
}

const roleIcons = {
  owner: Crown,
  admin: Shield,
  developer: Code,
  viewer: Eye,
}

const roleColors = {
  owner: 'text-amber-600',
  admin: 'text-blue-600',
  developer: 'text-green-600',
  viewer: 'text-gray-600',
}

export default function OrganizationsPage() {
  const router = useRouter()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [inviteLink, setInviteLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [requestsDialogOpen, setRequestsDialogOpen] = useState(false)
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([])
  const [formData, setFormData] = useState({
    email: '',
    role: 'developer' as 'admin' | 'developer' | 'viewer',
  })

  useEffect(() => {
    loadOrganizations()
  }, [])

  const loadOrganizations = async () => {
    try {
      const res = await fetch('/api/orgs/my-orgs')
      const data = await res.json()
      setOrganizations(data.organizations || [])
    } catch (error) {
      console.error('Failed to load organizations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateInvite = async () => {
    if (!selectedOrg || !formData.email.trim()) return

    try {
      const res = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orgId: selectedOrg.id,
          ...formData 
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const link = `${window.location.origin}/accept-invite?token=${data.invite.token}`
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

  const handleViewRequests = async (org: Organization) => {
    setSelectedOrg(org)
    try {
      const res = await fetch(`/api/orgs/${org.id}/requests`)
      const data = await res.json()
      setJoinRequests(data.requests || [])
      setRequestsDialogOpen(true)
    } catch (error) {
      console.error('Failed to load requests:', error)
    }
  }

  const handleApproveRequest = async (requestId: string) => {
    try {
      await fetch(`/api/orgs/requests/${requestId}/approve`, { method: 'POST' })
      if (selectedOrg) {
        const res = await fetch(`/api/orgs/${selectedOrg.id}/requests`)
        const data = await res.json()
        setJoinRequests(data.requests || [])
      }
      loadOrganizations()
    } catch (error) {
      console.error('Failed to approve request:', error)
    }
  }

  const handleDenyRequest = async (requestId: string) => {
    try {
      await fetch(`/api/orgs/requests/${requestId}/deny`, { method: 'POST' })
      if (selectedOrg) {
        const res = await fetch(`/api/orgs/${selectedOrg.id}/requests`)
        const data = await res.json()
        setJoinRequests(data.requests || [])
      }
    } catch (error) {
      console.error('Failed to deny request:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center animate-pulse">
          <Building className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading organizations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Organizations</h1>
          <p className="text-muted-foreground">
            Manage and collaborate with your teams
          </p>
        </div>
        <Button
          onClick={() => router.push('/onboarding')}
          className="shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          New organization
        </Button>
      </div>

      {/* Organizations Grid */}
      {organizations.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Building className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No organizations yet</h3>
            <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
              Get started by creating your first organization
            </p>
            <Button onClick={() => router.push('/onboarding')}>
              <Plus className="h-4 w-4 mr-2" />
              Get started
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {organizations.map((org, index) => {
            const RoleIcon = roleIcons[org.role]
            const canManage = org.role === 'owner' || org.role === 'admin'

            return (
              <Card 
                key={org.id} 
                className="border-0 shadow-md hover:shadow-lg transition-all animate-slide-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/10 to-orange-500/10 flex items-center justify-center">
                      <Building className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant="secondary" className="capitalize text-xs">
                      <RoleIcon className={`h-3 w-3 mr-1 ${roleColors[org.role]}`} />
                      {org.role}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{org.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1.5 text-sm">
                    <Users className="h-3.5 w-3.5" />
                    {org.memberCount} {org.memberCount === 1 ? 'member' : 'members'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {canManage && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setSelectedOrg(org)
                          setInviteDialogOpen(true)
                          setInviteLink('')
                          setFormData({ email: '', role: 'developer' })
                        }}
                      >
                        <UserPlus className="h-3.5 w-3.5 mr-2" />
                        Invite member
                      </Button>
                      {org.pendingRequests && org.pendingRequests > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleViewRequests(org)}
                        >
                          <Shield className="h-3.5 w-3.5 mr-2" />
                          Requests ({org.pendingRequests})
                        </Button>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Invite Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="animate-scale-in border-0 shadow-xl">
          <DialogHeader>
            <DialogTitle>Invite team member</DialogTitle>
            <DialogDescription>
              Send an invitation to join {selectedOrg?.name}
            </DialogDescription>
          </DialogHeader>
          
          {!inviteLink ? (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="colleague@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm">Role</Label>
                <Select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="h-10"
                >
                  <option value="viewer">Viewer</option>
                  <option value="developer">Developer</option>
                  <option value="admin">Admin</option>
                </Select>
              </div>
              <Button 
                onClick={handleCreateInvite} 
                disabled={!formData.email.trim()}
                className="w-full"
              >
                Generate invite link
              </Button>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="p-3 bg-accent/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">Share this link:</p>
                <code className="text-xs break-all block mb-2">{inviteLink}</code>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={copyInviteLink}
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 mr-2" />
                      Copy link
                    </>
                  )}
                </Button>
              </div>
              <Button variant="outline" onClick={() => setInviteDialogOpen(false)} className="w-full">
                Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Join Requests Dialog */}
      <Dialog open={requestsDialogOpen} onOpenChange={setRequestsDialogOpen}>
        <DialogContent className="animate-scale-in border-0 shadow-xl max-w-xl">
          <DialogHeader>
            <DialogTitle>Join requests</DialogTitle>
            <DialogDescription>
              People requesting to join {selectedOrg?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 py-2 max-h-80 overflow-y-auto">
            {joinRequests.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-6">No pending requests</p>
            ) : (
              joinRequests.map((request) => (
                <Card key={request.id} className="border-0 shadow-sm">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{request.userName}</h4>
                        <p className="text-xs text-muted-foreground">{request.userEmail}</p>
                        {request.message && (
                          <p className="text-xs mt-1.5 text-muted-foreground italic">"{request.message}"</p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApproveRequest(request.id)}
                        className="flex-1 h-9"
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDenyRequest(request.id)}
                        className="flex-1 h-9"
                      >
                        Deny
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
