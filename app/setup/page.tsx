"use client";

import { GoogleSheetsSetup } from "@/components/google-sheets-setup";
import { AuthGuard } from "@/components/auth-guard";

export default function SetupPage() {
  return (
    <AuthGuard>
      <div className="container mx-auto p-4">
        <GoogleSheetsSetup />
      </div>
    </AuthGuard>
  );
}
