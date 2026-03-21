// majay/components/financial-statements.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { calculateMonthlyProjection } from "@/lib/financial-logic";

interface FinancialStatementsProps {
  data: any;
}

export default function FinancialStatements({
  data,
}: FinancialStatementsProps) {
  const [dailyTarget, setDailyTarget] = useState(600); // Default daily revenue target
  const [projection, setProjection] = useState<any>(null);

  useEffect(() => {
    setProjection(calculateMonthlyProjection(dailyTarget));
  }, [dailyTarget]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Financial Projections</CardTitle>
          <CardDescription>
            Projected revenue and splits based on daily revenue target
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Daily Revenue Target (GHS)
              </label>
              <input
                type="number"
                value={dailyTarget}
                onChange={(e) => setDailyTarget(Number(e.target.value))}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              />
            </div>

            {projection && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Daily Projections
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Revenue:</div>
                    <div className="text-right font-medium">
                      GHS {projection.daily.revenue.toFixed(2)}
                    </div>

                    <div>Investor Payback (45%):</div>
                    <div className="text-right font-medium text-green-600">
                      GHS {projection.daily.investorPayback.toFixed(2)}
                    </div>

                    <div>Operating Expenses (25%):</div>
                    <div className="text-right font-medium text-orange-600">
                      GHS {projection.daily.operatingExpenses.toFixed(2)}
                    </div>

                    <div>Maintenance Fund (15%):</div>
                    <div className="text-right font-medium text-purple-600">
                      GHS {projection.daily.maintenanceFund.toFixed(2)}
                    </div>

                    <div>Management/Labor (15%):</div>
                    <div className="text-right font-medium text-cyan-600">
                      GHS {projection.daily.managementLabor.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Monthly Projections
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Revenue:</div>
                    <div className="text-right font-medium">
                      GHS {projection.monthly.revenue.toFixed(2)}
                    </div>

                    <div>Investor Payback (45%):</div>
                    <div className="text-right font-medium text-green-600">
                      GHS {projection.monthly.investorPayback.toFixed(2)}
                    </div>

                    <div>Operating Expenses (25%):</div>
                    <div className="text-right font-medium text-orange-600">
                      GHS {projection.monthly.operatingExpenses.toFixed(2)}
                    </div>

                    <div>Maintenance Fund (15%):</div>
                    <div className="text-right font-medium text-purple-600">
                      GHS {projection.monthly.maintenanceFund.toFixed(2)}
                    </div>

                    <div>Management/Labor (15%):</div>
                    <div className="text-right font-medium text-cyan-600">
                      GHS {projection.monthly.managementLabor.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Yearly Projections
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Revenue:</div>
                    <div className="text-right font-medium">
                      GHS {projection.yearly.revenue.toFixed(2)}
                    </div>

                    <div>Investor Payback (45%):</div>
                    <div className="text-right font-medium text-green-600">
                      GHS {projection.yearly.investorPayback.toFixed(2)}
                    </div>

                    <div>Operating Expenses (25%):</div>
                    <div className="text-right font-medium text-orange-600">
                      GHS {projection.yearly.operatingExpenses.toFixed(2)}
                    </div>

                    <div>Maintenance Fund (15%):</div>
                    <div className="text-right font-medium text-purple-600">
                      GHS {projection.yearly.maintenanceFund.toFixed(2)}
                    </div>

                    <div>Management/Labor (15%):</div>
                    <div className="text-right font-medium text-cyan-600">
                      GHS {projection.yearly.managementLabor.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {data && (
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
                    {data.paybackProgress?.percentage?.toFixed(1) || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-green-600 h-2.5 rounded-full"
                    style={{
                      width: `${data.paybackProgress?.percentage || 0}%`,
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
                    GHS {data.totalInvestorPayback?.toFixed(2) || 0}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Remaining</div>
                  <div className="text-2xl font-bold text-orange-600">
                    GHS {data.paybackProgress?.remaining?.toFixed(2) || 90000}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">
                  Estimated time to complete payback
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {data.paybackProgress?.estimatedDays || 0} days
                </div>
                <div className="text-sm text-muted-foreground">
                  Approximately{" "}
                  {(data.paybackProgress?.estimatedDays / 26 || 0).toFixed(1)}{" "}
                  months
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
