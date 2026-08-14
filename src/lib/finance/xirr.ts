export interface CashFlow {
  amount: number; // Negative for money invested, positive for money withdrawn / current terminal valuation
  date: Date;
}

/**
 * Calculates Extended Internal Rate of Return (XIRR) using Newton-Raphson method.
 * Returns annual rate as percentage (e.g. 15.4 for 15.4%).
 */
export function calculateXIRR(cashFlows: CashFlow[], guess = 0.1): number {
  if (cashFlows.length < 2) return 0;

  // Filter out zero amount cashflows
  const validFlows = cashFlows.filter((cf) => cf.amount !== 0);
  if (validFlows.length < 2) return 0;

  // Ensure there is at least one positive and one negative cash flow
  const hasPositive = validFlows.some((cf) => cf.amount > 0);
  const hasNegative = validFlows.some((cf) => cf.amount < 0);
  if (!hasPositive || !hasNegative) return 0;

  // Sort cash flows chronologically
  const sorted = [...validFlows].sort((a, b) => a.date.getTime() - b.date.getTime());
  const startDate = sorted[0].date.getTime();

  // Convert dates to fractional years relative to first date
  const times = sorted.map((cf) => (cf.date.getTime() - startDate) / (1000 * 60 * 60 * 24 * 365.25));
  const amounts = sorted.map((cf) => cf.amount);

  let rate = guess;
  const maxIterations = 100;
  const tolerance = 1e-6;

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let dNpv = 0;

    for (let j = 0; j < amounts.length; j++) {
      const t = times[j];
      const amount = amounts[j];
      const factor = Math.pow(1 + rate, t);

      if (isNaN(factor) || factor === 0) break;

      npv += amount / factor;
      dNpv -= (t * amount) / (factor * (1 + rate));
    }

    if (Math.abs(npv) < tolerance) {
      return rate * 100; // Convert to percentage
    }

    if (Math.abs(dNpv) < 1e-12) break;

    const newRate = rate - npv / dNpv;
    const delta = newRate - rate;

    // Bounds check to avoid invalid math domain errors
    if (!Number.isFinite(newRate)) break;
    if (newRate <= -0.99) {
      rate = (rate - 0.99) / 2;
    } else {
      rate = newRate;
    }

    if (Math.abs(delta) < tolerance) {
      return rate * 100;
    }
  }

  // Fallback simple ROI if XIRR does not converge
  const totalOutflow = amounts.filter((a) => a < 0).reduce((sum, a) => sum + Math.abs(a), 0);
  const totalInflow = amounts.filter((a) => a > 0).reduce((sum, a) => sum + a, 0);

  if (totalOutflow === 0) return 0;
  return ((totalInflow - totalOutflow) / totalOutflow) * 100;
}
