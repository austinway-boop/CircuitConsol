'use client'

import { useState, useEffect } from 'react'
import { Plus, Key, Copy, Trash2, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/empty-state'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CopyButton } from '@/components/copy-button'
import { Badge } from '@/components/ui/badge'

interface ApiKey {
  id: string
  name: string
  prefix: string
  projectId: string
  envId: string
  createdAt: string
  lastUsed?: string
}

interface Project {
  id: string
  name: string
  environments: Array<{ id: string; name: string }>
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newKeyDialogOpen, setNewKeyDialogOpen] = useState(false)
  const [newKey, setNewKey] = useState<string>('')
  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    projectId: '',
    envId: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [keysRes, projectsRes] = await Promise.all([
        fetch('/api/api-keys'),
        fetch('/api/projects'),
      ])
      const keysData = await keysRes.json()
      const projectsData = await projectsRes.json()
      
      setApiKeys(keysData.apiKeys || [])
      setProjects(projectsData.projects || [])
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.name.trim() || !formData.projectId || !formData.envId) return

    setCreating(true)
    try {
      const res = await fetch('/api/api-keys/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        const data = await res.json()
        setNewKey(data.key)
        setNewKeyDialogOpen(true)
        await loadData()
        setCreateDialogOpen(false)
        setFormData({ name: '', projectId: '', envId: '' })
      }
    } catch (error) {
      console.error('Failed to create API key:', error)
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return
    }

    try {
      await fetch(`/api/api-keys/${keyId}`, { method: 'DELETE' })
      await loadData()
    } catch (error) {
      console.error('Failed to delete API key:', error)
    }
  }

  const getProjectName = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.name || 'Unknown'
  }

  const getEnvName = (projectId: string, envId: string) => {
    const project = projects.find(p => p.id === projectId)
    return project?.environments.find(e => e.id === envId)?.name || 'Unknown'
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
          <p className="text-muted-foreground mt-2">
            Manage API keys for authenticating requests to your projects
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} disabled={projects.length === 0}>
          <Plus className="h-4 w-4 mr-2" />
          Create API Key
        </Button>
      </div>

      {projects.length === 0 && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-yellow-600 dark:text-yellow-500">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">You need to create a project before you can create API keys.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {apiKeys.length === 0 && projects.length > 0 ? (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              icon={Key}
              title="No API keys yet"
              description="Create your first API key to start authenticating requests to your projects"
              action={{
                label: 'Create API Key',
                onClick: () => setCreateDialogOpen(true),
              }}
            />
          </CardContent>
        </Card>
      ) : apiKeys.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Your API Keys</CardTitle>
            <CardDescription>
              These keys authenticate requests to the Circuit API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Environment</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">{key.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 font-mono text-sm">
                        <span>{key.prefix}••••••••••••</span>
                        <CopyButton value={key.prefix} />
                      </div>
                    </TableCell>
                    <TableCell>{getProjectName(key.projectId)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {getEnvName(key.projectId, key.envId)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(key.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {key.lastUsed ? new Date(key.lastUsed).toLocaleDateString() : 'Never'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(key.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}

      {/* Create API Key Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New API Key</DialogTitle>
            <DialogDescription>
              API keys authenticate requests to your projects. Keep them secure!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="key-name">Name</Label>
              <Input
                id="key-name"
                placeholder="Production API Key"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Select
                id="project"
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value, envId: '' })}
              >
                <option value="">Select a project</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </Select>
            </div>
            {formData.projectId && (
              <div className="space-y-2">
                <Label htmlFor="environment">Environment</Label>
                <Select
                  id="environment"
                  value={formData.envId}
                  onChange={(e) => setFormData({ ...formData, envId: e.target.value })}
                >
                  <option value="">Select an environment</option>
                  {projects
                    .find(p => p.id === formData.projectId)
                    ?.environments.map(env => (
                      <option key={env.id} value={env.id}>
                        {env.name}
                      </option>
                    ))}
                </Select>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={creating || !formData.name.trim() || !formData.projectId || !formData.envId}
              >
                {creating ? 'Creating...' : 'Create API Key'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Key Display Dialog */}
      <Dialog open={newKeyDialogOpen} onOpenChange={setNewKeyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API Key Created Successfully</DialogTitle>
            <DialogDescription>
              Make sure to copy your API key now. You won't be able to see it again!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between gap-2">
                <code className="text-sm font-mono break-all">{newKey}</code>
                <CopyButton value={newKey} />
              </div>
            </div>
              <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-500">
              <AlertCircle className="h-4 w-4" />
              <span>Store this key securely. It will not be shown again.</span>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setNewKeyDialogOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

