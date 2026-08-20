import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { UserModel } from '@/lib/db/models/User';
import { setSessionCookie } from '@/lib/auth/serverAuth';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/login?error=${encodeURIComponent(error || 'GoogleAuthFailed')}`);
  }

  try {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) throw new Error('GoogleNotConfigured');

    const redirectUri = `${appUrl}/api/auth/callback/google`;
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    if (!tokenResponse.ok) throw new Error('TokenExchangeFailed');
    const tokenData = await tokenResponse.json();

    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    if (!userResponse.ok) throw new Error('GoogleProfileFailed');
    const googleUser = await userResponse.json();
    const email = String(googleUser.email || '').trim().toLowerCase();
    if (!email) throw new Error('GoogleEmailMissing');
    const name = String(googleUser.name || email.split('@')[0]);
    const avatarUrl = String(googleUser.picture || '');

    const connection = await connectToDatabase();
    if (connection) {
      const existingUser = await UserModel.findOne({ email }).select('avatarUrl').lean();
      const profileUpdate: Record<string, string> = { name, provider: 'google' };
      if (!existingUser?.avatarUrl) profileUpdate.avatarUrl = avatarUrl;
      await UserModel.findOneAndUpdate(
        { email },
        {
          $set: profileUpdate,
          $setOnInsert: { id: `usr_g_${Date.now()}_${Math.random().toString(36).slice(2, 8)}` },
        },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      );
    } else {
      console.warn('Google login is continuing with local persistence because MongoDB is unavailable.');
    }

    return setSessionCookie(NextResponse.redirect(`${appUrl}/login/success`), {
      email,
      name,
      avatarUrl,
      storageMode: connection ? 'cloud' : 'local',
    });
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : 'GoogleAuthFailed';
    console.error('OAuth Callback Exception:', caught);
    return NextResponse.redirect(`${appUrl}/login?error=${encodeURIComponent(message)}`);
  }
}
