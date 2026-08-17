import { Transaction, Holding, Fund, PerformanceMetrics, FinancialGoal } from '@/types';
import { calculateXIRR, CashFlow } from './xirr';

function compareTransactionsChronologically(a: Transaction, b: Transaction) {
  const dateOrder = a.date.localeCompare(b.date);
  return dateOrder || a.id.localeCompare(b.id);
}

export function findOversoldTransaction(transactions: Transaction[]): Transaction | null {
  const positions = new Map<string, number>();
  for (const transaction of [...transactions].sort(compareTransactionsChronologically)) {
    const key = `${transaction.portfolioId}|${transaction.fundCode}`;
    const available = positions.get(key) || 0;
    if (transaction.type === 'BUY' || transaction.type === 'DEPOSIT') {
      positions.set(key, available + transaction.units);
      continue;
    }
    if ((transaction.type === 'SELL' || transaction.type === 'WITHDRAWAL') && transaction.units > available + 0.000001) {
      return transaction;
    }
    if (transaction.type === 'SELL' || transaction.type === 'WITHDRAWAL') {
      positions.set(key, Math.max(0, available - transaction.units));
    }
  }
  return null;
}

export function calculateHoldings(transactions: Transaction[], funds: Fund[]): Holding[] {
  const fundMap = new Map<string, Fund>();
  funds.forEach((f) => fundMap.set(f.id, f));
  funds.forEach((f) => fundMap.set(f.code, f));

  // Map fundCode to accumulated units and cost
  const holdingMap = new Map<
    string,
    {
      fundCode: string;
      fundId: string;
      totalUnits: number;
      totalCost: number;
    }
  >();

  // Sort transactions chronologically
  const sortedTx = [...transactions].sort(compareTransactionsChronologically);

  sortedTx.forEach((tx) => {
    const existing = holdingMap.get(tx.fundCode) || {
      fundCode: tx.fundCode,
      fundId: tx.fundId,
      totalUnits: 0,
      totalCost: 0,
    };

    if (tx.type === 'BUY' || tx.type === 'DEPOSIT') {
      const grossAmount = tx.amount + (tx.fee || 0);
      existing.totalUnits += tx.units;
      existing.totalCost += grossAmount;
    } else if (tx.type === 'SELL' || tx.type === 'WITHDRAWAL') {
      if (existing.totalUnits > 0) {
        const avgCost = existing.totalCost / existing.totalUnits;
        const unitsSold = Math.min(tx.units, existing.totalUnits);
        existing.totalUnits = Math.max(0, existing.totalUnits - unitsSold);
        existing.totalCost = Math.max(0, existing.totalCost - unitsSold * avgCost);
      }
    }

    holdingMap.set(tx.fundCode, existing);
  });

  const rawHoldings: Array<Omit<Holding, 'weightPercent'>> = [];
  let aggregateMarketValue = 0;

  holdingMap.forEach((h) => {
    if (h.totalUnits > 0.0001) {
      const fund = fundMap.get(h.fundCode) || fundMap.get(h.fundId);
      const currentNav = fund ? fund.nav : 0;
      const avgCostBasis = h.totalUnits > 0 ? h.totalCost / h.totalUnits : 0;
      const currentValue = h.totalUnits * currentNav;
      const unrealizedPnL = currentValue - h.totalCost;
      const unrealizedPnLPercent = h.totalCost > 0 ? (unrealizedPnL / h.totalCost) * 100 : 0;

      aggregateMarketValue += currentValue;

      rawHoldings.push({
        fundId: h.fundId,
        fundCode: h.fundCode,
        fundName: fund ? fund.name : h.fundCode,
        category: fund ? fund.category : 'Equity',
        totalUnits: h.totalUnits,
        avgCostBasis,
        totalCost: h.totalCost,
        currentNav,
        currentValue,
        unrealizedPnL,
        unrealizedPnLPercent,
      });
    }
  });

  // Calculate weights
  return rawHoldings.map((h) => ({
    ...h,
    weightPercent: aggregateMarketValue > 0 ? (h.currentValue / aggregateMarketValue) * 100 : 0,
  }));
}

