import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getUserOrganizations, getUserOrgMembership, canManageTeam } from '@/lib/org-utils'
import { updateStore, Invite } from '@/lib/data-store'
import { nanoid } from 'nanoid'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orgId, email, role } = await request.json()

    if (!orgId) {
      const orgs = getUserOrganizations(user.id)
      const currentOrg = orgs[0]

      if (!currentOrg) {
        return NextResponse.json({ error: 'No organization found' }, { status: 400 })
      }
    }

    const targetOrgId = orgId || getUserOrganizations(user.id)[0]?.id

    const membership = getUserOrgMembership(user.id, targetOrgId)
    if (!membership || !canManageTeam(membership.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    if (!email || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const token = nanoid(32)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days

    const invite: Invite = {
      id: `inv_${nanoid(12)}`,
      orgId: targetOrgId,
      email,
      role,
      token,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
    }

    updateStore(s => ({
      ...s,
      invites: [...s.invites, invite],
    }))

    return NextResponse.json({ invite })
  } catch (error) {
    console.error('Create invite error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

