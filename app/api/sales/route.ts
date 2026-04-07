// majay/app/api/sales/route.ts
import { google } from "googleapis"
import { JWT } from "google-auth-library"
import { calculateDailyRevenue } from "@/lib/financial-logic"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS!)
    const auth = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })
    const sheets = google.sheets({ version: "v4", auth })

    const dateValue = new Date(data.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })

    // Calculate revenue split
    const revenueData = calculateDailyRevenue(
      data.driverName,
      Number(data.revenue),
      dateValue,
      data.notes
    )

    const row = [
      revenueData.id,
      revenueData.date,
      revenueData.driverName,
      revenueData.revenue,
      revenueData.investorPayback,
      revenueData.operatingExpenses,
      revenueData.maintenanceFund,
      revenueData.managementLabor,
      revenueData.notes || ""
    ]

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID,
      range: "Daily Revenue!A:I",
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [row] }
    })

    return Response.json({ 
      success: true, 
      data: revenueData
    })
  } catch (error) {
    console.error("Revenue API error:", error)
    return Response.json({ error: "Failed to record daily revenue" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS!)
    const auth = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })
    const sheets = google.sheets({ version: "v4", auth })

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID,
      range: "Daily Revenue!A:I"
    })

    const rows = response.data.values || []
    const uniqueDays = new Set(rows.slice(1).map((row) => row[1])) // row[1] is the date column

    const revenueRecords = rows.slice(1).map((row) => ({
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

    return Response.json({
          records: revenueRecords,
          uniqueDaysCount: uniqueDays.size
        })
      } catch (error) {
        console.error("Failed to fetch revenue records:", error)
        return Response.json({ error: "Failed to fetch revenue records" }, { status: 500 })
      }
    }
