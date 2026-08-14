'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  Fund,
  Portfolio,
  Transaction,
  FinancialGoal,
  Holding,
  PerformanceMetrics,
} from '@/types';
import {
  initialProfile,
  initialFunds,
  initialPortfolios,
  initialTransactions,
  initialGoals,
} from './initialData';
import { calculateHoldings, calculatePerformanceMetrics } from '../finance/portfolio';
import { authService } from '../auth/authService';

interface AppContextType {
  user: UserProfile;
  isAuthenticated: boolean;
  funds: Fund[];
  portfolios: Portfolio[];
  activePortfolioId: string; // 'ALL' or portfolioId
  setActivePortfolioId: (id: string) => void;
  transactions: Transaction[];
  goals: FinancialGoal[];
  holdings: Holding[];
  metrics: PerformanceMetrics;
  login: (email: string, name?: string, avatarUrl?: string) => void;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addBulkTransactions: (txs: Omit<Transaction, 'id'>[]) => void;
  addPortfolio: (portfolio: Omit<Portfolio, 'id' | 'createdAt'>) => void;
  updatePortfolio: (id: string, updates: Partial<Portfolio>) => void;
  deletePortfolio: (id: string) => void;
  addGoal: (goal: Omit<FinancialGoal, 'id' | 'createdAt'>) => void;
  updateGoal: (id: string, updates: Partial<FinancialGoal>) => void;
  deleteGoal: (id: string) => void;
  addFund: (fund: Omit<Fund, 'id' | 'navHistory'>) => void;
  updateFundNav: (fundId: string, newNav: number, date?: string) => void;
  resetToSampleData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  PROFILE: 'nhatkyquy_profile',
  AUTH: 'nhatkyquy_auth',
  FUNDS: 'nhatkyquy_funds',
  PORTFOLIOS: 'nhatkyquy_portfolios',
  ACTIVE_PORTFOLIO: 'nhatkyquy_active_portfolio',
  TRANSACTIONS: 'nhatkyquy_tx',
  GOALS: 'nhatkyquy_goals',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(initialProfile);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [funds, setFunds] = useState<Fund[]>(initialFunds);
  const [portfolios, setPortfolios] = useState<Portfolio[]>(initialPortfolios);
  const [activePortfolioId, setActivePortfolioId] = useState<string>('ALL');
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [goals, setGoals] = useState<FinancialGoal[]>(initialGoals);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem(STORAGE_KEYS.AUTH);
      if (savedAuth !== null) setIsAuthenticated(JSON.parse(savedAuth));

      const savedProfile = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (savedProfile) setUser(JSON.parse(savedProfile));

      const savedFunds = localStorage.getItem(STORAGE_KEYS.FUNDS);
      if (savedFunds) setFunds(JSON.parse(savedFunds));

      const savedPortfolios = localStorage.getItem(STORAGE_KEYS.PORTFOLIOS);
      if (savedPortfolios) setPortfolios(JSON.parse(savedPortfolios));

      const savedActivePort = localStorage.getItem(STORAGE_KEYS.ACTIVE_PORTFOLIO);
      if (savedActivePort) setActivePortfolioId(savedActivePort);

      const savedTx = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (savedTx) setTransactions(JSON.parse(savedTx));

