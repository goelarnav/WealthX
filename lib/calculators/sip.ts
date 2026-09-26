export interface SipYearRow {
  year: number;
  age: number;
  openingBalance: number;
  sipInvested: number;
  interestEarned: number;
  closingBalance: number;
  principalExisting: number;
  principalSip: number;
  totalInterest: number;
}

export interface SipResult {
  requiredSip: number;
  projectedCorpus: number;
  shortfall: number;
  totalInvested: number;
  lumpsumNow: number;
  crossoverAge: number | null;
  yearlyData: SipYearRow[];
}

/**
 * Required monthly SIP (with optional annual step-up) to close the gap
 * between an existing corpus and a target corpus by retirement. Rates are
 * nominal-monthly (annual/12), the SIP market-standard convention.
 */
export function calculateSip(
  currentCorpus: number,
  targetCorpus: number,
  currentAge: number,
  retirementAge: number,
  expectedReturnPct: number,
  sipStepUpPct: number = 0,
): SipResult {
  if (retirementAge <= currentAge) {
    throw new Error("retirementAge must be strictly greater than currentAge");
  }

  const yearsRemaining = retirementAge - currentAge;
  const rm = expectedReturnPct / 100 / 12;
  const n = yearsRemaining * 12;

  const fvCorpus = rm > 0 ? currentCorpus * Math.pow(1 + rm, n) : currentCorpus;
  const shortfall = targetCorpus - fvCorpus;

  if (shortfall <= 0 || n === 0) {
    return generateSipData(currentCorpus, targetCorpus, 0, 0, currentAge, yearsRemaining, expectedReturnPct, sipStepUpPct, fvCorpus);
  }

  const lumpsumNow = rm === 0 ? shortfall : shortfall / Math.pow(1 + rm, n);

  let sip: number;
  if (sipStepUpPct === 0) {
    if (rm === 0) {
      sip = shortfall / n;
    } else {
      // Inverse annuity: SIP = Shortfall * r_m / [((1+r_m)^n - 1) * (1+r_m)]
      sip = (shortfall * rm) / ((Math.pow(1 + rm, n) - 1) * (1 + rm));
    }
  } else {
    // No closed form with an annual step-up — binary search on the FV function.
    let low = 0;
    let high = shortfall;
    let iterations = 0;
    const tolerance = 1e-6;

    while (high - low > tolerance && iterations < 100) {
      const mid = (low + high) / 2;
      const fvMid = simulateSipFv(mid, yearsRemaining, expectedReturnPct, sipStepUpPct);
      if (fvMid < shortfall) {
        low = mid;
      } else {
        high = mid;
      }
      iterations++;
    }
    sip = (low + high) / 2;
  }

  return generateSipData(currentCorpus, targetCorpus, sip, lumpsumNow, currentAge, yearsRemaining, expectedReturnPct, sipStepUpPct, fvCorpus);
}

function simulateSipFv(initialSip: number, years: number, returnPct: number, stepUpPct: number): number {
  let fv = 0;
  const rm = returnPct / 100 / 12;
  let currentSip = initialSip;
  const n = years * 12;

  for (let m = 1; m <= n; m++) {
    fv = (fv + currentSip) * (1 + rm);
    if (m % 12 === 0) {
      currentSip = currentSip * (1 + stepUpPct / 100);
    }
  }
  return fv;
}

function generateSipData(
  currentCorpus: number,
  targetCorpus: number,
  initialSip: number,
  lumpsumNow: number,
  currentAge: number,
  years: number,
  returnPct: number,
  stepUpPct: number,
  targetFvCorpus: number,
): SipResult {
  const rm = returnPct / 100 / 12;
  let corpusBalance = currentCorpus;
  let sipBalance = 0;
  let currentSip = initialSip;
  let totalInvested = currentCorpus;

  const yearlyData: SipYearRow[] = [
    {
      year: 0,
      age: currentAge,
      openingBalance: currentCorpus,
      sipInvested: currentCorpus,
      interestEarned: 0,
      closingBalance: currentCorpus,
      principalExisting: currentCorpus,
      principalSip: 0,
      totalInterest: 0,
    },
  ];

  let cumulativeInterest = 0;
  let crossoverAge: number | null = currentCorpus >= targetCorpus ? currentAge : null;

  for (let y = 1; y <= years; y++) {
    const openingBalance = corpusBalance + sipBalance;
    let yearlySipInvested = 0;

    for (let m = 1; m <= 12; m++) {
      corpusBalance = corpusBalance * (1 + rm);
      sipBalance = (sipBalance + currentSip) * (1 + rm);
      yearlySipInvested += currentSip;
    }

    const closingBalance = corpusBalance + sipBalance;
    const interestEarned = closingBalance - openingBalance - yearlySipInvested;
    cumulativeInterest += interestEarned;
    totalInvested += yearlySipInvested;

    yearlyData.push({
      year: y,
      age: currentAge + y,
      openingBalance,
      sipInvested: totalInvested,
      interestEarned,
      closingBalance,
      principalExisting: currentCorpus,
      principalSip: totalInvested - currentCorpus,
      totalInterest: cumulativeInterest,
    });

    if (crossoverAge === null && closingBalance >= targetCorpus - 1) {
      crossoverAge = currentAge + y;
    }

    currentSip = currentSip * (1 + stepUpPct / 100);
  }

  const finalBalance = corpusBalance + sipBalance;

  return {
    requiredSip: initialSip,
    projectedCorpus: finalBalance,
    shortfall: targetCorpus - targetFvCorpus,
    totalInvested,
    lumpsumNow,
    crossoverAge,
    yearlyData,
  };
}
