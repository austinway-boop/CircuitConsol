'use client'

import { useState } from 'react'
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
  key: string
  environment: 'production' | 'development'
  createdAt: string
  lastUsed?: string
  requests: number
}

const generateRealisticKey = (env: 'production' | 'development') => {
  const prefix = env === 'production' ? 'sk_live' : 'sk_test'
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let key = ''
  for (let i = 0; i < 48; i++) {
    key += chars[Math.floor(Math.random() * chars.length)]
  }
  return `${prefix}_${key}`
}

export default function ApiPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: '1',
      name: 'Production API Key',
      key: 'sk_live_' + 'aB3xK9mP2vL8nQ5wR7cF4jH6tY1zD0eG3sA8uB5xK2mV9nL7wP4',
      environment: 'production',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      lastUsed: new Date().toISOString(),
      requests: 12543,
    }
  ])
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newKeyDialogOpen, setNewKeyDialogOpen] = useState(false)
  const [newGeneratedKey, setNewGeneratedKey] = useState('')
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    environment: 'development' as 'production' | 'development',
  })

  const handleCreateKey = () => {
    const newKey = {
      id: Date.now().toString(),
      name: formData.name,
      key: generateRealisticKey(formData.environment),
      environment: formData.environment,
      createdAt: new Date().toISOString(),
      requests: 0,
    }

    setApiKeys([...apiKeys, newKey])
    setNewGeneratedKey(newKey.key)
    setNewKeyDialogOpen(true)
    setCreateDialogOpen(false)
    setFormData({ name: '', environment: 'development' })
  }

  const toggleKeyVisibility = (id: string) => {
    const newVisible = new Set(visibleKeys)
    if (newVisible.has(id)) {
      newVisible.delete(id)
    } else {
      newVisible.add(id)
    }
    setVisibleKeys(newVisible)
  }

  const copyKey = (key: string, id: string) => {
    navigator.clipboard.writeText(key)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const deleteKey = (id: string) => {
    if (confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      setApiKeys(apiKeys.filter(k => k.id !== id))
    }
  }

  const maskKey = (key: string) => {
    const parts = key.split('_')
    return `${parts[0]}_${parts[1]}_${'•'.repeat(20)}`
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
            <p className="text-sm text-muted-foreground">Total requests</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold mb-1">99.9%</div>
            <p className="text-sm text-muted-foreground">Uptime</p>
          </CardContent>
        </Card>
      </div>

      {/* API Keys List */}
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
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono">
                        {visibleKeys.has(apiKey.id) ? apiKey.key : maskKey(apiKey.key)}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => toggleKeyVisibility(apiKey.id)}
                      >
                        {visibleKeys.has(apiKey.id) ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyKey(apiKey.key, apiKey.id)}
                      >
                        {copied === apiKey.id ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:text-destructive"
                    onClick={() => deleteKey(apiKey.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
              disabled={!formData.name.trim()}
              className="w-full"
            >
              Create API key
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
