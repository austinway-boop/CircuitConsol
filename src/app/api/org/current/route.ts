import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getUserOrganizations } from '@/lib/org-utils'

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    const orgs = await getUserOrganizations(user.id)
    const currentOrg = orgs[0]
    
    if (!currentOrg) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      organization: {
        id: currentOrg.id,
        name: currentOrg.name,
        slug: currentOrg.slug
      },
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Error getting current org:', error)
    return NextResponse.json({ error: 'Failed to get organization' }, { status: 500 })
  }
}

