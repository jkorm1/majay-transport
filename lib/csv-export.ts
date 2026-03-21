// CSV export utilities for financial reports

import type { Sale, Expense, Withdrawal, FinancialSummary } from "./financial-logic"

function escapeCSV(value: string | number): string {
  const stringValue = String(value)
  if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}

export function generateSalesCSV(sales: Sale[]): string {
  const headers = [
    "Date",
    "Product",
    "Quantity",
    "Unit Price (GHS)",
    "Total (GHS)",
    "Business Fund (GHS)",
    "Employee Share (GHS)",
    "Investor Share (GHS)",
    "Savings (GHS)",  // Added this header
  ]
  const rows = sales.map((sale) => [
    sale.date,
    sale.product,
    sale.quantity.toString(),
    sale.price.toFixed(2),
    sale.total.toFixed(2),
    sale.businessFund.toFixed(2),
    sale.employeeShare.toFixed(2),
    sale.investorShare.toFixed(2),
    sale.savings.toFixed(2),  // Added this field
  ])

  return [headers, ...rows].map((row) => row.map(escapeCSV).join(",")).join("\n")
}

export function generateExpensesCSV(expenses: Expense[]): string {
  const headers = ["Date", "Category", "Description", "Amount (GHS)"]
  const rows = expenses.map((expense) => [
    expense.date,
    expense.category,
    expense.description,
    expense.amount.toFixed(2),
  ])

  return [headers, ...rows].map((row) => row.map(escapeCSV).join(",")).join("\n")
}

export function generateWithdrawalsCSV(withdrawals: Withdrawal[]): string {
  const headers = ["Date", "Type", "Purpose", "Amount (GHS)"]
  const rows = withdrawals.map((withdrawal) => [
    withdrawal.date,
    withdrawal.type === "withdrawal" ? "Withdrawal" : "Repayment",
    withdrawal.purpose,
    withdrawal.amount.toFixed(2),
  ])

  return [headers, ...rows].map((row) => row.map(escapeCSV).join(",")).join("\n")
}

export function generateFinancialSummaryCSV(summary: FinancialSummary): string {
  const rows = [
    ["Financial Summary Report"],
    [],
    ["Revenue", ""],
    ["Total Sales", summary.totalSales.toFixed(2)],
    [],
    ["Expenses", ""],
    ["Total Expenses", summary.totalExpenses.toFixed(2)],
    ["Cost of Goods", summary.costOfGoods.toFixed(2)],
    [],
    ["Fund Distribution", ""],
    ["Business Fund", summary.businessFund.toFixed(2)],
    ["Employee Share", summary.employeeShare.toFixed(2)],
    ["Investor Share", summary.investorShare.toFixed(2)],
    ["Savings", summary.savings?.toFixed(2) || "0.00"],
    [],
    ["Owner Transactions", ""],
    ["Withdrawals", summary.ownerWithdrawals.toFixed(2)],
    ["Repayments", summary.ownerRepayments.toFixed(2)],
    [],
    ["Summary", ""],
    ["Cash Balance", summary.cash.toFixed(2)],
  ]

  return rows.map((row) => row.map(escapeCSV).join(",")).join("\n")
}

export function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
