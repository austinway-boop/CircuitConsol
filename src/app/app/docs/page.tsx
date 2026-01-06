import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Book, Code, Zap, Users, Shield, Terminal, RefreshCw } from 'lucide-react'

export default function DocsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Circuit API Documentation</h1>
        <p className="text-muted-foreground text-lg">
          Complete guide to integrating Circuit matchmaking into your application
        </p>
      </div>

      {/* Quick Start */}
      <Card className="border-0 shadow-sm mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Quick Start
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">1. Get your API key</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Navigate to the API page and create a new API key for your environment.
            </p>
            <div className="p-3 bg-accent/50 rounded-lg">
              <code className="text-xs font-mono">sk_test_abc123...</code>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">2. Install the SDK</h3>
            <div className="p-3 bg-accent/50 rounded-lg">
              <code className="text-sm font-mono">npm install @circuit/matchmaking</code>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">3. Initialize the client</h3>
            <div className="p-3 bg-accent/50 rounded-lg">
              <pre className="text-xs font-mono overflow-x-auto">
{`import { CircuitClient } from '@circuit/matchmaking';

const circuit = new CircuitClient({
  apiKey: 'sk_test_your_key_here'
});`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Authentication */}
      <Card className="border-0 shadow-sm mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            All API requests must include your API key in the Authorization header:
          </p>
          <div className="p-3 bg-accent/50 rounded-lg">
            <pre className="text-xs font-mono overflow-x-auto">
{`Authorization: Bearer sk_live_your_key_here`}
            </pre>
          </div>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              💡 Use <code className="font-mono">sk_test_</code> for development and <code className="font-mono">sk_live_</code> for production
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Matchmaking API */}
      <Card className="border-0 shadow-sm mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Matchmaking API
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              Create Match Request
              <Badge variant="outline" className="text-xs">POST</Badge>
            </h3>
            <div className="p-3 bg-accent/50 rounded-lg mb-2">
              <code className="text-xs font-mono">POST https://api.circuit.dev/v1/matchmaking/create</code>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Submit a player to the matchmaking queue with their skill level and preferences.
            </p>
            <div className="p-3 bg-accent/50 rounded-lg">
              <pre className="text-xs font-mono overflow-x-auto">
{`{
  "player_id": "user_123",
  "skill_rating": 1500,
  "region": "us-east",
  "game_mode": "ranked",
  "party_size": 1
}`}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              Check Match Status
              <Badge variant="outline" className="text-xs">GET</Badge>
            </h3>
            <div className="p-3 bg-accent/50 rounded-lg mb-2">
              <code className="text-xs font-mono">GET https://api.circuit.dev/v1/matchmaking/status/:match_id</code>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Check the current status of a matchmaking request.
            </p>
            <div className="p-3 bg-accent/50 rounded-lg">
              <pre className="text-xs font-mono overflow-x-auto">
{`{
  "status": "matched",
  "match_id": "match_abc123",
  "players": [
    { "player_id": "user_123", "team": 1 },
    { "player_id": "user_456", "team": 2 }
  ],
  "server_url": "game.circuit.dev:7777",
  "estimated_skill_difference": 0.15
}`}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              Cancel Match Request
              <Badge variant="outline" className="text-xs">DELETE</Badge>
            </h3>
            <div className="p-3 bg-accent/50 rounded-lg mb-2">
              <code className="text-xs font-mono">DELETE https://api.circuit.dev/v1/matchmaking/cancel/:match_id</code>
            </div>
            <p className="text-sm text-muted-foreground">
              Remove a player from the matchmaking queue before a match is found.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Webhooks */}
      <Card className="border-0 shadow-sm mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-primary" />
            Webhooks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Configure webhooks to receive real-time notifications when matches are found:
          </p>
          <div className="p-3 bg-accent/50 rounded-lg">
            <pre className="text-xs font-mono overflow-x-auto">
{`{
  "event": "match.found",
  "match_id": "match_abc123",
  "timestamp": "2024-01-06T12:00:00Z",
  "data": {
    "players": [...],
    "server_url": "game.circuit.dev:7777"
  }
}`}
            </pre>
          </div>
          <p className="text-sm text-muted-foreground">
            Supported events: <code className="font-mono text-xs">match.found</code>, <code className="font-mono text-xs">match.cancelled</code>, <code className="font-mono text-xs">match.failed</code>
          </p>
        </CardContent>
      </Card>

      {/* Rate Limits */}
      <Card className="border-0 shadow-sm mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            Rate Limits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between p-2 bg-accent/30 rounded">
              <span className="font-medium">Development keys:</span>
              <span className="text-muted-foreground">100 requests/minute</span>
            </div>
            <div className="flex justify-between p-2 bg-accent/30 rounded">
              <span className="font-medium">Production keys:</span>
              <span className="text-muted-foreground">1,000 requests/minute</span>
            </div>
            <div className="flex justify-between p-2 bg-accent/30 rounded">
              <span className="font-medium">Burst limit:</span>
              <span className="text-muted-foreground">2x base rate</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SDK Examples */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            SDK Examples
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Find a match</h3>
            <div className="p-3 bg-accent/50 rounded-lg">
              <pre className="text-xs font-mono overflow-x-auto">
{`const match = await circuit.matchmaking.create({
  playerId: 'user_123',
  skillRating: 1500,
  region: 'us-east',
  gameMode: 'ranked'
});

console.log('Match ID:', match.id);
console.log('Status:', match.status);`}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Listen for match found</h3>
            <div className="p-3 bg-accent/50 rounded-lg">
              <pre className="text-xs font-mono overflow-x-auto">
{`circuit.on('match.found', (match) => {
  console.log('Match found!', match);
  console.log('Server:', match.server_url);
  console.log('Players:', match.players);
  
  // Connect to game server
  connectToGame(match.server_url);
});`}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Cancel matchmaking</h3>
            <div className="p-3 bg-accent/50 rounded-lg">
              <pre className="text-xs font-mono overflow-x-auto">
{`await circuit.matchmaking.cancel(matchId);
console.log('Matchmaking cancelled');`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support */}
      <div className="mt-8 p-6 bg-primary/5 border border-primary/20 rounded-lg">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Book className="h-5 w-5 text-primary" />
          Need help?
        </h3>
        <p className="text-sm text-muted-foreground">
          Check out our full API reference, join our Discord community, or contact support at{' '}
          <a href="mailto:support@circuit.dev" className="text-primary hover:underline font-medium">
            support@circuit.dev
          </a>
        </p>
      </div>
    </div>
  )
}

