import { Card, CardContent } from '@/components/ui/card'
import { Settings } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground text-lg">
          Configure your account and preferences
        </p>
      </div>

      <Card className="border-2 shadow-xl">
        <CardContent className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Settings className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-2xl font-semibold mb-2">Coming Soon</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Settings and configuration options will be available here
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
