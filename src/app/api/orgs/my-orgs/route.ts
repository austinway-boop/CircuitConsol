import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getStore } from '@/lib/data-store'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const store = getStore()
    
    // Get user's organization memberships
    const userMemberships = store.orgMembers.filter(m => m.userId === user.id)
    
    const organizations = userMemberships.map(membership => {
      const org = store.organizations.find(o => o.id === membership.orgId)
      const memberCount = store.orgMembers.filter(m => m.orgId === membership.orgId).length
      const pendingRequests = (store.joinRequests || []).filter(
        r => r.orgId === membership.orgId && r.status === 'pending'
      ).length
      
      return {
        id: org?.id || '',
        name: org?.name || 'Unknown',
        role: membership.role,
        memberCount,
        pendingRequests: pendingRequests > 0 ? pendingRequests : undefined,
      }
    })

    return NextResponse.json({ organizations })
  } catch (error) {
    console.error('Get my orgs error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

