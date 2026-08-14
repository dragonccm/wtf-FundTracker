import { readFile } from 'node:fs/promises';
import { createHash, randomBytes, scryptSync } from 'node:crypto';
import mongoose from 'mongoose';

async function loadLocalEnv() {
  let content = '';
  try {
    content = await readFile('.env.local', 'utf8');
  } catch {
    return {};
  }
  const values = {};
  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (match) values[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  }
  return values;
}

function id(prefix) {
  return `${prefix}_${createHash('sha1').update(`${prefix}:nhat-ky-quy-seed`).digest('hex').slice(0, 12)}`;
}

function passwordHash(password) {
  const salt = randomBytes(16).toString('hex');
  return `scrypt$${salt}$${scryptSync(password, salt, 64).toString('hex')}`;
}

function navHistory(start, points, step, drift) {
  return Array.from({ length: points }, (_, index) => {
    const wave = Math.sin(index * 1.71) * drift * 0.38;
    return {
      date: new Date(Date.UTC(2025, 7 + index, 15)).toISOString().slice(0, 10),
      nav: Math.round((start + step * index + wave) * 100) / 100,
    };
  });
}

const localEnv = await loadLocalEnv();
const uri = process.env.SEED_MONGODB_URI || localEnv.MONGODB_URI || process.env.MONGODB_URI;
if (!uri) throw new Error('MONGODB_URI chưa được cấu hình.');

const email = (process.env.SEED_EMAIL || 'demo@nhatkyquy.local').trim().toLowerCase();
const password = process.env.SEED_PASSWORD || 'NhatKyQuy2026!';
const now = new Date();

const funds = [
  {
    id: id('fund_vcbf_tbf'), code: 'VCBF-TBF', name: 'Quỹ Đầu Tư Cân Bằng Chiến Lược', company: 'VCBF', category: 'Balanced',
    nav: 31840, previousNav: 31690, navDate: '2026-08-14', inceptionDate: '2014-12-22', expenseRatioPercent: 1.8,
    description: 'Danh mục cân bằng giữa cổ phiếu và trái phiếu, phù hợp mục tiêu trung hạn.', navHistory: navHistory(28740, 12, 265, 310),
  },
  {
    id: id('fund_ssi_sca'), code: 'SSISCA', name: 'Quỹ SSI Cạnh Tranh', company: 'SSIAM', category: 'Equity',
    nav: 24180, previousNav: 23910, navDate: '2026-08-14', inceptionDate: '2014-09-26', expenseRatioPercent: 1.75,
    description: 'Quỹ cổ phiếu tập trung vào doanh nghiệp Việt Nam có lợi thế cạnh tranh dài hạn.', navHistory: navHistory(20500, 12, 305, 560),
  },
  {
    id: id('fund_tcbf'), code: 'TCBF', name: 'Quỹ Trái Phiếu Techcom', company: 'Techcom Capital', category: 'Bond',
    nav: 17620, previousNav: 17598, navDate: '2026-08-14', inceptionDate: '2017-03-20', expenseRatioPercent: 0.8,
    description: 'Quỹ trái phiếu với biến động thấp cho phần vốn ổn định.', navHistory: navHistory(16320, 12, 112, 80),
  },
  {
    id: id('fund_e1vfvn30'), code: 'E1VFVN30', name: 'Quỹ ETF VFMVN30', company: 'VFM', category: 'Index',
    nav: 28690, previousNav: 28320, navDate: '2026-08-14', inceptionDate: '2014-10-06', expenseRatioPercent: 0.65,
    description: 'Quỹ ETF mô phỏng chỉ số VN30 cho phần tăng trưởng dài hạn.', navHistory: navHistory(23800, 12, 350, 690),
  },
];

const portfolios = [
  { id: id('portfolio_core'), name: 'Tích luỹ dài hạn', description: 'Danh mục đầu tư định kỳ cho các mục tiêu 5–10 năm.', color: '#6750A4', isDefault: true },
  { id: id('portfolio_safety'), name: 'Quỹ an toàn', description: 'Phần vốn ổn định và dự phòng.', color: '#386A20', isDefault: false },
];

