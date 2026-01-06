import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getStore, updateStore, OrgMember } from '@/lib/data-store'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    const store = await getStore()
    const invite = store.invites.find(i => i.token === token && !i.acceptedAt)

    if (!invite) {
      return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 400 })
    }

    // Check if invite has expired
    if (new Date(invite.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Invitation has expired' }, { status: 400 })
    }

    // Check if user is already a member
    const existingMember = store.orgMembers.find(
      m => m.orgId === invite.orgId && m.userId === user.id
    )

    if (existingMember) {
      return NextResponse.json({ error: 'Already a member of this organization' }, { status: 400 })
    }

    // Add user to organization
    const membership: OrgMember = {
      orgId: invite.orgId,
      userId: user.id,
      role: invite.role,
      joinedAt: new Date().toISOString(),
    }

    await updateStore(s => ({
      ...s,
      orgMembers: [...s.orgMembers, membership],
      invites: s.invites.map(i =>
        i.id === invite.id ? { ...i, acceptedAt: new Date().toISOString() } : i
      ),
    }))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Accept invite error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

