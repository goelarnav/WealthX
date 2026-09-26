"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { PiggyBank, Wallet, TrendingUp, Target as TargetIcon } from "lucide-react";
import { calculateSip } from "@/lib/calculators/sip";
import { formatInrCompact } from "@/lib/calculators/format";
import { formatInr } from "@/lib/format";
import { CHART_COLORS } from "@/lib/calculators/chart-colors";
import { CurrencyField } from "@/components/calculators/currency-field";
import { SliderField } from "@/components/calculators/slider-field";
import { CalcStatCard } from "@/components/calculators/calc-stat-card";
import { CalcDataTable, type CalcTableColumn } from "@/components/calculators/calc-data-table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const DEFAULTS = {
  currentAge: 30,
  retirementAge: 50,
  currentCorpus: 1_000_000,
  targetCorpus: 20_000_000,
  expectedReturnPct: 12,
  sipStepUpPct: 0,
};

type YearRow = ReturnType<typeof calculateSip>["yearlyData"][number];

export function SipCalculator() {
  const [currentAge, setCurrentAge] = useState(DEFAULTS.currentAge);
  const [retirementAge, setRetirementAge] = useState(DEFAULTS.retirementAge);
  const [currentCorpus, setCurrentCorpus] = useState(DEFAULTS.currentCorpus);
  const [targetCorpus, setTargetCorpus] = useState(DEFAULTS.targetCorpus);
  const [expectedReturnPct, setExpectedReturnPct] = useState(DEFAULTS.expectedReturnPct);
  const [sipStepUpPct, setSipStepUpPct] = useState(DEFAULTS.sipStepUpPct);

  const result = useMemo(() => {
    try {
      return calculateSip(currentCorpus, targetCorpus, currentAge, retirementAge, expectedReturnPct, sipStepUpPct);
    } catch {
      return null;
    }
  }, [currentCorpus, targetCorpus, currentAge, retirementAge, expectedReturnPct, sipStepUpPct]);

  const tableColumns: CalcTableColumn<YearRow>[] = useMemo(
    () => [
      { key: "age", header: "Age", align: "center", render: (r) => r.age },
      { key: "opening", header: "Opening Corpus", align: "right", render: (r) => formatInr(r.openingBalance) },
      { key: "sip", header: "Cumulative SIP", align: "right", render: (r) => formatInr(r.sipInvested - r.principalExisting) },
      { key: "interest", header: "Interest Earned", align: "right", render: (r) => formatInr(r.interestEarned) },
      { key: "closing", header: "Closing Corpus", align: "right", render: (r) => formatInr(r.closingBalance) },
      {
        key: "pct",
        header: "% of Target",
        align: "right",
        render: (r) => `${Math.min(999.9, (r.closingBalance / targetCorpus) * 100).toFixed(1)}%`,
      },
    ],
    [targetCorpus],
  );

  if (retirementAge <= currentAge) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
        Retirement age must be greater than current age.
      </div>
    );
  }

  if (!result) return null;

  const finalYear = result.yearlyData[result.yearlyData.length - 1];
  const yearsRemaining = retirementAge - currentAge;
  const actualFvCorpus =
    expectedReturnPct > 0 ? currentCorpus * Math.pow(1 + expectedReturnPct / 100 / 12, yearsRemaining * 12) : currentCorpus;
  const coveredPct = Math.min(100, Math.round((actualFvCorpus / targetCorpus) * 100));

  const sipInvestedTotal = finalYear.sipInvested - currentCorpus;
  const returnsTotal = finalYear.closingBalance - finalYear.sipInvested;
  const distributionData = [
    { name: "Existing Corpus", value: currentCorpus, fill: CHART_COLORS.slate },
    { name: "SIP Invested", value: sipInvestedTotal, fill: CHART_COLORS.teal },
    { name: "Returns", value: returnsTotal, fill: CHART_COLORS.amber },
  ].filter((d) => d.value > 0);

  const targetAchieved = result.shortfall <= 0;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Your details</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <SliderField id="sip-current-age" label="Current Age" value={currentAge} onChange={setCurrentAge} min={18} max={70} suffix=" yrs" />
          <SliderField
            id="sip-retirement-age"
            label="Retirement Age"
            value={retirementAge}
            onChange={setRetirementAge}
            min={currentAge + 1}
            max={75}
            suffix=" yrs"
          />
          <CurrencyField id="sip-current-corpus" label="Current Corpus" value={currentCorpus} onChange={setCurrentCorpus} />
          <div>
            <CurrencyField id="sip-target-corpus" label="Target Corpus" value={targetCorpus} onChange={setTargetCorpus} />
            {targetCorpus > 0 && targetCorpus < currentCorpus ? (
              <p className="mt-1.5 text-xs text-amber-600">Target is less than your current corpus.</p>
            ) : null}
          </div>
          <SliderField
            id="sip-return"
            label="Expected Return"
            value={expectedReturnPct}
            onChange={setExpectedReturnPct}
            min={0}
            max={30}
            step={0.5}
            suffix=" %"
          />
          <SliderField
            id="sip-stepup"
            label="Annual SIP Step-up"
            value={sipStepUpPct}
            onChange={setSipStepUpPct}
            min={0}
            max={25}
            step={1}
            suffix=" %"
            sublabel="Increase your SIP by this much every year"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {targetAchieved ? (
          <CalcStatCard
            label="Target Achieved"
            value={`Surplus ${formatInrCompact(Math.abs(result.shortfall))}`}
            icon={TargetIcon}
            tone="teal"
          />
        ) : (
          <>
            <CalcStatCard label="Required Monthly SIP" value={formatInr(result.requiredSip)} icon={PiggyBank} tone="teal" />
            <CalcStatCard label="Lumpsum Equivalent" value={formatInr(result.lumpsumNow)} icon={Wallet} tone="neutral" />
          </>
        )}
        <CalcStatCard
          label="Total Value at Retirement"
          value={formatInrCompact(actualFvCorpus)}
          sublabel={`${coveredPct}% of ${formatInrCompact(targetCorpus)} target`}
          icon={TrendingUp}
          tone="neutral"
        />
      </div>

      <div className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        <Tabs defaultValue="growth">
          <TabsList>
            <TabsTrigger value="growth">Growth</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
            <TabsTrigger value="table">Year-wise</TabsTrigger>
          </TabsList>

          <TabsContent value="growth" className="pt-4">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={result.yearlyData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
                  <XAxis dataKey="age" stroke={CHART_COLORS.axis} fontSize={12} tickLine={false} axisLine={false} />
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
                      const labels: Record<string, string> = {
                        principalExisting: "Existing Corpus",
                        principalSip: "SIP Invested",
                        totalInterest: "Interest Earned",
                      };
                      const key = String(name);
                      return [formatInr(Number(value)), labels[key] ?? key];
                    }}
                    labelFormatter={(label) => `Age ${label}`}
                  />
                  <ReferenceLine
                    y={targetCorpus}
                    stroke={CHART_COLORS.tealDark}
                    strokeDasharray="4 4"
                    label={{ value: "Target", position: "insideTopRight", fill: CHART_COLORS.tealDark, fontSize: 12 }}
                  />
                  <Bar dataKey="principalExisting" stackId="corpus" fill={CHART_COLORS.slate} />
                  <Bar dataKey="principalSip" stackId="corpus" fill={CHART_COLORS.teal} />
                  <Bar dataKey="totalInterest" stackId="corpus" fill={CHART_COLORS.amber} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="distribution" className="pt-4">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={distributionData} dataKey="value" nameKey="name" innerRadius={72} outerRadius={110} paddingAngle={2}>
                    {distributionData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [formatInr(Number(value)), String(name)]} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="table" className="pt-4">
            <CalcDataTable columns={tableColumns} rows={result.yearlyData} getRowKey={(r) => r.year} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
