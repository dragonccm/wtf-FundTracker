import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/login?error=${encodeURIComponent(error || 'No code provided')}`);
  }

  try {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${appUrl}/api/auth/callback/google`;

    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId || '',
        client_secret: clientSecret || '',
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      console.error('Google Token Error:', tokenData);
      return NextResponse.redirect(`${appUrl}/login?error=TokenExchangeFailed`);
    }

    // Fetch user profile from Google UserInfo API
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const googleUser = await userResponse.json();

    // Redirect to login callback landing page with user info
    const redirectUrl = new URL(`${appUrl}/login/success`, req.url);
    redirectUrl.searchParams.set('email', googleUser.email || '');
    redirectUrl.searchParams.set('name', googleUser.name || '');
    redirectUrl.searchParams.set('avatar', googleUser.picture || '');

    const response = NextResponse.redirect(redirectUrl.toString());

    // Save auth session cookie
    response.cookies.set('nhatkyquy_session', JSON.stringify({
      email: googleUser.email,
      name: googleUser.name,
      avatar: googleUser.picture,
    }), {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err: any) {
    console.error('OAuth Callback Exception:', err);
    return NextResponse.redirect(`${appUrl}/login?error=${encodeURIComponent(err.message)}`);
  }
}
