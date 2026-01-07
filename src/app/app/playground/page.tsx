'use client'

import { useState, useEffect } from 'react'
import { Play, Copy, Check, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'

interface ApiKey {
  id: string
  name: string
  keyPrefix: string
  environment: string
}

export default function PlaygroundPage() {
  const router = useRouter()
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [selectedKeyId, setSelectedKeyId] = useState('')
  const [apiUrl] = useState('https://circuit-68ald.ondigitalocean.app')
  const [textInput, setTextInput] = useState('I am feeling really excited about this amazing opportunity!')
  const [loading, setLoading] = useState(false)
  const [loadingKeys, setLoadingKeys] = useState(true)
  const [response, setResponse] = useState<any>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadApiKeys()
  }, [])

  const loadApiKeys = async () => {
    try {
      const res = await fetch('/api/api-keys/list-circuit')
      const data = await res.json()
      setApiKeys(data.keys || [])
      if (data.keys && data.keys.length > 0) {
        setSelectedKeyId(data.keys[0].id)
      }
    } catch (error) {
      console.error('Failed to load API keys:', error)
    } finally {
      setLoadingKeys(false)
    }
  }

  const getFullApiKey = async (keyId: string) => {
    // In a real implementation, we'd need to store this securely
    // For now, user needs to copy it from creation
    return null
  }

  const handleTest = async () => {
    if (!selectedKeyId) {
      setError('Please select an API key')
      return
    }

    setLoading(true)
    setError('')
    setResponse(null)

    try {
      // Get the full key from session storage (saved when created)
      const fullKey = sessionStorage.getItem(`circuit_key_${selectedKeyId}`)
      
      if (!fullKey) {
        setError('API key not found in session. You may need to create a new key.')
        setLoading(false)
        return
      }

      const res = await fetch(`${apiUrl}/v1/analyze-text`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${fullKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: textInput })
      })

      const data = await res.json()
      setResponse(data)
      
      if (!data.success) {
        setError(data.error || 'Request failed')
      }
    } catch (err: any) {
      setError(err.message || 'Network error - make sure API is running')
      setResponse({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  const copyResponse = () => {
    navigator.clipboard.writeText(JSON.stringify(response, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loadingKeys) {
    return <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">Loading...</div>
  }

  if (apiKeys.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-0 shadow-sm">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">No API keys</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create an API key first to test the playground
            </p>
            <Button onClick={() => router.push('/app/api')} size="sm">
              Create API key
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1">API Playground</h1>
        <p className="text-sm text-muted-foreground">
          Test Circuit emotion analysis API in real-time
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key-select">API Key</Label>
                <Select
                  id="api-key-select"
                  value={selectedKeyId}
                  onChange={(e) => setSelectedKeyId(e.target.value)}
                >
                  {apiKeys.map((key) => (
                    <option key={key.id} value={key.id}>
                      {key.name} ({key.environment})
                    </option>
                  ))}
                </Select>
                <p className="text-xs text-muted-foreground">
                  API URL: <code className="font-mono">{apiUrl}</code>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Text to Analyze</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="w-full h-32 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Enter text to analyze..."
              />
              
              <Button 
                onClick={handleTest} 
                disabled={loading || !textInput.trim() || !selectedKeyId}
                className="w-full"
              >
                {loading ? (
                  'Analyzing...'
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Test API
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Example Texts */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm">Try These Examples</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <button
                onClick={() => setTextInput('I am absolutely thrilled about this amazing news!')}
                className="w-full text-left p-2 text-sm border rounded hover:bg-accent transition-colors"
              >
                Joy example
              </button>
              <button
                onClick={() => setTextInput('I am really worried and anxious about what might happen.')}
                className="w-full text-left p-2 text-sm border rounded hover:bg-accent transition-colors"
              >
                Fear example
              </button>
              <button
                onClick={() => setTextInput('This is incredibly frustrating and makes me angry.')}
                className="w-full text-left p-2 text-sm border rounded hover:bg-accent transition-colors"
              >
                Anger example
              </button>
              <button
                onClick={() => setTextInput('I feel so sad and disappointed about this situation.')}
                className="w-full text-left p-2 text-sm border rounded hover:bg-accent transition-colors"
              >
                Sadness example
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Response Section */}
        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Response</CardTitle>
                {response && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyResponse}
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 mr-2" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-4">
                  {error}
                </div>
              )}
              
              {!response && !error && !loading && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Run a test to see the API response
                </p>
              )}

              {response && response.success && response.result?.emotion_analysis && (
                <div className="space-y-4">
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Detected Emotion</span>
                      <Badge className="capitalize">
                        {response.result.emotion_analysis.overall_emotion}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Confidence</span>
                      <span className="font-mono">
                        {(response.result.emotion_analysis.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="text-sm font-semibold mb-2">Emotion Breakdown</h4>
                    <div className="space-y-2">
                      {Object.entries(response.result.emotion_analysis.emotions || {})
                        .sort(([,a]: any, [,b]: any) => b - a)
                        .slice(0, 5)
                        .map(([emotion, score]: any) => (
                          <div key={emotion} className="flex items-center justify-between text-sm">
                            <span className="capitalize">{emotion}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-accent rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary"
                                  style={{ width: `${score * 100}%` }}
                                />
                              </div>
                              <span className="font-mono text-xs w-12 text-right">
                                {(score * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {response.result.emotion_analysis.vad && (
                    <div className="p-4 border rounded-lg">
                      <h4 className="text-sm font-semibold mb-2">VAD Scores</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Valence (positivity)</span>
                          <span className="font-mono">{response.result.emotion_analysis.vad.valence.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Arousal (intensity)</span>
                          <span className="font-mono">{response.result.emotion_analysis.vad.arousal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Dominance (control)</span>
                          <span className="font-mono">{response.result.emotion_analysis.vad.dominance.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-semibold mb-2">Full JSON Response</h4>
                    <div className="p-4 bg-slate-900 rounded-lg max-h-96 overflow-y-auto">
                      <pre className="text-xs text-emerald-400 font-mono">
                        {JSON.stringify(response, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {response && !response.success && (
                <div className="p-4 bg-slate-900 rounded-lg">
                  <pre className="text-xs text-emerald-400 font-mono">
                    {JSON.stringify(response, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
