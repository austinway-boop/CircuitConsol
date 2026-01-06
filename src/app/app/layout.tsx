import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { SimpleShell } from '@/components/simple-shell'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/sign-in')
  }

  return (
    <SimpleShell user={user}>
      {children}
    </SimpleShell>
  )
}
