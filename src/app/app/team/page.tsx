'use client'

import { useState, useEffect } from 'react'
import { UserPlus, Users, Mail, Trash2, Crown, Shield, Code, Eye, Link as LinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/empty-state'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CopyButton } from '@/components/copy-button'
import { Badge } from '@/components/ui/badge'

interface Member {
  userId: string
  userName: string
  userEmail: string
  role: 'owner' | 'admin' | 'developer' | 'viewer'
  joinedAt: string
}

interface Invite {
  id: string
  email: string
  role: 'admin' | 'developer' | 'viewer'
  token: string
  createdAt: string
  expiresAt: string
}

const roleIcons = {
  owner: Crown,
  admin: Shield,
  developer: Code,
  viewer: Eye,
}

const roleColors = {
  owner: 'text-yellow-500',
  admin: 'text-blue-500',
  developer: 'text-green-500',
  viewer: 'text-gray-500',
}

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [invites, setInvites] = useState<Invite[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [inviteLinkDialogOpen, setInviteLinkDialogOpen] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const [creating, setCreating] = useState(false)
  const [canManageTeam, setCanManageTeam] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    role: 'developer' as 'admin' | 'developer' | 'viewer',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const res = await fetch('/api/team')
      const data = await res.json()
      setMembers(data.members || [])
      setInvites(data.invites || [])
      setCanManageTeam(data.canManageTeam || false)
    } catch (error) {
      console.error('Failed to load team:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async () => {
    if (!formData.email.trim()) return

    setCreating(true)
    try {
      const res = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        const data = await res.json()
        const link = `${window.location.origin}/accept-invite?token=${data.invite.token}`
        setInviteLink(link)
        setInviteLinkDialogOpen(true)
        await loadData()
        setInviteDialogOpen(false)
        setFormData({ email: '', role: 'developer' })
      }
    } catch (error) {
      console.error('Failed to create invite:', error)
    } finally {
      setCreating(false)
    }
  }

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return

    try {
      await fetch(`/api/team/members/${userId}`, { method: 'DELETE' })
      await loadData()
    } catch (error) {
      console.error('Failed to remove member:', error)
    }
  }

  const handleRevokeInvite = async (inviteId: string) => {
    try {
      await fetch(`/api/team/invites/${inviteId}`, { method: 'DELETE' })
      await loadData()
    } catch (error) {
      console.error('Failed to revoke invite:', error)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team</h1>
          <p className="text-muted-foreground mt-2">
            Manage your organization's team members and permissions
          </p>
        </div>
        {canManageTeam && (
          <Button onClick={() => setInviteDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Member
          </Button>
        )}
      </div>

      {/* Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members
          </CardTitle>
          <CardDescription>
            People who have access to this organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No team members"
              description="Invite team members to collaborate on your projects"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  {canManageTeam && <TableHead></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => {
                  const RoleIcon = roleIcons[member.role]
                  return (
                    <TableRow key={member.userId}>
                      <TableCell className="font-medium">{member.userName}</TableCell>
                      <TableCell className="text-muted-foreground">{member.userEmail}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          <RoleIcon className={`h-3 w-3 mr-1 ${roleColors[member.role]}`} />
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(member.joinedAt).toLocaleDateString()}
                      </TableCell>
                      {canManageTeam && (
                        <TableCell>
                          {member.role !== 'owner' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveMember(member.userId)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pending Invites */}
      {invites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Pending Invites
            </CardTitle>
            <CardDescription>
              Invitations that haven't been accepted yet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Invited</TableHead>
                  <TableHead>Expires</TableHead>
                  {canManageTeam && <TableHead></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {invites.map((invite) => (
                  <TableRow key={invite.id}>
                    <TableCell className="font-medium">{invite.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {invite.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(invite.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(invite.expiresAt).toLocaleDateString()}
                    </TableCell>
                    {canManageTeam && (
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRevokeInvite(invite.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Invite Member Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join your organization
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              >
                <option value="viewer">Viewer - Read-only access</option>
                <option value="developer">Developer - Can manage projects</option>
                <option value="admin">Admin - Can manage team</option>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleInvite} disabled={creating || !formData.email.trim()}>
                {creating ? 'Creating...' : 'Create Invite'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite Link Dialog */}
      <Dialog open={inviteLinkDialogOpen} onOpenChange={setInviteLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invitation Created</DialogTitle>
            <DialogDescription>
              Share this link with the person you want to invite
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <code className="text-sm font-mono break-all flex-1">{inviteLink}</code>
                <CopyButton value={inviteLink} />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              This invitation will expire in 7 days.
            </p>
            <div className="flex justify-end">
              <Button onClick={() => setInviteLinkDialogOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

