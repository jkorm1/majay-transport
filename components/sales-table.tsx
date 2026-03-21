"use client";

import { useState, useEffect } from "react";
import { Sale } from "@/lib/financial-logic";
import { getSales } from "@/lib/transaction-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

// In components/sales-table.tsx
// In components/sales-table.tsx
export default function SalesTable() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof Sale>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/sales");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to fetch sales");
        }

        // Ensure result is an array
        const salesData = Array.isArray(result) ? result : result.sales || [];

        // Process the sales data with correct profit distribution
        const processedSales = salesData.map((sale: any) => ({
          id: sale.id || "",
          date: sale.date || "",
          employee: sale.employee || "",
          product: sale.product || "",
          quantity: Number(sale.quantity) || 0,
          price: Number(sale.price) || 0,
          total: Number(sale.total) || 0,
          event: sale.event || "",
          productionCost: Number(sale.productionCost) || 0,
          tithe: Number(sale.tithe) || 0,
          founderPay: Number(sale.founderPay) || 0,
          businessSavings: Number(sale.businessSavings) || 0,
          leadershipPayroll: Number(sale.leadershipPayroll) || 0,
          salesPayroll: Number(sale.salesPayroll) || 0,
          salesPayrollSavings: Number(sale.salesPayrollSavings) || 0,
          packagingPayroll: Number(sale.packagingPayroll) || 0,
          investorShare: Number(sale.investorShare) || 0,
          reinvestment: Number(sale.reinvestment) || 0,
        }));

        setSales(processedSales);
      } catch (error) {
        console.error("Error fetching sales:", error);
        setSales([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, []);

  // Rest of the component remains the same...

  // Rest of the component remains the same...

  const handleSort = (field: keyof Sale) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredAndSortedSales = sales
    .filter((sale) =>
      Object.values(sale).some((value) =>
        value.toString().toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    )
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

  if (loading) {
    return <div className="text-center p-4">Loading sales data...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search sales..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("date")}
              >
                Date{" "}
                {sortField === "date" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("employee")}
              >
                Employee{" "}
                {sortField === "employee" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("product")}
              >
                Product{" "}
                {sortField === "product" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("quantity")}
              >
                Quantity{" "}
                {sortField === "quantity" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("price")}
              >
                Price{" "}
                {sortField === "price" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("total")}
              >
                Total{" "}
                {sortField === "total" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("event")}
              >
                Event{" "}
                {sortField === "event" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("productionCost")}
              >
                Production Cost{" "}
                {sortField === "productionCost" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("tithe")}
              >
                Tithe{" "}
                {sortField === "tithe" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("founderPay")}
              >
                Founder Pay{" "}
                {sortField === "founderPay" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("businessSavings")}
              >
                Business Savings{" "}
                {sortField === "businessSavings" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("leadershipPayroll")}
              >
                Leadership Payroll{" "}
                {sortField === "leadershipPayroll" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("salesPayroll")}
              >
                Sales Payroll{" "}
                {sortField === "salesPayroll" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("salesPayrollSavings")}
              >
                Sales Payroll Savings{" "}
                {sortField === "salesPayrollSavings" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("packagingPayroll")}
              >
                Packaging Payroll{" "}
                {sortField === "packagingPayroll" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("investorShare")}
              >
                Investor Share{" "}
                {sortField === "investorShare" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("reinvestment")}
              >
                Reinvestment{" "}
                {sortField === "reinvestment" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredAndSortedSales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>
                  {format(new Date(sale.date), "MMM d, yyyy")}
                </TableCell>
                <TableCell>{sale.employee}</TableCell>
                <TableCell>{sale.product}</TableCell>
                <TableCell>{sale.quantity}</TableCell>
                <TableCell>GHS {sale.price.toFixed(2)}</TableCell>
                <TableCell>GHS {sale.total.toFixed(2)}</TableCell>
                <TableCell>{sale.event || "Normal"}</TableCell>
                <TableCell>GHS {sale.productionCost.toFixed(2)}</TableCell>
                <TableCell>GHS {sale.tithe.toFixed(2)}</TableCell>
                <TableCell>GHS {sale.founderPay.toFixed(2)}</TableCell>
                <TableCell>GHS {sale.businessSavings.toFixed(2)}</TableCell>
                <TableCell>GHS {sale.leadershipPayroll.toFixed(2)}</TableCell>
                <TableCell>GHS {sale.salesPayroll.toFixed(2)}</TableCell>
                <TableCell>GHS {sale.salesPayrollSavings.toFixed(2)}</TableCell>
                <TableCell>GHS {sale.packagingPayroll.toFixed(2)}</TableCell>
                <TableCell>GHS {sale.investorShare.toFixed(2)}</TableCell>
                <TableCell>GHS {sale.reinvestment.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
