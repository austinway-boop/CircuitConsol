import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getUserOrganizations } from '@/lib/org-utils'
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

  const orgs = await getUserOrganizations(user.id)
  const currentOrg = orgs[0]

  return (
    <SimpleShell user={user} currentOrg={currentOrg}>
      {children}
    </SimpleShell>
  )
}
