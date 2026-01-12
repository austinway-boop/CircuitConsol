'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, Copy, Check, Plus, MessageSquare, User, Building2, X, Clock, TrendingUp, TrendingDown, Minus, Mic, StopCircle, Users, RefreshCw, History, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const emotionColors: Record<string, string> = {
  joy: 'bg-amber-50 border-amber-300 text-amber-900',
  trust: 'bg-sky-50 border-sky-300 text-sky-900',
  anticipation: 'bg-violet-50 border-violet-300 text-violet-900',
  surprise: 'bg-fuchsia-50 border-fuchsia-300 text-fuchsia-900',
  anger: 'bg-rose-50 border-rose-300 text-rose-900',
  fear: 'bg-orange-50 border-orange-300 text-orange-900',
  sadness: 'bg-slate-100 border-slate-300 text-slate-900',
  disgust: 'bg-emerald-50 border-emerald-300 text-emerald-900',
  neutral: 'bg-gray-50 border-gray-300 text-gray-900',
}

const emotionEmojis: Record<string, string> = {
  joy: '😊',
  trust: '🤝',
  anticipation: '🎯',
  surprise: '😮',
  anger: '😠',
  fear: '😨',
  sadness: '😢',
  disgust: '🤢',
  neutral: '😐',
}

interface Message {
  id: string
  content: string
  type: 'text' | 'audio'
  emotion: string
  confidence: number
  emotions: Record<string, number>
  vad: { valence: number; arousal: number; dominance: number }
  timestamp: Date
}

interface Session {
  id: string
  profile_id: string
  status: string
  started_at: string
  message_count: number
}

interface DashboardOrg {
  id: string
  name: string
  slug: string
}

interface Profile {
  id: string
  username: string
  display_name: string
  org_id: string
}

interface ProfileStats {
  total_sessions: number
  dominant_emotion: string
  dominant_emotion_percentage: number
  emotion_breakdown: Record<string, number>
  avg_valence: number
  avg_arousal: number
  total_messages: number
}

interface PastSession {
  id: string
  status: string
  started_at: string
  ended_at?: string
  overall_mood?: string
  mood_confidence?: number
  message_count: number
  avg_valence?: number
  duration_seconds?: number
}

type PlaygroundMode = 'simple' | 'session'

