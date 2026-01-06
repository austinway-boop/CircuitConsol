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
  X
} from 'lucide-react'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'

interface SimpleShellProps {
  children: React.ReactNode
  user: {
    id: string
    email: string
    name: string
  }
  currentOrg?: {
    name: string
  }
}

const navigation = [
  { name: 'Organization', href: '/app/organization', icon: Building },
]

export function SimpleShell({ children, user, currentOrg }: SimpleShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/sign-in')
  }

  // Close user menu when clicking anywhere
  const handleClickOutside = () => {
    if (userMenuOpen) setUserMenuOpen(false)
  }

  return (
    <div className="min-h-screen flex" onClick={handleClickOutside}>
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-56 bg-card border-r transform transition-transform lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-14 px-4 flex items-center justify-between border-b">
            <Link href="/app/organization" className="font-semibold text-lg">
              Circuit
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-accent text-foreground'
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
          <div className="p-3 border-t relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setUserMenuOpen(!userMenuOpen)
              }}
              className="w-full px-3 py-2 rounded-lg bg-accent/50 hover:bg-accent transition-colors text-left"
            >
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              {currentOrg && (
                <p className="text-xs text-primary truncate mt-1">{currentOrg.name}</p>
              )}
            </button>
            
            {/* User dropdown menu */}
            {userMenuOpen && (
              <div className="absolute bottom-full left-3 right-3 mb-2 bg-card border rounded-lg shadow-lg overflow-hidden">
                <Link
                  href="/app/settings"
                  className="flex items-center gap-2 px-3 py-2 hover:bg-accent transition-colors text-sm"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
                <button
                  onClick={() => {
                    setUserMenuOpen(false)
                    handleLogout()
                  }}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-destructive/10 hover:text-destructive transition-colors text-sm w-full text-left"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-56">
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-20 bg-background/80 backdrop-blur-sm border-b px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-semibold">Circuit</span>
        </div>

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
