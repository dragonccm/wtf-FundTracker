import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { UserModel } from '@/lib/db/models/User';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, avatarUrl, provider = 'local' } = body;

    if (!email || !name) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng cung cấp đầy đủ tên và email.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    await connectToDatabase();

    const existingUser = await UserModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email này đã được đăng ký trên hệ thống.' },
        { status: 400 }
      );
    }

    const id = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const user = await UserModel.create({
      id,
      email: normalizedEmail,
      name: name.trim(),
      password: password || '',
      avatarUrl:
        avatarUrl ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=6750A4`,
      provider,
    });

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
    console.error('Register API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi xử lý đăng ký tài khoản.' },
      { status: 500 }
    );
  }
}
