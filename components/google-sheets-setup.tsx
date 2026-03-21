// majay/components/google-sheets-setup.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function GoogleSheetsSetup() {
  const [sheetId, setSheetId] = useState("");
  const [credentials, setCredentials] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">(
    "info",
  );

  const handleSetup = async () => {
    if (!credentials) {
      setMessage("❌ Error: Please enter your Google Sheets credentials.");
      setMessageType("error");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/setup-sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sheetId,
          credentials,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(
          `✅ Success! A new Google Sheet has been created for MaJay Transportation. ID: ${data.sheetId}`,
        );
        setMessageType("success");
        setSheetId(data.sheetId);
      } else {
        setMessage(`❌ ${data.error}`);
        setMessageType("error");
      }
    } catch (error) {
      setMessage(`❌ Connection failed: ${error.message}`);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 mb-6 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-900">
      <h2 className="text-lg font-semibold mb-4">
        Initialize MaJay Transportation Data System
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Google Sheet ID (Optional)
          </label>
          <input
            type="text"
            value={sheetId}
            onChange={(e) => setSheetId(e.target.value)}
            placeholder="Leave blank to create a new sheet automatically"
            className="w-full px-3 py-2 border border-blue-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Google Sheets Credentials (JSON)
          </label>
          <textarea
            value={credentials}
            onChange={(e) => setCredentials(e.target.value)}
            placeholder='Paste your Google Sheets service account JSON credentials here. Example: {"type": "service_account", ...}'
            className="w-full px-3 py-2 border border-blue-300 rounded-md h-32"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            You can get these credentials from Google Cloud Console by creating
            a service account and downloading its JSON key file.
          </p>
        </div>

        <Button onClick={handleSetup} disabled={loading}>
          {loading ? "Creating..." : "Create New Sheet & Setup"}
        </Button>

        {message && (
          <p
            className={`text-sm ${
              messageType === "success"
                ? "text-green-600"
                : messageType === "error"
                  ? "text-red-600"
                  : "text-blue-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </Card>
  );
}
