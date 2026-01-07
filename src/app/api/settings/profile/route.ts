import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getStore, updateStore } from '@/lib/data-store'

export async function GET() {
  const user = await getCurrentUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({
    name: user.name,
    email: user.email,
    createdAt: user.createdAt
  })
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name, email } = await req.json()

  if (!name || !email) {
    return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
  }

  const store = await getStore()
  
  // Check if email is already taken by another user
  const existingUser = store.users.find(u => u.email === email && u.id !== user.id)
  if (existingUser) {
    return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
  }

  // Update user
  await updateStore(s => ({
    ...s,
    users: s.users.map(u => 
      u.id === user.id 
        ? { ...u, name, email }
        : u
    )
  }))

  return NextResponse.json({ success: true })
}

