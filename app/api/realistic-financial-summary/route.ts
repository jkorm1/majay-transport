// majay/app/api/realistic-financial-summary/route.ts
import { google } from "googleapis"
import { JWT } from "google-auth-library"
import { calculateRealisticFinancialSummaryFromExpenses } from "@/lib/realistic-financial-logic"

export async function GET() {
  try {
    const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS!)
    const auth = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })
    const sheets = google.sheets({ version: "v4", auth })

    // Get revenue and expenses data from sheets
    const [revenueRes, expensesRes] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID,
        range: "Daily Revenue!A:I"
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID,
        range: "Expenses!A:F"
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

    // Process expenses data
    const expenses = (expensesRes.data.values || []).slice(1).map((row) => ({
      id: row[0],
      date: row[1],
      category: row[2],
      description: row[3],
      amount: Number(row[4]),
      notes: row[5] || ""
    }))

    // Calculate total revenue
    const totalRevenue = dailyRevenue.reduce((sum, rev) => sum + rev.revenue, 0)
    
    // Calculate realistic financial summary
    const realisticFinancialSummary = calculateRealisticFinancialSummaryFromExpenses(
      totalRevenue,
      expenses
    )

    return Response.json({
      totalRevenue,
      realisticFinancialSummary
    })
  } catch (error) {
    console.error("Realistic Financial Summary API error:", error)
    return Response.json({ error: "Failed to fetch realistic financial summary" }, { status: 500 })
  }
}
