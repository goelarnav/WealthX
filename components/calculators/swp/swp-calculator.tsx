"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceDot,
} from "recharts";
import { AlertCircle, Wallet, CalendarClock, Hourglass } from "lucide-react";
import { calculateLongevity } from "@/lib/calculators/longevity";
import { formatInrCompact, formatPercentPrecise } from "@/lib/calculators/format";
import { formatInr } from "@/lib/format";
import { CHART_COLORS } from "@/lib/calculators/chart-colors";
import { CurrencyField } from "@/components/calculators/currency-field";
import { SliderField } from "@/components/calculators/slider-field";
import { CalcStatCard } from "@/components/calculators/calc-stat-card";
import { CalcDataTable, type CalcTableColumn } from "@/components/calculators/calc-data-table";
import { StatusBadge as PhaseBadge } from "@/components/calculators/swp/phase-badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const DEFAULTS = {
  currentAge: 30,
  retirementAge: 50,
  currentCorpus: 1_000_000,
  monthlySip: 0,
  yearlyOutflow: 800_000,
  returnPct: 12,
  returnAfterRetirementPct: 10,
  inflationPct: 6,
};

type YearRow = ReturnType<typeof calculateLongevity>["yearlyData"][number];

export function SwpCalculator() {
  const [currentAge, setCurrentAgeRaw] = useState(DEFAULTS.currentAge);
  const [retirementAge, setRetirementAgeRaw] = useState(DEFAULTS.retirementAge);
  const [currentCorpus, setCurrentCorpus] = useState(DEFAULTS.currentCorpus);
  const [monthlySip, setMonthlySip] = useState(DEFAULTS.monthlySip);
  const [yearlyOutflow, setYearlyOutflow] = useState(DEFAULTS.yearlyOutflow);
  const [returnPct, setReturnPct] = useState(DEFAULTS.returnPct);
  const [returnAfterRetirementPct, setReturnAfterRetirementPct] = useState(DEFAULTS.returnAfterRetirementPct);
  const [inflationPct, setInflationPct] = useState(DEFAULTS.inflationPct);

  function setCurrentAge(value: number) {
    setCurrentAgeRaw(value);
    if (retirementAge < value) setRetirementAgeRaw(value);
  }
  function setRetirementAge(value: number) {
    setRetirementAgeRaw(Math.max(currentAge, value));
  }

  const result = useMemo(
    () =>
      calculateLongevity(
        currentAge,
        retirementAge,
        currentCorpus,
        monthlySip,
        yearlyOutflow,
        returnPct,
        returnAfterRetirementPct,
        inflationPct,
      ),
    [currentAge, retirementAge, currentCorpus, monthlySip, yearlyOutflow, returnPct, returnAfterRetirementPct, inflationPct],
  );

  const tableColumns: CalcTableColumn<YearRow>[] = useMemo(
    () => [
      { key: "age", header: "Age", align: "center", render: (r) => r.year },
      { key: "phase", header: "Phase", align: "center", render: (r) => <PhaseBadge phase={r.phase} /> },
      { key: "opening", header: "Opening", align: "right", render: (r) => formatInrCompact(r.openingBalance) },
      { key: "sip", header: "SIP Paid", align: "right", render: (r) => (r.sipPaid > 0 ? formatInrCompact(r.sipPaid) : "–") },
      { key: "growth", header: "Growth", align: "right", render: (r) => (r.growth > 0 ? formatInrCompact(r.growth) : "–") },
      { key: "withdrawal", header: "Withdrawal", align: "right", render: (r) => (r.withdrawal > 0 ? formatInrCompact(r.withdrawal) : "–") },
      { key: "closing", header: "Closing", align: "right", render: (r) => formatInrCompact(r.closingBalance) },
    ],
    [],
  );

  if (!result.isValid) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
        Enter a current corpus or a monthly SIP to see a projection.
      </div>
    );
  }

  const depletionYearAbs = result.depletionAge != null ? new Date().getFullYear() + (result.depletionAge - currentAge) : null;
  const moneyLastsText =
    result.isDepleted && result.depletionAge != null
      ? `Age ${Math.floor(result.depletionAge)} · ${Math.floor(depletionYearAbs!)}`
      : "Beyond 80-yr horizon";
  const monthsExtra = Math.round(result.monthsLasted % 12);
  const postRetDurationText = `${result.yearsSurvived} yrs ${monthsExtra} mos`;
  const aboveSustainable = result.iwr >= result.breakevenIwr;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Your details</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <SliderField id="swp-current-age" label="Current Age" value={currentAge} onChange={setCurrentAge} min={18} max={70} suffix=" yrs" />
          <SliderField
            id="swp-retirement-age"
            label="Retirement Age"
            value={retirementAge}
            onChange={setRetirementAge}
            min={currentAge}
            max={75}
            suffix=" yrs"
          />
          <CurrencyField id="swp-current-corpus" label="Current Corpus" value={currentCorpus} onChange={setCurrentCorpus} />
          <CurrencyField id="swp-monthly-sip" label="Monthly SIP (optional)" value={monthlySip} onChange={setMonthlySip} />
          <CurrencyField
            id="swp-outflow"
            label="Yearly Withdrawal After Retirement"
            value={yearlyOutflow}
            onChange={setYearlyOutflow}
            sublabel="In your first retirement year's rupees"
            className="sm:col-span-2 lg:col-span-1"
          />
          <SliderField
            id="swp-return"
            label="Return Before Retirement"
            value={returnPct}
            onChange={setReturnPct}
            min={0}
            max={30}
            step={0.5}
            suffix=" %"
          />
          <SliderField
            id="swp-return-post"
            label="Return After Retirement"
            value={returnAfterRetirementPct}
            onChange={setReturnAfterRetirementPct}
            min={0}
            max={30}
            step={0.5}
            suffix=" %"
          />
          <SliderField
            id="swp-inflation"
            label="Inflation (post-retirement)"
            value={inflationPct}
            onChange={setInflationPct}
            min={0}
            max={15}
            step={0.5}
            suffix=" %"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <CalcStatCard label="Corpus at Retirement" value={formatInrCompact(result.retirementCorpus)} icon={Wallet} tone="neutral" />
        <CalcStatCard
          label="Money Lasts Until"
          value={moneyLastsText}
          icon={result.isDepleted ? AlertCircle : CalendarClock}
          tone={result.isDepleted ? "rose" : "teal"}
        />
        <CalcStatCard label="Post-Retirement Duration" value={postRetDurationText} icon={Hourglass} tone="neutral" />
        <CalcStatCard
          label="Total Withdrawn"
          value={formatInrCompact(result.totalWithdrawn)}
          sublabel={`IWR ${formatPercentPrecise(result.iwr * 100)}${aboveSustainable ? " · above sustainable band" : ""}`}
          icon={aboveSustainable ? AlertCircle : Wallet}
          tone={aboveSustainable ? "amber" : "neutral"}
        />
      </div>

      {returnPct <= inflationPct ? (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p>Return is at or below inflation — the corpus will always deplete eventually at these assumptions.</p>
        </div>
      ) : null}

      <div className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        <Tabs defaultValue="journey">
          <TabsList>
            <TabsTrigger value="journey">Corpus Journey</TabsTrigger>
            <TabsTrigger value="schedule">Withdrawal Schedule</TabsTrigger>
            <TabsTrigger value="table">Year-wise</TabsTrigger>
          </TabsList>

          <TabsContent value="journey" className="pt-4">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={result.yearlyData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="swpBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.teal} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={CHART_COLORS.teal} stopOpacity={0} />
                    </linearGradient>
                  </defs>
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
                      const labels: Record<string, string> = { closingBalance: "Balance", withdrawal: "Withdrawal" };
                      const key = String(name);
                      return [formatInr(Number(value)), labels[key] ?? key];
                    }}
                    labelFormatter={(label) => `Age ${label}`}
                  />
                  <ReferenceLine
                    x={retirementAge}
                    stroke={CHART_COLORS.amber}
                    strokeDasharray="4 4"
                    label={{ value: "Retirement", position: "insideTopRight", fill: CHART_COLORS.amber, fontSize: 12 }}
                  />
                  {result.isDepleted && result.depletionAge != null ? (
                    <ReferenceDot x={Math.floor(result.depletionAge)} y={0} r={5} fill={CHART_COLORS.rose} stroke="none" />
                  ) : null}
                  <Area type="monotone" dataKey="closingBalance" stroke={CHART_COLORS.teal} fill="url(#swpBalance)" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="pt-4">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={result.yearlyData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
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
                      const labels: Record<string, string> = { closingBalance: "Balance", withdrawal: "Withdrawal" };
                      const key = String(name);
                      return [formatInr(Number(value)), labels[key] ?? key];
                    }}
                    labelFormatter={(label) => `Age ${label}`}
                  />
                  <Bar dataKey="withdrawal" fill={CHART_COLORS.amber} radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="closingBalance" stroke={CHART_COLORS.teal} strokeWidth={2} dot={false} />
                </ComposedChart>
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
