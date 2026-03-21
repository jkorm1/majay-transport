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
import { AlertCircle } from "lucide-react";
import { validateWithdrawal } from "@/lib/validation";

export default function WithdrawalsForm({ onSuccess }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("withdrawal");
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    purpose: "",
    amount: "",
    type: "withdrawal", // Add this field
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
    console.log("Withdrawal form submission started"); // Debug log

    const validationErrors = validateWithdrawal({
      ...formData,
      type: activeTab,
    });

    if (validationErrors.length > 0) {
      const errorMap = validationErrors.reduce((acc, err) => {
        acc[err.field] = err.message;
        return acc;
      }, {} as Record<string, string>);
      setErrors(errorMap);
      toast({
        title: "Validation Error",
        description: "Please fix errors in the form",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const endpoint =
        activeTab === "withdrawal" ? "/api/withdrawals" : "/api/repayments";
      const submissionData = {
        ...formData,
        type: activeTab,
        amount: Number(formData.amount),
      };

      console.log("Submitting withdrawal data:", submissionData); // Debug log

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      const responseData = await response.json();
      console.log("Withdrawal API response:", responseData); // Debug log

      if (response.ok) {
        toast({
          title: "Success",
          description:
            activeTab === "withdrawal"
              ? "Withdrawal recorded"
              : "Repayment recorded",
        });
        setFormData({
          date: new Date().toISOString().split("T")[0],
          purpose: "",
          amount: "",
          type: activeTab,
        });
        setErrors({});
        onSuccess();
      } else {
        toast({
          title: "Error",
          description: responseData.error || "Failed to record transaction",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Withdrawal submission error:", error); // Debug log
      toast({
        title: "Error",
        description: "Failed to record transaction",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-card border-border max-w-2xl">
      <CardHeader>
        <CardTitle>Owner Transactions</CardTitle>
        <CardDescription>Track withdrawals and repayments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-6 border-b border-border">
          <button
            onClick={() => setActiveTab("withdrawal")}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "withdrawal"
                ? "text-accent border-b-2 border-accent"
                : "text-muted-foreground"
            }`}
          >
            Record Withdrawal
          </button>
          <button
            onClick={() => setActiveTab("repayment")}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "repayment"
                ? "text-accent border-b-2 border-accent"
                : "text-muted-foreground"
            }`}
          >
            Record Repayment
          </button>
        </div>

        {activeTab === "withdrawal" && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/50 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
            <div className="text-sm text-foreground">
              <p className="font-semibold">Money owed to business</p>
              <p className="text-muted-foreground">
                Track personal withdrawals that will need to be repaid
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
              <Label htmlFor="amount">Amount (GHS)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0"
                className={`bg-input border-border ${
                  errors.amount ? "border-destructive" : ""
                }`}
                required
              />
              {errors.amount && (
                <p className="text-xs text-destructive">{errors.amount}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="purpose">
              {activeTab === "withdrawal" ? "Purpose" : "Notes"}
            </Label>
            <Input
              id="purpose"
              name="purpose"
              type="text"
              value={formData.purpose}
              onChange={handleChange}
              placeholder={
                activeTab === "withdrawal"
                  ? "e.g., Personal use"
                  : "e.g., Loan repayment"
              }
              className="bg-input border-border"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accent/90"
            onClick={(e) => {
              console.log("Withdrawal button clicked"); // Debug log
              handleSubmit(e);
            }}
          >
            {loading
              ? "Recording..."
              : activeTab === "withdrawal"
              ? "Record Withdrawal"
              : "Record Repayment"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
