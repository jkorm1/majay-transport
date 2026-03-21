// majay/components/expenses-table.tsx
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

export default function ExpensesTable() {
  const [expenseRecords, setExpenseRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpenseRecords();
  }, []);

  const fetchExpenseRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/expenses");
      const data = await response.json();
      setExpenseRecords(data);
    } catch (error) {
      console.error("Error fetching expense records:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading expense records...</div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense Records</CardTitle>
        <CardDescription>
          All recorded operating expenses and other costs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenseRecords.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground"
                  >
                    No expense records found
                  </TableCell>
                </TableRow>
              ) : (
                expenseRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.date}</TableCell>
                    <TableCell>{record.category}</TableCell>
                    <TableCell>{record.description}</TableCell>
                    <TableCell className="text-right">
                      GHS {record.amount.toFixed(2)}
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
