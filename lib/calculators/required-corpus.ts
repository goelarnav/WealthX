import { calculateSip } from "./sip";

export interface ExpenseScheduleRow {
  year: number;
  phase: "Accumulation" | "Retirement";
  expenseNominal: number;
  discountFactor: number | null;
  presentValue: number | null;
  cumulativePv: number | null;
}

export interface ExpenseScheduleTotals {
  corpusRequired: number;
  firstRetYearExpense: number;
  nominalTotal: number;
  pvShareOfNominal: number;
  todayMoneyValue: number;
}

export interface ExpenseScheduleResult {
  rows: ExpenseScheduleRow[];
  totals: ExpenseScheduleTotals;
  requiredMonthlySip: number | null;
  valid: boolean;
}

/**
 * How large a retirement corpus needs to be, given today's yearly expense,
 * inflation, and a post-retirement return that must beat inflation for the
 * corpus to be finite. Uses annual-effective rates (the standard convention
 * for Indian retirement math) — a deliberately different convention from
 * the nominal-monthly rates in sip.ts/longevity.ts, not a bug.
 */
export function buildExpenseSchedule(params: {
  expenseToday: number;
  inflationPct: number;
  returnPct: number;
  returnAfterRetirementPct: number;
  yearsToRetirement: number;
  retirementYears: number;
  currentCorpus: number;
}): ExpenseScheduleResult {
  const { expenseToday, inflationPct, returnPct, returnAfterRetirementPct, yearsToRetirement, retirementYears, currentCorpus } = params;

  const g = inflationPct / 100;
  const rPost = returnAfterRetirementPct / 100;
  const valid = rPost > g;

  const totalYears = yearsToRetirement + retirementYears;
  const rows: ExpenseScheduleRow[] = [];

  let cumulativePv = 0;
  let nominalTotal = 0;

  for (let y = 1; y <= totalYears; y++) {
    const isRetirement = y > yearsToRetirement;
    const phase: ExpenseScheduleRow["phase"] = isRetirement ? "Retirement" : "Accumulation";
    const expenseNominal = expenseToday * Math.pow(1 + g, y - 1);

    let discountFactor: number | null = null;
    let presentValue: number | null = null;
    let currentCumPv: number | null = null;

    if (isRetirement) {
      nominalTotal += expenseNominal;
      // Discount factor anchors at 1.0 for the first retirement year.
      discountFactor = Math.pow(1 + rPost, -(y - yearsToRetirement - 1));
      presentValue = expenseNominal * discountFactor;
      cumulativePv += presentValue;
      currentCumPv = cumulativePv;
    }

    rows.push({
      year: y,
      phase,
      expenseNominal,
      discountFactor,
      presentValue,
      cumulativePv: currentCumPv,
    });
  }

  const firstRetYearExpense = expenseToday * Math.pow(1 + g, yearsToRetirement);

  let corpusRequired = 0;
  if (valid) {
    // Growing annuity, discounted: E * (1 - x^n) / (1 - x), x = (1+g)/(1+r)
    const x = (1 + g) / (1 + rPost);
    corpusRequired = (firstRetYearExpense * (1 - Math.pow(x, retirementYears))) / (1 - x);
  } else {
    corpusRequired = cumulativePv;
  }

  const todayMoneyValue = corpusRequired / Math.pow(1 + inflationPct / 100, yearsToRetirement);
  const pvShareOfNominal = nominalTotal > 0 ? corpusRequired / nominalTotal : 0;

  let requiredMonthlySip: number | null = null;
  if (yearsToRetirement > 0 && corpusRequired > 0) {
    const sipResult = calculateSip(currentCorpus, corpusRequired, 0, yearsToRetirement, returnPct, 0);
    requiredMonthlySip = sipResult.requiredSip;
  }

  return {
    rows,
    totals: {
      corpusRequired,
      firstRetYearExpense,
      nominalTotal,
      pvShareOfNominal,
      todayMoneyValue,
    },
    requiredMonthlySip,
    valid,
  };
}
