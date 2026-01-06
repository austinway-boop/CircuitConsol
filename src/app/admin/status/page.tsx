import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, CheckCircle, AlertTriangle, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function AdminStatusPage() {
  // Mock status components
  const components = [
    { name: 'API Gateway', status: 'operational', uptime: '99.99%' },
    { name: 'Matchmaking Service', status: 'operational', uptime: '99.95%' },
    { name: 'Database', status: 'operational', uptime: '100%' },
    { name: 'Webhook Delivery', status: 'degraded', uptime: '98.50%' },
  ]

  // Mock incidents
  const incidents = [
    {
      id: 1,
      title: 'Webhook Delivery Delays',
      status: 'investigating',
      severity: 'minor',
      started: '30 minutes ago',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Status</h1>
          <p className="text-muted-foreground mt-2">
            Monitor system health and manage incidents
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Report Incident
        </Button>
      </div>

      {/* Overall Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-yellow-500" />
            Current Status: Partial Outage
          </CardTitle>
          <CardDescription>
            Some systems are experiencing issues
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Active Incidents */}
      {incidents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Active Incidents
            </CardTitle>
            <CardDescription>
              Incidents currently being investigated
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {incidents.map((incident) => (
              <div key={incident.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{incident.title}</h4>
                  <div className="flex gap-2">
                    <Badge variant="outline">{incident.status}</Badge>
                    <Badge variant="outline">{incident.severity}</Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Started {incident.started}</p>
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm">Update</Button>
                  <Button variant="outline" size="sm">Resolve</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Component Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Components</CardTitle>
          <CardDescription>
            Status of individual system components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {components.map((component) => (
              <div key={component.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {component.status === 'operational' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  )}
                  <div>
                    <p className="font-medium">{component.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">{component.status}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{component.uptime}</p>
                  <p className="text-xs text-muted-foreground">Uptime</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

