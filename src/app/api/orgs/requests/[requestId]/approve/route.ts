import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getStore, updateStore, OrgMember } from '@/lib/data-store'

export async function POST(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const requestId = params.requestId
    const store = getStore()
    
    const joinRequest = (store.joinRequests || []).find(r => r.id === requestId)
    if (!joinRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    // Check if user can manage this org's team
    const membership = store.orgMembers.find(
      m => m.orgId === joinRequest.orgId && m.userId === user.id
    )
    
    if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Add user to organization
    const newMember: OrgMember = {
      orgId: joinRequest.orgId,
      userId: joinRequest.userId,
      role: 'developer', // Default role for approved requests
      joinedAt: new Date().toISOString(),
    }

    updateStore(s => ({
      ...s,
      orgMembers: [...s.orgMembers, newMember],
      joinRequests: (s.joinRequests || []).map(r =>
        r.id === requestId ? { ...r, status: 'approved' as const } : r
      ),
    }))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Approve request error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

