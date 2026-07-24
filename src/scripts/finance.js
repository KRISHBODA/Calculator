/**
 * Finance Formula Library for Ledger Calculators
 */

/**
 * Standard amortized payment formula
 * M = P * [r(1+r)^n] / [(1+r)^n - 1]
 * Fallback to P/n when rate is 0.
 */
export function amortizedPayment(principal, annualRate, months) {
  if (principal <= 0 || months <= 0) return 0;
  const r = (annualRate / 100) / 12;
  if (r === 0) return principal / months;
  const factor = Math.pow(1 + r, months);
  return (principal * r * factor) / (factor - 1);
}

/**
 * Amortization schedule generator (month by month and annual summary)
 * Supports extra payments (monthly, annual, one-time) and start dates (month/year).
 */
export function amortizationSchedule(principal, annualRate, months, options = {}) {
  const extraMonthly = typeof options === 'number' ? options : (options.extraMonthly || 0);
  const extraAnnual = options.extraAnnual || 0;
  const extraOneTime = options.extraOneTime || 0;
  const extraOneTimeMonth = options.extraOneTimeMonth || 1;
  const startMonth = options.startMonth || 1; // 1 = Jan
  const startYear = options.startYear || new Date().getFullYear();

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  let balance = principal;
  const r = (annualRate / 100) / 12;
  const basePmt = amortizedPayment(principal, annualRate, months);
  
  const monthly = [];
  const annual = [];
  
  let totalInterest = 0;
  let totalPrincipal = 0;
  let currentYearInterest = 0;
  let currentYearPrincipal = 0;
  
  for (let m = 1; m <= months && balance > 0.001; m++) {
    const currentMonthIndex = (startMonth - 1 + (m - 1)) % 12;
    const currentCalYear = startYear + Math.floor((startMonth - 1 + (m - 1)) / 12);
    const dateStr = `${monthNames[currentMonthIndex]} ${currentCalYear}`;

    let extraThisMonth = extraMonthly;
    if (m % 12 === (13 - startMonth) % 12) extraThisMonth += extraAnnual;
    if (m === extraOneTimeMonth) extraThisMonth += extraOneTime;

    const interest = balance * r;
    let pmt = basePmt + extraThisMonth;
    let principalPaid = pmt - interest;
    
    if (balance < principalPaid) {
      principalPaid = balance;
      pmt = interest + principalPaid;
      balance = 0;
    } else {
      balance -= principalPaid;
    }
    
    totalInterest += interest;
    totalPrincipal += principalPaid;
    currentYearInterest += interest;
    currentYearPrincipal += principalPaid;
    
    monthly.push({
      month: m,
      dateStr: dateStr,
      payment: pmt,
      principal: principalPaid,
      interest: interest,
      extraPayment: extraThisMonth,
      totalInterest: totalInterest,
      balance: Math.max(0, balance)
    });
    
    if (currentMonthIndex === 11 || balance === 0 || m === months) {
      annual.push({
        year: currentCalYear,
        principal: currentYearPrincipal,
        interest: currentYearInterest,
        totalInterest: totalInterest,
        balance: Math.max(0, balance)
      });
      currentYearInterest = 0;
      currentYearPrincipal = 0;
    }
  }
  
  return { monthly, annual, totalInterest, totalPrincipal };
}

/**
 * Future value of a single lump sum: FV = PV * (1 + r/n)^(n*t)
 */
export function futureValueLumpSum(pv, annualRate, years, compoundsPerYear = 12) {
  if (years <= 0) return pv;
  const r = (annualRate / 100) / compoundsPerYear;
  return pv * Math.pow(1 + r, compoundsPerYear * years);
}

/**
 * Future value of periodic series (annuity): FV = PMT * [((1 + r/n)^(n*t) - 1) / (r/n)]
 */
export function futureValueSeries(pmt, annualRate, years, compoundsPerYear = 12) {
  if (years <= 0 || pmt <= 0) return 0;
  const r = (annualRate / 100) / compoundsPerYear;
  if (r === 0) return pmt * compoundsPerYear * years;
  const n = compoundsPerYear * years;
  return pmt * ((Math.pow(1 + r, n) - 1) / r);
}

