'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  FolderKanban, 
  Key, 
  Webhook, 
  Activity, 
  Users, 
  Settings, 
  FileText,
  Search,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
  ChevronDown,
  Plus,
  Shield,
  BarChart3,
  Play,
  MessageSquare
} from 'lucide-react'
import { Button } from './ui/button'
import { useTheme } from './theme-provider'
import { cn } from '@/lib/utils'

interface AppShellProps {
  children: React.ReactNode
  user: {
    id: string
    email: string
    name: string
  }
  currentOrg?: {
    id: string
    name: string
    slug: string
  }
  organizations: Array<{
    id: string
    name: string
    slug: string
  }>
  isAdmin?: boolean
}

const consoleNavigation = [
  { name: 'Overview', href: '/app/overview', icon: LayoutDashboard },
  { name: 'Playground', href: '/app/playground', icon: Play },
  { name: 'Sessions', href: '/app/sessions', icon: MessageSquare },
  { name: 'Projects', href: '/app/projects', icon: FolderKanban },
  { name: 'API Keys', href: '/app/api-keys', icon: Key },
  { name: 'Webhooks', href: '/app/webhooks', icon: Webhook },
  { name: 'Integration', href: '/app/integration', icon: Activity },
  { name: 'Usage', href: '/app/usage', icon: BarChart3 },
  { name: 'Team', href: '/app/team', icon: Users },
  { name: 'Audit Logs', href: '/app/audit-logs', icon: FileText },
  { name: 'Settings', href: '/app/settings', icon: Settings },
]

const adminNavigation = [
  { name: 'Overview', href: '/admin/overview', icon: LayoutDashboard },
  { name: 'Matchmaking', href: '/admin/matchmaking', icon: Activity },
  { name: 'Controls', href: '/admin/controls', icon: Settings },
  { name: 'Experiments', href: '/admin/experiments', icon: FileText },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Status', href: '/admin/status', icon: Shield },
]

export function AppShell({ children, user, currentOrg, organizations, isAdmin }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  const isAdminRoute = pathname?.startsWith('/admin')
  const navigation = isAdminRoute ? adminNavigation : consoleNavigation

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/sign-in')
  }

  const handleSearch = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      setCommandOpen(!commandOpen)
    }
  }

  return (
    <div className="min-h-screen bg-background" onKeyDown={handleSearch}>
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b">
            <Link href="/app/overview" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">C</span>
              </div>
              <span className="font-semibold text-lg">Circuit</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Org Switcher */}
          {!isAdminRoute && (
            <div className="px-3 py-4 border-b">
              <button
                onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-accent text-left"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {currentOrg?.name || 'Select Organization'}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
              
              {orgDropdownOpen && (
                <div className="mt-2 py-2 bg-popover border rounded-md shadow-lg">
                  {organizations.map(org => (
                    <button
                      key={org.id}
                      onClick={() => {
                        router.push(`/app/overview?org=${org.id}`)
                        setOrgDropdownOpen(false)
                      }}
                      className="w-full px-3 py-2 text-sm text-left hover:bg-accent"
                    >
                      {org.name}
                    </button>
                  ))}
                  <div className="border-t my-2" />
                  <button
                    onClick={() => {
                      router.push('/app/create-org')
                      setOrgDropdownOpen(false)
                    }}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-accent flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create Organization
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {isAdmin && !isAdminRoute && (
              <Link
                href="/admin/overview"
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent text-sm font-medium"
              >
                <Shield className="h-4 w-4" />
                Admin Panel
              </Link>
            )}
            
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User Menu */}
          <div className="p-3 border-t">
            <div className="flex items-center justify-between px-3 py-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
            <div className="mt-2 flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="flex-1"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex-1">
            <Button
              variant="outline"
              className="w-full max-w-sm justify-start text-muted-foreground"
              onClick={() => setCommandOpen(true)}
            >
              <Search className="h-4 w-4 mr-2" />
              <span>Search...</span>
              <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Command Palette */}
      {commandOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-popover border rounded-lg shadow-lg">
            <div className="p-4">
              <input
                type="text"
                placeholder="Search for pages, actions..."
                className="w-full bg-transparent outline-none"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setCommandOpen(false)
                }}
              />
            </div>
            <div className="border-t p-2 max-h-96 overflow-y-auto">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    router.push(item.href)
                    setCommandOpen(false)
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent text-left"
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

