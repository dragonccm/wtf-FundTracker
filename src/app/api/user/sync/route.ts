import { NextRequest, NextResponse } from 'next/server';
import { ClientSession } from 'mongoose';
import { readSessionEmail } from '@/lib/auth/serverAuth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { FundModel } from '@/lib/db/models/Fund';
import { GoalModel } from '@/lib/db/models/Goal';
import { PortfolioModel } from '@/lib/db/models/Portfolio';
import { TransactionModel } from '@/lib/db/models/Transaction';
import { UserModel } from '@/lib/db/models/User';

function unauthorized() {
  return NextResponse.json({ success: false, error: 'Phiên đăng nhập không hợp lệ.' }, { status: 401 });
}

function getAvatarUrl(value: unknown) {
  const avatarUrl = String(value || '');
  if (!avatarUrl) return '';
  const isBase64Image = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=\s]+$/i.test(avatarUrl);
  const isHttpUrl = /^https?:\/\//i.test(avatarUrl);
  if (avatarUrl.length > 750_000 || (!isBase64Image && !isHttpUrl)) {
    throw new Error('Avatar image is invalid.');
  }
  return avatarUrl;
}

export async function GET(req: NextRequest) {
  try {
    const email = readSessionEmail(req);
    if (!email) return unauthorized();
    const connection = await connectToDatabase();
    if (!connection) return NextResponse.json({ success: false, error: 'Cơ sở dữ liệu chưa sẵn sàng.' }, { status: 503 });

    const [user, transactions, portfolios, goals, funds] = await Promise.all([
      UserModel.findOne({ email }).select('-password').lean(),
      TransactionModel.find({ userEmail: email }).sort({ date: -1 }).lean(),
      PortfolioModel.find({ userEmail: email }).lean(),
      GoalModel.find({ userEmail: email }).lean(),
      FundModel.find({ userEmail: email }).sort({ code: 1 }).lean(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        user: user ? {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatarUrl,
          currency: user.currency,
          dateFormat: user.dateFormat,
          syncVersion: user.syncVersion || 0,
          createdAt: user.createdAt?.toISOString(),
        } : null,
        transactions: transactions.map(({ _id, userEmail, __v, ...transaction }) => transaction),
        portfolios: portfolios.map(({ _id, userEmail, __v, ...portfolio }) => ({
          ...portfolio,
          createdAt: portfolio.createdAt?.toISOString(),
        })),
        goals: goals.map((goal) => ({
          id: goal.id,
          name: goal.name || goal.title || '',
          targetAmount: goal.targetAmount,
          currentAmount: goal.currentAmount,
          targetDate: goal.targetDate,
          category: goal.category,
          notes: goal.notes,
          createdAt: goal.createdAt?.toISOString(),
        })),
        funds: funds.map(({ _id, userEmail, __v, ...fund }) => fund),
      },
    });
  } catch (error) {
    console.error('Data sync GET Error:', error);
    return NextResponse.json({ success: false, error: 'Không thể tải dữ liệu.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const email = readSessionEmail(req);
    if (!email) return unauthorized();
    const connection = await connectToDatabase();
    if (!connection) return NextResponse.json({ success: false, error: 'Cơ sở dữ liệu chưa sẵn sàng.' }, { status: 503 });

    const { transactions = [], portfolios = [], goals = [], funds = [], profile, syncVersion } = await req.json();
    if (![transactions, portfolios, goals, funds].every(Array.isArray)) {
      return NextResponse.json({ success: false, error: 'Dữ liệu đồng bộ không hợp lệ.' }, { status: 400 });
    }

    const expectedSyncVersion = Number(syncVersion);
    if (!Number.isSafeInteger(expectedSyncVersion) || expectedSyncVersion < 0) {
      return NextResponse.json({ success: false, error: 'Invalid sync version.' }, { status: 400 });
    }

    const session = await connection.startSession();
    let nextSyncVersion = expectedSyncVersion;
    try {
      await session.withTransaction(async () => {
        const profileUpdate = profile ? {
          name: String(profile.name || '').trim(),
          avatarUrl: getAvatarUrl(profile.avatarUrl),
          currency: profile.currency === 'USD' ? 'USD' : 'VND',
          dateFormat: profile.dateFormat === 'YYYY-MM-DD' ? 'YYYY-MM-DD' : 'DD/MM/YYYY',
        } : {};
        const user = await UserModel.findOneAndUpdate(
          { email, syncVersion: expectedSyncVersion },
          { $set: profileUpdate, $inc: { syncVersion: 1 } },
          { new: true, session }
        );
        if (!user) {
          const latest = await UserModel.findOne({ email }).select('syncVersion').session(session).lean();
          const conflict: Error & { code?: string; syncVersion?: number } = new Error('Sync conflict');
          conflict.code = 'SYNC_CONFLICT';
          conflict.syncVersion = latest?.syncVersion || 0;
          throw conflict;
        }
        nextSyncVersion = user.syncVersion;
        await syncPortfolios(email, portfolios, session);
        await syncTransactions(email, transactions, session);
        await syncGoals(email, goals, session);
        await syncFunds(email, funds, session);
      });
    } catch (error) {
      if ((error as { code?: string }).code === 'SYNC_CONFLICT') {
        return NextResponse.json({ success: false, error: 'Data changed elsewhere.', syncVersion: (error as { syncVersion?: number }).syncVersion }, { status: 409 });
      }
      throw error;
    } finally {
      await session.endSession();
    }

    return NextResponse.json({ success: true, syncVersion: nextSyncVersion });
  } catch (error) {
    console.error('Data sync POST Error:', error);
    return NextResponse.json({ success: false, error: 'Không thể lưu dữ liệu.' }, { status: 500 });
  }
}

async function syncPortfolios(email: string, items: any[], session: ClientSession) {
  const ids = items.map((item) => String(item.id));
  await PortfolioModel.deleteMany({ userEmail: email, id: { $nin: ids } }, { session });
  if (!items.length) return;
  await PortfolioModel.bulkWrite(items.map((item) => ({ updateOne: {
    filter: { userEmail: email, id: String(item.id) },
    update: { $set: {
      userEmail: email,
      id: String(item.id),
      name: String(item.name),
      description: String(item.description || ''),
      color: String(item.color || '#1f6b45'),
      isDefault: Boolean(item.isDefault),
    } },
    upsert: true,
  } })), { session });
}

async function syncTransactions(email: string, items: any[], session: ClientSession) {
  const ids = items.map((item) => String(item.id));
  await TransactionModel.deleteMany({ userEmail: email, id: { $nin: ids } }, { session });
  if (!items.length) return;
  await TransactionModel.bulkWrite(items.map((item) => ({ updateOne: {
    filter: { userEmail: email, id: String(item.id) },
    update: { $set: {
      userEmail: email,
      id: String(item.id),
      portfolioId: String(item.portfolioId),
      fundId: String(item.fundId),
      fundCode: String(item.fundCode).toUpperCase(),
      type: item.type,
      date: String(item.date),
      amount: Number(item.amount),
      unitPrice: Number(item.unitPrice),
      units: Number(item.units),
      fee: Number(item.fee || 0),
      goalId: item.goalId ? String(item.goalId) : undefined,
      notes: String(item.notes || ''),
    } },
    upsert: true,
  } })), { session });
}

async function syncGoals(email: string, items: any[], session: ClientSession) {
  const ids = items.map((item) => String(item.id));
  await GoalModel.deleteMany({ userEmail: email, id: { $nin: ids } }, { session });
  if (!items.length) return;
  await GoalModel.bulkWrite(items.map((item) => ({ updateOne: {
    filter: { userEmail: email, id: String(item.id) },
    update: { $set: {
      userEmail: email,
      id: String(item.id),
      name: String(item.name),
      title: String(item.name),
      targetAmount: Number(item.targetAmount),
      currentAmount: Number(item.currentAmount || 0),
      targetDate: String(item.targetDate),
      category: item.category || 'OTHER',
      notes: String(item.notes || ''),
    } },
    upsert: true,
  } })), { session });
}

async function syncFunds(email: string, items: any[], session: ClientSession) {
  const ids = items.map((item) => String(item.id));
  await FundModel.deleteMany({ userEmail: email, id: { $nin: ids } }, { session });
  if (!items.length) return;
  await FundModel.bulkWrite(items.map((item) => ({ updateOne: {
    filter: { userEmail: email, id: String(item.id) },
    update: { $set: {
      userEmail: email,
      id: String(item.id),
      code: String(item.code).toUpperCase(),
      name: String(item.name),
      company: String(item.company),
      category: item.category,
      nav: Number(item.nav),
      previousNav: Number(item.previousNav),
      navDate: String(item.navDate),
      inceptionDate: String(item.inceptionDate),
      expenseRatioPercent: Number(item.expenseRatioPercent || 0),
      description: String(item.description || ''),
      navHistory: Array.isArray(item.navHistory) ? item.navHistory : [],
    } },
    upsert: true,
  } })), { session });
}
