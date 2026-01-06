import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getUserOrganizations, getUserOrgMembership } from '@/lib/org-utils'
import { updateStore } from '@/lib/data-store'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgs = await getUserOrganizations(user.id)
    const currentOrg = orgs[0]

    if (!currentOrg) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 })
    }

    // Check if user is a manager
    const membership = await getUserOrgMembership(user.id, currentOrg.id)
    if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
      return NextResponse.json({ error: 'Only managers can remove members' }, { status: 403 })
    }

    const userId = params.userId

    await updateStore(s => ({
      ...s,
      orgMembers: s.orgMembers.filter(
        m => !(m.userId === userId && m.orgId === currentOrg.id)
      ),
    }))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Remove member error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

