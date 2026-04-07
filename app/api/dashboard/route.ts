// majay/app/api/dashboard/route.ts
import { google } from "googleapis"
import { JWT } from "google-auth-library"
import { calculatePaybackProgress } from "@/lib/financial-logic"

const TOTAL_INVESTMENT = 90000; // GH₵ 90,000 investment from Michael Quainoo Mallen

export async function GET() {
  try {
    const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS!)
    const auth = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })
    const sheets = google.sheets({ version: "v4", auth })

    // Get all data from sheets
    const [revenueRes, expensesRes, maintenanceRes] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID,
        range: "Daily Revenue!A:I"
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID,
        range: "Expenses!A:F"
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID,
        range: "Maintenance Log!A:E"
      })
    ])

    // Process daily revenue data
    const dailyRevenue = (revenueRes.data.values || []).slice(1).map((row) => ({
      id: row[0],
      date: row[1],
      driverName: row[2],
      revenue: Number(row[3]),
      investorPayback: Number(row[4]),
      operatingExpenses: Number(row[5]),
      maintenanceFund: Number(row[6]),
      managementLabor: Number(row[7]),
      notes: row[8] || ""
    }))

    // Calculate unique days
const uniqueDays = new Set(dailyRevenue.map(rev => rev.date))
const uniqueDaysCount = uniqueDays.size

    // Process expenses data
    const expenses = (expensesRes.data.values || []).slice(1).map((row) => ({
      id: row[0],
      date: row[1],
      category: row[2],
      description: row[3],
      amount: Number(row[4]),
      notes: row[5] || ""
    }))

    // Process maintenance data
    const maintenance = (maintenanceRes.data.values || []).slice(1).map((row) => ({
      id: row[0],
      date: row[1],
      description: row[2],
      cost: Number(row[3]),
      status: row[4] || "Pending"
    }))

    // Calculate totals
    const totalRevenue = dailyRevenue.reduce((sum, rev) => sum + rev.revenue, 0)
    const totalInvestorPayback = dailyRevenue.reduce((sum, rev) => sum + rev.investorPayback, 0)
    const totalOperatingExpenses = dailyRevenue.reduce((sum, rev) => sum + rev.operatingExpenses, 0)
    const totalMaintenanceFund = dailyRevenue.reduce((sum, rev) => sum + rev.maintenanceFund, 0)
    const totalManagementLabor = dailyRevenue.reduce((sum, rev) => sum + rev.managementLabor, 0)
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
    const totalMaintenanceCost = maintenance.reduce((sum, m) => sum + m.cost, 0)

    // Calculate payback progress
    const paybackProgress = calculatePaybackProgress(TOTAL_INVESTMENT, totalInvestorPayback)

    // Calculate driver performance
    const driverPerformance = dailyRevenue.reduce((acc, rev) => {
      const existing = acc.find(d => d.driverName === rev.driverName)
      if (existing) {
        existing.totalRevenue += rev.revenue
        existing.totalPayback += rev.investorPayback
        existing.daysWorked += 1
      } else {
        acc.push({
          driverName: rev.driverName,
          totalRevenue: rev.revenue,
          totalPayback: rev.investorPayback,
          daysWorked: 1
        })
      }
      return acc
    }, [] as { driverName: string; totalRevenue: number; totalPayback: number; daysWorked: number }[])

    const summary = {
      totalRevenue,
      totalInvestorPayback,
      totalOperatingExpenses,
      totalMaintenanceFund,
      totalManagementLabor,
      totalExpenses,
      totalMaintenanceCost,
      netProfit: totalRevenue - totalExpenses - totalMaintenanceCost,
      paybackProgress,
      driverPerformance,
      uniqueDaysCount
    }

    return Response.json(summary)
  } catch (error) {
    console.error("Dashboard API error:", error)
    return Response.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}
