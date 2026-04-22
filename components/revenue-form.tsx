// majay/components/revenue-form.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { calculateRevenueSplit } from "@/lib/financial-logic";
import { useToast } from "@/hooks/use-toast";

interface RevenueFormProps {
  onSuccess?: () => void;
}

export default function RevenueForm({ onSuccess }: RevenueFormProps) {
  const [formData, setFormData] = useState({
    driverName: "",
    revenue: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const { toast } = useToast();

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Calculate preview when revenue changes
    if (name === "revenue") {
      const revenue = Number(value);
      if (revenue > 0) {
        setPreview(calculateRevenueSplit(revenue));
      } else {
        setPreview(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate driver name
    if (!formData.driverName || formData.driverName.trim() === "") {
      toast({
        title: "Validation Error",
        description: "Please select a driver",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({
          driverName: "",
          revenue: "",
          date: new Date().toISOString().split("T")[0],
          notes: "",
        });
        setPreview(null);
        onSuccess?.();
        toast({
          title: "Success",
          description: "Revenue recorded successfully",
        });
      } else {
        throw new Error("Failed to record revenue");
      }
    } catch (error) {
      console.error("Error recording revenue:", error);
      toast({
        title: "Error",
        description: "Failed to record revenue. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Daily Revenue</CardTitle>
        <CardDescription>
          Enter daily revenue to automatically calculate splits
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="driverName">Driver Name</Label>
              <select
                id="driverName"
                name="driverName"
                value={formData.driverName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                required
              >
                <option value="">Select a driver</option>
                <option value="Joseph Korm">Joseph Korm</option>
                <option value="Nathaniel Obeng">Nathaniel Obeng</option>
                <option value="Adu Kofi Owusu">Adu Kofi Owusu</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="revenue">Revenue (GHS)</Label>
              <Input
                id="revenue"
                name="revenue"
                type="number"
                step="0.01"
                value={formData.revenue}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {preview && (
            <div className="mt-6 p-4 bg-muted rounded-lg space-y-2">
              <h3 className="font-semibold mb-3">Revenue Split Preview</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Revenue:</div>
                <div className="text-right font-medium">
                  GHS {preview.revenue.toFixed(2)}
                </div>

                <div>Investor Payback (40%):</div>
                <div className="text-right font-medium text-green-600">
                  GHS {preview.investorPayback.toFixed(2)}
                </div>

                <div>Operating Expenses (45%):</div>
                <div className="text-right font-medium text-orange-600">
                  GHS {preview.operatingExpenses.toFixed(2)}
                </div>

                <div>Maintenance Fund (5%):</div>
                <div className="text-right font-medium text-purple-600">
                  GHS {preview.maintenanceFund.toFixed(2)}
                </div>

                <div>Management/Labor (10%):</div>
                <div className="text-right font-medium text-cyan-600">
                  GHS {preview.managementLabor.toFixed(2)}
                </div>
              </div>
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Recording..." : "Record Revenue"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
