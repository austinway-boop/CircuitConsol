import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { updateStore, ApiKey } from '@/lib/data-store'
import { nanoid } from 'nanoid'
import { generateApiKey } from '@/lib/utils'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, projectId, envId } = await request.json()

    if (!name || !projectId || !envId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { key, prefix } = generateApiKey('sk')
    const keyHash = await bcrypt.hash(key, 10)

    const apiKey: ApiKey = {
      id: `key_${nanoid(12)}`,
      projectId,
      envId,
      name,
      keyHash,
      prefix,
      createdAt: new Date().toISOString(),
      createdBy: user.id,
    }

    updateStore(s => ({
      ...s,
      apiKeys: [...s.apiKeys, apiKey],
    }))

    return NextResponse.json({ key, apiKey })
  } catch (error) {
    console.error('Create API key error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

