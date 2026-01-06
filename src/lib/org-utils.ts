import { getStore, updateStore, Organization, OrgMember } from './data-store'
import { nanoid } from 'nanoid'
import { slugify } from './utils'

export function getUserOrganizations(userId: string): Organization[] {
  const store = getStore()
  const userOrgIds = store.orgMembers
    .filter(m => m.userId === userId)
    .map(m => m.orgId)
  
  return store.organizations.filter(o => userOrgIds.includes(o.id))
}

export function getUserOrgMembership(userId: string, orgId: string): OrgMember | undefined {
  const store = getStore()
  return store.orgMembers.find(m => m.userId === userId && m.orgId === orgId)
}

export function hasPermission(
  role: 'owner' | 'admin' | 'developer' | 'viewer',
  requiredRole: 'owner' | 'admin' | 'developer' | 'viewer'
): boolean {
  const hierarchy = { owner: 4, admin: 3, developer: 2, viewer: 1 }
  return hierarchy[role] >= hierarchy[requiredRole]
}

export function canManageTeam(role: 'owner' | 'admin' | 'developer' | 'viewer'): boolean {
  return role === 'owner' || role === 'admin'
}

export async function createOrganization(
  name: string,
  ownerId: string
): Promise<Organization> {
  const orgId = `org_${nanoid(12)}`
  const slug = slugify(name)

  const org: Organization = {
    id: orgId,
    name,
    slug,
    createdAt: new Date().toISOString(),
    ownerId,
  }

  const membership: OrgMember = {
    orgId,
    userId: ownerId,
    role: 'owner',
    joinedAt: new Date().toISOString(),
  }

  updateStore(s => ({
    ...s,
    organizations: [...s.organizations, org],
    orgMembers: [...s.orgMembers, membership],
  }))

  return org
}

