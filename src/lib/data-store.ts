import fs from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';
import { getRedis } from './redis';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  ownerId: string;
}

export interface OrgMember {
  orgId: string;
  userId: string;
  role: 'owner' | 'admin' | 'developer' | 'viewer';
  joinedAt: string;
}

export interface Project {
  id: string;
  orgId: string;
  name: string;
  slug: string;
  environments: Environment[];
  createdAt: string;
}

export interface Environment {
  id: string;
  name: string;
  slug: string;
}

export interface ApiKey {
  id: string;
  projectId: string;
  envId: string;
  name: string;
  keyHash: string;
  prefix: string;
  lastUsed?: string;
  createdAt: string;
  createdBy: string;
}

export interface Webhook {
  id: string;
  projectId: string;
  url: string;
  events: string[];
  secretHash: string;
  enabled: boolean;
  createdAt: string;
}

export interface Invite {
  id: string;
  orgId: string;
  email: string;
  role: 'admin' | 'developer' | 'viewer';
  token: string;
  createdBy: string;
  createdAt: string;
  expiresAt: string;
  acceptedAt?: string;
}

export interface AuditLog {
  id: string;
  orgId: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  metadata?: any;
  timestamp: string;
}

export interface JoinRequest {
  id: string;
  orgId: string;
  userId: string;
  userName: string;
  userEmail: string;
  message?: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'denied';
}

export interface CircuitApiKey {
  id: string;
  name: string;
  key: string;
  keyHash: string;
  orgId: string;
  environment: 'production' | 'development';
  createdAt: string;
  createdBy: string;
  lastUsed?: string;
  requests: number;
}

export interface DataStore {
  users: User[];
  organizations: Organization[];
  orgMembers: OrgMember[];
  projects: Project[];
  apiKeys: ApiKey[];
  webhooks: Webhook[];
  invites: Invite[];
  auditLogs: AuditLog[];
  joinRequests?: JoinRequest[];
  circuitApiKeys?: CircuitApiKey[];
}

let inMemoryStore: DataStore | null = null;
let storageMode: 'redis' | 'file' | 'memory' = 'redis';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'dev-store.json');
const REDIS_KEY = 'circuit:store';

function getDefaultStore(): DataStore {
  const defaultPasswordHash = bcrypt.hashSync('password123', 10);
  const ownerId = 'user_default_owner';
  const orgId = 'org_default';
  const projectId = 'proj_default';

  return {
    users: [
      {
        id: ownerId,
        email: 'admin@circuit.com',
        passwordHash: defaultPasswordHash,
        name: 'Admin User',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'user_demo_dev',
        email: 'dev@circuit.com',
        passwordHash: defaultPasswordHash,
        name: 'Developer User',
        createdAt: new Date().toISOString(),
      }
    ],
    organizations: [
      {
        id: orgId,
        name: 'Circuit Labs',
        slug: 'circuit-labs',
        createdAt: new Date().toISOString(),
        ownerId,
      }
    ],
    orgMembers: [
      {
        orgId,
        userId: ownerId,
        role: 'owner',
        joinedAt: new Date().toISOString(),
      },
      {
        orgId,
        userId: 'user_demo_dev',
        role: 'developer',
        joinedAt: new Date().toISOString(),
      }
    ],
    projects: [
      {
        id: projectId,
        orgId,
        name: 'Main Project',
        slug: 'main-project',
        environments: [
          { id: 'env_sandbox', name: 'Sandbox', slug: 'sandbox' },
          { id: 'env_prod', name: 'Production', slug: 'production' }
        ],
        createdAt: new Date().toISOString(),
      }
    ],
    apiKeys: [],
    webhooks: [],
    invites: [],
    auditLogs: [],
    joinRequests: [],
    circuitApiKeys: [],
  };
}

async function initRedisStorage(): Promise<DataStore> {
  try {
    const redis = getRedis();
    const data = await redis.get(REDIS_KEY);
    
    if (data) {
      return JSON.parse(data);
    } else {
      const defaultData = getDefaultStore();
      await redis.set(REDIS_KEY, JSON.stringify(defaultData));
      return defaultData;
    }
  } catch (error) {
    console.warn('Redis storage failed, falling back to file storage:', error);
    storageMode = 'file';
    return initFileStorage();
  }
}

function initFileStorage(): DataStore {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(data);
    } else {
      const defaultData = getDefaultStore();
      fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
  } catch (error) {
    console.warn('File storage failed, using in-memory store:', error);
    storageMode = 'memory';
    return getDefaultStore();
  }
}

async function saveToRedis(data: DataStore): Promise<void> {
  try {
    const redis = getRedis();
    await redis.set(REDIS_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save to Redis, switching to file mode:', error);
    storageMode = 'file';
    saveToFile(data);
  }
}

function saveToFile(data: DataStore): void {
  if (storageMode === 'file') {
    try {
      const tempFile = DATA_FILE + '.tmp';
      fs.writeFileSync(tempFile, JSON.stringify(data, null, 2));
      fs.renameSync(tempFile, DATA_FILE);
    } catch (error) {
      console.warn('Failed to save to file, switching to memory mode:', error);
      storageMode = 'memory';
      inMemoryStore = data;
    }
  } else {
    inMemoryStore = data;
  }
}

export async function getStore(): Promise<DataStore> {
  if (storageMode === 'redis') {
    try {
      return await initRedisStorage();
    } catch (error) {
      console.warn('Redis unavailable, falling back:', error);
      storageMode = 'file';
    }
  }

  if (inMemoryStore) {
    return inMemoryStore;
  }

  if (storageMode === 'file') {
    return initFileStorage();
  }

  inMemoryStore = getDefaultStore();
  return inMemoryStore;
}

export async function updateStore(updater: (store: DataStore) => DataStore): Promise<void> {
  const currentStore = await getStore();
  const updatedStore = updater(currentStore);
  
  if (storageMode === 'redis') {
    await saveToRedis(updatedStore);
  } else {
    saveToFile(updatedStore);
  }
}

export function getStorageMode(): 'redis' | 'file' | 'memory' {
  return storageMode;
}

export async function resetStore(): Promise<void> {
  const defaultData = getDefaultStore();
  if (storageMode === 'redis') {
    await saveToRedis(defaultData);
  } else {
    saveToFile(defaultData);
  }
}