      const savedGoals = localStorage.getItem(STORAGE_KEYS.GOALS);
      if (savedGoals) setGoals(JSON.parse(savedGoals));
    } catch (e) {
      console.error('Failed to load storage state:', e);
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(isAuthenticated));
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.FUNDS, JSON.stringify(funds));
      localStorage.setItem(STORAGE_KEYS.PORTFOLIOS, JSON.stringify(portfolios));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PORTFOLIO, activePortfolioId);
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    } catch (e) {
      console.error('Failed to sync to storage:', e);
    }
  }, [isAuthenticated, user, funds, portfolios, activePortfolioId, transactions, goals]);

  // Filter transactions based on active portfolio
  const filteredTransactions =
    activePortfolioId === 'ALL'
      ? transactions
      : transactions.filter((tx) => tx.portfolioId === activePortfolioId);

  // Calculate live holdings and performance metrics
  const holdings = calculateHoldings(filteredTransactions, funds);
  const metrics = calculatePerformanceMetrics(filteredTransactions, funds);

  const login = (email: string, name?: string, avatarUrl?: string) => {
    const users = authService.getRegisteredUsers();
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    
    if (existing) {
      setUser((prev) => ({
        ...prev,
        id: existing.id || prev.id,
        email: existing.email,
        name: existing.name,
        avatarUrl: existing.avatarUrl || prev.avatarUrl,
      }));
      authService.saveRecentAccount(existing);
    } else {
      const newUser = {
        id: 'usr_' + Date.now(),
        email,
        name: name || email.split('@')[0],
        avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || email)}&backgroundColor=6750A4`,
        provider: 'local' as const,
        createdAt: new Date().toISOString(),
      };
      setUser((prev) => ({
        ...prev,
        ...newUser,
      }));
      authService.saveRecentAccount(newUser);
    }
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  const addTransaction = (txData: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...txData,
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const addBulkTransactions = (txsData: Omit<Transaction, 'id'>[]) => {
    const newTxs: Transaction[] = txsData.map((txData, index) => ({
      ...txData,
      id: 'tx_bulk_' + Date.now() + '_' + index,
    }));
    setTransactions((prev) => [...newTxs, ...prev]);
  };

  const addPortfolio = (portfolioData: Omit<Portfolio, 'id' | 'createdAt'>) => {
    const newPort: Portfolio = {
      ...portfolioData,
      id: 'p_' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setPortfolios((prev) => [...prev, newPort]);
  };

  const updatePortfolio = (id: string, updates: Partial<Portfolio>) => {
    setPortfolios((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deletePortfolio = (id: string) => {
    setPortfolios((prev) => prev.filter((p) => p.id !== id));
    setTransactions((prev) => prev.filter((t) => t.portfolioId !== id));
    if (activePortfolioId === id) setActivePortfolioId('ALL');
  };

  const addGoal = (goalData: Omit<FinancialGoal, 'id' | 'createdAt'>) => {
    const newGoal: FinancialGoal = {
      ...goalData,
      id: 'g_' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setGoals((prev) => [...prev, newGoal]);
  };

  const updateGoal = (id: string, updates: Partial<FinancialGoal>) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const addFund = (fundData: Omit<Fund, 'id' | 'navHistory'>) => {
    const newFund: Fund = {
      ...fundData,
      id: 'f_' + fundData.code.toLowerCase(),
      navHistory: [{ date: fundData.navDate, nav: fundData.nav }],
    };
    setFunds((prev) => [...prev, newFund]);
  };

  const updateFundNav = (fundId: string, newNav: number, date?: string) => {
    const updateDate = date || new Date().toISOString().split('T')[0];
    setFunds((prev) =>
      prev.map((f) => {
        if (f.id === fundId || f.code === fundId) {
          const updatedHistory = [...f.navHistory, { date: updateDate, nav: newNav }];
          return {
            ...f,
            previousNav: f.nav,
            nav: newNav,
            navDate: updateDate,
            navHistory: updatedHistory,
          };
        }
        return f;
      })
    );
  };

  const resetToSampleData = () => {
    setUser(initialProfile);
    setIsAuthenticated(true);
    setFunds(initialFunds);
    setPortfolios(initialPortfolios);
    setActivePortfolioId('ALL');
    setTransactions(initialTransactions);
    setGoals(initialGoals);
    localStorage.clear();
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated,
        funds,
        portfolios,
        activePortfolioId,
        setActivePortfolioId,
        transactions: filteredTransactions,
        goals,
        holdings,
        metrics,
        login,
        logout,
        updateProfile,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addBulkTransactions,
        addPortfolio,
        updatePortfolio,
        deletePortfolio,
        addGoal,
        updateGoal,
        deleteGoal,
        addFund,
        updateFundNav,
        resetToSampleData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useAppStore() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
}
