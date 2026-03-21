import type { Sale, Expense, Withdrawal } from "./financial-logic"

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function saleToRow(sale: Sale): string[] {
  return [
    sale.id,
    `'${sale.date}`,
    sale.employee,
    sale.product,
    String(sale.quantity),
    String(sale.price),
    String(sale.total),
    sale.event || "Normal",
    String(sale.productionCost),
    String(sale.tithe),
    String(sale.founderPay),
    String(sale.businessSavings),
    String(sale.leadershipPayroll),
    String(sale.salesPayroll),
    String(sale.salesPayrollSavings),
    String(sale.packagingPayroll),
    String(sale.investorShare),
    String(sale.reinvestment),
  ];
}



function expenseToRow(expense: Expense): string[] {
  return [expense.id, expense.date, expense.category, expense.description, String(expense.amount)]
}

function withdrawalToRow(withdrawal: Withdrawal): string[] {
  return [withdrawal.id, withdrawal.date, withdrawal.purpose, String(withdrawal.amount), withdrawal.type]
}

function rowToSale(row: string[]): Sale {
  return {
    id: row[0],
    date: row[1],
    employee: row[2],
    product: row[3],
    quantity: Number(row[4]),
    price: Number(row[5]),
    total: Number(row[6]),
    event: row[7] || "Normal",
    productionCost: Number(row[8]) || 0,
    tithe: Number(row[9]) || 0,
    founderPay: Number(row[10]) || 0,
    businessSavings: Number(row[11]) || 0,
    leadershipPayroll: Number(row[12]) || 0,
    salesPayroll: Number(row[13]) || 0,
    salesPayrollSavings: Number(row[14]) || 0,
    packagingPayroll: Number(row[15]) || 0,
    investorShare: Number(row[16]) || 0,
    reinvestment: Number(row[17]) || 0,
  };
}


function rowToExpense(row: string[]): Expense {
  return {
    id: row[0],
    date: row[1],
    category: row[2],
    description: row[3],
    amount: Number(row[4]),
  }
}

function rowToWithdrawal(row: string[]): Withdrawal {
  return {
    id: row[0],
    date: row[1],
    purpose: row[2],
    amount: Number(row[3]),
    type: row[4] as "withdrawal" | "repayment",
  }
}

async function makeRequest(action: string, range: string, values?: string[][]) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const response = await fetch(`${baseUrl}/api/sheets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, range, values })
  })

  if (!response.ok) {
    throw new Error(`Failed to ${action} to Google Sheets`)
  }

  return response.json()
}

export async function addSale(sale: Omit<Sale, "id">): Promise<Sale> {
  const newSale: Sale = {
    ...sale,
    id: generateId(),
  }

  try {
    await makeRequest('append', 'Sales!A2', [saleToRow(newSale)])
    return newSale
  } catch (error) {
    console.error("Failed to add sale:", error)
    throw new Error("Failed to save sale")
  }
}

export async function addExpense(expense: Omit<Expense, "id">): Promise<Expense> {
  const newExpense: Expense = {
    ...expense,
    id: generateId(),
  }

  try {
    await makeRequest('append', 'Expenses!A2', [expenseToRow(newExpense)])
    return newExpense
  } catch (error) {
    console.error("Failed to add expense:", error)
    throw new Error("Failed to save expense")
  }
}

export async function addWithdrawal(withdrawal: Omit<Withdrawal, "id">): Promise<Withdrawal> {
  const newWithdrawal: Withdrawal = {
    ...withdrawal,
    id: generateId(),
  }

  try {
    await makeRequest('append', 'Withdrawals!A2', [withdrawalToRow(newWithdrawal)])
    return newWithdrawal
  } catch (error) {
    console.error("Failed to add withdrawal:", error)
    throw new Error("Failed to save withdrawal")
  }
}

export async function getSales(): Promise<Sale[]> {
  try {
    const { values } = await makeRequest('read', 'Sales!A:R')
    return values.map(rowToSale)
  } catch (error) {
    console.error("Failed to fetch sales:", error)
    return []
  }
}

export async function getExpenses(): Promise<Expense[]> {
  try {
    const { values } = await makeRequest('read', 'Expenses!A2:E')
    return values.map(rowToExpense)
  } catch (error) {
    console.error("Failed to fetch expenses:", error)
    return []
  }
}

export async function getWithdrawals(): Promise<Withdrawal[]> {
  try {
    const { values } = await makeRequest('read', 'Withdrawals!A2:E')
    return values.map(rowToWithdrawal)
  } catch (error) {
    console.error("Failed to fetch withdrawals:", error)
    return []
  }
}

export async function getAllTransactions() {
  const [sales, expenses, withdrawals] = await Promise.all([
    getSales(),
    getExpenses(),
    getWithdrawals(),
  ])

  return {
    sales,
    expenses,
    withdrawals,
  }
}
