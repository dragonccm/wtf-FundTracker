import { Transaction, Holding, Fund, PerformanceMetrics } from '@/types';
import { calculateXIRR, CashFlow } from './xirr';

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
  const sortedTx = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  sortedTx.forEach((tx) => {
    const existing = holdingMap.get(tx.fundCode) || {
      fundCode: tx.fundCode,
      fundId: tx.fundId,
      totalUnits: 0,
      totalCost: 0,
    };

    if (tx.type === 'BUY') {
      const grossAmount = tx.amount + tx.fee;
      existing.totalUnits += tx.units;
      existing.totalCost += grossAmount;
    } else if (tx.type === 'SELL') {
      if (existing.totalUnits > 0) {
        const avgCost = existing.totalCost / existing.totalUnits;
        const unitsSold = Math.min(tx.units, existing.totalUnits);
        existing.totalUnits -= unitsSold;
        existing.totalCost -= unitsSold * avgCost;
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

  // Track realized PnL across history
  const tempHoldings = new Map<string, { units: number; cost: number }>();

  const sortedTx = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  sortedTx.forEach((tx) => {
    const cur = tempHoldings.get(tx.fundCode) || { units: 0, cost: 0 };
    if (tx.type === 'BUY') {
      cur.units += tx.units;
      cur.cost += tx.amount + tx.fee;
      cumulativePurchaseCost += tx.amount + tx.fee;
    } else if (tx.type === 'SELL') {
      const avgCost = cur.units > 0 ? cur.cost / cur.units : 0;
      const unitsSold = Math.min(tx.units, cur.units);
      const soldCost = unitsSold * avgCost;
      const proceeds = tx.amount - tx.fee;
      realizedPnL += proceeds - soldCost;
      cur.units = Math.max(0, cur.units - unitsSold);
      cur.cost = Math.max(0, cur.cost - soldCost);
    } else if (tx.type === 'DIVIDEND') {
      realizedPnL += tx.amount - tx.fee;
    }
    tempHoldings.set(tx.fundCode, cur);
  });

  const unrealizedPnL = currentMarketValue - totalCostActive;
  const totalPnL = unrealizedPnL + realizedPnL;
  const totalPnLPercent = cumulativePurchaseCost > 0 ? (totalPnL / cumulativePurchaseCost) * 100 : 0;

  // Build CashFlows for XIRR
  const cashFlows: CashFlow[] = [];
  transactions.forEach((tx) => {
    if (tx.type === 'BUY') {
      cashFlows.push({
        amount: -(tx.amount + tx.fee),
        date: new Date(tx.date),
      });
    } else if (tx.type === 'SELL') {
      cashFlows.push({
        amount: tx.amount - tx.fee,
        date: new Date(tx.date),
      });
    } else if (tx.type === 'DIVIDEND' || tx.type === 'WITHDRAWAL') {
      cashFlows.push({ amount: tx.amount - tx.fee, date: new Date(tx.date) });
    } else if (tx.type === 'DEPOSIT') {
      cashFlows.push({ amount: -(tx.amount + tx.fee), date: new Date(tx.date) });
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
    const fund = funds.find((f) => f.code === h.fundCode);
    if (fund) {
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

/**
 * Định dạng tiền tệ VND đầy đủ cho toàn bộ ứng dụng theo yêu cầu
 * Hiển thị đầy đủ số tiền có dấu chấm phân cách và đuôi VND (Ví dụ: 4.848.445 VND, 12.000.000.000 VND)
 */
export function formatCompactVND(amount: number): string {
  return formatVND(amount);
}

/**
 * Định dạng số CCQ hoặc số thập phân chuẩn tiếng Việt:
 * Ví dụ: 9135.49 -> "9.135,49" (không bao giờ bị "9.135.49")
 * Ví dụ: 1000 -> "1.000"
 */
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
 * Tự động chèn dấu chấm phân cách mỗi 3 chữ số khi người dùng gõ vào ô input
 * Khắc phục hoàn toàn lỗi khi gõ số liên tiếp và hỗ trợ số thập phân mượt mà
 */
export function formatInputCurrency(raw: string | number): string {
  if (raw === '' || raw === null || raw === undefined) return '';
  
  if (typeof raw === 'number') {
    if (isNaN(raw)) return '';
    return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 4 }).format(raw);
  }

  const str = String(raw).trim();
  if (!str) return '';

  // Nếu người dùng nhập dấu phẩy ',' (phân cách thập phân kiểu Việt Nam)
  if (str.includes(',')) {
    const parts = str.split(',');
    const intDigits = parts[0].replace(/\D/g, '');
    const decDigits = parts.slice(1).join('').replace(/\D/g, '');
    const formattedInt = intDigits ? intDigits.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '0';
    return decDigits ? `${formattedInt},${decDigits}` : `${formattedInt},`;
  }

  // Nếu chuỗi đến từ số thực JS có dấu chấm thập phân (VD "9135.49" hoặc "28000.5")
  if (str.includes('.') && !str.endsWith('.')) {
    const dotParts = str.split('.');
    if (dotParts.length === 2 && dotParts[1].length !== 3 && dotParts[1].length <= 4) {
      const intDigits = dotParts[0].replace(/\D/g, '');
      const decDigits = dotParts[1].replace(/\D/g, '');
      const formattedInt = intDigits ? intDigits.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '0';
      return `${formattedInt},${decDigits}`;
    }
  }

  // Nếu chuỗi kết thúc bằng dấu chấm (người dùng vừa bấm '.' để gõ số thập phân)
  if (str.endsWith('.')) {
    const intDigits = str.slice(0, -1).replace(/\D/g, '');
    const formattedInt = intDigits ? intDigits.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '0';
    return `${formattedInt},`;
  }

  // Với toàn bộ trường hợp số nguyên hoặc số có dấu chấm phân cách hàng nghìn sẵn có:
  const digits = str.replace(/\D/g, '');
  if (!digits) return '';

  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Chuyển chuỗi định dạng có dấu chấm / dấu phẩy thành số nguyên / thực chuẩn xác
 */
export function parseInputCurrency(formatted: string | number): number {
  if (typeof formatted === 'number') return isNaN(formatted) ? 0 : formatted;
  if (!formatted) return 0;

  const str = String(formatted).trim();
  if (!str) return 0;

  // Nếu có dấu phẩy thập phân: "9.135,49" -> 9135.49
  if (str.includes(',')) {
    const parts = str.split(',');
    const intPart = parts[0].replace(/\D/g, '') || '0';
    const decPart = parts[1] ? parts[1].replace(/\D/g, '') : '0';
    return parseFloat(`${intPart}.${decPart}`) || 0;
  }

  // Nếu là số thực US có dấu chấm (VD "9135.49")
  if (str.includes('.')) {
    const dotParts = str.split('.');
    if (dotParts.length === 2 && dotParts[1].length !== 3) {
      const intPart = dotParts[0].replace(/\D/g, '') || '0';
      const decPart = dotParts[1].replace(/\D/g, '') || '0';
      return parseFloat(`${intPart}.${decPart}`) || 0;
    }
  }

  // Nếu không có dấu phẩy/thập phân, mọi dấu chấm đều là phân cách hàng nghìn
  const digits = str.replace(/\D/g, '');
  return digits ? parseFloat(digits) : 0;
}

export interface TransactionPnLResult {
  currentNav: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
  isProfit: boolean;
}

/**
 * Tính toán lãi / lỗ thời gian thực cho từng giao dịch dựa trên NAV hiện tại của quỹ
 */
export function calculateTransactionPnL(
  tx: Transaction,
  funds: Fund[]
): TransactionPnLResult | null {
  const fund = funds.find((f) => f.code === tx.fundCode || f.id === tx.fundId);
  if (!fund || fund.nav <= 0) return null;

  const currentNav = fund.nav;
  if (tx.type === 'BUY') {
    const totalCost = tx.amount + (tx.fee || 0);
    const currentValue = tx.units * currentNav;
    const pnl = currentValue - totalCost;
    const pnlPercent = totalCost > 0 ? (pnl / totalCost) * 100 : 0;
    return {
      currentNav,
      currentValue,
      pnl,
      pnlPercent,
      isProfit: pnl >= 0,
    };
  }

  if (tx.type === 'SELL') {
    const proceeds = tx.amount - (tx.fee || 0);
    const costAtOriginalNav = tx.units * tx.unitPrice;
    const pnl = proceeds - costAtOriginalNav;
    const pnlPercent = costAtOriginalNav > 0 ? (pnl / costAtOriginalNav) * 100 : 0;
    return {
      currentNav,
      currentValue: proceeds,
      pnl,
      pnlPercent,
      isProfit: pnl >= 0,
    };
  }

  return null;
}
