import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { TransactionModel } from '@/lib/db/models/Transaction';
import { PortfolioModel } from '@/lib/db/models/Portfolio';
import { GoalModel } from '@/lib/db/models/Goal';
import { UserModel } from '@/lib/db/models/User';

// GET: Load all user data from MongoDB
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ success: false, error: 'Thiếu email người dùng.' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    await connectToDatabase();

    const [user, transactions, portfolios, goals] = await Promise.all([
      UserModel.findOne({ email: normalizedEmail }),
      TransactionModel.find({ userEmail: normalizedEmail }).sort({ date: -1 }),
      PortfolioModel.find({ userEmail: normalizedEmail }),
      GoalModel.find({ userEmail: normalizedEmail }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        user: user || null,
        transactions: transactions.map((t) => ({
          id: t.id,
          portfolioId: t.portfolioId,
          fundId: t.fundId,
          fundCode: t.fundCode,
          type: t.type,
          date: t.date,
          amount: t.amount,
          unitPrice: t.unitPrice,
          units: t.units,
          fee: t.fee,
          notes: t.notes,
        })),
        portfolios: portfolios.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          color: p.color,
          isDefault: p.isDefault,
          createdAt: p.createdAt.toISOString(),
        })),
        goals: goals.map((g) => ({
          id: g.id,
          title: g.title,
          targetAmount: g.targetAmount,
          currentAmount: g.currentAmount,
          targetDate: g.targetDate,
          category: g.category,
          notes: g.notes,
          createdAt: g.createdAt.toISOString(),
        })),
      },
    });
  } catch (error: any) {
    console.error('Data sync GET Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Save/Sync all user data to MongoDB
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, transactions, portfolios, goals, profile } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: 'Thiếu email người dùng.' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    await connectToDatabase();

    // Update Profile if provided
    if (profile) {
      await UserModel.findOneAndUpdate(
        { email: normalizedEmail },
        {
          name: profile.name,
          avatarUrl: profile.avatarUrl,
          currency: profile.currency || 'VND',
          dateFormat: profile.dateFormat || 'DD/MM/YYYY',
        },
        { upsert: true, new: true }
      );
    }

    // Upsert Portfolios
    if (Array.isArray(portfolios) && portfolios.length > 0) {
      const portOps = portfolios.map((p) => ({
        updateOne: {
          filter: { id: p.id, userEmail: normalizedEmail },
          update: {
            $set: {
              id: p.id,
              userEmail: normalizedEmail,
              name: p.name,
              description: p.description || '',
              color: p.color || '#6750A4',
              isDefault: p.isDefault || false,
            },
          },
          upsert: true,
        },
      }));
      await PortfolioModel.bulkWrite(portOps);
    }

    // Upsert Transactions
    if (Array.isArray(transactions) && transactions.length > 0) {
      const txOps = transactions.map((t) => ({
        updateOne: {
          filter: { id: t.id, userEmail: normalizedEmail },
          update: {
            $set: {
              id: t.id,
              userEmail: normalizedEmail,
              portfolioId: t.portfolioId,
              fundId: t.fundId,
              fundCode: t.fundCode,
              type: t.type,
              date: t.date,
              amount: t.amount,
              unitPrice: t.unitPrice,
              units: t.units,
              fee: t.fee || 0,
              notes: t.notes || '',
            },
          },
          upsert: true,
        },
      }));
      await TransactionModel.bulkWrite(txOps);
    }

    // Upsert Goals
    if (Array.isArray(goals) && goals.length > 0) {
      const goalOps = goals.map((g) => ({
        updateOne: {
          filter: { id: g.id, userEmail: normalizedEmail },
          update: {
            $set: {
              id: g.id,
              userEmail: normalizedEmail,
              title: g.title,
              targetAmount: g.targetAmount,
              currentAmount: g.currentAmount || 0,
              targetDate: g.targetDate,
              category: g.category || 'OTHER',
              notes: g.notes || '',
            },
          },
          upsert: true,
        },
      }));
      await GoalModel.bulkWrite(goalOps);
    }

    return NextResponse.json({
      success: true,
      message: 'Đồng bộ dữ liệu lên MongoDB thành công!',
    });
  } catch (error: any) {
    console.error('Data sync POST Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
