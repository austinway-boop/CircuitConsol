import { NextResponse } from 'next/server'
import { getCurrentUser, deleteSessionCookie } from '@/lib/auth'
import { getStore, updateStore } from '@/lib/data-store'

export async function DELETE() {
  const user = await getCurrentUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const store = await getStore()

  // Find all organizations where user is the owner
  const ownedOrgs = store.organizations.filter(org => org.ownerId === user.id)
  
  // Check if any owned organizations have other members
  for (const org of ownedOrgs) {
    const otherMembers = store.orgMembers.filter(
      m => m.orgId === org.id && m.userId !== user.id
    )
    
    if (otherMembers.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete account. You must transfer ownership or remove all members from your organizations first.' },
        { status: 400 }
      )
    }
  }

  // Delete user data
  await updateStore(s => ({
    ...s,
    // Remove user
    users: s.users.filter(u => u.id !== user.id),
    // Remove user's org memberships
    orgMembers: s.orgMembers.filter(m => m.userId !== user.id),
    // Remove organizations owned by user (if no other members)
    organizations: s.organizations.filter(org => org.ownerId !== user.id),
    // Remove projects from owned organizations
    projects: s.projects.filter(p => {
      const org = ownedOrgs.find(o => o.id === p.orgId)
      return !org
    }),
    // Remove API keys from owned projects
    apiKeys: s.apiKeys.filter(k => {
      const project = s.projects.find(p => p.id === k.projectId)
      if (!project) return true
      const org = ownedOrgs.find(o => o.id === project.orgId)
      return !org
    }),
    // Remove invites created by user
    invites: s.invites.filter(i => i.createdBy !== user.id),
    // Remove audit logs
    auditLogs: s.auditLogs.filter(log => log.userId !== user.id),
    // Remove Circuit API keys
    circuitApiKeys: (s.circuitApiKeys || []).filter(k => k.createdBy !== user.id)
  }))

  // Delete session
  await deleteSessionCookie()

  return NextResponse.json({ success: true })
}

