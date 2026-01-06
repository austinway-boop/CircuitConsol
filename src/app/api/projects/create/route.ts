import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getUserOrganizations } from '@/lib/org-utils'
import { updateStore, Project } from '@/lib/data-store'
import { nanoid } from 'nanoid'
import { slugify } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgs = getUserOrganizations(user.id)
    const currentOrg = orgs[0]

    if (!currentOrg) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 })
    }

    const { name } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      )
    }

    const projectId = `proj_${nanoid(12)}`
    const project: Project = {
      id: projectId,
      orgId: currentOrg.id,
      name,
      slug: slugify(name),
      environments: [
        { id: 'env_sandbox', name: 'Sandbox', slug: 'sandbox' },
        { id: 'env_production', name: 'Production', slug: 'production' }
      ],
      createdAt: new Date().toISOString(),
    }

    updateStore(s => ({
      ...s,
      projects: [...s.projects, project],
    }))

    return NextResponse.json({ project })
  } catch (error) {
    console.error('Create project error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

