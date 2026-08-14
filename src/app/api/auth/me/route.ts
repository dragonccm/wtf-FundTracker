import { NextRequest, NextResponse } from 'next/server';
import { readSession } from '@/lib/auth/serverAuth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { UserModel } from '@/lib/db/models/User';

export async function GET(req: NextRequest) {
  const session = readSession(req);
  if (!session) return NextResponse.json({ success: false });

  if (session.storageMode === 'local') {
    return sessionResponse(session, 'local');
  }

  const connection = await connectToDatabase();
  if (!connection) return sessionResponse(session, 'local');

  const user = await UserModel.findOne({ email: session.email }).select('-password');
  if (!user) return sessionResponse(session, 'local');

  return NextResponse.json({
    success: true,
    storageMode: 'cloud',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      currency: user.currency,
      dateFormat: user.dateFormat,
      createdAt: user.createdAt.toISOString(),
    },
  });
}

function sessionResponse(session: { email: string; name?: string; avatarUrl?: string }, storageMode: 'cloud' | 'local') {
  return NextResponse.json({
    success: true,
    storageMode,
    user: {
      id: `session_${Buffer.from(session.email).toString('base64url').slice(0, 16)}`,
      email: session.email,
      name: session.name || session.email.split('@')[0],
      avatarUrl: session.avatarUrl || '',
      currency: 'VND',
      dateFormat: 'DD/MM/YYYY',
      createdAt: new Date().toISOString(),
    },
  });
}
