import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getUserOrganizations } from '@/lib/org-utils'
import { getStore } from '@/lib/data-store'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgs = getUserOrganizations(user.id)
    const currentOrg = orgs[0]

    if (!currentOrg) {
      return NextResponse.json({ apiKeys: [] })
    }

    const store = getStore()
    const orgProjects = store.projects.filter(p => p.orgId === currentOrg.id)
    const projectIds = orgProjects.map(p => p.id)
    const apiKeys = store.apiKeys.filter(k => projectIds.includes(k.projectId))

    return NextResponse.json({ apiKeys })
  } catch (error) {
    console.error('Get API keys error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

