export type Currency = 'VND' | 'USD';
export type DateFormat = 'DD/MM/YYYY' | 'YYYY-MM-DD';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  currency: Currency;
  dateFormat: DateFormat;
  createdAt: string;
}

export type FundCategory = 'Equity' | 'Bond' | 'Balanced' | 'Index';

export interface NAVHistoryPoint {
  date: string; // YYYY-MM-DD
  nav: number;
}

export interface Fund {
  id: string;
  code: string; // e.g., VESAF, DCBC, DSI, TCBF, SSISCA, E1VFVN30
  name: string;
  company: string;
  category: FundCategory;
  nav: number; // Current NAV per unit
  previousNav: number;
  navDate: string;
  inceptionDate: string;
  expenseRatioPercent: number;
  description: string;
  navHistory: NAVHistoryPoint[];
}

export interface Portfolio {
  id: string;
  name: string;
  description?: string;
  color?: string;
  isDefault?: boolean;
  createdAt: string;
}

export type TransactionType = 'BUY' | 'SELL' | 'DIVIDEND' | 'DEPOSIT' | 'WITHDRAWAL';

export interface Transaction {
  id: string;
  portfolioId: string;
  fundId: string;
  fundCode: string;
  type: TransactionType;
  date: string; // YYYY-MM-DD
  amount: number; // Total cash invested or realized (in VND)
  unitPrice: number; // NAV price at transaction date
  units: number; // Number of fund certificates (CCQ)
  fee: number; // Transaction fee
  goalId?: string; // Optional linked Financial Goal
  notes?: string;
}

export interface Holding {
  fundId: string;
  fundCode: string;
  fundName: string;
  category: FundCategory;
  totalUnits: number;
  avgCostBasis: number; // Price per unit
  totalCost: number; // Total invested money active in current units
  currentNav: number;
  currentValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  weightPercent: number;
}

export type GoalCategory = 'HOUSE' | 'EDUCATION' | 'RETIREMENT' | 'CAR' | 'EMERGENCY' | 'OTHER';

export interface FinancialGoal {
  id: string;
  name: string;
  category: GoalCategory;
  targetAmount: number;
  targetDate: string; // YYYY-MM-DD
  currentAmount: number;
  portfolioId?: string;
  notes?: string;
  createdAt: string;
}

export interface PerformanceMetrics {
  totalInvested: number;
  currentMarketValue: number;
  totalPnL: number;
  totalPnLPercent: number;
  xirrPercent: number;
  realizedPnL: number;
  dailyChange: number;
  dailyChangePercent: number;
}

export interface ExcelImportRow {
  date: string;
  fundCode: string;
  type: string;
  amount: number;
  unitPrice: number;
  units: number;
  fee: number;
  notes?: string;
  isValid?: boolean;
  errorReason?: string;
}
