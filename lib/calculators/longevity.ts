export interface LongevityYearRow {
  year: number; // age
  phase: "Accumulation" | "Drawdown";
  openingBalance: number;
  sipPaid: number;
  growth: number;
  withdrawal: number;
  closingBalance: number;
}

export interface LongevityResult {
  yearsSurvived: number;
  monthsLasted: number;
  depletionYear: number | null;
  depletionAge: number | null;
  isDepleted: boolean;
  retirementCorpus: number;
  firstYearWithdrawal: number;
  totalWithdrawn: number;
  surplusAt80: number;
  isValid: boolean;
  yearlyData: LongevityYearRow[];
  iwr: number;
  realReturn: number;
  breakevenIwr: number;
}

const MAX_DRAWDOWN_YEARS = 80;

/**
 * Simulates accumulation (optional SIP until retirement) followed by
 * inflation-escalating withdrawals in retirement, month by month, until
 * either the corpus is depleted or an 80-year drawdown horizon is capped.
 * Outflow is first-retirement-year rupees — inflation only escalates
 * withdrawals from that point on, never before retirement.
 */
export function calculateLongevity(
  currentAge: number,
  retirementAge: number,
  currentCorpus: number,
  monthlySip: number,
  yearlyOutflow: number,
  returnPct: number,
  returnAfterRetirementPct: number,
  inflationPct: number,
): LongevityResult {
  if (retirementAge < currentAge) {
    throw new Error("retirementAge cannot be less than currentAge");
  }

  if (currentCorpus <= 0 && monthlySip <= 0) {
    return {
      yearsSurvived: 0,
      monthsLasted: 0,
      depletionYear: null,
      depletionAge: null,
      isDepleted: true,
      retirementCorpus: 0,
      firstYearWithdrawal: 0,
      totalWithdrawn: 0,
      surplusAt80: 0,
      isValid: false,
      yearlyData: [],
      iwr: 0,
      realReturn: 0,
      breakevenIwr: 0,
    };
  }

  let balance = currentCorpus;
  const yearlyData: LongevityYearRow[] = [];
  let totalWithdrawn = 0;

  const rm = returnPct / 12 / 100;
  const rmPost = returnAfterRetirementPct / 12 / 100;
  const g = inflationPct / 100;
  const yearsToRetirement = retirementAge - currentAge;

  // Phase A: accumulation
  for (let y = 1; y <= yearsToRetirement; y++) {
    const age = currentAge + y - 1;
    const openingBalance = balance;
    let sipPaid = 0;

    for (let m = 1; m <= 12; m++) {
      balance = (balance + monthlySip) * (1 + rm);
      sipPaid += monthlySip;
    }

    yearlyData.push({
      year: age,
      phase: "Accumulation",
      openingBalance,
      sipPaid,
      growth: balance - openingBalance - sipPaid,
      withdrawal: 0,
      closingBalance: balance,
    });
  }

  const retirementCorpus = balance;

  // Phase B: drawdown
  let monthsLasted = 0;
  let isDepleted = false;
  let depletionYear: number | null = null;
  let depletionAge: number | null = null;

  for (let y = 1; y <= MAX_DRAWDOWN_YEARS; y++) {
    if (isDepleted) break;

    const age = retirementAge + y - 1;
    const openingBalance = balance;

    // w_y = yearly_outflow * (1+g)^(y-1), y = 1-indexed retirement year
    const w = yearlyOutflow * Math.pow(1 + g, y - 1);
    const monthlyWithdrawal = w / 12;

    let yearlyWithdrawalActual = 0;

    for (let m = 1; m <= 12; m++) {
      if (balance <= monthlyWithdrawal) {
        const proRate = balance / monthlyWithdrawal;
        yearlyWithdrawalActual += balance;
        totalWithdrawn += balance;
        monthsLasted += proRate;
        balance = 0;
        isDepleted = true;
        depletionYear = y;
        depletionAge = retirementAge + monthsLasted / 12;
        break;
      }

      balance = (balance - monthlyWithdrawal) * (1 + rmPost);
      yearlyWithdrawalActual += monthlyWithdrawal;
      totalWithdrawn += monthlyWithdrawal;
      monthsLasted++;
    }

    const growth = balance - openingBalance + yearlyWithdrawalActual;

    yearlyData.push({
      year: age,
      phase: "Drawdown",
      openingBalance,
      sipPaid: 0,
      growth: growth > 0 ? growth : 0,
      withdrawal: yearlyWithdrawalActual,
      closingBalance: balance,
    });
  }

  const rAnnual = returnAfterRetirementPct / 100;
  const iwr = retirementCorpus > 0 ? yearlyOutflow / retirementCorpus : 0;
  const realReturn = (1 + rAnnual) / (1 + g) - 1;

  // Sustainable initial-withdrawal-rate breakeven, so the UI can flag an
  // outflow that's above what the post-retirement return can sustain.
  const R = Math.pow(1 + rmPost, 12);
  const K = rmPost === 0 ? 1 : ((R - 1) / (12 * rmPost)) * (1 + rmPost);
  const breakevenIwr = (R - 1 - g) / K;

  return {
    yearsSurvived: Math.floor(monthsLasted / 12),
    monthsLasted,
    depletionYear,
    depletionAge,
    isDepleted,
    retirementCorpus,
    firstYearWithdrawal: yearlyOutflow,
    totalWithdrawn,
    surplusAt80: balance,
    isValid: true,
    yearlyData,
    iwr,
    realReturn,
    breakevenIwr,
  };
}
