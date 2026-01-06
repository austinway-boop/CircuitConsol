import { getStore, updateStore, Organization, OrgMember } from './data-store'
import { nanoid } from 'nanoid'
import { slugify } from './utils'

export async function getUserOrganizations(userId: string): Promise<Organization[]> {
  const store = await getStore()
  const userOrgIds = store.orgMembers
    .filter(m => m.userId === userId)
    .map(m => m.orgId)
  
  return store.organizations.filter(o => userOrgIds.includes(o.id))
}

export async function getUserOrgMembership(userId: string, orgId: string): Promise<OrgMember | undefined> {
  const store = await getStore()
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

  await updateStore(s => ({
    ...s,
    organizations: [...s.organizations, org],
    orgMembers: [...s.orgMembers, membership],
  }))

  return org
}

