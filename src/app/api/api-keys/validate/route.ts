import { NextRequest, NextResponse } from 'next/server'
import { getStore } from '@/lib/data-store'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

import { updateStore } from '@/lib/data-store'

export async function POST(request: NextRequest) {
  try {
    const { apiKey, incrementUsage } = await request.json()

    if (!apiKey) {
      return NextResponse.json(
        { valid: false, error: 'No API key provided' },
        { status: 400 }
      )
    }

    const store = await getStore()
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex')
    
    const validKey = (store.circuitApiKeys || []).find((k: any) => k.keyHash === keyHash)

    if (!validKey) {
      return NextResponse.json({ valid: false })
    }

    // Update last used timestamp and increment requests if requested
    if (incrementUsage) {
      await updateStore(s => ({
        ...s,
        circuitApiKeys: (s.circuitApiKeys || []).map((k: any) =>
          k.keyHash === keyHash
            ? { 
                ...k, 
                lastUsed: new Date().toISOString(), 
                requests: (k.requests || 0) + 1 
              }
            : k
        ),
      }))
    }

    return NextResponse.json({
      valid: true,
      orgId: validKey.orgId,
      environment: validKey.environment,
    })
  } catch (error) {
    console.error('Validate API key error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

