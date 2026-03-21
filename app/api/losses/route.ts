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
      data.product,
      data.quantity,
      data.price,
      data.reason,
      data.potentialValue
    ]

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID,
      range: "Losses!A:G",
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [row] }
    })

    return Response.json({ success: true, data: { id, ...data } })
  } catch (error) {
    console.error("Error recording loss:", error)
    return Response.json({ error: "Failed to record loss" }, { status: 500 })
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
      range: "Losses!A:G"
    })

    const rows = response.data.values || []
    const losses = rows.slice(1).map((row) => ({
      id: row[0],
      date: row[1],
      product: row[2],
      quantity: Number(row[3]),
      price: Number(row[4]),
      reason: row[5],
      potentialValue: Number(row[6])
    }))

    return Response.json(losses)
  } catch (error) {
    console.error("Error fetching losses:", error)
    return Response.json({ error: "Failed to fetch losses" }, { status: 500 })
  }
}
