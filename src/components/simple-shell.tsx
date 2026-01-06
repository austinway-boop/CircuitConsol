'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  Building,
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
  Bell
} from 'lucide-react'
import { Button } from './ui/button'
import { useTheme } from './theme-provider'
import { cn } from '@/lib/utils'

interface SimpleShellProps {
  children: React.ReactNode
  user: {
    id: string
    email: string
    name: string
  }
}

const navigation = [
  { name: 'Organizations', href: '/app/organizations', icon: Building },
  { name: 'Members', href: '/app/members', icon: Users },
  { name: 'Settings', href: '/app/settings', icon: Settings },
]

export function SimpleShell({ children, user }: SimpleShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/sign-in')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-sm transform transition-all duration-300 ease-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-5 border-b border-border">
            <Link href="/app/organizations" className="flex items-center space-x-2 group">
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-orange-500 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow transition-all">
                <span className="text-white font-bold">C</span>
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

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="p-3 border-t border-border space-y-2">
            {/* User info */}
            <div className="px-3 py-2.5 rounded-lg bg-accent/40">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            
            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="flex-1 h-9"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="flex-1 h-9"
              >
                <Bell className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="flex-1 h-9 hover:bg-destructive/10 hover:text-destructive"
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
          className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar (mobile) */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-white/90 backdrop-blur-sm px-4 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex-1 flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-primary to-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="font-semibold">Circuit</span>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  )
}
