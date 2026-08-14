import { Fund, Portfolio, Transaction, FinancialGoal, UserProfile } from '@/types';

export const initialProfile: UserProfile = {
  id: '',
  email: '',
  name: '',
  avatarUrl: '',
  currency: 'VND',
  dateFormat: 'DD/MM/YYYY',
  createdAt: new Date().toISOString(),
};

// Generate historical NAV dates for past 12 months for market fund tracking
function generateNavHistory(baseNav: number, volatility: number = 0.008): { date: string; nav: number }[] {
  const history: { date: string; nav: number }[] = [];
  let current = baseNav * 0.88;
  const today = new Date();

  for (let i = 365; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    const change = (Math.random() - 0.48) * volatility * current;
    current = Math.max(1000, current + change);

    if (i % 3 === 0 || i === 0) {
      history.push({
        date: dateStr,
        nav: Math.round(current * 100) / 100,
      });
    }
  }

  if (history.length > 0) {
    history[history.length - 1].nav = baseNav;
  }

  return history;
}

// Official Open-Ended Funds in Vietnam for Lookup & Trading
export const initialFunds: Fund[] = [
  {
    id: 'f_vesaf',
    code: 'VESAF',
    name: 'Quỹ Đầu Tư Cổ Phiếu Tiếp Cận Thị Trường Việt Nam (VinaCapital)',
    company: 'VinaCapital',
    category: 'Equity',
    nav: 28450.5,
    previousNav: 28120.0,
    navDate: '2026-08-12',
    inceptionDate: '2017-04-18',
    expenseRatioPercent: 1.95,
    description: 'Tập trung đầu tư vào các cổ phiếu có giá trị vốn hóa vừa và nhỏ có tiềm năng tăng trưởng bứt phá.',
    navHistory: generateNavHistory(28450.5, 0.011),
  },
  {
    id: 'f_dcbc',
    code: 'DCBC',
    name: 'Quỹ Đầu Tư Doanh Nghiệp Hàng Đầu Việt Nam (Dragon Capital)',
    company: 'Dragon Capital',
    category: 'Equity',
    nav: 34120.0,
    previousNav: 33950.0,
    navDate: '2026-08-12',
    inceptionDate: '2008-05-20',
    expenseRatioPercent: 1.8,
    description: 'Đầu tư vào danh mục các cổ phiếu niêm yết hàng đầu có nền tảng quản trị vững chắc.',
    navHistory: generateNavHistory(34120.0, 0.009),
  },
  {
    id: 'f_dsi',
    code: 'DSI',
    name: 'Quỹ Đầu Tư Cổ Phiếu Năng Động (Dragon Capital)',
    company: 'Dragon Capital',
    category: 'Equity',
    nav: 19850.0,
    previousNav: 19700.0,
    navDate: '2026-08-12',
    inceptionDate: '2021-11-10',
    expenseRatioPercent: 1.75,
    description: 'Tối ưu hóa lợi nhuận thông qua việc phân bổ linh hoạt giữa các nhóm ngành dẫn dắt.',
    navHistory: generateNavHistory(19850.0, 0.012),
  },
  {
    id: 'f_ssisca',
    code: 'SSISCA',
    name: 'Quỹ Đầu Tư Lợi Thế Cạnh Tranh Bền Vững (SSIAM)',
    company: 'SSI Asset Management',
    category: 'Equity',
    nav: 38920.0,
    previousNav: 38650.0,
    navDate: '2026-08-12',
    inceptionDate: '2014-09-25',
    expenseRatioPercent: 1.9,
    description: 'Đầu tư vào các doanh nghiệp sở hữu lợi thế cạnh tranh bền vững và cổ tức cao.',
    navHistory: generateNavHistory(38920.0, 0.008),
  },
  {
    id: 'f_tcbf',
    code: 'TCBF',
    name: 'Quỹ Đầu Tư Trái Phiếu Techcom (TCAM)',
    company: 'Techcom Capital',
    category: 'Bond',
    nav: 16480.0,
    previousNav: 16472.0,
    navDate: '2026-08-12',
    inceptionDate: '2015-09-08',
    expenseRatioPercent: 0.95,
    description: 'Đầu tư 100% vào trái phiếu doanh nghiệp chất lượng cao và chứng chỉ tiền gửi an toàn.',
    navHistory: generateNavHistory(16480.0, 0.0015),
  },
  {
    id: 'f_e1vfvn30',
    code: 'E1VFVN30',
    name: 'Quỹ ETF VFMVN30 (Dragon Capital)',
    company: 'Dragon Capital',
    category: 'Index',
    nav: 22650.0,
    previousNav: 22510.0,
    navDate: '2026-08-12',
    inceptionDate: '2014-10-06',
    expenseRatioPercent: 0.65,
    description: 'Mô phỏng chỉ số VN30 gồm 30 cổ phiếu có giá trị vốn hóa và thanh khoản lớn nhất Việt Nam.',
    navHistory: generateNavHistory(22650.0, 0.01),
  },
];

// Clean Real Initial Portfolios (1 default main portfolio)
export const initialPortfolios: Portfolio[] = [
  {
    id: 'p_main',
    name: 'Danh Mục Chính',
    description: 'Danh mục đầu tư chính',
    color: '#6750A4',
    isDefault: true,
    createdAt: new Date().toISOString().split('T')[0],
  },
];

// Clean Real Transactions (Empty by default for real user entries)
export const initialTransactions: Transaction[] = [];

// Clean Real Financial Goals (Empty by default for real user entries)
export const initialGoals: FinancialGoal[] = [];
