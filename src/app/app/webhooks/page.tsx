import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Webhook } from 'lucide-react'
import { EmptyState } from '@/components/empty-state'

export default function WebhooksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Webhooks</h1>
        <p className="text-muted-foreground mt-2">
          Configure webhooks to receive real-time events from Circuit API
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <EmptyState
            icon={Webhook}
            title="No webhooks configured"
            description="Set up webhooks to receive real-time notifications about events in your projects"
          />
        </CardContent>
      </Card>
    </div>
  )
}

