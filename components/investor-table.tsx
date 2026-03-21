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

interface InvestorMonthlyShare {
  month: string;
  totalShare: number;
  salesCount: number;
}

export default function InvestorTable() {
  const [monthlyShares, setMonthlyShares] = useState<InvestorMonthlyShare[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInvestorShares = async () => {
      try {
        const response = await fetch("/api/sales");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to fetch sales");
        }

        const sales = Array.isArray(result) ? result : result.sales || [];

        // Group sales by month
        const sharesByMonth = sales.reduce(
          (acc, sale) => {
            const month = format(new Date(sale.date), "MMM yyyy");

            if (!acc[month]) {
              acc[month] = {
                month,
                totalShare: 0,
                salesCount: 0,
              };
            }

            acc[month].totalShare += Number(sale.investorShare) || 0;
            acc[month].salesCount += 1;

            return acc;
          },
          {} as Record<string, InvestorMonthlyShare>,
        );

        setMonthlyShares(Object.values(sharesByMonth));
      } catch (error) {
        console.error("Failed to load investor shares:", error);
      } finally {
        setLoading(false);
      }
    };
    loadInvestorShares();
  }, []);

  if (loading) {
    return <div className="text-center p-4">Loading investor shares...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Month</TableHead>
              <TableHead>Total Share (GHS)</TableHead>
              <TableHead>Sales Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {monthlyShares.map((share) => (
              <TableRow key={share.month}>
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
