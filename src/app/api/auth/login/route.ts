import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { UserModel } from '@/lib/db/models/User';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng nhập địa chỉ email.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    await connectToDatabase();

    const user = await UserModel.findOne({ email: normalizedEmail });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Tài khoản không tồn tại trên hệ thống.' },
        { status: 404 }
      );
    }

    if (password && user.password && user.password !== password) {
      return NextResponse.json(
        { success: false, error: 'Mật khẩu không chính xác.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        provider: user.provider,
        currency: user.currency,
        dateFormat: user.dateFormat,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Login API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi xử lý đăng nhập.' },
      { status: 500 }
    );
  }
}
