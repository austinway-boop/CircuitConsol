import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getUserOrganizations } from '@/lib/org-utils'
import { getStore } from '@/lib/data-store'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgs = getUserOrganizations(user.id)
    const currentOrg = orgs[0]

    if (!currentOrg) {
      return NextResponse.json({ org: null, members: [] })
    }

    const store = getStore()
    
    // Get user's role
    const membership = store.orgMembers.find(
      m => m.orgId === currentOrg.id && m.userId === user.id
    )
    
    // Map old roles to new simplified roles
    const mapRole = (oldRole: string) => {
      return oldRole === 'owner' || oldRole === 'admin' ? 'manager' : 'member'
    }

    // Get all members
    const orgMemberships = store.orgMembers.filter(m => m.orgId === currentOrg.id)
    const members = orgMemberships.map(m => {
      const memberUser = store.users.find(u => u.id === m.userId)
      return {
        userId: m.userId,
        userName: memberUser?.name || 'Unknown',
        userEmail: memberUser?.email || 'unknown@example.com',
        role: mapRole(m.role),
        joinedAt: m.joinedAt,
      }
    })

    return NextResponse.json({
      org: {
        id: currentOrg.id,
        name: currentOrg.name,
        yourRole: membership ? mapRole(membership.role) : 'member',
      },
      members,
    })
  } catch (error) {
    console.error('Get org details error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

