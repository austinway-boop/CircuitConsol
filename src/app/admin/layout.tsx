import { redirect } from 'next/navigation'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import { AppShell } from '@/components/app-shell'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/sign-in')
  }

  if (!isAdmin(user.email)) {
    redirect('/app/overview')
  }

  return (
    <AppShell
      user={user}
      organizations={[]}
      isAdmin={true}
    >
      {children}
    </AppShell>
  )
}

