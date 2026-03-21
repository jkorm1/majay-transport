"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { validateSale } from "@/lib/validation";

const employees = [
  "Christian Frimpong",
  "Joseph Korm",
  "Kofi Adu Jnr",
  "Taufik Yussif",
];

export default function SalesForm({ onSuccess }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    product: "Ahavor Tombrown",
    quantity: "",
    price: "",
    employee: employees[0],
    event: "Normal",
    eventName: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const total = Number(formData.quantity) * Number(formData.price);
    const profitPerPiece = 12.0;
    const actualProfit = total * (profitPerPiece / 25.0);

    const submissionData = {
      ...formData,
      event:
        formData.event === "Normal" ? "Normal" : formData.eventName || "Normal",
      total: total,
      productionCost: total - actualProfit,
      tithe: actualProfit * (1.2 / 12.0),
      founderPay: actualProfit * (1.5 / 12.0),
      businessSavings: actualProfit * (1.0 / 12.0),
      leadershipPayroll: actualProfit * (1.0 / 12.0),
      salesPayroll: actualProfit * (2.7 / 12.0),
      salesPayrollSavings: actualProfit * (0.3 / 12.0),
      packagingPayroll: actualProfit * (0.5 / 12.0),
      investorShare: actualProfit * (1.8 / 12.0),
      reinvestment: actualProfit * (2.0 / 12.0),
    };

    setLoading(true);
    try {
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      const responseData = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Sale recorded successfully",
        });
        setFormData({
          date: new Date().toISOString().split("T")[0],
          product: "Ahavor Tombrown",
          quantity: "",
          price: "",
          employee: employees[0],
          event: "Normal",
          eventName: "",
        });
        setErrors({});
        onSuccess();
      } else {
        toast({
          title: "Error",
          description: responseData.error || "Failed to record sale",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record sale",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalSales =
    formData.quantity && formData.price
      ? (
          Number.parseFloat(formData.quantity) *
          Number.parseFloat(formData.price)
        ).toFixed(2)
      : "0.00";

  const profitPerPiece = 12.0;
  const actualProfit = Number(totalSales) * (profitPerPiece / 25.0);

  const productionCost = (Number(totalSales) - actualProfit).toFixed(2);
  const tithe = (actualProfit * (1.2 / 12.0)).toFixed(2);
  const founderPay = (actualProfit * (1.5 / 12.0)).toFixed(2);
  const businessSavings = (actualProfit * (1.0 / 12.0)).toFixed(2);
  const leadershipPayroll = (actualProfit * (1.0 / 12.0)).toFixed(2);
  const salesPayroll = (actualProfit * (2.7 / 12.0)).toFixed(2);
  const salesPayrollSavings = (actualProfit * (0.3 / 12.0)).toFixed(2);
  const packagingPayroll = (actualProfit * (0.5 / 12.0)).toFixed(2);
  const investorShare = (actualProfit * (1.8 / 12.0)).toFixed(2);
  const reinvestment = (actualProfit * (2.0 / 12.0)).toFixed(2);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Record a Sale</CardTitle>
          <CardDescription>Add a new sales transaction</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                className="bg-input border-border"
                required
              />
              {errors.date && (
                <p className="text-xs text-destructive">{errors.date}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="employee">Employee</Label>
              <select
                name="employee"
                value={formData.employee}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-border bg-input px-3 py-2 text-sm"
              >
                {employees.map((emp) => (
                  <option key={emp} value={emp}>
                    {emp}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="product">Product</Label>
              <Input
                id="product"
                name="product"
                type="text"
                value={formData.product}
                onChange={handleChange}
                className="bg-input border-border"
                required
              />
              {errors.product && (
                <p className="text-xs text-destructive">{errors.product}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                step="0.01"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="0"
                className={`bg-input border-border ${
                  errors.quantity ? "border-destructive" : ""
                }`}
                required
              />
              {errors.quantity && (
                <p className="text-xs text-destructive">{errors.quantity}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Unit Price (GHS)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                placeholder="0"
                className={`bg-input border-border ${
                  errors.price ? "border-destructive" : ""
                }`}
                required
              />
              {errors.price && (
                <p className="text-xs text-destructive">{errors.price}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="event">Event Type</Label>
              <select
                name="event"
                value={formData.event}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    event: value,
                    eventName: value === "Normal" ? "" : prev.eventName,
                  }));
                }}
                className="flex h-10 w-full rounded-md border border-border bg-input px-3 py-2 text-sm"
              >
                <option value="Normal">Normal Day Sales</option>
                <option value="Event">Event Sales</option>
              </select>
            </div>
            {formData.event === "Event" && (
              <div className="space-y-2">
                <Label htmlFor="eventName">Event Name</Label>
                <Input
                  id="eventName"
                  name="eventName"
                  type="text"
                  value={formData.eventName || ""}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      eventName: e.target.value,
                    }));
                  }}
                  className="bg-input border-border"
                  placeholder="Enter event name"
                />
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent/90"
            >
              {loading ? "Recording..." : "Record Sale"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Money Split</CardTitle>
          <CardDescription>Automatic allocation from this sale</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg border border-border">
            <p className="text-sm text-muted-foreground mb-2">Total Sales</p>
            <p className="text-2xl font-bold text-foreground">
              GHS {totalSales}
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded border border-border">
              <span className="text-sm text-foreground">Production Cost</span>
              <span className="font-semibold text-accent">
                GHS {productionCost}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded border border-border">
              <span className="text-sm text-foreground">
                Tithe (1.20 GHS/piece)
              </span>
              <span className="font-semibold text-red-400">GHS {tithe}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded border border-border">
              <span className="text-sm text-foreground">
                Founder Pay (1.50 GHS/piece)
              </span>
              <span className="font-semibold text-purple-400">
                GHS {founderPay}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded border border-border">
              <span className="text-sm text-foreground">
                Business Savings (1.00 GHS/piece)
              </span>
              <span className="font-semibold text-green-400">
                GHS {businessSavings}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded border border-border">
              <span className="text-sm text-foreground">
                Leadership Payroll (1.00 GHS/piece)
              </span>
              <span className="font-semibold text-cyan-400">
                GHS {leadershipPayroll}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded border border-border">
              <span className="text-sm text-foreground">
                Sales Payroll (2.70 GHS/piece)
              </span>
              <span className="font-semibold text-cyan-400">
                GHS {salesPayroll}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded border border-border">
              <span className="text-sm text-foreground">
                Sales Payroll Savings (0.30 GHS/piece)
              </span>
              <span className="font-semibold text-green-400">
                GHS {salesPayrollSavings}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded border border-border">
              <span className="text-sm text-foreground">
                Packaging Payroll (0.50 GHS/piece)
              </span>
              <span className="font-semibold text-cyan-400">
                GHS {packagingPayroll}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded border border-border">
              <span className="text-sm text-foreground">
                Investor Share (1.80 GHS/piece)
              </span>
              <span className="font-semibold text-purple-400">
                GHS {investorShare}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded border border-border">
              <span className="text-sm text-foreground">
                Reinvestment (2.00 GHS/piece)
              </span>
              <span className="font-semibold text-green-400">
                GHS {reinvestment}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
