"use client";

import { useMemo } from "react";
import { useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
  ReferenceLine,
  ReferenceDot,
} from "recharts";
import { AlertCircle, Target, PiggyBank, Wallet, TrendingDown } from "lucide-react";
import { buildExpenseSchedule } from "@/lib/calculators/required-corpus";
import { formatInrCompact } from "@/lib/calculators/format";
import { formatInr } from "@/lib/format";
import { CHART_COLORS } from "@/lib/calculators/chart-colors";
import { CurrencyField } from "@/components/calculators/currency-field";
import { SliderField } from "@/components/calculators/slider-field";
import { CalcStatCard } from "@/components/calculators/calc-stat-card";
import { CalcDataTable, type CalcTableColumn } from "@/components/calculators/calc-data-table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const DEFAULTS = {
  currentYearlyExpense: 1_200_000,
  yearsToRetirement: 15,
  retirementYears: 30,
  currentCorpus: 0,
  inflationPct: 6,
  returnPct: 12,
  returnAfterRetirementPct: 8,
};

type ExpenseRow = ReturnType<typeof buildExpenseSchedule>["rows"][number];

export function RequiredCorpusCalculator() {
  const [currentYearlyExpense, setCurrentYearlyExpense] = useState(DEFAULTS.currentYearlyExpense);
  const [yearsToRetirement, setYearsToRetirement] = useState(DEFAULTS.yearsToRetirement);
  const [retirementYears, setRetirementYears] = useState(DEFAULTS.retirementYears);
  const [currentCorpus, setCurrentCorpus] = useState(DEFAULTS.currentCorpus);
  const [inflationPct, setInflationPct] = useState(DEFAULTS.inflationPct);
  const [returnPct, setReturnPct] = useState(DEFAULTS.returnPct);
  const [returnAfterRetirementPct, setReturnAfterRetirementPct] = useState(DEFAULTS.returnAfterRetirementPct);

  const result = useMemo(
    () =>
      buildExpenseSchedule({
        expenseToday: currentYearlyExpense,
        inflationPct,
        returnPct,
        returnAfterRetirementPct,
        yearsToRetirement,
        retirementYears,
        currentCorpus,
      }),
    [currentYearlyExpense, inflationPct, returnPct, returnAfterRetirementPct, yearsToRetirement, retirementYears, currentCorpus],
  );

  const { rows, totals, valid, requiredMonthlySip } = result;
  const totalYears = yearsToRetirement + retirementYears;

  const tableColumns: CalcTableColumn<ExpenseRow>[] = useMemo(
    () => [
      { key: "year", header: "Year", align: "center", render: (r) => r.year },
      {
        key: "phase",
        header: "Phase",
        align: "center",
        render: (r) => (
          <Badge
            variant="outline"
            className={cn(
              "border-none font-medium",
              r.phase === "Retirement" ? "bg-teal-50 text-teal-700" : "bg-muted text-muted-foreground",
            )}
          >
            {r.phase}
          </Badge>
        ),
      },
      { key: "expense", header: "Yearly Expense", align: "right", render: (r) => formatInrCompact(r.expenseNominal) },
      { key: "df", header: "Discount Factor", align: "right", render: (r) => (r.discountFactor != null ? r.discountFactor.toFixed(4) : "–") },
      { key: "pv", header: "Present Value", align: "right", render: (r) => (r.presentValue != null ? formatInrCompact(r.presentValue) : "–") },
      { key: "cumpv", header: "Cumulative PV", align: "right", render: (r) => (r.cumulativePv != null ? formatInrCompact(r.cumulativePv) : "–") },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Your details</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <CurrencyField
            id="rc-expense"
            label="Yearly Expense Today"
            value={currentYearlyExpense}
            onChange={setCurrentYearlyExpense}
          />
          <SliderField
            id="rc-years-to-ret"
            label="Years Until Retirement"
            value={yearsToRetirement}
            onChange={setYearsToRetirement}
            min={0}
            max={40}
            suffix=" yrs"
          />
          <SliderField
            id="rc-ret-years"
            label="Retirement Duration"
            value={retirementYears}
            onChange={setRetirementYears}
            min={1}
            max={50}
            suffix=" yrs"
            sublabel="Years after retirement"
          />
          <CurrencyField id="rc-corpus" label="Current Corpus (optional)" value={currentCorpus} onChange={setCurrentCorpus} />
          <SliderField id="rc-inflation" label="Inflation" value={inflationPct} onChange={setInflationPct} min={0} max={15} step={0.5} suffix=" %" />
          <SliderField
            id="rc-return"
            label="Return Before Retirement"
            value={returnPct}
            onChange={setReturnPct}
            min={0}
            max={30}
            step={0.5}
            suffix=" %"
          />
          <SliderField
            id="rc-return-post"
            label="Return After Retirement"
            value={returnAfterRetirementPct}
            onChange={setReturnAfterRetirementPct}
            min={0}
            max={30}
            step={0.5}
            suffix=" %"
          />
        </div>
      </div>

      {!valid ? (
        <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-medium">Return after retirement must exceed inflation</p>
            <p className="mt-1 text-destructive/90">
              At these rates the required corpus is unbounded — it would deplete no matter how much you saved. Try a
              higher post-retirement return or lower inflation.
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <CalcStatCard
          label="Corpus Required at Retirement"
          value={formatInrCompact(totals.corpusRequired)}
          sublabel={`≈ ${formatInrCompact(totals.todayMoneyValue)} in today's money`}
          icon={Target}
          tone={valid ? "teal" : "rose"}
        />
        {requiredMonthlySip != null ? (
          <CalcStatCard label="Required Monthly SIP" value={formatInr(requiredMonthlySip)} icon={PiggyBank} tone="neutral" />
        ) : (
          <CalcStatCard label="Required Monthly SIP" value="–" sublabel="Retiring now — nothing to accumulate" icon={PiggyBank} tone="neutral" />
        )}
        <CalcStatCard label="First Retirement-Year Expense" value={formatInrCompact(totals.firstRetYearExpense)} icon={Wallet} tone="neutral" />
        <CalcStatCard
          label="Discounting Impact"
          value={`${formatInrCompact(totals.nominalTotal)} → ${formatInrCompact(totals.corpusRequired)}`}
          sublabel={`${Math.round(totals.pvShareOfNominal * 100)}% of nominal total`}
          icon={TrendingDown}
          tone="neutral"
        />
      </div>

      <div className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        <Tabs defaultValue="a">
          <TabsList>
            <TabsTrigger value="a">Inflation vs Discounting</TabsTrigger>
            <TabsTrigger value="b">Corpus Build-Up</TabsTrigger>
            <TabsTrigger value="table">Year-wise</TabsTrigger>
          </TabsList>

          <TabsContent value="a" className="pt-4">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={rows} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
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
                    formatter={(value, name) => [formatInr(Number(value)), String(name) === "expenseNominal" ? "Expense" : "Present Value"]}
                    labelFormatter={(label) => `Year ${label}`}
                  />
                  {yearsToRetirement > 0 ? <ReferenceArea x1={1} x2={yearsToRetirement} fill={CHART_COLORS.slateLight} fillOpacity={0.25} /> : null}
                  <ReferenceArea x1={yearsToRetirement + 1} x2={totalYears} fill={CHART_COLORS.tealLight} fillOpacity={0.2} />
                  {yearsToRetirement > 0 ? (
                    <ReferenceLine
                      x={yearsToRetirement + 1}
                      stroke={CHART_COLORS.amber}
                      strokeDasharray="4 4"
                      label={{ value: "Retirement", position: "insideTopRight", fill: CHART_COLORS.amber, fontSize: 12 }}
                    />
                  ) : null}
                  <Bar dataKey="expenseNominal" fill={CHART_COLORS.amber} radius={[4, 4, 0, 0]} opacity={0.85} />
                  <Line type="monotone" dataKey="presentValue" stroke={CHART_COLORS.teal} strokeWidth={2.5} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="b" className="pt-4">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={rows.filter((r) => r.cumulativePv != null)} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rcCumPv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.teal} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={CHART_COLORS.teal} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
                  <XAxis dataKey="year" type="number" domain={["dataMin", "dataMax"]} stroke={CHART_COLORS.axis} fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke={CHART_COLORS.axis}
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => formatInrCompact(v)}
                    width={64}
                  />
                  <Tooltip formatter={(value) => [formatInr(Number(value)), "Running Total"]} labelFormatter={(label) => `Year ${label}`} />
                  <Area type="monotone" dataKey="cumulativePv" stroke={CHART_COLORS.teal} fill="url(#rcCumPv)" strokeWidth={2} />
                  {rows.length > 0 && valid ? (
                    <ReferenceDot
                      x={totalYears}
                      y={totals.corpusRequired}
                      r={5}
                      fill={CHART_COLORS.tealDark}
                      stroke="none"
                      label={{ position: "top", value: formatInrCompact(totals.corpusRequired), fill: CHART_COLORS.tealDark, fontSize: 12 }}
                    />
                  ) : null}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="table" className="pt-4">
            <CalcDataTable
              columns={tableColumns}
              rows={rows}
              getRowKey={(r) => r.year}
              footer={
                <tfoot>
                  <tr className="border-t-2 border-teal-200 bg-teal-50/60 font-semibold">
                    <td colSpan={2} className="px-4 py-3 text-right text-teal-800">
                      Corpus required at retirement
                    </td>
                    <td colSpan={4} className="px-4 py-3 text-right text-teal-800">
                      {formatInr(totals.corpusRequired)}
                    </td>
                  </tr>
                </tfoot>
              }
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
