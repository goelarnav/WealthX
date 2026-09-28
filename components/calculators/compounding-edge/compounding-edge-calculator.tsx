"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Wallet, TrendingUp, AlertCircle, Percent } from "lucide-react";
import { compareScenarios, type ScenarioAssumptions } from "@/lib/calculators/compounding-edge";
import { formatInrCompact, formatPercentPrecise } from "@/lib/calculators/format";
import { formatInr } from "@/lib/format";
import { CHART_COLORS } from "@/lib/calculators/chart-colors";
import { CurrencyField } from "@/components/calculators/currency-field";
import { SliderField } from "@/components/calculators/slider-field";
import { CalcStatCard } from "@/components/calculators/calc-stat-card";
import { CalcDataTable, type CalcTableColumn } from "@/components/calculators/calc-data-table";
import { ScenarioPanel } from "@/components/calculators/compounding-edge/scenario-panel";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// Scenario B isn't just "a better return" — it also assumes a disciplined
// annual step-up, which is usually the bigger lever in practice. Showing
// both levers moving together is the point of this calculator.
const DEFAULTS = {
  initialCorpus: 1_000_000,
  years: 20,
  scenarioA: { monthlySip: 10_000, stepUpPct: 0, returnPct: 10 } satisfies ScenarioAssumptions,
  scenarioB: { monthlySip: 10_000, stepUpPct: 10, returnPct: 12 } satisfies ScenarioAssumptions,
};

interface YearlyCompareRow {
  year: number;
  a: number;
  b: number;
  difference: number;
}

