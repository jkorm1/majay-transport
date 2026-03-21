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
import { format } from "date-fns";

interface EmployeeMonthlyShare {
  employee: string;
  month: string;
  totalShare: number;
  salesCount: number;
}

export default function EmployeeTable() {
  const [monthlyShares, setMonthlyShares] = useState<EmployeeMonthlyShare[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEmployeeShares = async () => {
      try {
        const response = await fetch("/api/sales");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to fetch sales");
        }

        const sales = Array.isArray(result) ? result : result.sales || [];

        // Group sales by employee and month
        const sharesByEmployee = sales.reduce(
          (acc, sale) => {
            const month = format(new Date(sale.date), "MMM yyyy");
            const key = `${sale.employee}-${month}`;

            if (!acc[key]) {
              acc[key] = {
                employee: sale.employee,
                month,
                totalShare: 0,
                salesCount: 0,
              };
            }

            acc[key].totalShare += Number(sale.salesPayroll) || 0;
            acc[key].salesCount += 1;

            return acc;
          },
          {} as Record<string, EmployeeMonthlyShare>,
        );

        setMonthlyShares(Object.values(sharesByEmployee));
      } catch (error) {
        console.error("Failed to load employee shares:", error);
      } finally {
        setLoading(false);
      }
    };
    loadEmployeeShares();
  }, []);

  if (loading) {
    return <div className="text-center p-4">Loading employee shares...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Month</TableHead>
              <TableHead>Total Share (GHS)</TableHead>
              <TableHead>Sales Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {monthlyShares.map((share, index) => (
              <TableRow key={`${share.employee}-${share.month}-${index}`}>
                <TableCell>{share.employee}</TableCell>
                <TableCell>{share.month}</TableCell>
                <TableCell>GHS {share.totalShare.toFixed(2)}</TableCell>
                <TableCell>{share.salesCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
