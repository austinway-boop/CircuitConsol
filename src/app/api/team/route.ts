import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getUserOrganizations, getUserOrgMembership, canManageTeam } from '@/lib/org-utils'
import { getStore } from '@/lib/data-store'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgs = getUserOrganizations(user.id)
    const currentOrg = orgs[0]

    if (!currentOrg) {
      return NextResponse.json({ members: [], invites: [], canManageTeam: false })
    }

    const store = getStore()
    const membership = getUserOrgMembership(user.id, currentOrg.id)
    
    // Get members
    const orgMemberships = store.orgMembers.filter(m => m.orgId === currentOrg.id)
    const members = orgMemberships.map(m => {
      const memberUser = store.users.find(u => u.id === m.userId)
      return {
        userId: m.userId,
        userName: memberUser?.name || 'Unknown',
        userEmail: memberUser?.email || 'unknown@example.com',
        role: m.role,
        joinedAt: m.joinedAt,
      }
    })

    // Get pending invites
    const invites = store.invites.filter(i => 
      i.orgId === currentOrg.id && !i.acceptedAt
    )

    return NextResponse.json({
      members,
      invites,
      canManageTeam: membership ? canManageTeam(membership.role) : false,
    })
  } catch (error) {
    console.error('Get team error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