/**
 * Total investment growth (lump sum + recurring deposits)
 */
export function investmentGrowth(initialPV, monthlyDeposit, annualRate, years) {
  const fvInitial = futureValueLumpSum(initialPV, annualRate, years, 12);
  const fvSeries = futureValueSeries(monthlyDeposit, annualRate, years, 12);
  const totalContributions = initialPV + (monthlyDeposit * 12 * years);
  const totalBalance = fvInitial + fvSeries;
  const totalInterest = Math.max(0, totalBalance - totalContributions);
  
  // Annual growth trajectory
  const trajectory = [];
  for (let y = 0; y <= years; y++) {
    const fvI = futureValueLumpSum(initialPV, annualRate, y, 12);
    const fvS = futureValueSeries(monthlyDeposit, annualRate, y, 12);
    const cont = initialPV + (monthlyDeposit * 12 * y);
    const bal = fvI + fvS;
    trajectory.push({
      year: y,
      contributions: cont,
      interest: Math.max(0, bal - cont),
      balance: bal
    });
  }
  
  return { totalBalance, totalContributions, totalInterest, trajectory };
}

/**
 * Present Value: PV = FV / (1 + r)^t
 */
export function presentValue(fv, annualRate, years) {
  if (years <= 0) return fv;
  const r = annualRate / 100;
  return fv / Math.pow(1 + r, years);
}

/**
 * Solve interest rate: r = (FV / PV)^(1/n) - 1
 */
export function solveRate(pv, fv, periods) {
  if (pv <= 0 || periods <= 0 || fv <= 0) return 0;
  return (Math.pow(fv / pv, 1 / periods) - 1) * 100;
}

/**
 * Internal Rate of Return (IRR) solver via Newton-Raphson method
 */
export function irr(cashflows, guess = 0.1) {
  let rate = guess;
  const maxIter = 100;
  const tol = 1e-7;
  
  for (let i = 0; i < maxIter; i++) {
    let npv = 0;
    let dnpv = 0;
    
    for (let t = 0; t < cashflows.length; t++) {
      const denom = Math.pow(1 + rate, t);
      npv += cashflows[t] / denom;
      dnpv -= (t * cashflows[t]) / (denom * (1 + rate));
    }
    
    if (Math.abs(npv) < tol) return rate * 100;
    if (Math.abs(dnpv) < 1e-12) break;
    
    const newRate = rate - npv / dnpv;
    if (isNaN(newRate) || !isFinite(newRate)) break;
    rate = newRate;
  }
  
  return rate * 100;
}

/**
 * Progressive Tax Calculation based on tax brackets
 */
export function applyProgressiveTax(income, brackets) {
  let tax = 0;
  let remaining = Math.max(0, income);
  const breakdown = [];
  
  for (let i = 0; i < brackets.length; i++) {
    const b = brackets[i];
    const prevCap = i === 0 ? 0 : brackets[i - 1].threshold;
    const bracketCap = b.threshold;
    const taxableInBracket = Math.min(remaining, bracketCap - prevCap);
    
    if (taxableInBracket <= 0) break;
    
    const bracketTax = taxableInBracket * (b.rate / 100);
    tax += bracketTax;
    remaining -= taxableInBracket;
    
    breakdown.push({
      rate: b.rate,
      taxable: taxableInBracket,
      tax: bracketTax
    });
  }
  
  return { totalTax: tax, effectiveRate: income > 0 ? (tax / income) * 100 : 0, breakdown };
}

/**
 * Currency and Number Formatting Helpers
 */
export function formatCurrency(amount, currency = 'USD', decimals = 2) {
  if (isNaN(amount) || !isFinite(amount)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(amount);
}

export function formatPercent(value, decimals = 2) {
  if (isNaN(value) || !isFinite(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
}

export function formatNumber(val, decimals = 0) {
  if (isNaN(val) || !isFinite(val)) return '0';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(val);
}
