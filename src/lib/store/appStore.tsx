'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
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

interface AppContextType {
  user: UserProfile;
  isAuthenticated: boolean;
  isAuthResolved: boolean;
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
  clearFinancialData: () => void;
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

function defaultPortfolioFor(email: string): Portfolio {
  let hash = 0;
  for (const character of email.toLowerCase()) hash = ((hash << 5) - hash + character.charCodeAt(0)) | 0;
  return {
    ...initialPortfolios[0],
    id: `p_main_${Math.abs(hash).toString(36)}`,
    createdAt: new Date().toISOString().slice(0, 10),
  };
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(initialProfile);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthResolved, setIsAuthResolved] = useState(false);
  const [funds, setFunds] = useState<Fund[]>(initialFunds);
  const [portfolios, setPortfolios] = useState<Portfolio[]>(initialPortfolios);
  const [activePortfolioId, setActivePortfolioId] = useState<string>('ALL');
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [goals, setGoals] = useState<FinancialGoal[]>(initialGoals);
  const [hasLoadedRemote, setHasLoadedRemote] = useState(false);
  const [isCloudAvailable, setIsCloudAvailable] = useState(true);
  const [hasHydrated, setHasHydrated] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
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
    setHasHydrated(true);

    fetch('/api/auth/me', { cache: 'no-store' })
      .then((response) => response.json())
      .then((data) => {
        if (!data?.success || !data?.user) throw new Error('No active session');
        setUser((previous) => ({ ...previous, ...data.user }));
        setIsCloudAvailable(data.storageMode !== 'local');
        setIsAuthenticated(true);
      })
      .catch(() => setIsAuthenticated(false))
      .finally(() => setIsAuthResolved(true));
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (!hasHydrated) return;
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
  }, [hasHydrated, isAuthenticated, user, funds, portfolios, activePortfolioId, transactions, goals]);

  // Initial Load from MongoDB on Login
  useEffect(() => {
    if (!isAuthenticated || !user?.email) {
      setHasLoadedRemote(false);
      return;
    }

    if (!isCloudAvailable) {
      setHasLoadedRemote(true);
      return;
    }

    setHasLoadedRemote(false);

    fetch('/api/user/sync', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data?.data) {
          if (data.data.user) setUser((previous) => ({ ...previous, ...data.data.user }));
          setTransactions(data.data.transactions || []);
          setPortfolios(data.data.portfolios?.length ? data.data.portfolios : [defaultPortfolioFor(user.email)]);
          setGoals(data.data.goals || []);
          setFunds(data.data.funds || []);
        }
      })
      .catch((err) => {
        console.debug('MongoDB initial sync:', err.message);
      })
      .finally(() => setHasLoadedRemote(true));
  }, [isAuthenticated, user?.email, isCloudAvailable]);

  // Background Auto-Sync to MongoDB
  useEffect(() => {
    if (!isAuthenticated || !user?.email || !hasLoadedRemote || !isCloudAvailable) return;

    const timer = setTimeout(() => {
      fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          profile: user,
          portfolios,
          transactions,
          goals,
          funds,
        }),
      }).catch((err) => {
        console.debug('MongoDB background sync:', err.message);
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, user, portfolios, transactions, goals, funds, hasLoadedRemote, isCloudAvailable]);

  // Filter transactions based on active portfolio
  const filteredTransactions = useMemo(
    () => (
      activePortfolioId === 'ALL'
        ? transactions
        : transactions.filter((tx) => tx.portfolioId === activePortfolioId)
    ),
    [activePortfolioId, transactions],
  );

  // Calculate live holdings and performance metrics
  const holdings = useMemo(
    () => calculateHoldings(filteredTransactions, funds),
    [filteredTransactions, funds],
  );
  const metrics = useMemo(
    () => calculatePerformanceMetrics(filteredTransactions, funds),
    [filteredTransactions, funds],
  );

  const login = useCallback((email: string, name?: string, avatarUrl?: string) => {
    setUser((previous) => ({
      ...previous,
      email: email.trim().toLowerCase(),
      name: name || previous.name || email.split('@')[0],
      avatarUrl: avatarUrl || previous.avatarUrl,
    }));
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined);
    setIsAuthenticated(false);
    setHasLoadedRemote(false);
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  }, []);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updates }));
  }, []);

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

  const clearFinancialData = () => {
    setFunds(initialFunds);
    setPortfolios([defaultPortfolioFor(user.email)]);
    setActivePortfolioId('ALL');
    setTransactions(initialTransactions);
    setGoals(initialGoals);
    [
      STORAGE_KEYS.FUNDS,
      STORAGE_KEYS.PORTFOLIOS,
      STORAGE_KEYS.ACTIVE_PORTFOLIO,
      STORAGE_KEYS.TRANSACTIONS,
      STORAGE_KEYS.GOALS,
    ].forEach((key) => localStorage.removeItem(key));
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated,
        isAuthResolved,
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
        clearFinancialData,
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
