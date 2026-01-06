import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Filter } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function IntegrationPage() {
  // Mock request logs
  const mockLogs = [
    { id: 1, method: 'GET', path: '/api/v1/users', status: 200, duration: '45ms', time: '2 min ago' },
    { id: 2, method: 'POST', path: '/api/v1/projects', status: 201, duration: '120ms', time: '5 min ago' },
    { id: 3, method: 'GET', path: '/api/v1/stats', status: 200, duration: '32ms', time: '8 min ago' },
    { id: 4, method: 'DELETE', path: '/api/v1/keys/123', status: 204, duration: '28ms', time: '12 min ago' },
    { id: 5, method: 'GET', path: '/api/v1/webhooks', status: 200, duration: '38ms', time: '15 min ago' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integration</h1>
          <p className="text-muted-foreground mt-2">
            Monitor API requests and debug integration issues
          </p>
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Request Logs
          </CardTitle>
          <CardDescription>
            Real-time API request monitoring (mock data)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-4">
                  <Badge variant={log.status === 200 || log.status === 201 || log.status === 204 ? 'default' : 'destructive'}>
                    {log.status}
                  </Badge>
                  <span className="font-mono text-sm font-medium">{log.method}</span>
                  <span className="text-sm text-muted-foreground">{log.path}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{log.duration}</span>
                  <span>{log.time}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

