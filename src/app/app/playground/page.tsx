'use client'

import { useState } from 'react'
import { Play, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const emotionColors: Record<string, string> = {
  joy: 'bg-yellow-50 border-yellow-200 text-yellow-900',
  trust: 'bg-blue-50 border-blue-200 text-blue-900',
  anticipation: 'bg-purple-50 border-purple-200 text-purple-900',
  surprise: 'bg-pink-50 border-pink-200 text-pink-900',
  anger: 'bg-red-50 border-red-200 text-red-900',
  fear: 'bg-orange-50 border-orange-200 text-orange-900',
  sadness: 'bg-gray-50 border-gray-200 text-gray-900',
  disgust: 'bg-green-50 border-green-200 text-green-900',
}

const API_ENDPOINTS = [
  { label: 'Production (DigitalOcean)', value: 'https://circuit-68ald.ondigitalocean.app' },
  { label: 'Local Development', value: 'http://localhost:8080' },
]

export default function PlaygroundPage() {
  const [apiKey, setApiKey] = useState('')
  const [apiUrl, setApiUrl] = useState(API_ENDPOINTS[0].value)
  const [textInput, setTextInput] = useState('I am feeling really excited about this amazing opportunity!')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<any>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleTest = async () => {
    if (!apiKey.trim()) {
      setError('Please enter your API key')
      return
    }

    setLoading(true)
    setError('')
    setResponse(null)

    try {
      const res = await fetch(`${apiUrl}/v1/analyze-text`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
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

  const emotionData = response?.result
  const topEmotion = emotionData?.overall_emotion

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-normal mb-2">API Playground</h1>
        <p className="text-muted-foreground">
          Test the Circuit emotion analysis API in real-time
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium mb-4">Configuration</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="api-endpoint">API Endpoint</Label>
                <select
                  id="api-endpoint"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  className="mt-1 w-full h-9 px-3 py-2 border border-input bg-background rounded text-sm focus:outline-none focus:border-foreground transition-colors"
                >
                  {API_ENDPOINTS.map((endpoint) => (
                    <option key={endpoint.value} value={endpoint.value}>
                      {endpoint.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="api-key">API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk_test_... or sk_live_..."
                  className="mt-1 font-mono text-sm"
                />
              </div>
            </div>
          </div>

          <hr className="border-border" />

          <div>
            <h2 className="text-lg font-medium mb-4">Text to Analyze</h2>
            <div className="space-y-3">
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="w-full h-32 p-3 border border-input rounded resize-none focus:outline-none focus:border-foreground transition-colors text-sm"
                placeholder="Enter text to analyze emotions..."
              />
              
              <Button 
                onClick={handleTest} 
                disabled={loading || !textInput.trim() || !apiKey.trim()}
                className="w-full"
                variant="outline"
              >
                {loading ? 'Analyzing...' : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Analyze Emotions
                  </>
                )}
              </Button>
            </div>
          </div>

          <hr className="border-border" />

          <div>
            <h2 className="text-sm font-medium mb-3">Example Texts</h2>
            <div className="space-y-2">
              {[
                { emotion: 'Joy', text: 'I am absolutely thrilled about this amazing news!' },
                { emotion: 'Fear', text: 'I am really worried and anxious about what might happen.' },
                { emotion: 'Anger', text: 'This is incredibly frustrating and makes me so angry.' },
                { emotion: 'Sadness', text: 'I feel so sad and disappointed about this situation.' }
              ].map((example) => (
                <button
                  key={example.emotion}
                  onClick={() => setTextInput(example.text)}
                  className="w-full text-left p-3 text-sm border border-border rounded hover:border-foreground transition-colors"
                >
                  <div className="font-medium mb-1">{example.emotion}</div>
                  <div className="text-xs text-muted-foreground line-clamp-1">{example.text}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Response Section */}
        <div className="space-y-6">
          <h2 className="text-lg font-medium">Results</h2>

          {error && (
            <div className="p-4 border border-red-200 bg-red-50 rounded text-sm text-red-900">
              {error}
            </div>
          )}

          {!response && !error && !loading && (
            <div className="border border-dashed border-border rounded p-12 text-center">
              <p className="text-muted-foreground text-sm">
                Configure your settings and click Analyze to see results
              </p>
            </div>
          )}

          {loading && (
            <div className="border border-dashed border-border rounded p-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent mb-4"></div>
              <p className="text-muted-foreground text-sm">
                Analyzing emotions...
              </p>
            </div>
          )}

          {emotionData && (
            <div className="space-y-6">
              {/* Main Result */}
              <div className={`border-2 rounded p-6 text-center ${emotionColors[topEmotion] || 'bg-gray-50 border-gray-200'}`}>
                <div className="text-sm font-medium mb-2">Detected Emotion</div>
                <div className="text-4xl font-semibold capitalize mb-2">{topEmotion}</div>
                <div className="text-xl">
                  {(emotionData.confidence * 100).toFixed(1)}% confidence
                </div>
              </div>

              {/* Analyzed Text */}
              <div>
                <h3 className="text-sm font-medium mb-2">Analyzed Text</h3>
                <div className="p-4 border rounded bg-muted/30">
                  <p className="text-sm italic">&quot;{textInput}&quot;</p>
                </div>
              </div>

              {/* Emotion Breakdown */}
              <div>
                <h3 className="text-sm font-medium mb-3">Emotion Breakdown</h3>
                <div className="space-y-3">
                  {Object.entries(emotionData.emotions || {})
                    .sort(([,a]: any, [,b]: any) => b - a)
                    .map(([emotion, score]: any) => (
                      <div key={emotion}>
                        <div className="flex items-center justify-between text-sm mb-1.5">
                          <span className="capitalize">{emotion}</span>
                          <span className="font-mono text-xs text-muted-foreground">
                            {(score * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-foreground transition-all"
                            style={{ width: `${score * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* VAD Scores */}
              {emotionData.vad && (
                <div>
                  <h3 className="text-sm font-medium mb-3">VAD Dimensions</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-muted-foreground">Valence (positivity)</span>
                        <span className="font-mono text-xs">{emotionData.vad.valence.toFixed(2)}</span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: `${emotionData.vad.valence * 100}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-muted-foreground">Arousal (intensity)</span>
                        <span className="font-mono text-xs">{emotionData.vad.arousal.toFixed(2)}</span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500" style={{ width: `${emotionData.vad.arousal * 100}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-muted-foreground">Dominance (control)</span>
                        <span className="font-mono text-xs">{emotionData.vad.dominance.toFixed(2)}</span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: `${emotionData.vad.dominance * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div>
                <h3 className="text-sm font-medium mb-3">Analysis Statistics</h3>
                <div className="space-y-2 text-sm">
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
                </div>
              </div>

              {/* Raw JSON */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium">Raw JSON Response</h3>
                  <Button variant="ghost" size="sm" onClick={copyResponse}>
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 mr-1.5" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 mr-1.5" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <div className="p-4 bg-slate-950 rounded max-h-64 overflow-y-auto">
                  <pre className="text-xs text-emerald-400 font-mono">
                    {JSON.stringify(response, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
