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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Loss {
  id: string;
  date: string;
  product: string;
  quantity: number;
  price: number;
  reason: string;
  potentialValue: number;
}

export function LossesTable() {
  const [losses, setLosses] = useState<Loss[]>([]);

  useEffect(() => {
    fetchLosses();
  }, []);

  const fetchLosses = async () => {
    try {
      const response = await fetch("/api/losses");
      if (response.ok) {
        const data = await response.json();
        // Ensure data is an array before setting state
        if (Array.isArray(data)) {
          setLosses(data);
        } else {
          console.error("Invalid data format received:", data);
          setLosses([]);
        }
      } else {
        console.error("Failed to fetch losses:", response.statusText);
        setLosses([]);
      }
    } catch (error) {
      console.error("Failed to fetch losses:", error);
      setLosses([]);
    }
  };

  const totalLosses = Array.isArray(losses)
    ? losses.reduce((sum, loss) => sum + (loss.potentialValue || 0), 0)
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Losses</CardTitle>
        <div className="text-sm text-muted-foreground">
          Total Lost Value: GHS {totalLosses.toFixed(2)}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Potential Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {losses.map((loss) => (
              <TableRow key={loss.id}>
                <TableCell>{loss.date}</TableCell>
                <TableCell>{loss.product}</TableCell>
                <TableCell>{loss.quantity}</TableCell>
                <TableCell>GHS {loss.price.toFixed(2)}</TableCell>
                <TableCell>{loss.reason}</TableCell>
                <TableCell>GHS {loss.potentialValue.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
