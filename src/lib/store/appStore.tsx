'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
import { useToast } from '@/components/feedback/ToastProvider';

export function getOptimalNavSyncIntervalMs(): number {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 6 = Saturday
  const hour = now.getHours();
  const isWeekend = day === 0 || day === 6;

  if (isWeekend) {
    return 6 * 60 * 60 * 1000; // 6 hours on weekends (NAV doesn't change)
  }
  if (hour >= 17 && hour <= 22) {
    return 30 * 60 * 1000; // 30 minutes during evening peak publication window (17:00 - 22:00)
  }
  if (hour >= 8 && hour < 17) {
    return 2 * 60 * 60 * 1000; // 2 hours during day (08:00 - 17:00)
  }
  return 6 * 60 * 60 * 1000; // 6 hours at night (22:00 - 08:00)
}

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
  lastNavSyncAt: number | null;
  isSyncingNav: boolean;
  syncNavAutomatically: (force?: boolean) => Promise<{ updatedCount: number }>;
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
  LAST_NAV_SYNC: 'nhatkyquy_last_nav_sync',
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
  const { showToast } = useToast();
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
  const [lastNavSyncAt, setLastNavSyncAt] = useState<number | null>(null);
  const [isSyncingNav, setIsSyncingNav] = useState(false);

  const hasReportedSyncError = useRef(false);
  const fundsRef = useRef<Fund[]>(funds);
  const lastNavSyncAtRef = useRef<number | null>(lastNavSyncAt);
  const isSyncingNavRef = useRef<boolean>(false);

  useEffect(() => {
    fundsRef.current = funds;
  }, [funds]);

  useEffect(() => {
    lastNavSyncAtRef.current = lastNavSyncAt;
  }, [lastNavSyncAt]);

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

      const savedLastNavSync = localStorage.getItem(STORAGE_KEYS.LAST_NAV_SYNC);
      if (savedLastNavSync) {
        const parsed = Number(savedLastNavSync);
        if (Number.isFinite(parsed)) setLastNavSyncAt(parsed);
      }
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
    let cancelled = false;

    const loadRemoteData = async () => {
      try {
        const response = await fetch('/api/user/sync', { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!data?.success || !data?.data) throw new Error('Initial sync rejected');
        if (cancelled) return;

        if (data.data.user) setUser((previous) => ({ ...previous, ...data.data.user }));
        setTransactions(data.data.transactions || []);
        setPortfolios(data.data.portfolios?.length ? data.data.portfolios : [defaultPortfolioFor(user.email)]);
        setGoals(data.data.goals || []);
        setFunds(data.data.funds || []);
        setHasLoadedRemote(true);
        hasReportedSyncError.current = false;
      } catch (err) {
        console.debug('MongoDB initial sync:', err instanceof Error ? err.message : err);
        if (!cancelled) {
          setHasLoadedRemote(false);
          if (!hasReportedSyncError.current) {
            hasReportedSyncError.current = true;
            showToast('error', 'Chưa thể tải dữ liệu từ đám mây. Dữ liệu trên máy chủ sẽ không bị thay đổi.');
          }
        }
      }
    };

    loadRemoteData();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user?.email, isCloudAvailable, showToast]);

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
      })
        .then(async (response) => {
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const data = await response.json();
          if (!data?.success) throw new Error('Sync rejected');
          hasReportedSyncError.current = false;
        })
        .catch((err) => {
          console.debug('MongoDB background sync:', err.message);
          if (!hasReportedSyncError.current) {
            hasReportedSyncError.current = true;
            showToast('error', 'Chưa thể đồng bộ dữ liệu. Vui lòng kiểm tra kết nối và thử lại.');
          }
        });
    }, 2000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, user, portfolios, transactions, goals, funds, hasLoadedRemote, isCloudAvailable, showToast]);

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

  // Proactive Auto-Sync NAV from Fmarket
  const syncNavAutomatically = useCallback(async (force = false) => {
    if (isSyncingNavRef.current) return { updatedCount: 0 };

    const now = Date.now();
    const optimalInterval = getOptimalNavSyncIntervalMs();
    const lastSync = lastNavSyncAtRef.current;

    // Skip if throttled within optimal window unless forced
    if (!force && lastSync && now - lastSync < optimalInterval) {
      return { updatedCount: 0 };
    }

    isSyncingNavRef.current = true;
    setIsSyncingNav(true);

    try {
      const currentFunds = fundsRef.current;
      const codes = currentFunds.map((f) => f.code);

      const response = await fetch('/api/funds/auto-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codes }),
      });

      if (!response.ok) throw new Error(`Auto-sync HTTP ${response.status}`);
      const result = await response.json();
      if (!result?.success || !result?.data) throw new Error('Auto-sync data invalid');

      const fmarketMap = result.data;
      let count = 0;

      setFunds((prevFunds) => {
        let hasAnyChange = false;
        const nextFunds = prevFunds.map((fund) => {
          const remote = fmarketMap[fund.code.toUpperCase()];
          if (!remote || !remote.nav || remote.nav <= 0) return fund;

          const isNavDifferent = Math.abs(fund.nav - remote.nav) > 0.001;
          const isDateDifferent = remote.navDate && fund.navDate !== remote.navDate;

          if (isNavDifferent || isDateDifferent) {
            hasAnyChange = true;
            count++;
            const history = Array.isArray(fund.navHistory) ? [...fund.navHistory] : [];
            if (!history.some((h) => h.date === remote.navDate)) {
              history.push({ date: remote.navDate, nav: remote.nav });
            }
            return {
              ...fund,
              previousNav: fund.nav,
              nav: remote.nav,
              navDate: remote.navDate || fund.navDate,
              company: remote.company || fund.company,
              navHistory: history,
            };
          }
          return fund;
        });

        return hasAnyChange ? nextFunds : prevFunds;
      });

      setLastNavSyncAt(now);
      localStorage.setItem(STORAGE_KEYS.LAST_NAV_SYNC, String(now));

      if (count > 0) {
        showToast('info', `Đã tự động cập nhật NAV mới nhất cho ${count} quỹ.`);
      }

      return { updatedCount: count };
    } catch (error) {
      console.debug('Silent NAV auto-sync error:', error instanceof Error ? error.message : error);
      return { updatedCount: 0 };
    } finally {
      isSyncingNavRef.current = false;
      setIsSyncingNav(false);
    }
  }, [showToast]);

  // Periodic Adaptive Background Trigger for Auto-Sync NAV
  useEffect(() => {
    if (!hasHydrated) return;

    // Check immediately on mount/hydration
    syncNavAutomatically(false);

    // Run adaptive heartbeat check every 2 minutes
    const intervalTimer = setInterval(() => {
      syncNavAutomatically(false);
    }, 2 * 60 * 1000);

    // Also check when tab becomes active / visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncNavAutomatically(false);
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      clearInterval(intervalTimer);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [hasHydrated, syncNavAutomatically]);

  const login = useCallback((email: string, name?: string, avatarUrl?: string) => {
    setUser((previous) => ({
      ...previous,
      email: email.trim().toLowerCase(),
      name: name || previous.name || email.split('@')[0],
      avatarUrl: avatarUrl || previous.avatarUrl,
    }));
    setIsAuthenticated(true);
    showToast('success', 'Đăng nhập thành công.');
  }, [showToast]);

  const logout = useCallback(() => {
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined);
    setIsAuthenticated(false);
    setHasLoadedRemote(false);
    localStorage.removeItem(STORAGE_KEYS.AUTH);
    showToast('info', 'Bạn đã đăng xuất.');
  }, [showToast]);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updates }));
    showToast('success', 'Đã lưu thay đổi tài khoản.');
  }, [showToast]);

  const addTransaction = (txData: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...txData,
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    };
    setTransactions((prev) => [newTx, ...prev]);
    showToast('success', `Đã thêm giao dịch ${txData.type === 'BUY' ? 'mua' : 'bán'} ${txData.fundCode}.`);
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    showToast('success', 'Đã cập nhật giao dịch.');
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    showToast('info', 'Đã xóa giao dịch.');
  };

  const addBulkTransactions = (txsData: Omit<Transaction, 'id'>[]) => {
    const newTxs: Transaction[] = txsData.map((txData, index) => ({
      ...txData,
      id: 'tx_bulk_' + Date.now() + '_' + index,
    }));
    setTransactions((prev) => [...newTxs, ...prev]);
    showToast('success', `Đã nhập ${newTxs.length} giao dịch hợp lệ.`);
  };

  const addPortfolio = (portfolioData: Omit<Portfolio, 'id' | 'createdAt'>) => {
    const newPort: Portfolio = {
      ...portfolioData,
      id: 'p_' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setPortfolios((prev) => [...prev, newPort]);
    showToast('success', `Đã tạo danh mục “${newPort.name}”.`);
  };

  const updatePortfolio = (id: string, updates: Partial<Portfolio>) => {
    setPortfolios((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    showToast('success', 'Đã cập nhật danh mục.');
  };

  const deletePortfolio = (id: string) => {
    setPortfolios((prev) => prev.filter((p) => p.id !== id));
    setTransactions((prev) => prev.filter((t) => t.portfolioId !== id));
    if (activePortfolioId === id) setActivePortfolioId('ALL');
    showToast('info', 'Đã xóa danh mục và các giao dịch liên quan.');
  };

  const addGoal = (goalData: Omit<FinancialGoal, 'id' | 'createdAt'>) => {
    const newGoal: FinancialGoal = {
      ...goalData,
      id: 'g_' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setGoals((prev) => [...prev, newGoal]);
    showToast('success', `Đã thêm mục tiêu “${newGoal.name}”.`);
  };

  const updateGoal = (id: string, updates: Partial<FinancialGoal>) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
    showToast('success', 'Đã cập nhật mục tiêu.');
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    showToast('info', 'Đã xóa mục tiêu.');
  };

  const addFund = (fundData: Omit<Fund, 'id' | 'navHistory'>) => {
    const newFund: Fund = {
      ...fundData,
      id: 'f_' + fundData.code.toLowerCase(),
      navHistory: [{ date: fundData.navDate, nav: fundData.nav }],
    };
    setFunds((prev) => [...prev, newFund]);
    showToast('success', `Đã thêm quỹ ${newFund.code}.`);
  };

  const updateFundNav = (fundId: string, newNav: number, date?: string) => {
    const updateDate = date || new Date().toISOString().split('T')[0];
    setFunds((prev) =>
      prev.map((f) => {
        if (f.id === fundId || f.code === fundId) {
          const updatedHistory = [...(f.navHistory || []), { date: updateDate, nav: newNav }];
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
    showToast('success', 'Đã cập nhật NAV quỹ.');
  };

  const clearFinancialData = () => {
    setFunds(initialFunds);
    setPortfolios([defaultPortfolioFor(user.email)]);
    setActivePortfolioId('ALL');
    setTransactions(initialTransactions);
    setGoals(initialGoals);
    setLastNavSyncAt(null);
    [
      STORAGE_KEYS.FUNDS,
      STORAGE_KEYS.PORTFOLIOS,
      STORAGE_KEYS.ACTIVE_PORTFOLIO,
      STORAGE_KEYS.TRANSACTIONS,
      STORAGE_KEYS.GOALS,
      STORAGE_KEYS.LAST_NAV_SYNC,
    ].forEach((key) => localStorage.removeItem(key));
    showToast('info', 'Đã xóa toàn bộ dữ liệu tài chính.');
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
        lastNavSyncAt,
        isSyncingNav,
        syncNavAutomatically,
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
