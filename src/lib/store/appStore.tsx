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
import { calculateHoldings, calculatePerformanceMetrics, calculateLiveGoals } from '../finance/portfolio';
import { useToast } from '@/components/feedback/ToastProvider';

export function getOptimalNavSyncIntervalMs(): number {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 6 = Saturday
  const hour = now.getHours();
  const isWeekend = day === 0 || day === 6;

  if (isWeekend) {
    return 6 * 60 * 60 * 1000; // 6 hours on weekends
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

function getStorageKey(key: string, email?: string): string {
  const normalized = (email || '').trim().toLowerCase();
  return normalized ? `nhatkyquy_u_${normalized}_${key}` : `nhatkyquy_guest_${key}`;
}

function defaultPortfolioFor(email: string): Portfolio {
  let hash = 0;
  for (const character of email.toLowerCase()) hash = ((hash << 5) - hash + character.charCodeAt(0)) | 0;
  return {
    id: `p_main_${Math.abs(hash).toString(36)}`,
    name: 'Danh mục chính',
    color: '#1f6b45',
    isDefault: true,
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
  const activeEmailRef = useRef<string>('');

  useEffect(() => {
    fundsRef.current = funds;
  }, [funds]);

  useEffect(() => {
    lastNavSyncAtRef.current = lastNavSyncAt;
  }, [lastNavSyncAt]);

  useEffect(() => {
    activeEmailRef.current = user.email.trim().toLowerCase();
  }, [user.email]);

  // Initial Auth Verification on Mount
  useEffect(() => {
    let cancelled = false;

    fetch('/api/auth/me', { cache: 'no-store' })
      .then((response) => response.json())
      .then((data) => {
        if (cancelled) return;
        if (!data?.success || !data?.user?.email) {
          setIsAuthenticated(false);
          setUser(initialProfile);
          setFunds([]);
          setTransactions([]);
          setGoals([]);
          setPortfolios(initialPortfolios);
          return;
        }

        const email = data.user.email.trim().toLowerCase();
        setUser((prev) => ({ ...prev, ...data.user, email }));
        setIsCloudAvailable(data.storageMode !== 'local');
        setIsAuthenticated(true);

        // Load local cache for this specific user if exists
        try {
          const cachedProfile = localStorage.getItem(getStorageKey('profile', email));
          if (cachedProfile) setUser((prev) => ({ ...prev, ...JSON.parse(cachedProfile) }));

          const cachedFunds = localStorage.getItem(getStorageKey('funds', email));
          if (cachedFunds) setFunds(JSON.parse(cachedFunds));

          const cachedPortfolios = localStorage.getItem(getStorageKey('portfolios', email));
          if (cachedPortfolios) setPortfolios(JSON.parse(cachedPortfolios));

          const cachedActivePort = localStorage.getItem(getStorageKey('active_port', email));
          if (cachedActivePort) setActivePortfolioId(cachedActivePort);

          const cachedTx = localStorage.getItem(getStorageKey('tx', email));
          if (cachedTx) setTransactions(JSON.parse(cachedTx));

          const cachedGoals = localStorage.getItem(getStorageKey('goals', email));
          if (cachedGoals) setGoals(JSON.parse(cachedGoals));

          const cachedSyncAt = localStorage.getItem(getStorageKey('last_nav_sync', email));
          if (cachedSyncAt) setLastNavSyncAt(Number(cachedSyncAt));
        } catch (e) {
          console.debug('Failed to read user-scoped localStorage:', e);
        }
      })
      .catch(() => {
        if (!cancelled) setIsAuthenticated(false);
      })
      .finally(() => {
        if (!cancelled) {
          setIsAuthResolved(true);
          setHasHydrated(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Sync to User-Scoped localStorage
  useEffect(() => {
    if (!hasHydrated || !isAuthenticated || !user.email) return;
    const email = user.email.trim().toLowerCase();

    try {
      localStorage.setItem(getStorageKey('profile', email), JSON.stringify(user));
      localStorage.setItem(getStorageKey('funds', email), JSON.stringify(funds));
      localStorage.setItem(getStorageKey('portfolios', email), JSON.stringify(portfolios));
      localStorage.setItem(getStorageKey('active_port', email), activePortfolioId);
      localStorage.setItem(getStorageKey('tx', email), JSON.stringify(transactions));
      localStorage.setItem(getStorageKey('goals', email), JSON.stringify(goals));
      if (lastNavSyncAt) {
        localStorage.setItem(getStorageKey('last_nav_sync', email), String(lastNavSyncAt));
      }
    } catch (e) {
      console.error('Failed to sync to user-scoped storage:', e);
    }
  }, [hasHydrated, isAuthenticated, user, funds, portfolios, activePortfolioId, transactions, goals, lastNavSyncAt]);

  // Initial Load from MongoDB on Login (Strict Isolation per Email)
  useEffect(() => {
    if (!isAuthenticated || !user?.email) {
      setHasLoadedRemote(false);
      return;
    }

    const currentTargetEmail = user.email.trim().toLowerCase();
    setHasLoadedRemote(false);

    if (!isCloudAvailable) {
      setHasLoadedRemote(true);
      return;
    }

    let cancelled = false;

    const loadRemoteData = async () => {
      try {
        const response = await fetch('/api/user/sync', { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!data?.success || !data?.data) throw new Error('Initial sync rejected');
        if (cancelled || activeEmailRef.current !== currentTargetEmail) return;

        if (data.data.user) {
          setUser((prev) => ({ ...prev, ...data.data.user }));
        }

        const remoteTransactions = data.data.transactions || [];
        const remotePortfolios = data.data.portfolios?.length
          ? data.data.portfolios
          : [defaultPortfolioFor(currentTargetEmail)];
        const remoteGoals = data.data.goals || [];
        const remoteFunds = data.data.funds || [];

        setTransactions(remoteTransactions);
        setPortfolios(remotePortfolios);
        setGoals(remoteGoals);
        setFunds(remoteFunds);

        setHasLoadedRemote(true);
        hasReportedSyncError.current = false;
      } catch (err) {
        console.debug('MongoDB initial sync:', err instanceof Error ? err.message : err);
        if (!cancelled && activeEmailRef.current === currentTargetEmail) {
          setHasLoadedRemote(false);
          if (!hasReportedSyncError.current) {
            hasReportedSyncError.current = true;
            showToast('error', 'Chưa thể tải dữ liệu từ đám mây.');
          }
        }
      }
    };

    loadRemoteData();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user?.email, isCloudAvailable, showToast]);

  // Background Auto-Sync to MongoDB (Guarded to current user)
  useEffect(() => {
    const email = user.email.trim().toLowerCase();
    if (!isAuthenticated || !email || !hasLoadedRemote || !isCloudAvailable) return;
    if (activeEmailRef.current !== email) return;

    const timer = setTimeout(() => {
      if (activeEmailRef.current !== email) return;

      fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
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
            showToast('error', 'Chưa thể đồng bộ dữ liệu với đám mây.');
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
  const liveGoals = useMemo(
    () => calculateLiveGoals(goals, transactions, funds),
    [goals, transactions, funds],
  );

  // Proactive Auto-Sync NAV from Fmarket
  const syncNavAutomatically = useCallback(async (force = false) => {
    if (isSyncingNavRef.current) return { updatedCount: 0 };

    const now = Date.now();
    const optimalInterval = getOptimalNavSyncIntervalMs();
    const lastSync = lastNavSyncAtRef.current;

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

          const remotePrevNav = remote.previousNav || remote.nav;
          const isNavDifferent = Math.abs(fund.nav - remote.nav) > 0.001;
          const isPrevNavDifferent = Math.abs((fund.previousNav || 0) - remotePrevNav) > 0.001;
          const isDateDifferent = remote.navDate && fund.navDate !== remote.navDate;

          if (isNavDifferent || isPrevNavDifferent || isDateDifferent) {
            hasAnyChange = true;
            count++;
            const history = Array.isArray(fund.navHistory) ? [...fund.navHistory] : [];
            if (!history.some((h) => h.date === remote.navDate)) {
              history.push({ date: remote.navDate, nav: remote.nav });
            }
            return {
              ...fund,
              previousNav: remotePrevNav,
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
      if (activeEmailRef.current) {
        localStorage.setItem(getStorageKey('last_nav_sync', activeEmailRef.current), String(now));
      }

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
    if (!hasHydrated || !isAuthenticated) return;

    syncNavAutomatically(false);

    const intervalTimer = setInterval(() => {
      syncNavAutomatically(false);
    }, 2 * 60 * 1000);

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
  }, [hasHydrated, isAuthenticated, syncNavAutomatically]);

  const login = useCallback((email: string, name?: string, avatarUrl?: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const isNewUser = activeEmailRef.current !== normalizedEmail;

    if (isNewUser) {
      // Clean slate for new user before loading their specific data
      setHasLoadedRemote(false);
      setTransactions([]);
      setFunds([]);
      setGoals([]);
      setPortfolios([defaultPortfolioFor(normalizedEmail)]);
      setActivePortfolioId('ALL');
      setLastNavSyncAt(null);
    }

    setUser({
      id: `usr_${Math.abs(normalizedEmail.split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)).toString(36)}`,
      email: normalizedEmail,
      name: name || normalizedEmail.split('@')[0],
      avatarUrl: avatarUrl || '',
      currency: 'VND',
      dateFormat: 'DD/MM/YYYY',
      createdAt: new Date().toISOString(),
    });
    setIsAuthenticated(true);
    showToast('success', 'Đăng nhập thành công.');
  }, [showToast]);

  const logout = useCallback(() => {
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined);
    setIsAuthenticated(false);
    setHasLoadedRemote(false);
    setUser(initialProfile);
    setTransactions([]);
    setFunds([]);
    setGoals([]);
    setPortfolios(initialPortfolios);
    setActivePortfolioId('ALL');
    setLastNavSyncAt(null);
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
    const email = user.email.trim().toLowerCase();
    setFunds([]);
    setPortfolios([defaultPortfolioFor(email)]);
    setActivePortfolioId('ALL');
    setTransactions([]);
    setGoals([]);
    setLastNavSyncAt(null);

    if (email) {
      localStorage.removeItem(getStorageKey('funds', email));
      localStorage.removeItem(getStorageKey('portfolios', email));
      localStorage.removeItem(getStorageKey('active_port', email));
      localStorage.removeItem(getStorageKey('tx', email));
      localStorage.removeItem(getStorageKey('goals', email));
      localStorage.removeItem(getStorageKey('last_nav_sync', email));
    }
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
        goals: liveGoals,
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
