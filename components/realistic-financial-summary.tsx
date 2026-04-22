// majay/components/realistic-financial-summary.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

export default function RealisticFinancialSummary() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const COLORS = ["#16a34a", "#dc2626", "#0891b2", "#a855f7"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/realistic-financial-summary");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || "Failed to fetch realistic financial summary",
          );
        }

        setData(result);
      } catch (err) {
        console.error("Error fetching realistic financial summary:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Realistic Financial Summary</CardTitle>
          <CardDescription>
            Actual financial breakdown based on expense categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">
              Loading realistic financial summary...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Realistic Financial Summary</CardTitle>
          <CardDescription>
            Actual financial breakdown based on expense categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-red-500">Error: {error}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const financialData = [
    {
      name: "Investor Payback",
      value: data?.realisticFinancialSummary?.investorPayback?.amount ?? 0,
      percentage:
        data?.realisticFinancialSummary?.investorPayback?.percentage ?? 0,
    },
    {
      name: "Operating Expenses",
      value: data?.realisticFinancialSummary?.operatingExpenses?.amount ?? 0,
      percentage:
        data?.realisticFinancialSummary?.operatingExpenses?.percentage ?? 0,
    },
    {
      name: "Maintenance Fund",
      value: data?.realisticFinancialSummary?.maintenanceFund?.amount ?? 0,
      percentage:
        data?.realisticFinancialSummary?.maintenanceFund?.percentage ?? 0,
    },
    {
      name: "Management/Labor",
      value: data?.realisticFinancialSummary?.managementLabor?.amount ?? 0,
      percentage:
        data?.realisticFinancialSummary?.managementLabor?.percentage ?? 0,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Investor Payback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              GHS{" "}
              {(
                data?.realisticFinancialSummary?.investorPayback?.amount ?? 0
              ).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {(
                data?.realisticFinancialSummary?.investorPayback?.percentage ??
                0
              ).toFixed(1)}
              % of revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Operating Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              GHS{" "}
              {(
                data?.realisticFinancialSummary?.operatingExpenses?.amount ?? 0
              ).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {(
                data?.realisticFinancialSummary?.operatingExpenses
                  ?.percentage ?? 0
              ).toFixed(1)}
              % of revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Maintenance Fund
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              GHS{" "}
              {(
                data?.realisticFinancialSummary?.maintenanceFund?.amount ?? 0
              ).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {(
                data?.realisticFinancialSummary?.maintenanceFund?.percentage ??
                0
              ).toFixed(1)}
              % of revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Management/Labor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-600">
              GHS{" "}
              {(
                data?.realisticFinancialSummary?.managementLabor?.amount ?? 0
              ).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {(
                data?.realisticFinancialSummary?.managementLabor?.percentage ??
                0
              ).toFixed(1)}
              % of revenue
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Realistic Financial Summary</CardTitle>
          <CardDescription>
            Actual financial breakdown based on expense categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={financialData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) =>
                    `${entry.name} (${entry.percentage.toFixed(1)}%)`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {financialData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => `GHS ${value.toFixed(2)}`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
