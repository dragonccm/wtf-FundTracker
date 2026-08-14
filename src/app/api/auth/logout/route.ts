import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth/serverAuth';

export async function POST() {
  return clearSessionCookie(NextResponse.json({ success: true }));
}
