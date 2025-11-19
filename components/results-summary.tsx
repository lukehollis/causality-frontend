"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle2, XCircle, TrendingUp, TrendingDown } from "lucide-react";

interface MainResults {
  treatment_effect: number;
  std_error: number;
  p_value: number;
  confidence_interval: number[];
  method: string;
  n_treated: number;
  n_control: number;
}

interface PreTrendsTest {
  test_statistic: number;
  p_value: number;
  result: string;
  interpretation: string;
}

interface BalanceRow {
  covariate: string;
  treated_mean: number;
  control_mean: number;
  difference: number;
  p_value: number;
  standardized_diff: number;
}

interface HeterogeneityResult {
  subgroup: string;
  effect: number;
  std_error: number;
  p_value: number;
  n_obs: number;
}

interface RobustnessCheck {
  check_name: string;
  description: string;
  effect_estimate: number;
  p_value: number;
  interpretation: string;
}

interface ResultsSummaryProps {
  mainResults: MainResults;
  preTrends: PreTrendsTest;
  balanceTable: BalanceRow[];
  heterogeneity: HeterogeneityResult[];
  robustnessChecks: RobustnessCheck[];
  metadata?: Record<string, any>;
}

export function ResultsSummary({
  mainResults,
  preTrends,
  balanceTable,
  heterogeneity,
  robustnessChecks,
  metadata,
}: ResultsSummaryProps) {
  const formatNumber = (num: number, decimals = 3) => {
    return num.toFixed(decimals);
  };

  const getSignificanceBadge = (pValue: number) => {
    if (pValue < 0.01) {
      return <Badge variant="default">p &lt; 0.01 ***</Badge>;
    } else if (pValue < 0.05) {
      return <Badge variant="default">p &lt; 0.05 **</Badge>;
    } else if (pValue < 0.1) {
      return <Badge variant="secondary">p &lt; 0.10 *</Badge>;
    } else {
      return <Badge variant="outline">Not significant</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Main Treatment Effect
          </CardTitle>
          <CardDescription>
            Primary causal estimate using {mainResults.method}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Effect Estimate</p>
              <p className="text-2xl font-bold">
                {formatNumber(mainResults.treatment_effect)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Std. Error</p>
              <p className="text-2xl font-semibold">
                {formatNumber(mainResults.std_error)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">95% CI</p>
              <p className="text-lg font-semibold">
                [{formatNumber(mainResults.confidence_interval[0])},{" "}
                {formatNumber(mainResults.confidence_interval[1])}]
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Significance</p>
              {getSignificanceBadge(mainResults.p_value)}
            </div>
          </div>
          <div className="flex gap-4 text-sm text-muted-foreground pt-2 border-t">
            <span>
              <strong>Treated:</strong> {mainResults.n_treated} units
            </span>
            <span>
              <strong>Control:</strong> {mainResults.n_control} units
            </span>
            <span>
              <strong>P-value:</strong> {formatNumber(mainResults.p_value, 4)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Pre-Trends Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {preTrends.result === "PASS" ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            Parallel Trends Test
          </CardTitle>
          <CardDescription>
            Tests whether treatment and control groups had similar trends before
            intervention
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Test Result:</span>
            <Badge
              variant={preTrends.result === "PASS" ? "default" : "destructive"}
            >
              {preTrends.result}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Test Statistic:</span>
              <span className="ml-2 font-semibold">
                {formatNumber(preTrends.test_statistic)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">P-value:</span>
              <span className="ml-2 font-semibold">
                {formatNumber(preTrends.p_value, 4)}
              </span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground pt-2 border-t">
            {preTrends.interpretation}
          </p>
        </CardContent>
      </Card>

      {/* Balance Table */}
      {balanceTable && balanceTable.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Covariate Balance</CardTitle>
            <CardDescription>
              Comparison of baseline characteristics between treatment and control
              groups
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Covariate</TableHead>
                  <TableHead className="text-right">Treated Mean</TableHead>
                  <TableHead className="text-right">Control Mean</TableHead>
                  <TableHead className="text-right">Difference</TableHead>
                  <TableHead className="text-right">Std. Diff</TableHead>
                  <TableHead className="text-right">P-value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {balanceTable.map((row) => {
                  const isImbalanced = Math.abs(row.standardized_diff) > 0.1;
                  return (
                    <TableRow key={row.covariate} className={isImbalanced ? "bg-yellow-50 dark:bg-yellow-950/20" : ""}>
                      <TableCell className="font-medium">
                        {row.covariate}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(row.treated_mean)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(row.control_mean)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(row.difference)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={isImbalanced ? "font-semibold" : ""}>
                          {formatNumber(row.standardized_diff)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(row.p_value, 4)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <p className="text-xs text-muted-foreground mt-2">
              Note: Rows highlighted indicate standardized difference &gt; 0.1,
              suggesting potential imbalance
            </p>
          </CardContent>
        </Card>
      )}

      {/* Heterogeneous Effects */}
      {heterogeneity && heterogeneity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Heterogeneous Treatment Effects</CardTitle>
            <CardDescription>
              Treatment effect variation across subgroups
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {heterogeneity.map((result) => (
                <Card key={result.subgroup}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      {result.subgroup}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Effect:
                      </span>
                      <span className="font-bold">
                        {formatNumber(result.effect)} (SE:{" "}
                        {formatNumber(result.std_error)})
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Significance:
                      </span>
                      {getSignificanceBadge(result.p_value)}
                    </div>
                    <div className="text-xs text-muted-foreground pt-1 border-t">
                      N = {result.n_obs} observations
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Robustness Checks */}
      {robustnessChecks && robustnessChecks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Robustness Checks</CardTitle>
            <CardDescription>
              Alternative specifications and sensitivity analyses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {robustnessChecks.map((check) => (
              <div key={check.check_name} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">{check.check_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {check.description}
                    </p>
                  </div>
                  {getSignificanceBadge(check.p_value)}
                </div>
                <div className="flex gap-4 text-sm">
                  <span>
                    <strong>Estimate:</strong>{" "}
                    {formatNumber(check.effect_estimate)}
                  </span>
                  <span>
                    <strong>P-value:</strong>{" "}
                    {formatNumber(check.p_value, 4)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground pt-1 border-t">
                  {check.interpretation}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      {metadata && Object.keys(metadata).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Metadata</CardTitle>
            <CardDescription>
              Dataset and estimation details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              {Object.entries(metadata).map(([key, value]) => (
                <div key={key}>
                  <span className="text-muted-foreground">
                    {key.replace(/_/g, " ")}:
                  </span>
                  <span className="ml-2 font-semibold">
                    {typeof value === "object"
                      ? JSON.stringify(value)
                      : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
