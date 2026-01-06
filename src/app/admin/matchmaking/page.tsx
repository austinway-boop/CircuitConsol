import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, TrendingUp, Zap } from 'lucide-react'

export default function AdminMatchmakingPage() {
  // Mock matchmaking stats
  const stats = {
    activeMatches: 1234,
    avgWaitTime: '2.3s',
    successRate: '98.5%',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Matchmaking</h1>
        <p className="text-muted-foreground mt-2">
          Monitor and control matchmaking algorithms
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Matches</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeMatches}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Wait Time</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgWaitTime}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Last hour average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Match completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Matchmaking Queue */}
      <Card>
        <CardHeader>
          <CardTitle>Matchmaking Queue</CardTitle>
          <CardDescription>Real-time view of matchmaking activity (mock data)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Real-time matchmaking visualization would appear here
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

