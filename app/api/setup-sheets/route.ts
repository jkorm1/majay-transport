// majay/app/api/setup-sheets/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"
import { JWT } from "google-auth-library"

type SheetConfig = {
  name: string
  headers: string[]
  gridProperties?: { rowCount: number; columnCount: number }
}

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
      } catch (createError: any) {
        console.error("Error creating spreadsheet:", createError)
        return NextResponse.json({ error: `Failed to create spreadsheet: ${createError.message}` }, { status: 500 })
      }
    }

    try {
      const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId })

      const sheetConfigs: SheetConfig[] = [
        {
          name: "Daily Revenue",
          headers: [
            "ID",
            "Date",
            "Driver Name",
            "Revenue",
            "Investor Payback (40%)",
            "Operating Expenses (45%)",
            "Maintenance Fund (5%)",
            "Management/Labor (10%)",
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
        {
          name: "Enrollments",
          headers: [
            "Timestamp",
            "Full Name",
            "Phone",
            "Email",
            "Course",
            "Start Date",
            "Note"
          ],
        },
        {
          name: "Ride Requests",
          headers: [
            "Timestamp",
            "Name",
            "Phone",
            "Location",
            "Pickup Time",
            "Price",
            "Notes"
          ],
        },
        {
          name: "Tracking",
          // 1 date column + 18 day rides + 17 night rides = 36 columns (A:AJ).
          // A new sheet defaults to 26 columns, so this must be set explicitly.
          gridProperties: { rowCount: 100, columnCount: 36 },
          headers: [
            "Date",
            ...Array.from({ length: 18 }, (_, i) => `Day Ride ${i + 1}`),
            ...Array.from({ length: 17 }, (_, i) => `Night Ride ${i + 1}`),
          ],
        },
      ]

      for (const config of sheetConfigs) {
        // Look for the sheet in the snapshot we fetched above.
        let sheetId: number | null =
          spreadsheet.data.sheets?.find((s) => s.properties?.title === config.name)
            ?.properties?.sheetId ?? null

        if (sheetId === null) {
          // Create it, and capture the real sheetId from the reply.
          const addRes = await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
              requests: [{
                addSheet: {
                  properties: {
                    title: config.name,
                    ...(config.gridProperties ? { gridProperties: config.gridProperties } : {}),
                  },
                },
              }],
            },
          })
          sheetId = addRes.data.replies?.[0]?.addSheet?.properties?.sheetId ?? null
        } else if (config.gridProperties) {
          // Sheet already exists — make sure it is wide enough.
          const existing = spreadsheet.data.sheets?.find(
            (s) => s.properties?.title === config.name
          )
          const currentCols = existing?.properties?.gridProperties?.columnCount ?? 0
          if (currentCols < config.gridProperties.columnCount) {
            await sheets.spreadsheets.batchUpdate({
              spreadsheetId,
              requestBody: {
                requests: [{
                  updateSheetProperties: {
                    properties: {
                      sheetId,
                      gridProperties: { columnCount: config.gridProperties.columnCount },
                    },
                    fields: "gridProperties.columnCount",
                  },
                }],
              },
            })
          }
        }

        // Write (or refresh) the header row.
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${config.name}!A1`,
          valueInputOption: "USER_ENTERED",
          requestBody: { values: [config.headers] },
        })

        // Tracking sheet gets real checkboxes + green fill on ticked cells.
        if (config.name === "Tracking" && sheetId !== null) {
          const tickRange = {
            sheetId,
            startRowIndex: 1,
            endRowIndex: 1000,
            startColumnIndex: 1,
            endColumnIndex: 36,
          }

          await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
              requests: [
                // Click-to-tick checkboxes directly in the sheet
                {
                  setDataValidation: {
                    range: tickRange,
                    rule: {
                      condition: { type: "BOOLEAN" },
                      strict: true,
                      showCustomUi: true,
                    },
                  },
                },
                // Green background wherever a box is ticked
                {
                  addConditionalFormatRule: {
                    rule: {
                      ranges: [tickRange],
                      booleanRule: {
                        condition: {
                          type: "CUSTOM_FORMULA",
                          values: [{ userEnteredValue: "=B2=TRUE" }],
                        },
                        format: {
                          backgroundColor: { red: 0.72, green: 0.93, blue: 0.75 },
                          textFormat: { bold: true },
                        },
                      },
                    },
                    index: 0,
                  },
                },
                // Freeze the header row and the date column
                {
                  updateSheetProperties: {
                    properties: {
                      sheetId,
                      gridProperties: { frozenRowCount: 1, frozenColumnCount: 1 },
                    },
                    fields:
                      "gridProperties.frozenRowCount,gridProperties.frozenColumnCount",
                  },
                },
                // Centre the tick marks
                {
                  repeatCell: {
                    range: tickRange,
                    cell: { userEnteredFormat: { horizontalAlignment: "CENTER" } },
                    fields: "userEnteredFormat.horizontalAlignment",
                  },
                },
                // Narrow the 35 tick columns so the whole day fits on screen
                {
                  updateDimensionProperties: {
                    range: {
                      sheetId,
                      dimension: "COLUMNS",
                      startIndex: 1,
                      endIndex: 36,
                    },
                    properties: { pixelSize: 44 },
                    fields: "pixelSize",
                  },
                },
              ],
            },
          })
        }
      }

      return NextResponse.json({
        success: true,
        message: "Google Sheets setup complete! A new sheet was created and structured automatically.",
        sheetId: spreadsheetId,
      })
    } catch (sheetError: any) {
      console.error("Error setting up spreadsheet:", sheetError)
      return NextResponse.json({ error: `Failed to setup spreadsheet: ${sheetError.message}` }, { status: 500 })
    }
  } catch (error: any) {
    console.error("[Setup] Error:", error)
    return NextResponse.json({ error: `Setup failed: ${error.message}` }, { status: 500 })
  }
}