const transactions = [
  ['t01', 'portfolio_core', 'fund_vcbf_tbf', 'VCBF-TBF', 'BUY', '2025-09-16', 25000000, 28980, 862.66, 0, 'Mua định kỳ quý III'],
  ['t02', 'portfolio_core', 'fund_ssi_sca', 'SSISCA', 'BUY', '2025-10-15', 18000000, 21420, 840.34, 0, 'Tích luỹ cổ phiếu'],
  ['t03', 'portfolio_safety', 'fund_tcbf', 'TCBF', 'BUY', '2025-11-12', 20000000, 16680, 1199.04, 0, 'Phần vốn ổn định'],
  ['t04', 'portfolio_core', 'fund_e1vfvn30', 'E1VFVN30', 'BUY', '2025-12-16', 15000000, 25160, 596.18, 0, 'Mua theo kế hoạch'],
  ['t05', 'portfolio_core', 'fund_vcbf_tbf', 'VCBF-TBF', 'BUY', '2026-01-15', 12000000, 29840, 402.14, 0, 'DCA tháng 1'],
  ['t06', 'portfolio_core', 'fund_ssi_sca', 'SSISCA', 'BUY', '2026-02-17', 10000000, 22470, 445.04, 0, 'DCA tháng 2'],
  ['t07', 'portfolio_safety', 'fund_tcbf', 'TCBF', 'BUY', '2026-03-16', 10000000, 17040, 586.85, 0, 'Bổ sung quỹ an toàn'],
  ['t08', 'portfolio_core', 'fund_e1vfvn30', 'E1VFVN30', 'BUY', '2026-04-15', 12000000, 26620, 450.79, 0, 'DCA tháng 4'],
  ['t09', 'portfolio_core', 'fund_vcbf_tbf', 'VCBF-TBF', 'BUY', '2026-05-15', 10000000, 30620, 326.58, 0, 'DCA tháng 5'],
  ['t10', 'portfolio_core', 'fund_ssi_sca', 'SSISCA', 'BUY', '2026-06-15', 8000000, 23180, 345.13, 0, 'DCA tháng 6'],
  ['t11', 'portfolio_safety', 'fund_tcbf', 'TCBF', 'DIVIDEND', '2026-07-02', 320000, 0, 0, 0, 'Thu nhập trái phiếu'],
  ['t12', 'portfolio_core', 'fund_e1vfvn30', 'E1VFVN30', 'BUY', '2026-07-15', 9000000, 27640, 325.62, 0, 'DCA tháng 7'],
].map(([key, portfolioKey, fundKey, fundCode, type, date, amount, unitPrice, units, fee, notes]) => ({
  id: id(`tx_${key}`), portfolioId: portfolios.find((portfolio) => portfolio.id === id(portfolioKey))?.id || id(portfolioKey),
  fundId: funds.find((fund) => fund.id === id(fundKey))?.id || id(fundKey), fundCode, type, date, amount, unitPrice, units, fee, notes,
}));

const goals = [
  { id: id('goal_home'), name: 'Quỹ cho tổ ấm', category: 'HOUSE', targetAmount: 500000000, currentAmount: 178000000, targetDate: '2030-12-31', notes: 'Tích luỹ từ danh mục dài hạn.' },
  { id: id('goal_safety'), name: 'Dự phòng 6 tháng', category: 'EMERGENCY', targetAmount: 120000000, currentAmount: 78000000, targetDate: '2027-06-30', notes: 'Ưu tiên thanh khoản và ổn định.' },
];

await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
const database = mongoose.connection.db;

await database.collection('users').updateOne(
  { email },
  { $setOnInsert: { id: id('user_demo'), email, name: 'Minh Anh', password: passwordHash(password), provider: 'local', currency: 'VND', dateFormat: 'DD/MM/YYYY', createdAt: now }, $set: { updatedAt: now } },
  { upsert: true },
);

for (const portfolio of portfolios) {
  await database.collection('portfolios').updateOne({ userEmail: email, id: portfolio.id }, { $set: { ...portfolio, userEmail: email, updatedAt: now }, $setOnInsert: { createdAt: now } }, { upsert: true });
}
for (const fund of funds) {
  await database.collection('funds').updateOne({ userEmail: email, id: fund.id }, { $set: { ...fund, userEmail: email, updatedAt: now }, $setOnInsert: { createdAt: now } }, { upsert: true });
}
for (const transaction of transactions) {
  await database.collection('transactions').updateOne({ userEmail: email, id: transaction.id }, { $set: { ...transaction, userEmail: email, updatedAt: now }, $setOnInsert: { createdAt: now } }, { upsert: true });
}
for (const goal of goals) {
  await database.collection('goals').updateOne({ userEmail: email, id: goal.id }, { $set: { ...goal, userEmail: email, title: goal.name, updatedAt: now }, $setOnInsert: { createdAt: now } }, { upsert: true });
}

await mongoose.disconnect();
console.log(`Đã seed MongoDB cho ${email}: ${funds.length} quỹ, ${portfolios.length} danh mục, ${transactions.length} giao dịch, ${goals.length} mục tiêu.`);
if (email === 'demo@nhatkyquy.local') console.log('Tài khoản local: demo@nhatkyquy.local / NhatKyQuy2026!');
