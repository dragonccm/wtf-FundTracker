import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { UserModel } from '@/lib/db/models/User';
import { hashPassword, setSessionCookie, verifyPassword } from '@/lib/auth/serverAuth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Vui lòng nhập email và mật khẩu.' }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const connection = await connectToDatabase();
    if (!connection) {
      return NextResponse.json({ success: false, error: 'Không thể kết nối cơ sở dữ liệu.' }, { status: 503 });
    }

    const user = await UserModel.findOne({ email: normalizedEmail });
    if (!user || !verifyPassword(String(password), user.password)) {
      return NextResponse.json({ success: false, error: 'Email hoặc mật khẩu không đúng.' }, { status: 401 });
    }

    if (user.password && !user.password.startsWith('scrypt$')) {
      user.password = hashPassword(String(password));
      await user.save();
    }

    const response = NextResponse.json({
      success: true,
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
    return setSessionCookie(response, user.email);
  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json({ success: false, error: 'Không thể đăng nhập lúc này.' }, { status: 500 });
  }
}
