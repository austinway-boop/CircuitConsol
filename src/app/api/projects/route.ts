import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getUserOrganizations } from '@/lib/org-utils'
import { getStore } from '@/lib/data-store'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgs = getUserOrganizations(user.id)
    const currentOrg = orgs[0]

    if (!currentOrg) {
      return NextResponse.json({ projects: [] })
    }

    const store = getStore()
    const projects = store.projects.filter(p => p.orgId === currentOrg.id)

    return NextResponse.json({ projects })
  } catch (error) {
    console.error('Get projects error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

