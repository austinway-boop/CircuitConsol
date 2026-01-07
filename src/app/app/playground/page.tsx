'use client'

import { useState, useEffect } from 'react'
import { Play, Copy, Check, Plus, Sparkles } from 'lucide-react'
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

const emotionColors: Record<string, string> = {
  joy: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  trust: 'bg-blue-100 text-blue-800 border-blue-300',
  anticipation: 'bg-purple-100 text-purple-800 border-purple-300',
  surprise: 'bg-pink-100 text-pink-800 border-pink-300',
  anger: 'bg-red-100 text-red-800 border-red-300',
  fear: 'bg-orange-100 text-orange-800 border-orange-300',
  sadness: 'bg-gray-100 text-gray-800 border-gray-300',
  disgust: 'bg-green-100 text-green-800 border-green-300',
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

  const handleTest = async () => {
    if (!selectedKeyId) {
      setError('Please select an API key')
      return
    }

    setLoading(true)
    setError('')
    setResponse(null)

    try {
      const fullKey = sessionStorage.getItem(`circuit_key_${selectedKeyId}`)
      
      if (!fullKey) {
        setError('API key not found. Create a new key and try again.')
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
      
      if (data.success) {
        setResponse(data)
      } else {
        setError(data.error || 'Request failed')
        setResponse(data)
      }
    } catch (err: any) {
      setError('Network error. Make sure the API is running.')
      setResponse(null)
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
              Go to API Keys
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // API returns data directly in result, not result.emotion_analysis
  const emotionData = response?.result
  const topEmotion = emotionData?.overall_emotion

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1">API Playground</h1>
        <p className="text-sm text-muted-foreground">
          Test Circuit emotion analysis in real-time
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key-select" className="text-sm">API Key</Label>
                <Select
                  id="api-key-select"
                  value={selectedKeyId}
                  onChange={(e) => setSelectedKeyId(e.target.value)}
                  className="h-10"
                >
                  {apiKeys.map((key) => (
                    <option key={key.id} value={key.id}>
                      {key.name} - {key.environment}
                    </option>
                  ))}
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Text to Analyze</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="w-full h-32 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                placeholder="Enter text to analyze emotions..."
              />
              
              <Button 
                onClick={handleTest} 
                disabled={loading || !textInput.trim() || !selectedKeyId}
                className="w-full"
              >
                {loading ? 'Analyzing...' : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Analyze Emotions
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Example Texts */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm">Example Texts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { emotion: 'Joy', text: 'I am absolutely thrilled about this amazing news!' },
                { emotion: 'Fear', text: 'I am really worried and anxious about what might happen.' },
                { emotion: 'Anger', text: 'This is incredibly frustrating and makes me so angry.' },
                { emotion: 'Sadness', text: 'I feel so sad and disappointed about this situation.' }
              ].map((example) => (
                <button
                  key={example.emotion}
                  onClick={() => setTextInput(example.text)}
                  className="w-full text-left p-3 text-sm border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="font-medium mb-1">{example.emotion}</div>
                  <div className="text-xs text-muted-foreground">{example.text.substring(0, 50)}...</div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Response Section */}
        <div className="space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {!response && !error && !loading && (
            <Card className="border-0 shadow-sm">
              <CardContent className="text-center py-16">
                <Sparkles className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Enter text and click Analyze to see emotion results
                </p>
              </CardContent>
            </Card>
          )}

          {emotionData && (
            <>
              {/* Main Result */}
              <Card className={`border-2 shadow-lg ${emotionColors[topEmotion] || 'bg-gray-100'}`}>
                <CardContent className="pt-6 text-center">
                  <div className="text-sm font-medium mb-2">Detected Emotion</div>
                  <div className="text-4xl font-bold capitalize mb-2">{topEmotion}</div>
                  <div className="text-2xl font-semibold">
                    {(emotionData.confidence * 100).toFixed(1)}% confidence
                  </div>
                </CardContent>
              </Card>

              {/* Input Text */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm">Analyzed Text</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm italic">&quot;{textInput}&quot;</p>
                </CardContent>
              </Card>

              {/* Emotion Breakdown */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm">All Emotions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(emotionData.emotions || {})
                      .sort(([,a]: any, [,b]: any) => b - a)
                      .map(([emotion, score]: any) => (
                        <div key={emotion}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="capitalize font-medium">{emotion}</span>
                            <span className="font-mono text-xs">
                              {(score * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-accent rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all"
                              style={{ width: `${score * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* VAD Scores */}
              {emotionData.vad && (
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-sm">VAD Dimensions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Valence (positivity)</span>
                        <span className="font-mono font-semibold">{emotionData.vad.valence.toFixed(2)}</span>
                      </div>
                      <div className="w-full h-2 bg-accent rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: `${emotionData.vad.valence * 100}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Arousal (intensity)</span>
                        <span className="font-mono font-semibold">{emotionData.vad.arousal.toFixed(2)}</span>
                      </div>
                      <div className="w-full h-2 bg-accent rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500" style={{ width: `${emotionData.vad.arousal * 100}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Dominance (control)</span>
                        <span className="font-mono font-semibold">{emotionData.vad.dominance.toFixed(2)}</span>
                      </div>
                      <div className="w-full h-2 bg-accent rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: `${emotionData.vad.dominance * 100}%` }} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Sentiment */}
              {emotionData.sentiment && (
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-sm">Sentiment Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Polarity</span>
                      <Badge className="capitalize">{emotionData.sentiment.polarity}</Badge>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm">Strength</span>
                      <span className="font-mono text-sm">{(emotionData.sentiment.strength * 100).toFixed(0)}%</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Stats */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm">Analysis Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Words analyzed</span>
                    <span className="font-mono">{emotionData.analyzed_words}/{emotionData.word_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Coverage</span>
                    <span className="font-mono">{(emotionData.coverage * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Processing time</span>
                    <span className="font-mono">{response.result.processing_time.toFixed(3)}s</span>
                  </div>
                </CardContent>
              </Card>

              {/* Raw JSON */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Raw JSON</CardTitle>
                    <Button variant="outline" size="sm" onClick={copyResponse}>
                      {copied ? (
                        <>
                          <Check className="h-3 w-3 mr-1" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="p-3 bg-slate-900 rounded-lg max-h-64 overflow-y-auto">
                    <pre className="text-xs text-emerald-400 font-mono">
                      {JSON.stringify(response, null, 2)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