export default function PlaygroundPage() {
  const [mode, setMode] = useState<PlaygroundMode>('simple')
  const [apiKey, setApiKey] = useState('')
  const apiUrl = 'https://circuit-68ald.ondigitalocean.app'
  const [textInput, setTextInput] = useState('I am feeling really excited about this amazing opportunity!')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<any>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [fetchingKey, setFetchingKey] = useState(true)

  // Dashboard org (from your login)
  const [dashboardOrg, setDashboardOrg] = useState<DashboardOrg | null>(null)
  const [dashboardUser, setDashboardUser] = useState<{ id: string; name: string; email: string } | null>(null)

  // Session mode state
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
  const [profileStats, setProfileStats] = useState<ProfileStats | null>(null)
  const [pastSessions, setPastSessions] = useState<PastSession[]>([])
  const [activeSession, setActiveSession] = useState<Session | null>(null)
  const [sessionMessages, setSessionMessages] = useState<Message[]>([])
  const [sessionSummary, setSessionSummary] = useState<any>(null)
  const [loadingProfiles, setLoadingProfiles] = useState(false)
  const [loadingStats, setLoadingStats] = useState(false)

  // Create profile modal
  const [showCreateProfile, setShowCreateProfile] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [newDisplayName, setNewDisplayName] = useState('')

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false)
  const [transcription, setTranscription] = useState('')
  const recognitionRef = useRef<any>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch API key and dashboard org on mount
  useEffect(() => {
    const init = async () => {
      try {
        // Get API key
        const keyRes = await fetch('/api/api-keys/list-circuit')
        if (keyRes.ok) {
          const keyData = await keyRes.json()
          if (keyData.keys && keyData.keys.length > 0) {
            const prodKey = keyData.keys.find((k: any) => k.environment === 'production')
            setApiKey((prodKey || keyData.keys[0]).key)
          }
        }

        // Get current dashboard org
        const orgRes = await fetch('/api/org/current')
        if (orgRes.ok) {
          const orgData = await orgRes.json()
          if (orgData.success) {
            setDashboardOrg(orgData.organization)
            setDashboardUser(orgData.user)
          }
        }
      } catch (err) {
        console.error('Init error:', err)
      } finally {
        setFetchingKey(false)
      }
    }

    init()
  }, [])

  // Ensure org exists in API when switching to session mode
  useEffect(() => {
    if (mode === 'session' && apiKey && dashboardOrg) {
      ensureOrgInAPI()
    }
  }, [mode, apiKey, dashboardOrg])

  // Fetch profile stats when profile is selected
  useEffect(() => {
    if (selectedProfile && apiKey) {
      fetchProfileStats(selectedProfile.id)
    }
  }, [selectedProfile, apiKey])

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [sessionMessages])

  const ensureOrgInAPI = async () => {
    if (!dashboardOrg || !apiKey) return

    try {
      const res = await fetch(`${apiUrl}/v1/orgs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: dashboardOrg.id,
          name: dashboardOrg.name,
          slug: dashboardOrg.slug
        })
      })
      
      if (res.ok) {
        fetchProfiles()
      }
    } catch (err) {
      console.error('Failed to ensure org in API:', err)
    }
  }

  const fetchProfiles = async () => {
    if (!dashboardOrg || !apiKey) return

    setLoadingProfiles(true)
    try {
      const res = await fetch(`${apiUrl}/v1/orgs/${dashboardOrg.id}/profiles`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      })
      const data = await res.json()
      if (data.success) {
        setProfiles(data.profiles || [])
      }
    } catch (err) {
      console.error('Failed to fetch profiles:', err)
    } finally {
      setLoadingProfiles(false)
    }
  }

  const fetchProfileStats = async (profileId: string) => {
    if (!apiKey) return

    setLoadingStats(true)
    try {
      const res = await fetch(`${apiUrl}/v1/profiles/${profileId}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      })
      const data = await res.json()
      if (data.success) {
        setProfileStats(data.emotion_stats)
        setPastSessions(data.sessions || [])
      }
    } catch (err) {
      console.error('Failed to fetch profile stats:', err)
    } finally {
      setLoadingStats(false)
    }
  }

  const createProfile = async () => {
    if (!dashboardOrg || !newUsername || !apiKey) return

    try {
      setLoading(true)
      setError('')
      const res = await fetch(`${apiUrl}/v1/profiles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          org_id: dashboardOrg.id,
          username: newUsername,
          display_name: newDisplayName || newUsername
        })
      })
      const data = await res.json()
      if (data.success) {
        setProfiles([...profiles, data.profile])
        setSelectedProfile(data.profile)
        setShowCreateProfile(false)
        setNewUsername('')
        setNewDisplayName('')
      } else {
        setError(data.error || 'Failed to create profile')
      }
    } catch (err) {
      setError('Failed to create profile')
    } finally {
      setLoading(false)
    }
  }

  const startSession = async () => {
    if (!dashboardOrg || !selectedProfile || !apiKey) {
      setError('Please select a user first')
      return
    }

    try {
      setLoading(true)
      setError('')
      const res = await fetch(`${apiUrl}/v1/sessions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          org_id: dashboardOrg.id,
          profile_id: selectedProfile.id
        })
      })
      const data = await res.json()
      if (data.success) {
        setActiveSession(data.session)
        setSessionMessages([])
        setSessionSummary(null)
      } else {
        setError(data.error || 'Failed to start session')
      }
    } catch (err) {
      setError('Failed to start session')
    } finally {
      setLoading(false)
    }
  }

  const endSession = async () => {
    if (!activeSession || !apiKey) return

    try {
      setLoading(true)
      const res = await fetch(`${apiUrl}/v1/sessions/${activeSession.id}/end`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}` }
      })
      const data = await res.json()
      if (data.success) {
        setSessionSummary(data.summary)
        setActiveSession(null)
        // Refresh profile stats
        if (selectedProfile) {
          fetchProfileStats(selectedProfile.id)
        }
      } else {
        setError(data.error || 'Failed to end session')
      }
    } catch (err) {
      setError('Failed to end session')
    } finally {
      setLoading(false)
    }
  }

  const sendSessionMessage = async () => {
    if (!activeSession || !textInput.trim() || !apiKey) return

    try {
      setLoading(true)
      setError('')
      const res = await fetch(`${apiUrl}/v1/sessions/${activeSession.id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: textInput })
      })
      const data = await res.json()
      if (data.success) {
        const newMessage: Message = {
          id: data.message.id,
          content: textInput,
          type: 'text',
          emotion: data.analysis.overall_emotion,
          confidence: data.analysis.confidence,
          emotions: data.analysis.emotions,
          vad: data.analysis.vad,
          timestamp: new Date()
        }
        setSessionMessages([...sessionMessages, newMessage])
        setTextInput('')
      } else {
        setError(data.error || 'Failed to send message')
      }
    } catch (err) {
      setError('Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  // Check if speech recognition is available
  const [speechSupported, setSpeechSupported] = useState(false)
  
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    setSpeechSupported(!!SpeechRecognition)
  }, [])

  const startRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setError('Speech recognition not supported. Please type your message instead.')
      return
    }

    try {
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'
      
      let finalTranscript = ''
      
      recognitionRef.current.onresult = (event: any) => {
        let interim = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' '
          } else {
            interim += event.results[i][0].transcript
          }
        }
        setTranscription(finalTranscript + interim)
      }
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsRecording(false)
        if (event.error === 'network') {
          setError('Speech recognition network error. Please type your message instead.')
        } else if (event.error === 'not-allowed') {
          setError('Microphone access denied. Please allow microphone access or type your message.')
        } else {
          setError(`Speech error: ${event.error}. Please type your message instead.`)
        }
      }
      
      recognitionRef.current.onend = () => {
        // Auto-restart if still recording
        if (isRecording && recognitionRef.current) {
          try {
            recognitionRef.current.start()
          } catch (e) {
            setIsRecording(false)
          }
        }
      }
      
      recognitionRef.current.start()
      setIsRecording(true)
      setTranscription('')
    } catch (err) {
      setError('Failed to start speech recognition. Please type your message instead.')
    }
  }

  const stopRecording = async () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {
        // Ignore stop errors
      }
    }
    setIsRecording(false)
    
    // Send the transcription as a message
    if (transcription.trim() && activeSession && apiKey) {
      try {
        setLoading(true)
        const res = await fetch(`${apiUrl}/v1/sessions/${activeSession.id}/audio`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ transcription: transcription.trim() })
        })
        const data = await res.json()
        if (data.success) {
          const newMessage: Message = {
            id: data.message.id,
            content: transcription.trim(),
            type: 'audio',
            emotion: data.analysis.overall_emotion,
            confidence: data.analysis.confidence,
            emotions: data.analysis.emotions,
            vad: data.analysis.vad,
            timestamp: new Date()
          }
          setSessionMessages([...sessionMessages, newMessage])
          setTranscription('')
        } else {
          setError(data.error || 'Failed to send audio')
        }
      } catch (err) {
        setError('Failed to send audio message')
      } finally {
        setLoading(false)
      }
    } else if (!transcription.trim() && isRecording) {
      setError('No speech detected. Please try again or type your message.')
    }
  }

  // Simple mode test
  const handleSimpleTest = async () => {
    if (!apiKey.trim()) {
      setError('No API key found. Please create one in the API Keys page.')
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

  // Calculate current session mood
  const getCurrentSessionMood = () => {
    if (sessionMessages.length === 0) return null
    
    const emotionTotals: Record<string, number> = {}
    sessionMessages.forEach(msg => {
      for (const [emotion, score] of Object.entries(msg.emotions)) {
        emotionTotals[emotion] = (emotionTotals[emotion] || 0) + score
      }
    })
    
    const dominant = Object.entries(emotionTotals).sort(([,a], [,b]) => b - a)[0]
    return dominant ? dominant[0] : 'neutral'
  }

  const currentMood = getCurrentSessionMood()

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2 tracking-tight">API Playground</h1>
        <p className="text-muted-foreground">
          Test the Circuit emotion analysis API in real-time
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-8 p-1 bg-muted/50 rounded-lg w-fit">
        <button
          onClick={() => setMode('simple')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            mode === 'simple' 
              ? 'bg-white shadow-sm text-foreground' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Simple Analysis
        </button>
        <button
          onClick={() => setMode('session')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            mode === 'session' 
              ? 'bg-white shadow-sm text-foreground' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Session Mode
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 border border-rose-200 bg-rose-50 rounded-lg text-sm text-rose-900 flex items-center gap-2">
          <X className="h-4 w-4 flex-shrink-0" />
          {error}
          <button onClick={() => setError('')} className="ml-auto text-rose-500 hover:text-rose-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Simple Mode */}
      {mode === 'simple' && (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium mb-4">Text to Analyze</h2>
              <div className="space-y-3">
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  className="w-full h-32 p-4 border border-input rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all text-sm font-mono"
                  placeholder="Enter text to analyze emotions..."
                />
                
                <Button 
                  onClick={handleSimpleTest} 
                  disabled={loading || !textInput.trim() || fetchingKey}
                  className="w-full"
                  size="lg"
                >
                  {loading ? 'Analyzing...' : fetchingKey ? 'Loading...' : (
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
              <h2 className="text-sm font-medium mb-3 text-muted-foreground">Quick Examples</h2>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { emotion: 'Joy', text: 'I am absolutely thrilled about this amazing news!' },
                  { emotion: 'Fear', text: 'I am really worried and anxious about what might happen.' },
                  { emotion: 'Anger', text: 'This is incredibly frustrating and makes me so angry.' },
                  { emotion: 'Sadness', text: 'I feel so sad and disappointed about this situation.' }
                ].map((example) => (
                  <button
                    key={example.emotion}
                    onClick={() => setTextInput(example.text)}
                    className="text-left p-3 text-sm border border-border rounded-lg hover:border-foreground/30 hover:bg-muted/30 transition-all"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span>{emotionEmojis[example.emotion.toLowerCase()]}</span>
                      <span className="font-medium">{example.emotion}</span>
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-2">{example.text}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Response Section */}
          <div className="space-y-6">
            <h2 className="text-lg font-medium">Results</h2>

            {!response && !error && !loading && (
              <div className="border-2 border-dashed border-border rounded-xl p-16 text-center">
                <div className="text-4xl mb-4">🎭</div>
                <p className="text-muted-foreground text-sm">
                  Enter text and click Analyze to see results
                </p>
              </div>
            )}

            {loading && (
              <div className="border-2 border-dashed border-border rounded-xl p-16 text-center">
                <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-current border-r-transparent mb-4"></div>
                <p className="text-muted-foreground text-sm">
                  Analyzing emotions...
                </p>
              </div>
            )}

            {emotionData && (
              <div className="space-y-6">
                {/* Main Result */}
                <div className={`border-2 rounded-xl p-8 text-center ${emotionColors[topEmotion] || 'bg-gray-50 border-gray-200'}`}>
                  <div className="text-6xl mb-3">{emotionEmojis[topEmotion] || '😐'}</div>
                  <div className="text-sm font-medium mb-1 opacity-70">Detected Emotion</div>
                  <div className="text-3xl font-bold capitalize mb-2">{topEmotion}</div>
                  <div className="text-lg font-medium opacity-80">
                    {(emotionData.confidence * 100).toFixed(1)}% confidence
                  </div>
                </div>

                {/* Emotion Breakdown */}
                <div className="bg-muted/30 rounded-xl p-6">
                  <h3 className="text-sm font-medium mb-4">Emotion Breakdown</h3>
                  <div className="space-y-3">
                    {Object.entries(emotionData.emotions || {})
                      .sort(([,a]: any, [,b]: any) => b - a)
                      .map(([emotion, score]: any) => (
                        <div key={emotion} className="flex items-center gap-3">
                          <span className="text-lg">{emotionEmojis[emotion]}</span>
                          <span className="capitalize text-sm w-24">{emotion}</span>
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-foreground/70 rounded-full transition-all"
                              style={{ width: `${score * 100}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs text-muted-foreground w-12 text-right">
                            {(score * 100).toFixed(1)}%
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* VAD Scores */}
                {emotionData.vad && (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-sky-600">{emotionData.vad.valence.toFixed(2)}</div>
                      <div className="text-xs text-sky-700">Valence</div>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600">{emotionData.vad.arousal.toFixed(2)}</div>
                      <div className="text-xs text-orange-700">Arousal</div>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-emerald-600">{emotionData.vad.dominance.toFixed(2)}</div>
                      <div className="text-xs text-emerald-700">Dominance</div>
                    </div>
                  </div>
                )}

                {/* Raw JSON */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium">Raw Response</h3>
                    <Button variant="ghost" size="sm" onClick={copyResponse}>
                      {copied ? (
                        <><Check className="h-3 w-3 mr-1.5" />Copied</>
                      ) : (
                        <><Copy className="h-3 w-3 mr-1.5" />Copy</>
                      )}
                    </Button>
                  </div>
                  <div className="p-4 bg-slate-950 rounded-lg max-h-48 overflow-y-auto">
                    <pre className="text-xs text-emerald-400 font-mono">
                      {JSON.stringify(response, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Session Mode */}
      {mode === 'session' && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Panel: Setup */}
          <div className="space-y-4">
            {/* Current Organization (from dashboard login) */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-4 w-4 opacity-70" />
                <span className="text-xs text-slate-400 uppercase tracking-wide">Your Organization</span>
              </div>
              <div className="text-xl font-semibold">{dashboardOrg?.name || 'Loading...'}</div>
              <div className="text-xs text-slate-400 font-mono mt-1">{dashboardOrg?.id || ''}</div>
            </div>

            {/* User Selection */}
            <div className="bg-muted/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Select User
                </h3>
                <button
                  onClick={fetchProfiles}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  disabled={loadingProfiles}
                >
                  <RefreshCw className={`h-3 w-3 ${loadingProfiles ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* User List */}
              <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
                {profiles.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">
                    No users yet. Create one to start a session.
                  </p>
                ) : (
                  profiles.map(profile => (
                    <button
                      key={profile.id}
                      onClick={() => {
                        setSelectedProfile(profile)
                        setActiveSession(null)
                        setSessionMessages([])
                        setSessionSummary(null)
                      }}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        selectedProfile?.id === profile.id
                          ? 'border-foreground bg-accent'
                          : 'border-transparent bg-background hover:bg-accent/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                          {(profile.display_name || profile.username).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{profile.display_name || profile.username}</div>
                          <div className="text-xs text-muted-foreground">@{profile.username}</div>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* Create User Button */}
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setShowCreateProfile(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New User
              </Button>
            </div>

            {/* Profile Stats (shown when user selected) */}
            {selectedProfile && profileStats && (
              <div className={`rounded-xl p-4 ${emotionColors[profileStats.dominant_emotion] || 'bg-muted/30'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="h-4 w-4" />
                  <h3 className="text-sm font-medium">User Profile Stats</h3>
                </div>
                
                {loadingStats ? (
                  <div className="py-4 text-center">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto" />
                  </div>
                ) : profileStats.total_sessions === 0 ? (
                  <p className="text-sm opacity-70">No sessions yet</p>
                ) : (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Dominant Emotion</span>
                      <span className="font-medium flex items-center gap-1">
                        {emotionEmojis[profileStats.dominant_emotion]}
                        <span className="capitalize">{profileStats.dominant_emotion}</span>
                        <span className="text-xs opacity-70">({profileStats.dominant_emotion_percentage}%)</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Total Sessions</span>
                      <span className="font-mono">{profileStats.total_sessions}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Total Messages</span>
                      <span className="font-mono">{profileStats.total_messages}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Avg Valence</span>
                      <span className="font-mono">{(profileStats.avg_valence * 100).toFixed(0)}%</span>
                    </div>
                    
                    {/* Emotion breakdown */}
                    {Object.keys(profileStats.emotion_breakdown).length > 0 && (
                      <div className="pt-2 mt-2 border-t border-current/10">
                        <div className="text-xs font-medium mb-2 opacity-70">Emotion History</div>
                        <div className="space-y-1">
                          {Object.entries(profileStats.emotion_breakdown)
                            .sort(([,a], [,b]) => b - a)
                            .slice(0, 4)
                            .map(([emotion, pct]) => (
                              <div key={emotion} className="flex items-center gap-2">
                                <span>{emotionEmojis[emotion]}</span>
                                <div className="flex-1 h-1.5 bg-current/20 rounded-full overflow-hidden">
                                  <div className="h-full bg-current/60 rounded-full" style={{ width: `${pct}%` }} />
                                </div>
                                <span className="text-xs font-mono w-8">{pct}%</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Past Sessions */}
            {selectedProfile && pastSessions.length > 0 && (
              <div className="bg-muted/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <History className="h-4 w-4" />
                  <h3 className="text-sm font-medium">Past Sessions</h3>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {pastSessions.slice(0, 5).map(session => (
                    <div
                      key={session.id}
                      className={`p-2 rounded-lg text-xs ${session.overall_mood ? emotionColors[session.overall_mood] : 'bg-background'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          {session.overall_mood && emotionEmojis[session.overall_mood]}
                          <span className="capitalize">{session.overall_mood || 'In progress'}</span>
                        </span>
                        <span className="font-mono">{session.message_count} msgs</span>
                      </div>
                      <div className="text-[10px] opacity-60 mt-1">
                        {new Date(session.started_at).toLocaleDateString()}
                        {session.duration_seconds && ` • ${formatDuration(session.duration_seconds)}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Session Control */}
            <div className="bg-muted/30 rounded-xl p-4">
              <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
                <MessageSquare className="h-4 w-4" />
                Session
              </h3>

              {!activeSession ? (
                <Button 
                  onClick={startSession}
                  disabled={!selectedProfile || loading}
                  className="w-full"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Session
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Messages</span>
                    <span className="font-mono">{sessionMessages.length}</span>
                  </div>
                  {currentMood && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Current Mood</span>
                      <span className="flex items-center gap-1.5">
                        {emotionEmojis[currentMood]}
                        <span className="capitalize">{currentMood}</span>
                      </span>
                    </div>
                  )}
                  <Button 
                    onClick={endSession}
                    variant="outline"
                    className="w-full"
                    disabled={loading}
                  >
                    <StopCircle className="h-4 w-4 mr-2" />
                    End Session
                  </Button>
                </div>
              )}
            </div>

            {/* Session Summary (shown after ending) */}
            {sessionSummary && (
              <div className={`rounded-xl p-4 ${emotionColors[sessionSummary.overall_mood] || 'bg-gray-50'}`}>
                <h3 className="text-sm font-medium mb-3">Session Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Overall Mood</span>
                    <span className="flex items-center gap-1.5 font-medium">
                      {emotionEmojis[sessionSummary.overall_mood]}
                      <span className="capitalize">{sessionSummary.overall_mood}</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Confidence</span>
                    <span className="font-mono">{(sessionSummary.mood_confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Sentiment Trend</span>
                    <span className="flex items-center gap-1.5">
                      {sessionSummary.sentiment_trend === 'improving' && <TrendingUp className="h-4 w-4 text-emerald-600" />}
                      {sessionSummary.sentiment_trend === 'declining' && <TrendingDown className="h-4 w-4 text-rose-600" />}
                      {sessionSummary.sentiment_trend === 'stable' && <Minus className="h-4 w-4 text-slate-600" />}
                      <span className="capitalize">{sessionSummary.sentiment_trend}</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Duration</span>
                    <span className="flex items-center gap-1.5 font-mono">
                      <Clock className="h-3 w-3" />
                      {formatDuration(sessionSummary.duration_seconds)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Middle Panel: Chat */}
          <div className="lg:col-span-2">
            <div className="bg-muted/30 rounded-xl h-[600px] flex flex-col">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {!activeSession && sessionMessages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center">
                    <div>
                      <div className="text-5xl mb-4">💬</div>
                      <p className="text-muted-foreground text-sm">
                        {selectedProfile 
                          ? 'Click "Start Session" to begin analyzing messages'
                          : 'Select a user and start a session'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {sessionMessages.map((msg) => (
                      <div key={msg.id} className="flex gap-3">
                        <div className={`flex-1 rounded-xl p-4 ${emotionColors[msg.emotion] || 'bg-white border'}`}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="text-sm">{msg.content}</p>
                              <div className="mt-2 flex items-center gap-2 text-xs opacity-70">
                                <span className="flex items-center gap-1">
                                  {emotionEmojis[msg.emotion]}
                                  <span className="capitalize">{msg.emotion}</span>
                                </span>
                                <span>•</span>
                                <span>{(msg.confidence * 100).toFixed(0)}%</span>
                                {msg.type === 'audio' && (
                                  <>
                                    <span>•</span>
                                    <Mic className="h-3 w-3" />
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="text-3xl">{emotionEmojis[msg.emotion]}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input Area */}
              {activeSession && (
                <div className="border-t p-4">
                  {/* Transcription preview */}
                  {isRecording && transcription && (
                    <div className="mb-3 p-2 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-800">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
                        Recording...
                      </div>
                      <p className="italic">{transcription}</p>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendSessionMessage()}
                      placeholder="Type a message to analyze..."
                      className="flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                      disabled={loading || isRecording}
                    />
                    {speechSupported && (
                      <Button
                        onClick={isRecording ? stopRecording : startRecording}
                        variant={isRecording ? "destructive" : "outline"}
                        size="lg"
                        className="px-4"
                        title={isRecording ? "Stop recording" : "Start voice input (optional)"}
                      >
                        {isRecording ? <StopCircle className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                      </Button>
                    )}
                    <Button
                      onClick={sendSessionMessage}
                      disabled={loading || !textInput.trim() || isRecording}
                      size="lg"
                      className="px-6"
                    >
                      {loading ? '...' : 'Send'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Profile Modal */}
      {showCreateProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Create New User</h2>
              <button onClick={() => setShowCreateProfile(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Username</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                  placeholder="john_doe"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring font-mono"
                />
                <p className="text-xs text-muted-foreground mt-1">Lowercase letters, numbers, underscores, hyphens only</p>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Display Name</label>
                <input
                  type="text"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setShowCreateProfile(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={createProfile} disabled={loading || !newUsername} className="flex-1">
                  {loading ? 'Creating...' : 'Create User'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
