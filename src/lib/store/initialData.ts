import { Fund, Portfolio, Transaction, FinancialGoal, UserProfile } from '@/types';

export const initialProfile: UserProfile = {
  id: '',
  email: '',
  name: '',
  avatarUrl: '',
  currency: 'VND',
  dateFormat: 'DD/MM/YYYY',
  createdAt: '',
};

// The application starts without fabricated NAV or performance data.
// Users create funds with the NAV published by their fund manager.
export const initialFunds: Fund[] = [];

export const initialPortfolios: Portfolio[] = [
  {
    id: 'p_main',
    name: 'Danh mục chính',
    color: '#1f6b45',
    isDefault: true,
    createdAt: '2026-01-01',
  },
];

export const initialTransactions: Transaction[] = [];
export const initialGoals: FinancialGoal[] = [];
