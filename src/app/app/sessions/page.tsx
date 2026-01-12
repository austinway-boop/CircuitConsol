'use client'

import { useState, useEffect } from 'react'
import { Clock, User, MessageSquare, TrendingUp, TrendingDown, Minus, RefreshCw, ChevronRight, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const emotionColors: Record<string, string> = {
  joy: 'bg-amber-100 text-amber-800',
  trust: 'bg-sky-100 text-sky-800',
  anticipation: 'bg-violet-100 text-violet-800',
  surprise: 'bg-fuchsia-100 text-fuchsia-800',
  anger: 'bg-rose-100 text-rose-800',
  fear: 'bg-orange-100 text-orange-800',
  sadness: 'bg-slate-100 text-slate-800',
  disgust: 'bg-emerald-100 text-emerald-800',
  neutral: 'bg-gray-100 text-gray-800',
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

interface Session {
  id: string
  profile_id: string
  username: string
  display_name: string
  status: string
  started_at: string
  ended_at?: string
  duration_seconds?: number
  message_count: number
  overall_mood?: string
  mood_confidence?: number
  sentiment_trend?: string
  avg_valence?: number
}

interface Organization {
  id: string
  name: string
  slug: string
}

interface Analytics {
  period_days: number
  overall: {
    total_sessions: string
    unique_profiles: string
    total_messages: string
    avg_session_duration: string
    avg_valence: string
  }
  emotion_distribution: Array<{ overall_mood: string; count: string }>
  daily_trends: Array<{ date: string; sessions: string; avg_valence: string; messages: string }>
}

export default function SessionsPage() {
  const [apiKey, setApiKey] = useState('')
  const apiUrl = 'https://circuit-68ald.ondigitalocean.app'
  const [loading, setLoading] = useState(true)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [selectedSession, setSelectedSession] = useState<any>(null)
  const [sessionMessages, setSessionMessages] = useState<any[]>([])

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const res = await fetch('/api/api-keys/list-circuit')
        if (res.ok) {
          const data = await res.json()
          if (data.keys && data.keys.length > 0) {
            const prodKey = data.keys.find((k: any) => k.environment === 'production')
            setApiKey((prodKey || data.keys[0]).key)
          }
        }
      } catch (err) {
        console.error('Failed to fetch API key:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchApiKey()
  }, [])

  useEffect(() => {
    if (apiKey) {
      fetchOrganizations()
    }
  }, [apiKey])

  useEffect(() => {
    if (selectedOrg && apiKey) {
      fetchSessions()
      fetchAnalytics()
    }
  }, [selectedOrg, apiKey])

  const fetchOrganizations = async () => {
    try {
      const res = await fetch(`${apiUrl}/v1/orgs`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      })
      const data = await res.json()
      if (data.success && data.organizations?.length > 0) {
        setOrganizations(data.organizations)
        setSelectedOrg(data.organizations[0])
      }
    } catch (err) {
      console.error('Failed to fetch organizations:', err)
    }
  }

  const fetchSessions = async () => {
    if (!selectedOrg) return
    try {
      const res = await fetch(`${apiUrl}/v1/orgs/${selectedOrg.id}/sessions?limit=50`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      })
      const data = await res.json()
      if (data.success) {
        setSessions(data.sessions || [])
      }
    } catch (err) {
      console.error('Failed to fetch sessions:', err)
    }
  }

  const fetchAnalytics = async () => {
    if (!selectedOrg) return
    try {
      const res = await fetch(`${apiUrl}/v1/orgs/${selectedOrg.id}/analytics?days=30`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      })
      const data = await res.json()
      if (data.success) {
        setAnalytics(data.analytics)
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err)
    }
  }

  const fetchSessionDetails = async (sessionId: string) => {
    try {
      const res = await fetch(`${apiUrl}/v1/sessions/${sessionId}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      })
      const data = await res.json()
      if (data.success) {
        setSelectedSession(data.session)
        setSessionMessages(data.messages || [])
      }
    } catch (err) {
      console.error('Failed to fetch session details:', err)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Sessions</h1>
          <p className="text-muted-foreground mt-1">
            View and analyze emotion profiling sessions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedOrg?.id || ''}
            onChange={(e) => {
              const org = organizations.find(o => o.id === e.target.value)
              setSelectedOrg(org || null)
            }}
            className="px-4 py-2 border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {organizations.map(org => (
              <option key={org.id} value={org.id}>{org.name}</option>
            ))}
          </select>
          <Button variant="outline" size="sm" onClick={fetchSessions}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-gradient-to-br from-violet-50 to-violet-100 border border-violet-200 rounded-xl p-4">
            <div className="text-2xl font-bold text-violet-700">{analytics.overall.total_sessions || 0}</div>
            <div className="text-sm text-violet-600">Total Sessions</div>
          </div>
          <div className="bg-gradient-to-br from-sky-50 to-sky-100 border border-sky-200 rounded-xl p-4">
            <div className="text-2xl font-bold text-sky-700">{analytics.overall.unique_profiles || 0}</div>
            <div className="text-sm text-sky-600">Unique Users</div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-4">
            <div className="text-2xl font-bold text-amber-700">{analytics.overall.total_messages || 0}</div>
            <div className="text-sm text-amber-600">Messages</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-4">
            <div className="text-2xl font-bold text-emerald-700">
              {analytics.overall.avg_session_duration 
                ? formatDuration(Math.round(parseFloat(analytics.overall.avg_session_duration)))
                : '0m'}
            </div>
            <div className="text-sm text-emerald-600">Avg Duration</div>
          </div>
          <div className="bg-gradient-to-br from-rose-50 to-rose-100 border border-rose-200 rounded-xl p-4">
            <div className="text-2xl font-bold text-rose-700">
              {analytics.overall.avg_valence 
                ? (parseFloat(analytics.overall.avg_valence) * 100).toFixed(0) + '%'
                : 'N/A'}
            </div>
            <div className="text-sm text-rose-600">Avg Valence</div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sessions List */}
        <div className="lg:col-span-2">
          <div className="bg-white border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b bg-muted/30">
              <h2 className="font-medium">Recent Sessions</h2>
            </div>
            
            {sessions.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-4xl mb-4">💬</div>
                <p className="text-muted-foreground">No sessions yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Start a session in the Playground to begin tracking emotions
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {sessions.map(session => (
                  <button
                    key={session.id}
                    onClick={() => fetchSessionDetails(session.id)}
                    className={`w-full text-left p-4 hover:bg-muted/30 transition-colors ${
                      selectedSession?.id === session.id ? 'bg-muted/50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-lg ${
                          session.overall_mood 
                            ? emotionColors[session.overall_mood] 
                            : 'bg-gray-100'
                        }`}>
                          {session.overall_mood ? emotionEmojis[session.overall_mood] : '💬'}
                        </div>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            <User className="h-3 w-3 text-muted-foreground" />
                            {session.display_name || session.username}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            {formatDate(session.started_at)}
                            {session.duration_seconds && (
                              <>
                                <span>•</span>
                                {formatDuration(session.duration_seconds)}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {session.status === 'active' ? (
                          <span className="px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Active
                          </span>
                        ) : session.overall_mood && (
                          <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${emotionColors[session.overall_mood]}`}>
                            {session.overall_mood}
                          </span>
                        )}
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MessageSquare className="h-4 w-4" />
                          {session.message_count}
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Session Details / Emotion Distribution */}
        <div className="space-y-6">
          {selectedSession ? (
            <div className="bg-white border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
                <h2 className="font-medium">Session Details</h2>
                <button 
                  onClick={() => {
                    setSelectedSession(null)
                    setSessionMessages([])
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
              </div>
              
              <div className="p-4 space-y-4">
                {/* Session Summary */}
                {selectedSession.overall_mood && (
                  <div className={`rounded-xl p-4 ${emotionColors[selectedSession.overall_mood]}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm opacity-70">Overall Mood</div>
                        <div className="text-xl font-bold capitalize flex items-center gap-2">
                          {emotionEmojis[selectedSession.overall_mood]}
                          {selectedSession.overall_mood}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm opacity-70">Trend</div>
                        <div className="flex items-center gap-1">
                          {selectedSession.sentiment_trend === 'improving' && <TrendingUp className="h-5 w-5" />}
                          {selectedSession.sentiment_trend === 'declining' && <TrendingDown className="h-5 w-5" />}
                          {selectedSession.sentiment_trend === 'stable' && <Minus className="h-5 w-5" />}
                          <span className="capitalize">{selectedSession.sentiment_trend || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Messages */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Messages ({sessionMessages.length})</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {sessionMessages.map((msg: any) => (
                      <div 
                        key={msg.id}
                        className={`p-3 rounded-lg text-sm ${emotionColors[msg.overall_emotion] || 'bg-gray-50'}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="flex-1">{msg.content || msg.transcription || '[Audio]'}</p>
                          <span className="flex-shrink-0">{emotionEmojis[msg.overall_emotion]}</span>
                        </div>
                        <div className="mt-1 text-xs opacity-60">
                          {new Date(msg.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Emotion Distribution */
            analytics && analytics.emotion_distribution.length > 0 && (
              <div className="bg-white border rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b bg-muted/30">
                  <h2 className="font-medium">Emotion Distribution</h2>
                </div>
                <div className="p-4 space-y-3">
                  {analytics.emotion_distribution.map(({ overall_mood, count }) => (
                    <div key={overall_mood} className="flex items-center gap-3">
                      <span className="text-xl">{emotionEmojis[overall_mood] || '😐'}</span>
                      <span className="capitalize text-sm w-24">{overall_mood}</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${emotionColors[overall_mood]?.split(' ')[0] || 'bg-gray-300'}`}
                          style={{ 
                            width: `${(parseInt(count) / parseInt(analytics.overall.total_sessions || '1')) * 100}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-8 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}

          {/* Quick Info */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="h-4 w-4" />
              <h3 className="font-medium">Organization</h3>
            </div>
            <div className="text-2xl font-bold mb-1">{selectedOrg?.name || 'No org selected'}</div>
            <div className="text-sm text-slate-400 font-mono">{selectedOrg?.slug || '-'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

