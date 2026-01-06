import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, Sliders, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AdminControlsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Algorithm Controls</h1>
          <p className="text-muted-foreground mt-2">
            Fine-tune matchmaking algorithms and parameters
          </p>
        </div>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Publish Changes
        </Button>
      </div>

      {/* Algorithm Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sliders className="h-5 w-5" />
            Algorithm Parameters
          </CardTitle>
          <CardDescription>
            Adjust matchmaking algorithm knobs and thresholds
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Skill Range Tolerance</label>
              <div className="flex items-center gap-4">
                <input type="range" className="flex-1" min="0" max="100" defaultValue="50" />
                <span className="text-sm text-muted-foreground w-12">50%</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Wait Time Threshold</label>
              <div className="flex items-center gap-4">
                <input type="range" className="flex-1" min="0" max="60" defaultValue="30" />
                <span className="text-sm text-muted-foreground w-12">30s</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Team Balance Weight</label>
              <div className="flex items-center gap-4">
                <input type="range" className="flex-1" min="0" max="100" defaultValue="75" />
                <span className="text-sm text-muted-foreground w-12">75%</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Latency Priority</label>
              <div className="flex items-center gap-4">
                <input type="range" className="flex-1" min="0" max="100" defaultValue="60" />
                <span className="text-sm text-muted-foreground w-12">60%</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Changes will be applied to new matchmaking sessions after publishing.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Feature Flags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Feature Flags
          </CardTitle>
          <CardDescription>
            Enable or disable experimental features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Advanced Skill-Based Matching</p>
                <p className="text-sm text-muted-foreground">Use ML-based skill prediction</p>
              </div>
              <input type="checkbox" className="h-4 w-4" />
            </label>

            <label className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Cross-Region Matchmaking</p>
                <p className="text-sm text-muted-foreground">Allow matches across regions</p>
              </div>
              <input type="checkbox" className="h-4 w-4" defaultChecked />
            </label>

            <label className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Priority Queue for Premium Users</p>
                <p className="text-sm text-muted-foreground">Fast-track premium users</p>
              </div>
              <input type="checkbox" className="h-4 w-4" defaultChecked />
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

