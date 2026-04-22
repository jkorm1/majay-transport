// majay/lib/realistic-financial-logic.ts

export interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  notes?: string;
}

export interface CategorizedExpenses {
  operatingExpenses: number;
  maintenanceFund: number;
  uncategorized: number;
}

export interface FinancialSummary {
  investorPayback: {
    amount: number;
    percentage: number;
  };
  operatingExpenses: {
    amount: number;
    percentage: number;
  };
  maintenanceFund: {
    amount: number;
    percentage: number;
  };
  managementLabor: {
    amount: number;
    percentage: number;
  };
}

// Define expense categories
const operatingExpenseCategories = ["Fuel", "Mobile Data"];
const maintenanceFundCategories = ["Cleaning", "Repairs", "Licensing", "Insurance", "Other"];

/**
 * Categorizes expenses into operating expenses, maintenance fund, and uncategorized
 * @param expenses - Array of expense objects
 * @returns Object with categorized expense amounts
 */
export function categorizeExpenses(expenses: Expense[]): CategorizedExpenses {
  return expenses.reduce((acc, exp) => {
    const category = exp.category;
    
    // Check if it's an operating expense
    if (operatingExpenseCategories.some(cat => 
      category.toLowerCase().includes(cat.toLowerCase()))) {
      acc.operatingExpenses += exp.amount;
    } 
    // Check if it's a maintenance fund expense
    else if (maintenanceFundCategories.some(cat => 
      category.toLowerCase().includes(cat.toLowerCase()))) {
      acc.maintenanceFund += exp.amount;
    }
    // Otherwise, it's an uncategorized expense
    else {
      acc.uncategorized += exp.amount;
    }
    
    return acc;
  }, {
    operatingExpenses: 0,
    maintenanceFund: 0,
    uncategorized: 0
  });
}

/**
 * Calculates a realistic financial summary based on actual expense data
 * @param totalRevenue - Total revenue
 * @param categorizedExpenses - Categorized expense amounts
 * @returns Financial summary with amounts and percentages
 */
export function calculateRealisticFinancialSummary(
  totalRevenue: number,
  categorizedExpenses: CategorizedExpenses
): FinancialSummary {
  // Calculate management/labor (10% of revenue)
  const managementLabor = totalRevenue * 0.10;
  
  // Calculate investor payback (remaining percentage)
  const investorPayback = totalRevenue - categorizedExpenses.operatingExpenses - 
                         categorizedExpenses.maintenanceFund - managementLabor;
  
  // Calculate percentages for the financial summary
  const totalDeductions = categorizedExpenses.operatingExpenses + 
                         categorizedExpenses.maintenanceFund + managementLabor;
  const investorPaybackPercentage = totalRevenue > 0 ? (investorPayback / totalRevenue) * 100 : 0;
  const operatingExpensesPercentage = totalRevenue > 0 ? (categorizedExpenses.operatingExpenses / totalRevenue) * 100 : 0;
  const maintenanceFundPercentage = totalRevenue > 0 ? (categorizedExpenses.maintenanceFund / totalRevenue) * 100 : 0;
  const managementLaborPercentage = 10; // Fixed at 10% of revenue
  
  return {
    investorPayback: {
      amount: investorPayback,
      percentage: investorPaybackPercentage
    },
    operatingExpenses: {
      amount: categorizedExpenses.operatingExpenses,
      percentage: operatingExpensesPercentage
    },
    maintenanceFund: {
      amount: categorizedExpenses.maintenanceFund,
      percentage: maintenanceFundPercentage
    },
    managementLabor: {
      amount: managementLabor,
      percentage: managementLaborPercentage
    }
  };
}

/**
 * Calculates a realistic financial summary from expense data
 * @param totalRevenue - Total revenue
 * @param expenses - Array of expense objects
 * @returns Financial summary with amounts and percentages
 */
export function calculateRealisticFinancialSummaryFromExpenses(
  totalRevenue: number,
  expenses: Expense[]
): FinancialSummary {
  const categorizedExpenses = categorizeExpenses(expenses);
  return calculateRealisticFinancialSummary(totalRevenue, categorizedExpenses);
}
