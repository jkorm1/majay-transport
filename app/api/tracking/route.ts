// majay/app/api/tracking/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { google, type sheets_v4 } from "googleapis";
import { JWT } from "google-auth-library";

// Always hit the sheet — never serve a cached copy, or a refresh could show old ticks.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DAY_COUNT = 18;
const NIGHT_COUNT = 17;
const TOTAL_RIDES = DAY_COUNT + NIGHT_COUNT; // 35
const TAB_NAME = "Tracking";
const RANGE = `${TAB_NAME}!A:AJ`; // A = date, B:S = day rides, T:AJ = night rides
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const spreadsheetId = () => process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID;

async function getSheetsClient() {
  const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS!);
  const auth = new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive",
    ],
  });
  return google.sheets({ version: "v4", auth });
}

// The numeric id of the "Tracking" tab (needed for appendCells). Cached per server instance.
let cachedTab: { spreadsheetId: string; tabId: number } | null = null;

async function getTabId(sheets: sheets_v4.Sheets, id: string): Promise<number> {
  if (cachedTab?.spreadsheetId === id) return cachedTab.tabId;

  const res = await sheets.spreadsheets.get({
    spreadsheetId: id,
    fields: "sheets.properties(sheetId,title)",
  });
  const tab = res.data.sheets?.find((s) => s.properties?.title === TAB_NAME);
  const tabId = tab?.properties?.sheetId;
  if (tabId === undefined || tabId === null) {
    throw new Error(`Tab "${TAB_NAME}" not found. Run the sheet setup first.`);
  }
  cachedTab = { spreadsheetId: id, tabId };
  return tabId;
}

// Accepts real booleans (new rows) and legacy "✓" / "TRUE" text (old rows).
function isTicked(val: unknown): boolean {
  if (typeof val === "boolean") return val;
  const v = String(val ?? "").trim().toUpperCase();
  return v === "TRUE" || v === "✓" || v === "YES";
}

// Sheets truncates trailing empty cells, so a partly-filled row comes back
// short. Always rebuild a fixed-length array by index.
function toRides(row: unknown[]): boolean[] {
  return Array.from({ length: TOTAL_RIDES }, (_, i) => isTicked(row[1 + i]));
}

// One checkbox cell (used when a brand-new date row is appended).
const checkboxCell = (ticked: boolean): sheets_v4.Schema$CellData => ({
  userEnteredValue: { boolValue: ticked },
  dataValidation: {
    condition: { type: "BOOLEAN" },
    strict: true,
    showCustomUi: true,
  },
  userEnteredFormat: { horizontalAlignment: "CENTER" },
});

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");

  try {
    const sheets = await getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId(),
      range: RANGE,
    });

    // Drop the header row and anything without a date in column A.
    // If the same date somehow appears twice, the FIRST row wins — the same row
    // POST updates — so the page and the sheet can never disagree.
    const byDate = new Map<string, boolean[]>();
    for (const row of (response.data.values || []).slice(1)) {
      const d = String(row?.[0] ?? "").trim();
      if (d !== "" && !byDate.has(d)) byDate.set(d, toRides(row));
    }

    // ?date=… → just that day.
    if (date) {
      const rides = byDate.get(date.trim());
      return NextResponse.json(rides ? { date: date.trim(), rides } : null);
    }

    // No ?date= → return every recorded day, newest first.
    const all = Array.from(byDate, ([d, rides]) => ({ date: d, rides })).sort((a, b) =>
      a.date < b.date ? 1 : -1
    );
    return NextResponse.json({ rows: all });
  } catch (error) {
    console.error("Error fetching tracking data:", error);
    return NextResponse.json(
      { error: "Failed to fetch tracking data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const date = String(body?.date ?? "").trim();

    // Accept either a single 35-long `rides` array or the older
    // dayRides / nightRides pair.
    const incoming: unknown[] = Array.isArray(body?.rides)
      ? body.rides
      : [...(body?.dayRides ?? []), ...(body?.nightRides ?? [])];

    if (!DATE_RE.test(date) || incoming.length === 0) {
      return NextResponse.json(
        { error: "Missing or invalid fields (need date as YYYY-MM-DD and rides)" },
        { status: 400 }
      );
    }

    // Always exactly 35 real booleans: ticked = true, unticked = false.
    const rides = Array.from({ length: TOTAL_RIDES }, (_, i) => Boolean(incoming[i]));

    const sheetId = spreadsheetId();
    if (!sheetId) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_GOOGLE_SHEET_ID is not set" },
        { status: 500 }
      );
    }

    const sheets = await getSheetsClient();

    const existingResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: RANGE,
    });

    const allRows = existingResponse.data.values || [];
    // Index 0 is the header, so a match is always >= 1.
    const existingIndex = allRows.findIndex(
      (row, i) => i > 0 && String(row?.[0] ?? "").trim() === date
    );

    if (existingIndex !== -1) {
      // Known date → overwrite the 35 boxes of THAT row in place.
      // allRows is zero-based and includes the header, so the sheet row number is index + 1.
      // Ticking writes TRUE, unticking writes FALSE — the sheet always mirrors the page.
      const rowNumber = existingIndex + 1;
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `${TAB_NAME}!B${rowNumber}:AJ${rowNumber}`,
        valueInputOption: "RAW",
        requestBody: { values: [rides] },
      });
      return NextResponse.json({ success: true, created: false });
    }

    // New date → add ONE new row below the last one, with its own checkboxes.
    // appendCells writes the values and the checkbox validation in a single call.
    const tabId = await getTabId(sheets, sheetId);
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: {
        requests: [
          {
            appendCells: {
              sheetId: tabId,
              rows: [
                {
                  values: [
                    { userEnteredValue: { stringValue: date } },
                    ...rides.map(checkboxCell),
                  ],
                },
              ],
              fields: "userEnteredValue,dataValidation,userEnteredFormat.horizontalAlignment",
            },
          },
        ],
      },
    });

    return NextResponse.json({ success: true, created: true });
  } catch (error) {
    // If the tab was deleted/recreated, forget the cached tab id.
    cachedTab = null;
    console.error("Error saving tracking data:", error);
    return NextResponse.json(
      { error: "Failed to save tracking data" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const date = request.nextUrl.searchParams.get("date");
    
    if (!date || !DATE_RE.test(date)) {
      return NextResponse.json(
        { error: "Invalid or missing date parameter" },
        { status: 400 }
      );
    }

    const sheetId = spreadsheetId();
    if (!sheetId) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_GOOGLE_SHEET_ID is not set" },
        { status: 500 }
      );
    }

    const sheets = await getSheetsClient();

    // Get all rows to find the one to delete
    const existingResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: RANGE,
    });

    const allRows = existingResponse.data.values || [];
    // Find the row index (0-based, including header)
    const existingIndex = allRows.findIndex(
      (row, i) => i > 0 && String(row?.[0] ?? "").trim() === date
    );

    if (existingIndex === -1) {
      return NextResponse.json(
        { error: "Row not found" },
        { status: 404 }
      );
    }

    // Delete the row (existingIndex + 1 because sheets uses 1-based indexing)
    const tabId = await getTabId(sheets, sheetId);
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: tabId,
                dimension: "ROWS",
                startIndex: existingIndex, // 0-based index including header
                endIndex: existingIndex + 1, // Exclusive end index
              },
            },
          },
        ],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting tracking row:", error);
    return NextResponse.json(
      { error: "Failed to delete tracking row" },
      { status: 500 }
    );
  }
}
