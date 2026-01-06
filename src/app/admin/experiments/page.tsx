import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function AdminExperimentsPage() {
  // Mock experiments
  const experiments = [
    { id: 1, name: 'New Matchmaking Algorithm', status: 'active', traffic: '10%', started: '2024-01-15' },
    { id: 2, name: 'Reduced Wait Times', status: 'completed', traffic: '50%', started: '2024-01-10' },
    { id: 3, name: 'Cross-Region Beta', status: 'paused', traffic: '5%', started: '2024-01-20' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Experiments</h1>
          <p className="text-muted-foreground mt-2">
            Manage A/B tests and feature experiments
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Experiment
        </Button>
      </div>

      {/* Experiments List */}
      <div className="space-y-4">
        {experiments.map((exp) => (
          <Card key={exp.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{exp.name}</CardTitle>
                  <CardDescription>Started {exp.started}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      exp.status === 'active'
                        ? 'default'
                        : exp.status === 'completed'
                        ? 'secondary'
                        : 'outline'
                    }
                  >
                    {exp.status}
                  </Badge>
                  <Badge variant="outline">{exp.traffic} traffic</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">View Results</Button>
                <Button variant="outline" size="sm">Configure</Button>
                {exp.status === 'active' && (
                  <Button variant="outline" size="sm">Pause</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

