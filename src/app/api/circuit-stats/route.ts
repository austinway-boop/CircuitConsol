import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const API_URL = process.env.CIRCUIT_API_URL || 'https://circuit-68ald.ondigitalocean.app'

export async function GET() {
  try {
    const response = await fetch(`${API_URL}/v1/stats`)
    const data = await response.json()
    
    if (data.success) {
      return NextResponse.json({
        totalRequests: data.stats.total_requests || 0,
        uptime: data.stats.uptime || '0m',
        uptimeSeconds: data.stats.uptime_seconds || 0,
        wordDatabaseSize: data.stats.word_database_size || 25847,
        status: data.stats.system_status || 'operational'
      })
    }
    
    return NextResponse.json({
      totalRequests: 0,
      uptime: 'unknown',
      uptimeSeconds: 0,
      wordDatabaseSize: 25847,
      status: 'unknown'
    })
  } catch (error) {
    console.error('Failed to fetch Circuit stats:', error)
    return NextResponse.json({
      totalRequests: 0,
      uptime: 'offline',
      uptimeSeconds: 0,
      wordDatabaseSize: 25847,
      status: 'offline'
    })
  }
}

