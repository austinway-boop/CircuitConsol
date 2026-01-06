import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { updateStore } from '@/lib/data-store'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const inviteId = params.id

    updateStore(s => ({
      ...s,
      invites: s.invites.filter(i => i.id !== inviteId),
    }))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete invite error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

