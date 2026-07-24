import fs from 'fs';
import path from 'path';

const root = path.resolve(process.cwd(), 'src/pages');

function makePage(dir, name, title, description, category, categoryHref, resultLabel, resultSuffix, formulaText, workedExample, scriptLogic, inputsHTML, breakdownHTML) {
  const content = `---
import CalculatorShell from '../../components/CalculatorShell.astro';
import ResultChart from '../../components/ResultChart.astro';
---

<CalculatorShell
  title="${title}"
  description="${description}"
  category="${category}"
  categoryHref="${categoryHref}"
  resultLabel="${resultLabel}"
  resultSuffix="${resultSuffix}"
>
  <div slot="inputs" class="space-y-4">
    ${inputsHTML}
  </div>

  <div slot="result-breakdown" class="space-y-2">
    ${breakdownHTML}
  </div>

  <div slot="chart">
    <ResultChart id="calc-chart" type="donut" title="Breakdown" />
  </div>

  <div slot="formula-explanation" class="space-y-2">
    <p>${formulaText}</p>
  </div>

  <div slot="worked-example" class="space-y-2 text-xs">
    <p>${workedExample}</p>
  </div>
</CalculatorShell>

<script>
  import { amortizedPayment, amortizationSchedule, futureValueLumpSum, futureValueSeries, investmentGrowth, presentValue, solveRate, irr, applyProgressiveTax, formatCurrency, formatPercent, formatNumber } from '../../scripts/finance.js';
  import { TAX_BRACKETS_2024, STANDARD_DEDUCTION_2024, FICA_RATES, IRS_UNIFORM_LIFETIME_TABLE } from '../../scripts/taxData.js';
  import { renderDonutChart, renderLineChart } from '../../scripts/charts.js';

  function update() {
    try {
      ${scriptLogic}
    } catch (err) {
      console.error(err);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('input, select').forEach(el => {
      el.addEventListener('input', update);
      el.addEventListener('change', update);
    });
    update();
  });
</script>
`;

  const targetDir = path.join(root, dir);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  fs.writeFileSync(path.join(targetDir, `${name}.astro`), content, 'utf-8');
  console.log(`Generated: ${dir}/${name}.astro`);
}

