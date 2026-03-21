// majay/app/tables/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RevenueTable from "@/components/revenue-table";
import ExpensesTable from "@/components/expenses-table";
import MaintenanceTable from "@/components/maintenance-table";
import DriverPerformanceTable from "@/components/driver-performance-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function TablesPage() {
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalInvestorPayback: 0,
    totalOperatingExpenses: 0,
    totalMaintenanceFund: 0,
    totalManagementLabor: 0,
    totalExpenses: 0,
    totalMaintenanceCost: 0,
    netProfit: 0,
    paybackProgress: {
      percentage: 0,
      remaining: 90000,
      estimatedDays: 0,
    },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/dashboard");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to fetch data");
        }

        setSummary({
          totalRevenue: result.totalRevenue || 0,
          totalInvestorPayback: result.totalInvestorPayback || 0,
          totalOperatingExpenses: result.totalOperatingExpenses || 0,
          totalMaintenanceFund: result.totalMaintenanceFund || 0,
          totalManagementLabor: result.totalManagementLabor || 0,
          totalExpenses: result.totalExpenses || 0,
          totalMaintenanceCost: result.totalMaintenanceCost || 0,
          netProfit: result.netProfit || 0,
          paybackProgress: result.paybackProgress || {
            percentage: 0,
            remaining: 90000,
            estimatedDays: 0,
          },
        });
      } catch (error) {
        console.error("Failed to load summary:", error);
        setSummary({
          totalRevenue: 0,
          totalInvestorPayback: 0,
          totalOperatingExpenses: 0,
          totalMaintenanceFund: 0,
          totalManagementLabor: 0,
          totalExpenses: 0,
          totalMaintenanceCost: 0,
          netProfit: 0,
          paybackProgress: {
            percentage: 0,
            remaining: 90000,
            estimatedDays: 0,
          },
        });
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, []);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Tables</h1>
          <p className="text-muted-foreground">
            View and analyze your transportation business data
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-24"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                GHS {summary.totalRevenue.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Investor Payback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                GHS {summary.totalInvestorPayback.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {summary.paybackProgress.percentage.toFixed(1)}% of GHS 90,000
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Operating Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                GHS {summary.totalOperatingExpenses.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                25% of revenue
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Maintenance Fund
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                GHS {summary.totalMaintenanceFund.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                15% of revenue
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Management/Labor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-600">
                GHS {summary.totalManagementLabor.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                15% of revenue
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                GHS {summary.totalExpenses.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Maintenance Cost
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">
                GHS {summary.totalMaintenanceCost.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${summary.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                GHS {summary.netProfit.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Payback Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {summary.paybackProgress.estimatedDays} days
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Estimated to complete
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="revenue" className="space-y-4">
        <div className="bg-muted border border-border rounded-lg p-1 mb-4">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-muted border border-border auto-rows-min pd-3 mb-4">
            <TabsTrigger
              value="revenue"
              className="flex items-center gap-2 text-xs md:text-sm"
            >
              Daily Revenue
            </TabsTrigger>
            <TabsTrigger
              value="expenses"
              className="flex items-center gap-2 text-xs md:text-sm"
            >
              Expenses
            </TabsTrigger>
            <TabsTrigger
              value="maintenance"
              className="flex items-center gap-2 text-xs md:text-sm"
            >
              Maintenance Log
            </TabsTrigger>
            <TabsTrigger
              value="drivers"
              className="flex items-center gap-2 text-xs md:text-sm"
            >
              Driver Performance
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Revenue Records</CardTitle>
              <CardDescription>
                View all daily revenue records and their financial breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Expense Records</CardTitle>
              <CardDescription>
                Track and analyze all business expenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExpensesTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Log</CardTitle>
              <CardDescription>
                Track vehicle maintenance and repairs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MaintenanceTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drivers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Driver Performance Summary</CardTitle>
              <CardDescription>
                Monthly breakdown of driver performance and earnings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DriverPerformanceTable />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
