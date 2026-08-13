import { Fund, Portfolio, Transaction, FinancialGoal, UserProfile } from '@/types';

export const initialProfile: UserProfile = {
  id: 'user_default',
  email: 'investor@nhatkyquy.com',
  name: 'Đầu Tư Thông Thái',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  currency: 'VND',
  dateFormat: 'DD/MM/YYYY',
  createdAt: '2024-01-01',
};

// Generate historical NAV dates for past 30 days and past 12 months
function generateNavHistory(baseNav: number, volatility: number = 0.008): { date: string; nav: number }[] {
  const history: { date: string; nav: number }[] = [];
  let current = baseNav * 0.85; // Started 1 year ago at ~85% of present NAV
  const today = new Date();

  for (let i = 365; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    // Simulating market movement
    const change = (Math.random() - 0.47) * volatility * current;
    current = Math.max(1000, current + change);

    if (i % 3 === 0 || i === 0) {
      history.push({
        date: dateStr,
        nav: Math.round(current * 100) / 100,
      });
    }
  }

  // Ensure last point matches current baseNav
  if (history.length > 0) {
    history[history.length - 1].nav = baseNav;
  }

  return history;
}

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
    name: 'Quỹ Đầu Tư Lợi Thế Cạnh Tranh Săn Chắc (SSIAM)',
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

export const initialPortfolios: Portfolio[] = [
  {
    id: 'p_main',
    name: 'Danh Mục Đầu Tư Dài Hạn',
    description: 'Tích lũy tài sản chiến lược 5-10 năm',
    color: '#00639B',
    isDefault: true,
    createdAt: '2024-01-10',
  },
  {
    id: 'p_retirement',
    name: 'Quỹ Hưu Trí An Nhàn',
    description: 'Danh mục trái phiếu & cổ phiếu phòng thủ',
    color: '#2E6C40',
    isDefault: false,
    createdAt: '2024-03-15',
  },
];

export const initialTransactions: Transaction[] = [
  {
    id: 'tx_1',
    portfolioId: 'p_main',
    fundId: 'f_vesaf',
    fundCode: 'VESAF',
    type: 'BUY',
    date: '2024-02-15',
    amount: 50000000,
    unitPrice: 24200.0,
    units: 2066.11,
    fee: 150000,
    notes: 'Đầu tư định kỳ tháng 2',
  },
  {
    id: 'tx_2',
    portfolioId: 'p_main',
    fundId: 'f_dcbc',
    fundCode: 'DCBC',
    type: 'BUY',
    date: '2024-03-10',
    amount: 40000000,
    unitPrice: 30500.0,
    units: 1311.47,
    fee: 120000,
    notes: 'Mua thêm cổ phiếu nhóm VN30',
  },
  {
    id: 'tx_3',
    portfolioId: 'p_main',
    fundId: 'f_vesaf',
    fundCode: 'VESAF',
    type: 'BUY',
    date: '2024-06-20',
    amount: 30000000,
    unitPrice: 26100.0,
    units: 1149.42,
    fee: 90000,
    notes: 'Tích lũy đợt 2',
  },
  {
    id: 'tx_4',
    portfolioId: 'p_main',
    fundId: 'f_ssisca',
    fundCode: 'SSISCA',
    type: 'BUY',
    date: '2024-09-05',
    amount: 60000000,
    unitPrice: 35200.0,
    units: 1704.54,
    fee: 180000,
    notes: 'Mở vị thế SSISCA',
  },
  {
    id: 'tx_5',
    portfolioId: 'p_retirement',
    fundId: 'f_tcbf',
    fundCode: 'TCBF',
    type: 'BUY',
    date: '2024-01-20',
    amount: 100000000,
    unitPrice: 15800.0,
    units: 6329.11,
    fee: 100000,
    notes: 'Nạp quỹ trái phiếu hưu trí',
  },
  {
    id: 'tx_6',
    portfolioId: 'p_main',
    fundId: 'f_e1vfvn30',
    fundCode: 'E1VFVN30',
    type: 'BUY',
    date: '2024-11-12',
    amount: 35000000,
    unitPrice: 21100.0,
    units: 1658.76,
    fee: 70000,
    notes: 'Bắt đáy chỉ số VN30',
  },
  {
    id: 'tx_7',
    portfolioId: 'p_main',
    fundId: 'f_vesaf',
    fundCode: 'VESAF',
    type: 'BUY',
    date: '2025-03-01',
    amount: 25000000,
    unitPrice: 27300.0,
    units: 915.75,
    fee: 75000,
    notes: 'Đầu tư thêm đầu năm 2025',
  },
  {
    id: 'tx_8',
    portfolioId: 'p_main',
    fundId: 'f_dcbc',
    fundCode: 'DCBC',
    type: 'SELL',
    date: '2025-07-15',
    amount: 15000000,
    unitPrice: 33500.0,
    units: 447.76,
    fee: 45000,
    notes: 'Chốt lời một phần DCBC',
  },
];

export const initialGoals: FinancialGoal[] = [
  {
    id: 'g_house',
    name: 'Mua Nhà Mơ Ước (Căn Hộ 2PN)',
    category: 'HOUSE',
    targetAmount: 2500000000,
    targetDate: '2030-12-31',
    currentAmount: 215000000,
    portfolioId: 'p_main',
    notes: 'Mục tiêu tài chính quan trọng nhất cho gia đình.',
    createdAt: '2024-01-15',
  },
  {
    id: 'g_retirement',
    name: 'Quỹ Hưu Trí An Nhàn',
    category: 'RETIREMENT',
    targetAmount: 5000000000,
    targetDate: '2045-06-30',
    currentAmount: 110000000,
    portfolioId: 'p_retirement',
    notes: 'Đảm bảo thu nhập thụ động khi nghỉ hưu.',
    createdAt: '2024-03-20',
  },
  {
    id: 'g_education',
    name: 'Quỹ Du Học Cho Con',
    category: 'EDUCATION',
    targetAmount: 1000000000,
    targetDate: '2038-09-01',
    currentAmount: 85000000,
    portfolioId: 'p_main',
    notes: 'Chuẩn bị cho con đi học đại học nước ngoài.',
    createdAt: '2024-05-10',
  },
  {
    id: 'g_emergency',
    name: 'Quỹ Dự Phòng Khẩn Cấp (6 Tháng)',
    category: 'EMERGENCY',
    targetAmount: 120000000,
    targetDate: '2026-12-31',
    currentAmount: 95000000,
    portfolioId: 'p_retirement',
    notes: 'Bao gồm 6 tháng chi phí sinh hoạt gia đình.',
    createdAt: '2024-02-01',
  },
];
