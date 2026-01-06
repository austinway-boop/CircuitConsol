import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getStore, updateStore } from '@/lib/data-store'
import { nanoid } from 'nanoid'

interface JoinRequest {
  id: string
  orgId: string
  userId: string
  userName: string
  userEmail: string
  message?: string
  createdAt: string
  status: 'pending' | 'approved' | 'denied'
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orgName, message } = await request.json()

    if (!orgName) {
      return NextResponse.json(
        { error: 'Organization name is required' },
        { status: 400 }
      )
    }

    const store = getStore()
    
    // Find organization by name (case-insensitive)
    const org = store.organizations.find(
      o => o.name.toLowerCase() === orgName.toLowerCase()
    )

    if (!org) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    // Check if user is already a member
    const existingMember = store.orgMembers.find(
      m => m.orgId === org.id && m.userId === user.id
    )

    if (existingMember) {
      return NextResponse.json(
        { error: 'You are already a member of this organization' },
        { status: 400 }
      )
    }

    // Create join request
    const joinRequest: JoinRequest = {
      id: `req_${nanoid(12)}`,
      orgId: org.id,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      message,
      createdAt: new Date().toISOString(),
      status: 'pending',
    }

    updateStore(s => ({
      ...s,
      joinRequests: [...(s.joinRequests || []), joinRequest],
    }))

    return NextResponse.json({ success: true, request: joinRequest })
  } catch (error) {
    console.error('Request join error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

