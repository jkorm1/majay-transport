import { NextResponse } from "next/server";
import { google, type sheets_v4 } from "googleapis";
import { JWT } from "google-auth-library";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const TAB_NAME = "Status";
const RANGE = `${TAB_NAME}!A1:B1`;

const spreadsheetId = () => process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID!;

function getSheetsClient() {
  const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS!);
  const auth = new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

// Creates the Status tab with ON in A1 if it doesn't exist yet.
async function ensureStatusTab(sheets: sheets_v4.Sheets) {
  const meta = await sheets.spreadsheets.get({
    spreadsheetId: spreadsheetId(),
    fields: "sheets.properties.title",
  });
  const exists = meta.data.sheets?.some(
    (s) => s.properties?.title === TAB_NAME
  );
  if (exists) return;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: spreadsheetId(),
    requestBody: {
      requests: [{ addSheet: { properties: { title: TAB_NAME } } }],
    },
  });
  await sheets.spreadsheets.values.update({
    spreadsheetId: spreadsheetId(),
    range: RANGE,
    valueInputOption: "RAW",
    requestBody: { values: [["ON", new Date().toISOString()]] },
  });
}

export async function GET() {
  try {
    const sheets = getSheetsClient();
    await ensureStatusTab(sheets);

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId(),
      range: RANGE,
    });
    const row = res.data.values?.[0] ?? [];
    const available = String(row[0] ?? "ON").trim().toUpperCase() !== "OFF";
    const updatedAt = row[1] ? String(row[1]) : null;
    return NextResponse.json(
      { available, updatedAt },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Error reading availability:", error);
    return NextResponse.json(
      { error: "Failed to read availability" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (typeof body?.available !== "boolean") {
      return NextResponse.json(
        { error: "`available` must be true or false" },
        { status: 400 }
      );
    }

    const updatedAt = new Date().toISOString();
    const sheets = getSheetsClient();
    await ensureStatusTab(sheets);

    await sheets.spreadsheets.values.update({
      spreadsheetId: spreadsheetId(),
      range: RANGE,
      valueInputOption: "RAW",
      requestBody: {
        values: [[body.available ? "ON" : "OFF", updatedAt]],
      },
    });

    return NextResponse.json({ available: body.available, updatedAt });
  } catch (error) {
    console.error("Error saving availability:", error);
    return NextResponse.json(
      { error: "Failed to save availability" },
      { status: 500 }
    );
  }
}