// majay/app/api/setup-sheets/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"
import { JWT } from "google-auth-library"

export async function POST(request: NextRequest) {
  try {
    const { sheetId: inputSheetId, credentials } = await request.json()

    if (!credentials) {
      return NextResponse.json({ error: "Credentials are required" }, { status: 400 })
    }

    let parsedCredentials;
    try {
      parsedCredentials = typeof credentials === 'string' ? JSON.parse(credentials) : credentials;
    } catch (error) {
      return NextResponse.json({ error: "Invalid credentials format. Please provide valid JSON." }, { status: 400 })
    }

    // Validate credentials structure
    if (!parsedCredentials.client_email || !parsedCredentials.private_key) {
      return NextResponse.json({ error: "Invalid credentials structure. Missing client_email or private_key." }, { status: 400 })
    }

    const auth = new JWT({
      email: parsedCredentials.client_email,
      key: parsedCredentials.private_key,
      scopes: ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive"],
    })
    const sheets = google.sheets({ version: "v4", auth })

    let spreadsheetId = inputSheetId

    if (!spreadsheetId) {
      try {
        const newSheet = await sheets.spreadsheets.create({
          requestBody: {
            properties: {
              title: `MaJay Transportation Data - ${new Date().toISOString().split('T')[0]}`,
            },
          },
        })
        spreadsheetId = newSheet.data.spreadsheetId
      } catch (createError) {
        console.error("Error creating spreadsheet:", createError)
        return NextResponse.json({ error: `Failed to create spreadsheet: ${createError.message}` }, { status: 500 })
      }
    }

    try {
      const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId })
      const existingSheetNames = spreadsheet.data.sheets?.map((s) => s.properties?.title) || []

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
          headers: [
            "ID",
            "Date",
            "Category",
            "Description",
            "Amount",
            "Notes"
          ],
        },
        {
          name: "Maintenance Log",
          headers: [
            "ID",
            "Date",
            "Description",
            "Cost",
            "Status"
          ],
        },
      ]

      for (const config of sheetConfigs) {
        if (!existingSheetNames.includes(config.name)) {
          await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
              requests: [{
                addSheet: {
                  properties: { 
                    title: config.name,
                  },
                },
              }],
            },
          })

          await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${config.name}!A1`,
            valueInputOption: "USER_ENTERED",
            requestBody: { values: [config.headers] },
          })
        } else {
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
        message: "Google Sheets setup complete! A new sheet was created and structured automatically.",
        sheetId: spreadsheetId,
      })
    } catch (sheetError) {
      console.error("Error setting up spreadsheet:", sheetError)
      return NextResponse.json({ error: `Failed to setup spreadsheet: ${sheetError.message}` }, { status: 500 })
    }
  } catch (error) {
    console.error("[Setup] Error:", error)
    return NextResponse.json({ error: `Setup failed: ${error.message}` }, { status: 500 })
  }
}
