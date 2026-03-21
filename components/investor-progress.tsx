import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/auth-context";
import { useState, useEffect } from "react";

const INVESTOR_TARGET = 18000;
const SALES_TARGET = 151200;
const PIECE_TARGET = 15120;

export default function InvestorProgress({
  salesData = [],
}: {
  salesData?: Array<{
    total: number;
    quantity: number;
  }>;
}) {
  const { investorName } = useAuth();
  const [loading, setLoading] = useState(true);

  // Calculate totals from sales data with safe defaults
  const totals = (salesData || []).reduce(
    (acc, sale) => {
      const total = Number(sale?.total) || 0;
      return {
        total: acc.total + total,
        totalPieces: acc.totalPieces + (Number(sale?.quantity) || 0),
        investorShare: acc.investorShare + total * 0.12, // Calculate 12% of total
      };
    },
    { total: 0, totalPieces: 0, investorShare: 0 },
  );

  const investorPercentage = Math.min(
    (totals.investorShare / INVESTOR_TARGET) * 100,
    100,
  );
  const investorRemaining = Math.max(INVESTOR_TARGET - totals.investorShare, 0);

  const salesPercentage = Math.min((totals.total / SALES_TARGET) * 100, 100);
  const salesRemaining = Math.max(SALES_TARGET - totals.total, 0);

  const piecesPercentage = Math.min(
    (totals.totalPieces / PIECE_TARGET) * 100,
    100,
  );
  const piecesRemaining = Math.max(PIECE_TARGET - totals.totalPieces, 0);

  useEffect(() => {
    setLoading(false);
  }, [salesData]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">
          Investment Progress
          {investorName && (
            <span className="ml-2 text-sm text-muted-foreground">
              ({investorName})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-2">
            <div className="h-2 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-2 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-2 w-full bg-gray-200 rounded animate-pulse" />
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Investment Target</span>
                <span className="font-medium">
                  GHS{" "}
                  {totals.investorShare.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  / GHS{" "}
                  {INVESTOR_TARGET.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <Progress value={investorPercentage} className="w-full" />
              <div className="text-sm text-muted-foreground">
                {investorPercentage.toFixed(1)}% - GHS{" "}
                {investorRemaining.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                remaining
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Sales Target</span>
                <span className="font-medium">
                  GHS{" "}
                  {totals.total.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  / GHS{" "}
                  {SALES_TARGET.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <Progress value={salesPercentage} className="w-full" />
              <div className="text-sm text-muted-foreground">
                {salesPercentage.toFixed(1)}% - GHS{" "}
                {salesRemaining.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                remaining
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Pieces Target</span>
                <span className="font-medium">
                  {totals.totalPieces.toLocaleString()} /{" "}
                  {PIECE_TARGET.toLocaleString()} pieces
                </span>
              </div>
              <Progress value={piecesPercentage} className="w-full" />
              <div className="text-sm text-muted-foreground">
                {piecesPercentage.toFixed(1)}% -{" "}
                {piecesRemaining.toLocaleString()} pieces remaining
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
