// majay/app/api/sheets/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"
import { JWT } from "google-auth-library"

async function getSheetsClient() {
  const credentials = process.env.GOOGLE_SHEETS_CREDENTIALS
  if (!credentials) {
    throw new Error("Google Sheets credentials not configured")
  }

  const parsedCredentials = JSON.parse(credentials)
  const auth = new JWT({
    email: parsedCredentials.client_email,
    key: parsedCredentials.private_key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  })

  return google.sheets({ version: "v4", auth })
}

export async function POST(request: NextRequest) {
  try {
    const { action, range, values } = await request.json()
    const sheets = await getSheetsClient()
    const spreadsheetId = process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID

    if (!spreadsheetId) {
      throw new Error("Google Sheet ID not configured")
    }

    switch (action) {
      case 'append':
        const appendResponse = await sheets.spreadsheets.values.append({
          spreadsheetId,
          range,
          valueInputOption: 'USER_ENTERED',
          requestBody: { values },
          insertDataOption: 'INSERT_ROWS',
        })
        return NextResponse.json(appendResponse.data)

      case 'read':
        const readResponse = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range,
        })
        return NextResponse.json({ values: readResponse.data.values || [] })

      case 'setup':
        const sheetConfigs = [
          {
            name: "Daily Revenue",
            headers: [
              "ID",
              "Date",
              "Driver Name",
              "Revenue",
              "Investor Payback (45%)",
              "Operating Expenses (25%)",
              "Maintenance Fund (15%)",
              "Management/Labor (15%)",
              "Notes"
            ],
          },
          {
            name: "Expenses",
            headers: ["ID", "Date", "Category", "Description", "Amount", "Notes"]
          },
          {
            name: "Maintenance Log",
            headers: ["ID", "Date", "Description", "Cost", "Status"]
          },
          {
            name: "Summary",
            headers: ["Metric", "Value", "Last Updated"]
          },
        ]

        const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId })
        const existingSheetNames = spreadsheet.data.sheets?.map((s) => s.properties?.title) || []

        for (const config of sheetConfigs) {
          if (!existingSheetNames.includes(config.name)) {
            await sheets.spreadsheets.batchUpdate({
              spreadsheetId,
              requestBody: {
                requests: [{
                  addSheet: {
                    properties: { title: config.name },
                  },
                }],
              },
            })
          }

          const headerResponse = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${config.name}!A1:Z1`,
          })

          if (!headerResponse.data.values || headerResponse.data.values.length === 0) {
            await sheets.spreadsheets.values.update({
              spreadsheetId,
              range: `${config.name}!A1`,
              valueInputOption: "USER_ENTERED",
              requestBody: { values: [config.headers] },
            })
          }
        }

        return NextResponse.json({ 
          success: true, 
          message: existingSheetNames.length > 0 
            ? "Google Sheets updated successfully!" 
            : "Google Sheets setup completed successfully!",
          existingSheets: existingSheetNames
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Google Sheets API error:', error)
    return NextResponse.json(
      { error: 'Failed to perform Google Sheets operation' },
      { status: 500 }
    )
  }
}
