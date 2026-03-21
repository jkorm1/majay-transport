// majay/components/driver-performance-table.tsx
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

export default function DriverPerformanceTable() {
  const [driverData, setDriverData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDriverData();
  }, []);

  const fetchDriverData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/dashboard");
      const data = await response.json();
      setDriverData(data.driverPerformance || []);
    } catch (error) {
      console.error("Error fetching driver data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">
          Loading driver performance data...
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Driver Performance Summary</CardTitle>
        <CardDescription>
          Driver performance metrics and earnings breakdown
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Driver Name</TableHead>
                <TableHead className="text-right">Days Worked</TableHead>
                <TableHead className="text-right">Total Revenue</TableHead>
                <TableHead className="text-right">Avg Daily</TableHead>
                <TableHead className="text-right">Total Payback</TableHead>
                <TableHead className="text-right">Avg Payback</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {driverData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground"
                  >
                    No driver performance data found
                  </TableCell>
                </TableRow>
              ) : (
                driverData.map((driver) => (
                  <TableRow key={driver.driverName}>
                    <TableCell className="font-medium">
                      {driver.driverName}
                    </TableCell>
                    <TableCell className="text-right">
                      {driver.daysWorked}
                    </TableCell>
                    <TableCell className="text-right">
                      GHS {driver.totalRevenue.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      GHS {(driver.totalRevenue / driver.daysWorked).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      GHS {driver.totalPayback.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      GHS {(driver.totalPayback / driver.daysWorked).toFixed(2)}
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
