import { getCurrentUser } from '@/lib/auth'
import { getUserOrganizations } from '@/lib/org-utils'
import { getStore } from '@/lib/data-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Key, Webhook, Users, TrendingUp, Zap } from 'lucide-react'

export default async function OverviewPage() {
  const user = await getCurrentUser()
  const orgs = getUserOrganizations(user!.id)
  const currentOrg = orgs[0]
  const store = getStore()

  // Mock data - in a real app, this would be calculated from actual usage
  const stats = {
    apiCalls: 1234567,
    apiCallsChange: '+12.5%',
    activeKeys: store.apiKeys.filter(k => k.projectId).length,
    activeWebhooks: store.webhooks.filter(w => w.enabled).length,
    teamMembers: store.orgMembers.filter(m => m.orgId === currentOrg?.id).length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back! Here's what's happening with your projects.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Calls</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.apiCalls.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500">{stats.apiCallsChange}</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active API Keys</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeKeys}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Webhooks</CardTitle>
            <Webhook className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeWebhooks}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active endpoints
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teamMembers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              In your organization
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Start */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Start Guide
          </CardTitle>
          <CardDescription>
            Get up and running in minutes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
              1
            </div>
            <div className="flex-1">
              <h4 className="font-semibold mb-1">Create a project</h4>
              <p className="text-sm text-muted-foreground">
                Projects help you organize your API keys and environments.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
              2
            </div>
            <div className="flex-1">
              <h4 className="font-semibold mb-1">Generate an API key</h4>
              <p className="text-sm text-muted-foreground">
                Create API keys for your applications to authenticate requests.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
              3
            </div>
            <div className="flex-1">
              <h4 className="font-semibold mb-1">Make your first request</h4>
              <p className="text-sm text-muted-foreground">
                Start integrating Circuit API into your application.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Latest events in your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {store.auditLogs.filter(l => l.orgId === currentOrg?.id).length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No recent activity to display
            </p>
          ) : (
            <div className="space-y-3">
              {store.auditLogs
                .filter(l => l.orgId === currentOrg?.id)
                .slice(0, 5)
                .map((log) => (
                  <div key={log.id} className="flex items-center gap-4 text-sm">
                    <div className="flex-1">
                      <span className="font-medium">{log.action}</span>
                      <span className="text-muted-foreground"> on </span>
                      <span className="font-medium">{log.resource}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

