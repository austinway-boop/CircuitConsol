import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, hashPassword, verifyPassword } from '@/lib/auth'
import { getStore, updateStore } from '@/lib/data-store'

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { currentPassword, newPassword } = await req.json()

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Current and new passwords are required' }, { status: 400 })
  }

  if (newPassword.length < 8) {
    return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 })
  }

  // Verify current password
  const isValid = await verifyPassword(currentPassword, user.passwordHash)
  if (!isValid) {
    return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
  }

  // Hash new password
  const newPasswordHash = await hashPassword(newPassword)

  // Update password
  await updateStore(s => ({
    ...s,
    users: s.users.map(u => 
      u.id === user.id 
        ? { ...u, passwordHash: newPasswordHash }
        : u
    )
  }))

  return NextResponse.json({ success: true })
}

