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

    const id = Date.now().toString();
    const dateValue = new Date(data.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const row = [
      id,
      dateValue, 
      data.category,
      data.description,
      data.amount
    ]

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID,
      range: "Expenses!A:E",
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [row] }
    })

    return Response.json({ success: true, data: { id, ...data } })
  } catch (error) {
    return Response.json({ error: "Failed to record expense" }, { status: 400 })
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
      range: "Expenses!A:E"
    })

    const rows = response.data.values || []
    const expenses = rows.slice(1).map((row) => ({
      id: row[0],
      date: row[1],
      category: row[2],
      description: row[3],
      amount: Number(row[4])
    }))

    return Response.json(expenses)
  } catch (error) {
    return Response.json({ error: "Failed to fetch expenses" }, { status: 500 })
  }
}
