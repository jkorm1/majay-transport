// majay/lib/financial-logic.ts

export interface RevenueSplit {
  revenue: number;
  investorPayback: number; // 40% of revenue
  operatingExpenses: number; // 45% of revenue
  maintenanceFund: number; // 5% of revenue
  managementLabor: number; // 10% of revenue
}

export function calculateRevenueSplit(revenue: number): RevenueSplit {
  return {
    revenue,
    investorPayback: revenue * 0.40,
    operatingExpenses: revenue * 0.45,
    maintenanceFund: revenue * 0.05,
    managementLabor: revenue * 0.10
  };
}

export function calculatePaybackProgress(
  totalInvestment: number,
  totalInvestorPayback: number
): { percentage: number; remaining: number; estimatedDays: number } {
  const percentage = (totalInvestorPayback / totalInvestment) * 100;
  const remaining = totalInvestment - totalInvestorPayback;
  
  // Assuming average daily revenue of GH₵ 600
  const averageDailyInvestorShare = calculateRevenueSplit(600).investorPayback;
  const estimatedDays = Math.ceil(remaining / averageDailyInvestorShare);
  
  return {
    percentage: Math.min(percentage, 100),
    remaining: Math.max(remaining, 0),
    estimatedDays
  };
}

export interface DailyRevenue {
  id: string;
  date: string;
  driverName: string;
  revenue: number;
  investorPayback: number;
  operatingExpenses: number;
  maintenanceFund: number;
  managementLabor: number;
  notes?: string;
}

export function calculateDailyRevenue(
  driverName: string,
  revenue: number,
  date: string,
  notes?: string
): DailyRevenue {
  const split = calculateRevenueSplit(revenue);
  
  return {
    id: Date.now().toString(),
    date,
    driverName,
    revenue,
    investorPayback: split.investorPayback,
    operatingExpenses: split.operatingExpenses,
    maintenanceFund: split.maintenanceFund,
    managementLabor: split.managementLabor,
    notes
  };
}

export function calculateMonthlyProjection(
  dailyRevenue: number,
  workingDaysPerMonth: number = 26
) {
  const dailySplit = calculateRevenueSplit(dailyRevenue);
  
  return {
    daily: dailySplit,
    monthly: {
      revenue: dailySplit.revenue * workingDaysPerMonth,
      investorPayback: dailySplit.investorPayback * workingDaysPerMonth,
      operatingExpenses: dailySplit.operatingExpenses * workingDaysPerMonth,
      maintenanceFund: dailySplit.maintenanceFund * workingDaysPerMonth,
      managementLabor: dailySplit.managementLabor * workingDaysPerMonth
    },
    yearly: {
      revenue: dailySplit.revenue * workingDaysPerMonth * 12,
      investorPayback: dailySplit.investorPayback * workingDaysPerMonth * 12,
      operatingExpenses: dailySplit.operatingExpenses * workingDaysPerMonth * 12,
      maintenanceFund: dailySplit.maintenanceFund * workingDaysPerMonth * 12,
      managementLabor: dailySplit.managementLabor * workingDaysPerMonth * 12
    }
  };
}
