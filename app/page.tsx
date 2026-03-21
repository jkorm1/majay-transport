// majay/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Dashboard from "@/components/dashboard";
import RevenueForm from "@/components/revenue-form";
import ExpensesForm from "@/components/expenses-form";
import MaintenanceForm from "@/components/maintenance-form";
import FinancialStatements from "@/components/financial-statements";
import { useAuth } from "@/contexts/auth-context";

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { investorName } = useAuth();

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/dashboard");
      const result = await response.json();
      setData(result);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <h1 className="text-3xl font-bold text-foreground">
            MaJay Transportation
            {investorName && (
              <span className="ml-2 text-sm text-muted-foreground">
                (Welcome, {investorName})
              </span>
            )}
          </h1>
          <p className="text-muted-foreground mt-2">
            Strategic Partnership Dashboard
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {data && (
          <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  GHS {data.totalRevenue?.toFixed(2) || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Investor Payback Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {data.paybackProgress?.percentage?.toFixed(1) || 0}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  GHS {data.paybackProgress?.remaining?.toFixed(2) || 0}{" "}
                  remaining
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Expenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  GHS {data.totalExpenses?.toFixed(2) || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Net Profit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${data.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  GHS {data.netProfit?.toFixed(2) || 0}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="bg-muted border border-border rounded-lg p-1 mb-4">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 bg-transparent border-0 bg-muted border border-border gap-1 auto-rows-min pd-3 mb-4">
              <TabsTrigger value="dashboard" className="text-xs md:text-sm">
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="revenue" className="text-xs md:text-sm">
                Daily Revenue
              </TabsTrigger>
              <TabsTrigger value="expenses" className="text-xs md:text-sm">
                Expenses
              </TabsTrigger>
              <TabsTrigger value="maintenance" className="text-xs md:text-sm">
                Maintenance
              </TabsTrigger>
              <TabsTrigger value="statements" className="text-xs md:text-sm">
                Statements
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard" className="mt-6">
            <Dashboard data={data} onRefresh={fetchData} />
          </TabsContent>

          <TabsContent value="revenue" className="mt-6">
            <RevenueForm onSuccess={fetchData} />
          </TabsContent>

          <TabsContent value="expenses" className="mt-6">
            <ExpensesForm onSuccess={fetchData} />
          </TabsContent>

          <TabsContent value="maintenance" className="mt-6">
            <MaintenanceForm onSuccess={fetchData} />
          </TabsContent>

          <TabsContent value="statements" className="mt-6">
            <FinancialStatements data={data} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
