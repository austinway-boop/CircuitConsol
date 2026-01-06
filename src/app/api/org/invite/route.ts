import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getUserOrganizations } from '@/lib/org-utils'
import { updateStore, Invite } from '@/lib/data-store'
import { nanoid } from 'nanoid'

export async function POST(request: NextRequest) {
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

    // Generate secure random token
    const token = nanoid(32)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days

    const invite: Invite = {
      id: `inv_${nanoid(12)}`,
      orgId: currentOrg.id,
      email: '', // Generic invite, not tied to specific email
      role: 'developer', // Will be mapped to 'member'
      token,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
    }

    await updateStore(s => ({
      ...s,
      invites: [...s.invites, invite],
    }))

    return NextResponse.json({ token })
  } catch (error) {
    console.error('Create invite error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

