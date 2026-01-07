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

    const orgs = await getUserOrganizations(user.id)
    const currentOrg = orgs[0]

    if (!currentOrg) {
      return NextResponse.json({ keys: [] })
    }

    const store = await getStore()
    const keys = (store.circuitApiKeys || [])
      .filter((k: any) => k.orgId === currentOrg.id)
      .map((k: any) => ({
        id: k.id,
        name: k.name,
        key: k.key,
        keyPrefix: k.key.substring(0, 20),
        environment: k.environment,
        createdAt: k.createdAt,
        lastUsed: k.lastUsed,
        requests: k.requests || 0,
      }))

    return NextResponse.json({ keys })
  } catch (error) {
    console.error('List Circuit API keys error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

