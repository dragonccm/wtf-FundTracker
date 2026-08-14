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

export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercent(value: number): string {
  const formatted = value.toFixed(2);
  return value > 0 ? `+${formatted}%` : `${formatted}%`;
}
