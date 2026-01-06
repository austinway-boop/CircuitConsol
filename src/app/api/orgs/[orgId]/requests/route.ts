import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getStore } from '@/lib/data-store'
import { getUserOrgMembership, canManageTeam } from '@/lib/org-utils'

export async function GET(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = params.orgId
    
    // Check if user can manage team
    const membership = await getUserOrgMembership(user.id, orgId)
    if (!membership || !canManageTeam(membership.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const store = await getStore()
    const requests = (store.joinRequests || []).filter(
      r => r.orgId === orgId && r.status === 'pending'
    )

    return NextResponse.json({ requests })
  } catch (error) {
    console.error('Get requests error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

