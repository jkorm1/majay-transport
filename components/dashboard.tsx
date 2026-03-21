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
            <CardDescription>Overview of financial performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">
                    Total Expenses
                  </div>
                  <div className="text-2xl font-bold text-red-600">
                    GHS {data?.totalExpenses?.toFixed(2) || 0}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    Maintenance Cost
                  </div>
                  <div className="text-2xl font-bold text-red-600">
                    GHS {data?.totalMaintenanceCost?.toFixed(2) || 0}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">Net Profit</div>
                <div
                  className={`text-2xl font-bold ${data?.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  GHS {data?.netProfit?.toFixed(2) || 0}
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Revenue Split Model
                </div>
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Investor Payback:</span>
                    <span className="font-medium">45%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Operating Expenses:</span>
                    <span className="font-medium">25%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Maintenance Fund:</span>
                    <span className="font-medium">15%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Management/Labor:</span>
                    <span className="font-medium">15%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {data?.driverPerformance && data.driverPerformance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Driver Performance Summary</CardTitle>
            <CardDescription>
              Performance metrics for all drivers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.driverPerformance.map((driver: any, index: number) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">{driver.driverName}</h3>
                    <span className="text-sm text-muted-foreground">
                      {driver.daysWorked} days worked
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Total Revenue</div>
                      <div className="font-medium">
                        GHS {driver.totalRevenue.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Average Daily</div>
                      <div className="font-medium">
                        GHS{" "}
                        {(driver.totalRevenue / driver.daysWorked).toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Total Payback</div>
                      <div className="font-medium text-green-600">
                        GHS {driver.totalPayback.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">
                        Average Payback
                      </div>
                      <div className="font-medium text-green-600">
                        GHS{" "}
                        {(driver.totalPayback / driver.daysWorked).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