const mortgage = [
  {
    dir: 'mortgage-real-estate', name: 'mortgage-payoff-calculator', title: 'Mortgage Payoff Calculator',
    description: 'Calculate interest saved and time reduced on your mortgage by making extra principal payments.',
    category: 'Mortgage & Real Estate', categoryHref: '/#mortgage-real-estate', resultLabel: 'Interest Saved', resultSuffix: 'total',
    formulaText: 'Compares baseline amortization schedule against schedule with extra monthly principal contributions.',
    workedExample: 'Adding $200/mo extra on a $250,000, 30-year 6% loan saves over $60,000 in interest and pays off 5 years early.',
    scriptLogic: `
      const amount = parseFloat(document.getElementById('loan-amount').value || '250000');
      const rate = parseFloat(document.getElementById('interest-rate').value || '6.0');
      const years = parseInt(document.getElementById('loan-term').value || '30');
      const extra = parseFloat(document.getElementById('extra-payment').value || '200');

      const months = years * 12;
      const baseSched = amortizationSchedule(amount, rate, months, 0);
      const extraSched = amortizationSchedule(amount, rate, months, extra);

      const interestSaved = Math.max(0, baseSched.totalInterest - extraSched.totalInterest);
      const monthsSaved = Math.max(0, baseSched.monthly.length - extraSched.monthly.length);

      document.getElementById('hero-result-value').textContent = formatCurrency(interestSaved);
      document.getElementById('res-p1').textContent = monthsSaved + ' months (' + (monthsSaved/12).toFixed(1) + ' yrs)';
      document.getElementById('res-p2').textContent = formatCurrency(extraSched.totalInterest);

      const canvas = document.getElementById('calc-chart');
      if (canvas) {
        renderDonutChart(canvas, ['Interest Saved', 'Remaining Interest Paid'], [interestSaved, extraSched.totalInterest]);
      }
    `,
    inputsHTML: `
      <div class="space-y-1.5"><label class="text-xs font-medium">Original Loan Balance ($)</label><input type="number" id="loan-amount" value="250000" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Interest Rate (%)</label><input type="number" id="interest-rate" value="6.0" step="0.1" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Remaining Term (Years)</label><input type="number" id="loan-term" value="30" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Extra Monthly Payment ($)</label><input type="number" id="extra-payment" value="200" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
    `,
    breakdownHTML: `
      <div class="flex justify-between"><span>Payoff Time Reduced:</span><span id="res-p1" class="font-bold text-white">0 months</span></div>
      <div class="flex justify-between"><span>New Total Interest:</span><span id="res-p2" class="font-bold text-emerald-200">$0.00</span></div>
    `
  },
  {
    dir: 'mortgage-real-estate', name: 'house-affordability-calculator', title: 'House Affordability Calculator',
    description: 'Calculate maximum home purchase price based on your gross income, monthly debt obligations, and target debt-to-income (DTI) ratio.',
    category: 'Mortgage & Real Estate', categoryHref: '/#mortgage-real-estate', resultLabel: 'Maximum Home Purchase Price', resultSuffix: 'est.',
    formulaText: 'Max Loan = (Gross Monthly Income × DTI Cap − Monthly Debts) / Amortization Factor.',
    workedExample: 'With $100,000 annual income, $500 monthly debts, and 36% target DTI, max affordable price is ~$340,000.',
    scriptLogic: `
      const income = parseFloat(document.getElementById('annual-income').value || '100000');
      const debts = parseFloat(document.getElementById('monthly-debts').value || '500');
      const down = parseFloat(document.getElementById('down-payment').value || '50000');
      const rate = parseFloat(document.getElementById('interest-rate').value || '6.5');
      const dti = parseFloat(document.getElementById('target-dti').value || '36');

      const grossMonthly = income / 12;
      const maxHousingPmt = Math.max(0, (grossMonthly * (dti / 100)) - debts);
      const r = (rate / 100) / 12;
      const n = 360;
      const factor = (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const maxLoan = maxHousingPmt / factor;
      const maxPrice = maxLoan + down;

      document.getElementById('hero-result-value').textContent = formatCurrency(maxPrice);
      document.getElementById('res-p1').textContent = formatCurrency(maxHousingPmt) + '/mo';
      document.getElementById('res-p2').textContent = formatCurrency(maxLoan);

      const canvas = document.getElementById('calc-chart');
      if (canvas) {
        renderDonutChart(canvas, ['Max Borrowed Loan', 'Down Payment'], [maxLoan, down]);
      }
    `,
    inputsHTML: `
      <div class="space-y-1.5"><label class="text-xs font-medium">Annual Gross Income ($)</label><input type="number" id="annual-income" value="100000" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Monthly Debt Payments ($)</label><input type="number" id="monthly-debts" value="500" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Available Down Payment ($)</label><input type="number" id="down-payment" value="50000" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Interest Rate (%)</label><input type="number" id="interest-rate" value="6.5" step="0.1" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Target DTI Ratio (%)</label><input type="number" id="target-dti" value="36" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
    `,
    breakdownHTML: `
      <div class="flex justify-between"><span>Max Monthly Housing Pmt:</span><span id="res-p1" class="font-bold text-white">$0.00</span></div>
      <div class="flex justify-between"><span>Maximum Loan Amount:</span><span id="res-p2" class="font-bold text-emerald-200">$0.00</span></div>
    `
  },
  {
    dir: 'mortgage-real-estate', name: 'rent-calculator', title: 'Rent Calculator',
    description: 'Calculate recommended monthly rent based on the 30% gross monthly income rule of thumb.',
    category: 'Mortgage & Real Estate', categoryHref: '/#mortgage-real-estate', resultLabel: 'Recommended Max Rent', resultSuffix: '/mo',
    formulaText: 'Recommended Rent = (Gross Annual Income / 12) × Target Rent Ratio (default 30%).',
    workedExample: 'For an $80,000 annual salary, 30% maximum rule suggests a monthly rent cap of $2,000/month.',
    scriptLogic: `
      const income = parseFloat(document.getElementById('annual-income').value || '80000');
      const ratio = parseFloat(document.getElementById('rent-ratio').value || '30');
      const grossMonthly = income / 12;
      const maxRent = grossMonthly * (ratio / 100);
      const remaining = grossMonthly - maxRent;

      document.getElementById('hero-result-value').textContent = formatCurrency(maxRent);
      document.getElementById('res-p1').textContent = formatCurrency(grossMonthly) + '/mo';
      document.getElementById('res-p2').textContent = formatCurrency(remaining) + '/mo';

      const canvas = document.getElementById('calc-chart');
      if (canvas) {
        renderDonutChart(canvas, ['Recommended Rent', 'Other Income / Expenses'], [maxRent, remaining]);
      }
    `,
    inputsHTML: `
      <div class="space-y-1.5"><label class="text-xs font-medium">Gross Annual Income ($)</label><input type="number" id="annual-income" value="80000" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Target Income Ratio (%)</label><input type="number" id="rent-ratio" value="30" min="15" max="50" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
    `,
    breakdownHTML: `
      <div class="flex justify-between"><span>Gross Monthly Income:</span><span id="res-p1" class="font-bold text-white">$0.00</span></div>
      <div class="flex justify-between"><span>Income Left for Other Spending:</span><span id="res-p2" class="font-bold text-emerald-200">$0.00</span></div>
    `
  },
  {
    dir: 'mortgage-real-estate', name: 'debt-to-income-calculator', title: 'Debt-to-Income Ratio Calculator',
    description: 'Calculate your front-end (housing) and back-end (total debt) DTI ratios to assess borrowing power.',
    category: 'Mortgage & Real Estate', categoryHref: '/#mortgage-real-estate', resultLabel: 'Back-End DTI Ratio', resultSuffix: '%',
    formulaText: 'DTI = (Total Monthly Debt Payments / Gross Monthly Income) × 100.',
    workedExample: 'Monthly income $6,000 with $1,500 housing payment + $500 auto/student loans gives 33.3% total DTI.',
    scriptLogic: `
      const income = parseFloat(document.getElementById('monthly-income').value || '6000');
      const housing = parseFloat(document.getElementById('housing-pmt').value || '1500');
      const otherDebt = parseFloat(document.getElementById('other-debts').value || '500');

      const frontDTI = income > 0 ? (housing / income) * 100 : 0;
      const totalDebt = housing + otherDebt;
      const backDTI = income > 0 ? (totalDebt / income) * 100 : 0;

      document.getElementById('hero-result-value').textContent = formatPercent(backDTI, 1);
      document.getElementById('res-p1').textContent = formatPercent(frontDTI, 1);
      document.getElementById('res-p2').textContent = formatCurrency(totalDebt) + '/mo';

      const canvas = document.getElementById('calc-chart');
      if (canvas) {
        renderDonutChart(canvas, ['Housing Payment', 'Other Debt Payments', 'Disposable Income'], [housing, otherDebt, Math.max(0, income - totalDebt)]);
      }
    `,
    inputsHTML: `
      <div class="space-y-1.5"><label class="text-xs font-medium">Gross Monthly Income ($)</label><input type="number" id="monthly-income" value="6000" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Monthly Housing Payment ($)</label><input type="number" id="housing-pmt" value="1500" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Other Monthly Debt Payments ($)</label><input type="number" id="other-debts" value="500" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
    `,
    breakdownHTML: `
      <div class="flex justify-between"><span>Front-End DTI (Housing Only):</span><span id="res-p1" class="font-bold text-white">0%</span></div>
      <div class="flex justify-between"><span>Total Monthly Debt Obligations:</span><span id="res-p2" class="font-bold text-emerald-200">$0.00</span></div>
    `
  },
  {
    dir: 'mortgage-real-estate', name: 'real-estate-calculator', title: 'Real Estate Calculator',
    description: 'Calculate Net Operating Income (NOI) and Capitalization Rate (Cap Rate) for investment property valuation.',
    category: 'Mortgage & Real Estate', categoryHref: '/#mortgage-real-estate', resultLabel: 'Capitalization Rate (Cap Rate)', resultSuffix: '%',
    formulaText: 'NOI = Gross Rental Income − Operating Expenses. Cap Rate = (NOI / Property Value) × 100.',
    workedExample: '$500,000 property generating $48,000 rent with $13,000 operating expenses yields $35,000 NOI (7.0% Cap Rate).',
    scriptLogic: `
      const value = parseFloat(document.getElementById('property-value').value || '500000');
      const grossRent = parseFloat(document.getElementById('gross-rent').value || '48000');
      const expenses = parseFloat(document.getElementById('operating-expenses').value || '13000');

      const noi = grossRent - expenses;
      const capRate = value > 0 ? (noi / value) * 100 : 0;

      document.getElementById('hero-result-value').textContent = formatPercent(capRate, 2);
      document.getElementById('res-p1').textContent = formatCurrency(noi) + '/yr';
      document.getElementById('res-p2').textContent = formatCurrency(expenses) + '/yr';

      const canvas = document.getElementById('calc-chart');
      if (canvas) {
        renderDonutChart(canvas, ['Net Operating Income (NOI)', 'Operating Expenses'], [Math.max(0, noi), expenses]);
      }
    `,
    inputsHTML: `
      <div class="space-y-1.5"><label class="text-xs font-medium">Property Value ($)</label><input type="number" id="property-value" value="500000" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Gross Annual Rental Income ($)</label><input type="number" id="gross-rent" value="48000" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Annual Operating Expenses ($)</label><input type="number" id="operating-expenses" value="13000" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
    `,
    breakdownHTML: `
      <div class="flex justify-between"><span>Net Operating Income (NOI):</span><span id="res-p1" class="font-bold text-white">$0.00</span></div>
      <div class="flex justify-between"><span>Total Operating Expenses:</span><span id="res-p2" class="font-bold text-emerald-200">$0.00</span></div>
    `
  },
  {
    dir: 'mortgage-real-estate', name: 'refinance-calculator', title: 'Refinance Calculator',
    description: 'Compare existing mortgage terms against a new loan option to calculate monthly savings and break-even timeline.',
    category: 'Mortgage & Real Estate', categoryHref: '/#mortgage-real-estate', resultLabel: 'Monthly Refinance Savings', resultSuffix: '/mo',
    formulaText: 'Break-even Month = Total Closing Costs / Monthly Payment Reduction.',
    workedExample: 'Reducing interest rate from 7% to 5.5% on a $300,000 loan saves $300/mo, breaking even on $4,500 closing costs in 15 months.',
    scriptLogic: `
      const curBal = parseFloat(document.getElementById('cur-balance').value || '300000');
      const curRate = parseFloat(document.getElementById('cur-rate').value || '7.0');
      const curYears = parseInt(document.getElementById('cur-term').value || '30');
      const newRate = parseFloat(document.getElementById('new-rate').value || '5.5');
      const newYears = parseInt(document.getElementById('new-term').value || '30');
      const closing = parseFloat(document.getElementById('closing-costs').value || '4500');

      const oldPmt = amortizedPayment(curBal, curRate, curYears * 12);
      const newPmt = amortizedPayment(curBal, newRate, newYears * 12);
      const monthlySavings = oldPmt - newPmt;
      const breakEvenMonths = monthlySavings > 0 ? Math.ceil(closing / monthlySavings) : 0;

      document.getElementById('hero-result-value').textContent = formatCurrency(monthlySavings);
      document.getElementById('res-p1').textContent = breakEvenMonths > 0 ? breakEvenMonths + ' months' : 'N/A';
      document.getElementById('res-p2').textContent = formatCurrency(newPmt) + '/mo';

      const canvas = document.getElementById('calc-chart');
      if (canvas) {
        renderDonutChart(canvas, ['New Payment', 'Monthly Savings'], [newPmt, Math.max(0, monthlySavings)]);
      }
    `,
    inputsHTML: `
      <div class="space-y-1.5"><label class="text-xs font-medium">Current Loan Balance ($)</label><input type="number" id="cur-balance" value="300000" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Current Rate (%)</label><input type="number" id="cur-rate" value="7.0" step="0.1" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Current Remaining Term (Yrs)</label><input type="number" id="cur-term" value="30" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">New Refinance Rate (%)</label><input type="number" id="new-rate" value="5.5" step="0.1" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">New Loan Term (Yrs)</label><input type="number" id="new-term" value="30" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Refinance Closing Costs ($)</label><input type="number" id="closing-costs" value="4500" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
    `,
    breakdownHTML: `
      <div class="flex justify-between"><span>Break-Even Timeline:</span><span id="res-p1" class="font-bold text-white">0 months</span></div>
      <div class="flex justify-between"><span>New Monthly Payment:</span><span id="res-p2" class="font-bold text-emerald-200">$0.00</span></div>
    `
  }
];

mortgage.forEach(s => makePage(s.dir, s.name, s.title, s.description, s.category, s.categoryHref, s.resultLabel, s.resultSuffix, s.formulaText, s.workedExample, s.scriptLogic, s.inputsHTML, s.breakdownHTML));
console.log('Master generator script completed!');
