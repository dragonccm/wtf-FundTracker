import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { UserModel } from '@/lib/db/models/User';
import { hashPassword, setSessionCookie } from '@/lib/auth/serverAuth';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedName = String(name || '').trim();

    if (!normalizedName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json({ success: false, error: 'Tên hoặc email chưa hợp lệ.' }, { status: 400 });
    }
    if (String(password || '').length < 8) {
      return NextResponse.json({ success: false, error: 'Mật khẩu cần ít nhất 8 ký tự.' }, { status: 400 });
    }

    const connection = await connectToDatabase();
    if (!connection) {
      return NextResponse.json({ success: false, error: 'Không thể kết nối cơ sở dữ liệu.' }, { status: 503 });
    }

    if (await UserModel.exists({ email: normalizedEmail })) {
      return NextResponse.json({ success: false, error: 'Email đã được đăng ký.' }, { status: 409 });
    }

    const user = await UserModel.create({
      id: `usr_${Date.now()}_${randomId()}`,
      email: normalizedEmail,
      name: normalizedName,
      password: hashPassword(String(password)),
      provider: 'local',
    });

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
    }, { status: 201 });
    return setSessionCookie(response, user.email);
  } catch (error) {
    console.error('Register API Error:', error);
    return NextResponse.json({ success: false, error: 'Không thể tạo tài khoản lúc này.' }, { status: 500 });
  }
}

function randomId() {
  return Math.random().toString(36).slice(2, 8);
}