export function calculatePerformanceMetrics(
  transactions: Transaction[],
  funds: Fund[]
): PerformanceMetrics {
  const holdings = calculateHoldings(transactions, funds);

  const currentMarketValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalCostActive = holdings.reduce((sum, h) => sum + h.totalCost, 0);

  let realizedPnL = 0;
  let cumulativePurchaseCost = 0;

  // Track realized PnL across history with exact weighted average cost basis
  const tempHoldings = new Map<string, { units: number; cost: number }>();

  const sortedTx = [...transactions].sort(compareTransactionsChronologically);

  sortedTx.forEach((tx) => {
    const cur = tempHoldings.get(tx.fundCode) || { units: 0, cost: 0 };
    if (tx.type === 'BUY' || tx.type === 'DEPOSIT') {
      cur.units += tx.units;
      cur.cost += tx.amount + (tx.fee || 0);
      cumulativePurchaseCost += tx.amount + (tx.fee || 0);
    } else if (tx.type === 'SELL' || tx.type === 'WITHDRAWAL') {
      const avgCost = cur.units > 0 ? cur.cost / cur.units : 0;
      const unitsSold = Math.min(tx.units, cur.units);
      const soldCost = unitsSold * avgCost;
      const saleRatio = tx.units > 0 ? unitsSold / tx.units : 0;
      const proceeds = (tx.amount - (tx.fee || 0)) * saleRatio;
      realizedPnL += proceeds - soldCost;
      cur.units = Math.max(0, cur.units - unitsSold);
      cur.cost = Math.max(0, cur.cost - soldCost);
    } else if (tx.type === 'DIVIDEND') {
      realizedPnL += tx.amount - (tx.fee || 0);
    }
    tempHoldings.set(tx.fundCode, cur);
  });

  const unrealizedPnL = currentMarketValue - totalCostActive;
  const totalPnL = unrealizedPnL + realizedPnL;
  const totalPnLPercent = cumulativePurchaseCost > 0 ? (totalPnL / cumulativePurchaseCost) * 100 : 0;

  // Build CashFlows for XIRR
  const cashFlows: CashFlow[] = [];
  transactions.forEach((tx) => {
    if (tx.type === 'BUY' || tx.type === 'DEPOSIT') {
      cashFlows.push({
        amount: -(tx.amount + (tx.fee || 0)),
        date: new Date(tx.date),
      });
    } else if (tx.type === 'SELL' || tx.type === 'WITHDRAWAL' || tx.type === 'DIVIDEND') {
      cashFlows.push({
        amount: tx.amount - (tx.fee || 0),
        date: new Date(tx.date),
      });
    }
  });

  // Add terminal valuation cash flow (today)
  if (currentMarketValue > 0) {
    cashFlows.push({
      amount: currentMarketValue,
      date: new Date(),
    });
  }

  const xirrPercent = calculateXIRR(cashFlows);

  // Daily change estimation
  let dailyChange = 0;
  holdings.forEach((h) => {
    const fund = funds.find((f) => f.code === h.fundCode || f.id === h.fundId);
    if (fund && fund.previousNav && fund.previousNav > 0) {
      const changePerUnit = fund.nav - fund.previousNav;
      dailyChange += changePerUnit * h.totalUnits;
    }
  });

  const prevValue = currentMarketValue - dailyChange;
  const dailyChangePercent = prevValue > 0 ? (dailyChange / prevValue) * 100 : 0;

  return {
    totalInvested: totalCostActive,
    currentMarketValue,
    totalPnL,
    totalPnLPercent,
    xirrPercent,
    realizedPnL,
    dailyChange,
    dailyChangePercent,
  };
}

export function formatNumberWithDots(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '0';
  return new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatVND(amount: number, showSuffix = true): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return showSuffix ? '0 VND' : '0';
  }
  const formatted = new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
  return showSuffix ? `${formatted} VND` : formatted;
}

export function formatCompactVND(amount: number): string {
  return formatVND(amount);
}

export function formatUnits(units: number): string {
  if (isNaN(units) || units === null || units === undefined) return '0';
  return new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: 4,
  }).format(units);
}

