export interface ScenarioAssumptions {
  monthlySip: number;
  stepUpPct: number;
  returnPct: number;
}

export interface ScenarioYearRow {
  year: number;
  openingBalance: number;
  contribution: number;
  growth: number;
  closingBalance: number;
}

export interface ScenarioProjection {
  finalCorpus: number;
  totalInvested: number;
  totalGrowth: number;
  yearlyData: ScenarioYearRow[];
}

export interface ScenarioComparisonResult {
  scenarioA: ScenarioProjection;
  scenarioB: ScenarioProjection;
  wealthDifference: number;
  wealthMultiplier: number | null;
  percentMoreWealth: number | null;
}

/**
 * Forward-projects a starting corpus plus a monthly SIP (with an optional
 * annual step-up) at a fixed return — same monthly-annuity-due convention
 * (contribution added, then the whole balance grows) as `calculateSip`,
 * just without solving for anything: every input is already known.
 */
function projectScenario(initialCorpus: number, years: number, assumptions: ScenarioAssumptions): ScenarioProjection {
  const { monthlySip, stepUpPct, returnPct } = assumptions;
  const rm = returnPct / 100 / 12;

  let balance = initialCorpus;
  let currentSip = monthlySip;
  let totalInvested = initialCorpus;

  const yearlyData: ScenarioYearRow[] = [
    { year: 0, openingBalance: initialCorpus, contribution: 0, growth: 0, closingBalance: initialCorpus },
  ];

  for (let y = 1; y <= years; y++) {
    const openingBalance = balance;
    let yearlyContribution = 0;

    for (let m = 1; m <= 12; m++) {
      balance = (balance + currentSip) * (1 + rm);
      yearlyContribution += currentSip;
    }

    const closingBalance = balance;
    const growth = closingBalance - openingBalance - yearlyContribution;
    totalInvested += yearlyContribution;

    yearlyData.push({ year: y, openingBalance, contribution: yearlyContribution, growth, closingBalance });

    currentSip = currentSip * (1 + stepUpPct / 100);
  }

  return {
    finalCorpus: balance,
    totalInvested,
    totalGrowth: balance - totalInvested,
    yearlyData,
  };
}

/**
 * Compares two independent sets of assumptions (contribution, step-up,
 * and return can all differ) starting from the same corpus and horizon,
 * so the gap shown is the combined effect of every lever that changed —
 * not just the return, the way a single-variable comparison would.
 */
export function compareScenarios(
  initialCorpus: number,
  years: number,
  scenarioA: ScenarioAssumptions,
  scenarioB: ScenarioAssumptions,
): ScenarioComparisonResult {
  const a = projectScenario(initialCorpus, years, scenarioA);
  const b = projectScenario(initialCorpus, years, scenarioB);

  const wealthDifference = b.finalCorpus - a.finalCorpus;
  const wealthMultiplier = a.finalCorpus > 0 ? b.finalCorpus / a.finalCorpus : null;
  const percentMoreWealth = a.finalCorpus > 0 ? (wealthDifference / a.finalCorpus) * 100 : null;

  return { scenarioA: a, scenarioB: b, wealthDifference, wealthMultiplier, percentMoreWealth };
}
