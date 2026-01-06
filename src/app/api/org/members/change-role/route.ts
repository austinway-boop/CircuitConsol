import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getUserOrganizations, getUserOrgMembership } from '@/lib/org-utils'
import { updateStore } from '@/lib/data-store'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgs = getUserOrganizations(user.id)
    const currentOrg = orgs[0]

    if (!currentOrg) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 })
    }

    // Check if user is a manager
    const membership = getUserOrgMembership(user.id, currentOrg.id)
    if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
      return NextResponse.json({ error: 'Only managers can change roles' }, { status: 403 })
    }

    const { userId, role } = await request.json()

    if (!userId || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Map new role to old role system
    const oldRole = role === 'manager' ? 'admin' : 'developer'

    updateStore(s => ({
      ...s,
      orgMembers: s.orgMembers.map(m =>
        m.userId === userId && m.orgId === currentOrg.id
          ? { ...m, role: oldRole }
          : m
      ),
    }))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Change role error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

