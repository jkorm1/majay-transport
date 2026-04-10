// majay/components/revenue-table.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RevenueTable() {
  const [revenueRecords, setRevenueRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRevenueRecords();
  }, []);

  const fetchRevenueRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/sales");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Modify data processing logic in revenue-table.tsx
      const data = await response.json();

      // Modify this part of code to correctly handle the API returned data structure
      if (Array.isArray(data)) {
        setRevenueRecords(data);
      } else if (data && Array.isArray(data.data)) {
        setRevenueRecords(data.data);
      } else if (data && Array.isArray(data.records)) {
        setRevenueRecords(data.records);
      } else {
        console.error("Unexpected data format:", data);
        setRevenueRecords([]);
      }
    } catch (error) {
      console.error("Error fetching revenue records:", error);
      setError("Failed to load revenue records");
      setRevenueRecords([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading revenue records...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Revenue Records</CardTitle>
        <CardDescription>
          All recorded daily revenue and their automatic splits
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Investor</TableHead>
                <TableHead className="text-right">Ops</TableHead>
                <TableHead className="text-right">Maint</TableHead>
                <TableHead className="text-right">Labor</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!revenueRecords || revenueRecords.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-muted-foreground"
                  >
                    No revenue records found
                  </TableCell>
                </TableRow>
              ) : (
                revenueRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.date}</TableCell>
                    <TableCell>{record.driverName}</TableCell>
                    <TableCell className="text-right">
                      GHS {record.revenue?.toFixed(2) || "0.00"}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      GHS {record.investorPayback?.toFixed(2) || "0.00"}
                    </TableCell>
                    <TableCell className="text-right text-orange-600">
                      GHS {record.operatingExpenses?.toFixed(2) || "0.00"}
                    </TableCell>
                    <TableCell className="text-right text-purple-600">
                      GHS {record.maintenanceFund?.toFixed(2) || "0.00"}
                    </TableCell>
                    <TableCell className="text-right text-cyan-600">
                      GHS {record.managementLabor?.toFixed(2) || "0.00"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {record.notes || "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
