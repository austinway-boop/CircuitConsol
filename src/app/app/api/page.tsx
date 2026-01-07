'use client'

import { useState, useEffect } from 'react'
import { Plus, Copy, Check, Eye, EyeOff, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'

interface ApiKey {
  id: string
  name: string
  keyPrefix: string
  environment: 'production' | 'development'
  createdAt: string
  lastUsed?: string
  requests: number
}

export default function ApiPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newKeyDialogOpen, setNewKeyDialogOpen] = useState(false)
  const [newGeneratedKey, setNewGeneratedKey] = useState('')
  const [creating, setCreating] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [stats, setStats] = useState({ totalRequests: 0, uptime: '0m', uptimePercent: 99.9 })
  const [formData, setFormData] = useState({
    name: '',
    environment: 'development' as 'production' | 'development',
  })

  useEffect(() => {
    loadKeys()
    loadStats()
    const interval = setInterval(loadStats, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const loadStats = async () => {
    try {
      const res = await fetch('/api/circuit-stats')
      const data = await res.json()
      setStats({
        totalRequests: data.totalRequests || 0,
        uptime: data.uptime || '0m',
        uptimePercent: data.uptimeSeconds > 0 ? 99.9 : 0
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const loadKeys = async () => {
    try {
      const res = await fetch('/api/api-keys/list-circuit')
      const data = await res.json()
      setApiKeys(data.keys || [])
    } catch (error) {
      console.error('Failed to load API keys:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateKey = async () => {
    if (!formData.name.trim()) return

    setCreating(true)
    try {
      const res = await fetch('/api/api-keys/create-circuit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        const data = await res.json()
        setNewGeneratedKey(data.key)
        // Store key in session for playground use
        sessionStorage.setItem(`circuit_key_${data.id}`, data.key)
        setNewKeyDialogOpen(true)
        await loadKeys()
        setCreateDialogOpen(false)
        setFormData({ name: '', environment: 'development' })
      }
    } catch (error) {
      console.error('Failed to create API key:', error)
    } finally {
      setCreating(false)
    }
  }

  const copyKey = (key: string, id: string) => {
    navigator.clipboard.writeText(key)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">Loading...</div>
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-1">API Keys</h1>
          <p className="text-sm text-muted-foreground">Manage your Circuit emotion analysis API keys</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Create key
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold mb-1">{apiKeys.length}</div>
            <p className="text-sm text-muted-foreground">Active keys</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold mb-1">
              {apiKeys.reduce((sum, k) => sum + k.requests, 0).toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">Your requests</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold mb-1">{stats.uptime}</div>
            <p className="text-sm text-muted-foreground">API uptime</p>
          </CardContent>
        </Card>
      </div>

      {/* API Keys List */}
      {apiKeys.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">No API keys yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Create your first API key to start using Circuit</p>
            <Button onClick={() => setCreateDialogOpen(true)} size="sm">
              Create API key
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Your API Keys</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {apiKeys.map((apiKey) => (
                <div key={apiKey.id} className="p-4 border rounded-lg hover:bg-accent/30 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{apiKey.name}</h3>
                        <Badge variant={apiKey.environment === 'production' ? 'default' : 'secondary'} className="text-xs">
                          {apiKey.environment}
                        </Badge>
                      </div>
                      <code className="text-xs font-mono text-muted-foreground">
                        {apiKey.keyPrefix}...
                      </code>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Created {new Date(apiKey.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{apiKey.requests.toLocaleString()} requests</span>
                    {apiKey.lastUsed && (
                      <>
                        <span>•</span>
                        <span>Last used {new Date(apiKey.lastUsed).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create API key</DialogTitle>
            <DialogDescription>Generate a new API key for Circuit emotion analysis</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="key-name">Key name</Label>
              <Input
                id="key-name"
                placeholder="My Application"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="environment">Environment</Label>
              <Select
                id="environment"
                value={formData.environment}
                onChange={(e) => setFormData({ ...formData, environment: e.target.value as any })}
              >
                <option value="development">Development</option>
                <option value="production">Production</option>
              </Select>
            </div>
            <Button 
              onClick={handleCreateKey} 
              disabled={creating || !formData.name.trim()}
              className="w-full"
            >
              {creating ? 'Creating...' : 'Create API key'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Key Dialog */}
      <Dialog open={newKeyDialogOpen} onOpenChange={setNewKeyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API key created</DialogTitle>
            <DialogDescription>
              Save this key now. You will not be able to see it again.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="p-4 bg-accent/50 rounded-lg border-2 border-border">
              <p className="text-xs text-muted-foreground mb-2">Your API key:</p>
              <code className="text-xs break-all block mb-3 font-mono">{newGeneratedKey}</code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(newGeneratedKey)
                  setCopied('new')
                }}
                className="w-full"
              >
                {copied === 'new' ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy key
                  </>
                )}
              </Button>
            </div>
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                Warning: Store this key securely. It will not be shown again.
              </p>
            </div>
            <Button onClick={() => setNewKeyDialogOpen(false)} className="w-full">
              I have saved my key
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
