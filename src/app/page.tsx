import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getUserOrganizations } from '@/lib/org-utils'

export default async function HomePage() {
  const user = await getCurrentUser()
  
  if (user) {
    // Check if user has any organizations
    const orgs = getUserOrganizations(user.id)
    
    if (orgs.length === 0) {
      // No organizations - go to onboarding
      redirect('/onboarding')
    } else {
      // Has organizations - go to organization page
      redirect('/app/organization')
    }
  } else {
    redirect('/sign-in')
  }
}
