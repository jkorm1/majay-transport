import { google } from "googleapis"
import { JWT } from "google-auth-library"

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

    const id = Date.now().toString()
    const row = [
      id,
      data.date,
      data.purpose,
      data.amount,
      "repayment"
    ]

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID,
      range: "Withdrawals!A:E",
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [row] }
    })

    return Response.json({ success: true, data: { id, ...data } })
  } catch (error) {
    return Response.json({ error: "Failed to record repayment" }, { status: 400 })
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
      range: "Withdrawals!A:E"
    })

    const rows = response.data.values || []
    const repayments = rows.slice(1).map((row) => ({
      id: row[0],
      date: row[1],
      purpose: row[2],
      amount: Number(row[3]),
      type: row[4]
    })).filter(r => r.type === "repayment")

    return Response.json(repayments)
  } catch (error) {
    return Response.json({ error: "Failed to fetch repayments" }, { status: 500 })
  }
}
