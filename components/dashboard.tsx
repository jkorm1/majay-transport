// majay/components/dashboard.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface DashboardProps {
  data: any;
  onRefresh: () => void;
}

export default function Dashboard({ data, onRefresh }: DashboardProps) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  // Data for the Financial Summary Pie Chart
  const financialData = [
    { name: "Payback", value: data?.totalInvestorPayback || 0 },
    { name: "Total Expenses", value: data?.totalExpenses || 0 },
    { name: "Labor", value: data?.totalManagementLabor || 0 },
    { name: "Maintenance", value: data?.totalMaintenanceFund || 0 },
  ];

  const COLORS = ["#16a34a", "#dc2626", "#0891b2", "#a855f7"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">MaJay Transportation Dashboard</h2>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {refreshing ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              GHS {data?.totalRevenue?.toFixed(2) || 0}
            </div>
            <p className="text-sm text-green-600 mt-1">
              in {data?.uniqueDaysCount || 0} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Investor Payback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              GHS {data?.totalInvestorPayback?.toFixed(2) || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">45% of revenue</p>
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
              GHS {data?.totalOperatingExpenses?.toFixed(2) || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">25% of revenue</p>
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
              GHS {data?.totalMaintenanceFund?.toFixed(2) || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">15% of revenue</p>
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
              GHS {data?.totalManagementLabor?.toFixed(2) || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">15% of revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              GHS {data?.totalExpenses?.toFixed(2) || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Investment Payback Progress</CardTitle>
            <CardDescription>
              Progress towards the GH₵ 90,000 investment from Michael Quainoo
              Mallen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Payback Progress</span>
                  <span className="text-sm font-medium">
                    {data?.paybackProgress?.percentage?.toFixed(1) || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-green-600 h-2.5 rounded-full"
                    style={{
                      width: `${data?.paybackProgress?.percentage || 0}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">
                    Total Payback
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    GHS {data?.totalInvestorPayback?.toFixed(2) || 0}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Remaining</div>
                  <div className="text-2xl font-bold text-orange-600">
                    GHS {data?.paybackProgress?.remaining?.toFixed(2) || 90000}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">
                  Estimated time to complete payback
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {data?.paybackProgress?.estimatedDays || 0} days
                </div>
                <div className="text-sm text-muted-foreground">
                  Approximately{" "}
                  {(data?.paybackProgress?.estimatedDays / 26 || 0).toFixed(1)}{" "}
                  months
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
            <CardDescription>Revenue distribution overview</CardDescription>
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
                    label={(entry) => `${entry.name}`}
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

      {data?.driverPerformance && data.driverPerformance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Driver Performance</CardTitle>
            <CardDescription>Revenue and payback by driver</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.driverPerformance}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="driverName" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => `GHS ${value.toFixed(2)}`}
                  />
                  <Legend />
                  <Bar
                    dataKey="totalRevenue"
                    name="Total Revenue"
                    fill="#3b82f6"
                  />
                  <Bar
                    dataKey="totalPayback"
                    name="Total Payback"
                    fill="#16a34a"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
