import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { getStore, updateStore, User, AuditLog } from './data-store';
import { cookies } from 'next/headers';

const AUTH_SECRET = process.env.AUTH_SECRET || 'dev-secret-key';
const COOKIE_NAME = 'circuit_session';

export interface SessionData {
  userId: string;
  email: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createSession(user: User): string {
  const payload: SessionData = {
    userId: user.id,
    email: user.email,
  };

  return jwt.sign(payload, AUTH_SECRET, { expiresIn: '7d' });
}

export function verifySession(token: string): SessionData | null {
  try {
    return jwt.verify(token, AUTH_SECRET) as SessionData;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string): Promise<void> {
  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function getSessionCookie(): Promise<string | undefined> {
  return (await cookies()).get(COOKIE_NAME)?.value;
}

export async function deleteSessionCookie(): Promise<void> {
  (await cookies()).delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<User | null> {
  const token = await getSessionCookie();
  if (!token) return null;

  const session = verifySession(token);
  if (!session) return null;

  const store = await getStore();
  const user = store.users.find(u => u.id === session.userId);
  return user || null;
}

export async function signUp(email: string, password: string, name: string): Promise<{ success: boolean; error?: string; user?: User }> {
  const store = await getStore();

  // Check if user already exists
  if (store.users.find(u => u.email === email)) {
    return { success: false, error: 'Email already registered' };
  }

  const userId = `user_${nanoid(12)}`;
  const passwordHash = await hashPassword(password);

  const newUser: User = {
    id: userId,
    email,
    passwordHash,
    name,
    createdAt: new Date().toISOString(),
  };

  await updateStore(s => ({
    ...s,
    users: [...s.users, newUser],
  }));

  return { success: true, user: newUser };
}

export async function signIn(email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> {
  const store = await getStore();
  const user = store.users.find(u => u.email === email);

  if (!user) {
    return { success: false, error: 'Invalid credentials' };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { success: false, error: 'Invalid credentials' };
  }

  return { success: true, user };
}

export function isAdmin(email: string): boolean {
  const allowlist = process.env.ADMIN_EMAIL_ALLOWLIST || '';
  const allowedEmails = allowlist.split(',').map(e => e.trim()).filter(Boolean);
  return allowedEmails.includes(email);
}

export async function logAuditEvent(
  orgId: string,
  userId: string,
  action: string,
  resource: string,
  resourceId: string,
  metadata?: any
): Promise<void> {
  const auditLog: AuditLog = {
    id: `audit_${nanoid(12)}`,
    orgId,
    userId,
    action,
    resource,
    resourceId,
    metadata,
    timestamp: new Date().toISOString(),
  };

  await updateStore(s => ({
    ...s,
    auditLogs: [...s.auditLogs, auditLog],
  }));
}