export function CompoundingEdgeCalculator() {
  const [initialCorpus, setInitialCorpus] = useState(DEFAULTS.initialCorpus);
  const [years, setYears] = useState(DEFAULTS.years);

  const [aMonthlySip, setAMonthlySip] = useState(DEFAULTS.scenarioA.monthlySip);
  const [aStepUpPct, setAStepUpPct] = useState(DEFAULTS.scenarioA.stepUpPct);
  const [aReturnPct, setAReturnPct] = useState(DEFAULTS.scenarioA.returnPct);

  const [bMonthlySip, setBMonthlySip] = useState(DEFAULTS.scenarioB.monthlySip);
  const [bStepUpPct, setBStepUpPct] = useState(DEFAULTS.scenarioB.stepUpPct);
  const [bReturnPct, setBReturnPct] = useState(DEFAULTS.scenarioB.returnPct);

  const result = useMemo(
    () =>
      compareScenarios(
        initialCorpus,
        years,
        { monthlySip: aMonthlySip, stepUpPct: aStepUpPct, returnPct: aReturnPct },
        { monthlySip: bMonthlySip, stepUpPct: bStepUpPct, returnPct: bReturnPct },
      ),
    [initialCorpus, years, aMonthlySip, aStepUpPct, aReturnPct, bMonthlySip, bStepUpPct, bReturnPct],
  );

  const yearlyCompare: YearlyCompareRow[] = useMemo(
    () =>
      result.scenarioA.yearlyData.map((row, index) => ({
        year: row.year,
        a: row.closingBalance,
        b: result.scenarioB.yearlyData[index].closingBalance,
        difference: result.scenarioB.yearlyData[index].closingBalance - row.closingBalance,
      })),
    [result],
  );

  const barData = [
    { name: "Scenario A", value: result.scenarioA.finalCorpus },
    { name: "Scenario B", value: result.scenarioB.finalCorpus },
  ];

  const tableColumns: CalcTableColumn<YearlyCompareRow>[] = useMemo(
    () => [
      { key: "year", header: "Year", align: "center", render: (r) => r.year },
      { key: "a", header: "Scenario A", align: "right", render: (r) => formatInrCompact(r.a) },
      { key: "b", header: "Scenario B", align: "right", render: (r) => formatInrCompact(r.b) },
      {
        key: "difference",
        header: "Difference",
        align: "right",
        render: (r) => (
          <span className={r.difference >= 0 ? "text-teal-700" : "text-rose-600"}>
            {r.difference >= 0 ? "+" : ""}
            {formatInrCompact(r.difference)}
          </span>
        ),
      },
    ],
    [],
  );

  const isShortfall = result.wealthDifference < 0;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Your details</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <CurrencyField id="sc-initial-corpus" label="Initial Corpus" value={initialCorpus} onChange={setInitialCorpus} />
          <SliderField id="sc-years" label="Investment Duration" value={years} onChange={setYears} min={1} max={40} suffix=" yrs" />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ScenarioPanel accent="slate" label="Scenario A">
          <CurrencyField id="sc-a-sip" label="Monthly SIP Contribution" value={aMonthlySip} onChange={setAMonthlySip} />
          <SliderField id="sc-a-stepup" label="Annual Step-Up" value={aStepUpPct} onChange={setAStepUpPct} min={0} max={20} suffix=" %" />
          <SliderField
            id="sc-a-return"
            label="Annualised Return"
            value={aReturnPct}
            onChange={setAReturnPct}
            min={0}
            max={30}
            step={0.5}
            suffix=" %"
          />
        </ScenarioPanel>

        <ScenarioPanel accent="teal" label="Scenario B">
          <CurrencyField id="sc-b-sip" label="Monthly SIP Contribution" value={bMonthlySip} onChange={setBMonthlySip} />
          <SliderField id="sc-b-stepup" label="Annual Step-Up" value={bStepUpPct} onChange={setBStepUpPct} min={0} max={20} suffix=" %" />
          <SliderField
            id="sc-b-return"
            label="Annualised Return"
            value={bReturnPct}
            onChange={setBReturnPct}
            min={0}
            max={30}
            step={0.5}
            suffix=" %"
          />
        </ScenarioPanel>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <CalcStatCard label="Scenario A — Final Corpus" value={formatInrCompact(result.scenarioA.finalCorpus)} icon={Wallet} tone="neutral" />
        <CalcStatCard label="Scenario B — Final Corpus" value={formatInrCompact(result.scenarioB.finalCorpus)} icon={Wallet} tone="teal" />
        <CalcStatCard
          label={isShortfall ? "Wealth Shortfall" : "Additional Wealth Created"}
          value={formatInrCompact(Math.abs(result.wealthDifference))}
          sublabel={isShortfall ? "Scenario B trails Scenario A" : "by Scenario B over Scenario A"}
          icon={isShortfall ? AlertCircle : TrendingUp}
          tone={isShortfall ? "rose" : "teal"}
        />
        <CalcStatCard
          label="% More Wealth"
          value={result.percentMoreWealth != null ? formatPercentPrecise(result.percentMoreWealth) : "N/A"}
          sublabel={result.wealthMultiplier != null ? `${result.wealthMultiplier.toFixed(2)}× Scenario A` : undefined}
          icon={Percent}
          tone={result.percentMoreWealth == null ? "neutral" : isShortfall ? "rose" : "teal"}
        />
      </div>

      <div className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        <Tabs defaultValue="comparison">
          <TabsList>
            <TabsTrigger value="comparison">Wealth Comparison</TabsTrigger>
            <TabsTrigger value="growth">Growth Over Time</TabsTrigger>
            <TabsTrigger value="table">Year-wise</TabsTrigger>
          </TabsList>

          <TabsContent value="comparison" className="pt-4">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
                  <XAxis dataKey="name" stroke={CHART_COLORS.axis} fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke={CHART_COLORS.axis}
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => formatInrCompact(v)}
                    width={64}
                  />
                  <Tooltip formatter={(value) => [formatInr(Number(value)), "Final Corpus"]} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={120}>
                    {barData.map((row) => (
                      <Cell key={row.name} fill={row.name === "Scenario A" ? CHART_COLORS.slate : CHART_COLORS.teal} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="growth" className="pt-4">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={yearlyCompare} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
                  <XAxis dataKey="year" stroke={CHART_COLORS.axis} fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke={CHART_COLORS.axis}
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => formatInrCompact(v)}
                    width={64}
                  />
                  <Tooltip
                    formatter={(value, name) => {
                      const labels: Record<string, string> = { a: "Scenario A", b: "Scenario B" };
                      const key = String(name);
                      return [formatInr(Number(value)), labels[key] ?? key];
                    }}
                    labelFormatter={(label) => `Year ${label}`}
                  />
                  <Line type="monotone" dataKey="a" name="a" stroke={CHART_COLORS.slate} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="b" name="b" stroke={CHART_COLORS.teal} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="table" className="pt-4">
            <CalcDataTable columns={tableColumns} rows={yearlyCompare} getRowKey={(r) => r.year} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
