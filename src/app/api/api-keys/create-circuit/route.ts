import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getUserOrganizations } from '@/lib/org-utils'
import { updateStore } from '@/lib/data-store'
import { nanoid } from 'nanoid'
import crypto from 'crypto'

interface CircuitApiKey {
  id: string
  name: string
  key: string
  keyHash: string
  orgId: string
  environment: 'production' | 'development'
  createdAt: string
  createdBy: string
  lastUsed?: string
  requests: number
}

function generateCircuitKey(environment: 'production' | 'development'): string {
  const prefix = environment === 'production' ? 'sk_live' : 'sk_test'
  const randomBytes = crypto.randomBytes(32).toString('hex')
  return `${prefix}_${randomBytes}`
}

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

    const { name, environment } = await request.json()

    if (!name || !environment) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate real API key
    const key = generateCircuitKey(environment)
    const keyHash = crypto.createHash('sha256').update(key).digest('hex')

    const apiKey: CircuitApiKey = {
      id: `key_${nanoid(12)}`,
      name,
      key,
      keyHash,
      orgId: currentOrg.id,
      environment,
      createdAt: new Date().toISOString(),
      createdBy: user.id,
      requests: 0,
    }

    // Store in database
    await updateStore(s => ({
      ...s,
      circuitApiKeys: [...(s.circuitApiKeys || []), apiKey],
    }))

    // Also return for session storage
    const response = NextResponse.json({ 
      key: apiKey.key,
      id: apiKey.id,
      name: apiKey.name,
      environment: apiKey.environment
    })
    
    // Set a header so frontend can store the key temporarily
    response.headers.set('X-Circuit-Key-Id', apiKey.id)
    
    return response
  } catch (error) {
    console.error('Create Circuit API key error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