export function formatPercent(value: number): string {
  if (isNaN(value) || value === null || value === undefined) return '0.00%';
  const formatted = value.toFixed(2);
  return value > 0 ? `+${formatted}%` : `${formatted}%`;
}

/**
 * Tự động chèn dấu chấm phân cách hàng nghìn mỗi 3 chữ số khi gõ số tiền hoặc giá NAV.
 * Khắc phục triệt để lỗi biến số thành số lẻ thập phân (như 1,000000).
 */
export function formatInputCurrency(raw: string | number): string {
  if (raw === '' || raw === null || raw === undefined) return '';

  if (typeof raw === 'number') {
    if (isNaN(raw)) return '';
    // Format number with dots for thousands, commas for decimals
    const parts = raw.toString().split('.');
    const intPart = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(Number(parts[0]));
    return parts.length > 1 && parts[1] ? `${intPart},${parts[1].slice(0, 4)}` : intPart;
  }

  const str = String(raw).trim();
  if (!str) return '';

  // If user typed comma ',' (Vietnamese decimal separator)
  if (str.includes(',')) {
    const parts = str.split(',');
    const intDigits = parts[0].replace(/\D/g, '');
    const decDigits = parts.slice(1).join('').replace(/\D/g, '').slice(0, 4);
    const formattedInt = intDigits ? intDigits.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '0';
    return parts.length > 1 && str.endsWith(',') && !decDigits
      ? `${formattedInt},`
      : decDigits
        ? `${formattedInt},${decDigits}`
        : formattedInt;
  }

  // If user typed dot '.' at the end, treat as wanting to type decimal
  if (str.endsWith('.')) {
    const intDigits = str.slice(0, -1).replace(/\D/g, '');
    const formattedInt = intDigits ? intDigits.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '0';
    return `${formattedInt},`;
  }

  // All other input: strip non-digits and format integer with dots
  const digits = str.replace(/\D/g, '');
  if (!digits) return '';

  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Chuyển chuỗi định dạng có dấu chấm / dấu phẩy thành số thực / nguyên chính xác 100%
 */
export function parseInputCurrency(formatted: string | number): number {
  if (typeof formatted === 'number') return isNaN(formatted) ? 0 : formatted;
  if (!formatted) return 0;

  const str = String(formatted).trim();
  if (!str) return 0;

  // If contains comma for decimals (e.g. "15.806,5")
  if (str.includes(',')) {
    const parts = str.split(',');
    const intPart = parts[0].replace(/\D/g, '') || '0';
    const decPart = parts[1] ? parts[1].replace(/\D/g, '') : '0';
    return parseFloat(`${intPart}.${decPart}`) || 0;
  }

  // Otherwise all non-digits are thousand separators
  const digits = str.replace(/\D/g, '');
  return digits ? parseFloat(digits) : 0;
}

export interface TransactionPnLResult {
  currentNav: number;
  costBasis: number;
  pnl: number;
  pnlPercent: number;
  isProfit: boolean;
  isRealized: boolean;
}

/**
 * Tính toán Lãi / Lỗ chuẩn xác cho từng giao dịch:
 * - Lệnh MUA: Lãi/Lỗ tạm tính theo NAV hiện tại so với giá mua (bao gồm phí).
 * - Lệnh BÁN: Lãi/Lỗ đã chốt = (Tiền bán - Phí) - (Số CCQ bán * Giá vốn bình quân của quỹ tại thời điểm bán).
 */
export function calculateTransactionPnLMap(
  transactions: Transaction[],
  funds: Fund[]
): Map<string, TransactionPnLResult> {
  const resultMap = new Map<string, TransactionPnLResult>();
  const fundMap = new Map<string, Fund>();
  funds.forEach((f) => fundMap.set(f.code, f));
  funds.forEach((f) => fundMap.set(f.id, f));

  // Sort chronologically to compute running cost basis for SELL orders
  const sortedTx = [...transactions].sort(compareTransactionsChronologically);

  const runningHoldings = new Map<string, { units: number; cost: number }>();

  sortedTx.forEach((tx) => {
    const fund = fundMap.get(tx.fundCode) || fundMap.get(tx.fundId);
    const currentNav = fund ? fund.nav : tx.unitPrice;
    const cur = runningHoldings.get(tx.fundCode) || { units: 0, cost: 0 };

    if (tx.type === 'BUY' || tx.type === 'DEPOSIT') {
      const grossCost = tx.amount + (tx.fee || 0);
      const unitCost = tx.units > 0 ? grossCost / tx.units : tx.unitPrice;
      const currentValue = tx.units * currentNav;
      const pnl = currentValue - grossCost;
      const pnlPercent = grossCost > 0 ? (pnl / grossCost) * 100 : 0;

      resultMap.set(tx.id, {
        currentNav,
        costBasis: unitCost,
        pnl,
        pnlPercent,
        isProfit: pnl >= 0,
        isRealized: false,
      });

      cur.units += tx.units;
      cur.cost += grossCost;
      runningHoldings.set(tx.fundCode, cur);
    } else if (tx.type === 'SELL' || tx.type === 'WITHDRAWAL') {
      // Cost basis per unit at the moment of sale
      const avgCostBasisAtSale = cur.units > 0 ? cur.cost / cur.units : (fund?.nav || tx.unitPrice);
      const unitsSold = Math.min(tx.units, cur.units);
      const soldCost = unitsSold * avgCostBasisAtSale;
      const saleRatio = tx.units > 0 ? unitsSold / tx.units : 0;
      const netProceeds = (tx.amount - (tx.fee || 0)) * saleRatio;
      const realizedPnL = netProceeds - soldCost;
      const realizedPnLPercent = soldCost > 0 ? (realizedPnL / soldCost) * 100 : 0;

      resultMap.set(tx.id, {
        currentNav: tx.unitPrice, // Price sold at
        costBasis: avgCostBasisAtSale,
        pnl: realizedPnL,
        pnlPercent: realizedPnLPercent,
        isProfit: realizedPnL >= 0,
        isRealized: true,
      });

      cur.units = Math.max(0, cur.units - unitsSold);
      cur.cost = Math.max(0, cur.cost - soldCost);
      runningHoldings.set(tx.fundCode, cur);
    }
  });

  return resultMap;
}

/**
 * Helper tính toán tiến độ mục tiêu tài chính tự động đồng bộ từ các giao dịch & tài sản
 */
export function calculateLiveGoals(
  goals: FinancialGoal[],
  transactions: Transaction[],
  funds: Fund[]
): FinancialGoal[] {
  const fundMap = new Map<string, Fund>();
  funds.forEach((f) => fundMap.set(f.code, f));
  funds.forEach((f) => fundMap.set(f.id, f));

  return goals.map((goal) => {
    // Find all transactions linked to this goal
    const goalTx = transactions
      .filter((tx) => tx.goalId === goal.id)
      .sort(compareTransactionsChronologically);

    // Calculate active holdings value contributed to this goal
    const goalFundUnits = new Map<string, number>();
    let netContributedCash = 0;

    goalTx.forEach((tx) => {
      const units = goalFundUnits.get(tx.fundCode) || 0;
      if (tx.type === 'BUY' || tx.type === 'DEPOSIT') {
        goalFundUnits.set(tx.fundCode, units + tx.units);
        netContributedCash += tx.amount;
      } else if (tx.type === 'SELL' || tx.type === 'WITHDRAWAL') {
        goalFundUnits.set(tx.fundCode, Math.max(0, units - tx.units));
        netContributedCash -= tx.amount;
      }
    });

    let liveMarketValue = 0;
    goalFundUnits.forEach((units, fundCode) => {
      const fund = fundMap.get(fundCode);
      const nav = fund ? fund.nav : 0;
      liveMarketValue += units * nav;
    });

    // If transactions exist for this goal, live amount is the current market value of its holdings (or net contributions)
    // If base amount exists, add to it
    const linkedValue = liveMarketValue > 0 ? liveMarketValue : Math.max(0, netContributedCash);
    const effectiveAmount = goalTx.length > 0 ? goal.currentAmount + linkedValue : goal.currentAmount;

    return {
      ...goal,
      currentAmount: effectiveAmount,
    };
  });
}
