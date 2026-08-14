import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export const SESSION_COOKIE = 'nhatkyquy_session';
const SESSION_AGE_SECONDS = 60 * 60 * 24 * 7;

export interface SessionProfile {
  email: string;
  name?: string;
  avatarUrl?: string;
  storageMode?: 'cloud' | 'local';
}

function authSecret() {
  const secret = process.env.AUTH_SECRET || process.env.GOOGLE_CLIENT_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV !== 'production') return 'nhatkyquy-local-development-secret';
  throw new Error('AUTH_SECRET is required in production.');
}

function sign(value: string) {
  return createHmac('sha256', authSecret()).update(value).digest('base64url');
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, storedPassword?: string) {
  if (!storedPassword) return false;
  if (!storedPassword.startsWith('scrypt$')) {
    return password === storedPassword;
  }

  const [, salt, storedHash] = storedPassword.split('$');
  if (!salt || !storedHash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(storedHash, 'hex');
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

export function createSessionToken(profile: string | SessionProfile) {
  const session = typeof profile === 'string' ? { email: profile } : profile;
  const payload = Buffer.from(JSON.stringify({
    ...session,
    email: session.email.trim().toLowerCase(),
    exp: Math.floor(Date.now() / 1000) + SESSION_AGE_SECONDS,
  })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function readSession(req: NextRequest): (SessionProfile & { exp: number }) | null {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;

  const actual = Buffer.from(signature);
  const expected = Buffer.from(sign(payload));
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as SessionProfile & { exp?: number };
    if (!parsed.email || !parsed.exp || parsed.exp <= Math.floor(Date.now() / 1000)) return null;
    return { ...parsed, email: parsed.email.trim().toLowerCase(), exp: parsed.exp };
  } catch {
    return null;
  }
}

export function readSessionEmail(req: NextRequest) {
  return readSession(req)?.email || null;
}

export function setSessionCookie(response: NextResponse, profile: string | SessionProfile) {
  response.cookies.set(SESSION_COOKIE, createSessionToken(profile), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_AGE_SECONDS,
  });
  return response;
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
  return response;
}
