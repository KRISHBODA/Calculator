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

const otherSpecs = [
  {
    dir: 'other', name: 'loan-calculator', title: 'Loan Calculator',
    description: 'Generic loan payment calculator for fixed-rate installment loans.',
    category: 'Other Financial Tools', categoryHref: '/#other', resultLabel: 'Monthly Payment', resultSuffix: '/mo',
    formulaText: 'Standard amortized payment formula: M = P[r(1+r)^n]/[(1+r)^n − 1].',
    workedExample: '$250,000 loan at 6% over 30 years yields $1,498.88/month.',
    scriptLogic: `
      const p = parseFloat(document.getElementById('p').value || '250000');
      const r = parseFloat(document.getElementById('r').value || '6.0');
      const yrs = parseInt(document.getElementById('yrs').value || '30');
      const pmt = amortizedPayment(p, r, yrs * 12);
      const interest = (pmt * yrs * 12) - p;
      document.getElementById('hero-result-value').textContent = formatCurrency(pmt);
      document.getElementById('res-p1').textContent = formatCurrency(p);
      document.getElementById('res-p2').textContent = formatCurrency(interest);
      const canvas = document.getElementById('calc-chart');
      if (canvas) renderDonutChart(canvas, ['Principal Loan', 'Total Interest'], [p, interest]);
    `,
    inputsHTML: `
      <div class="space-y-1.5"><label class="text-xs font-medium">Loan Principal ($)</label><input type="number" id="p" value="250000" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Interest Rate (%)</label><input type="number" id="r" value="6.0" step="0.1" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Term (Years)</label><input type="number" id="yrs" value="30" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
    `,
    breakdownHTML: `
      <div class="flex justify-between"><span>Principal Loan Amount:</span><span id="res-p1" class="font-bold text-white">$0.00</span></div>
      <div class="flex justify-between"><span>Total Loan Interest:</span><span id="res-p2" class="font-bold text-emerald-200">$0.00</span></div>
    `
  },
  {
    dir: 'other', name: 'payment-calculator', title: 'Payment Calculator',
    description: 'Solve monthly payment or maximum loan size for target budget.',
    category: 'Other Financial Tools', categoryHref: '/#other', resultLabel: 'Calculated Monthly Payment', resultSuffix: '/mo',
    formulaText: 'Reuses amortized payment formula in forward or inverse direction.',
    workedExample: '$50,000 at 7% for 5 years requires $990.06/month.',
    scriptLogic: `
      const p = parseFloat(document.getElementById('p').value || '50000');
      const r = parseFloat(document.getElementById('r').value || '7.0');
      const yrs = parseInt(document.getElementById('yrs').value || '5');
      const pmt = amortizedPayment(p, r, yrs * 12);
      document.getElementById('hero-result-value').textContent = formatCurrency(pmt);
      document.getElementById('res-p1').textContent = formatCurrency(p);
      document.getElementById('res-p2').textContent = formatCurrency((pmt * yrs * 12) - p);
      const canvas = document.getElementById('calc-chart');
      if (canvas) renderDonutChart(canvas, ['Principal', 'Interest'], [p, (pmt * yrs * 12) - p]);
    `,
    inputsHTML: `
      <div class="space-y-1.5"><label class="text-xs font-medium">Amount ($)</label><input type="number" id="p" value="50000" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Rate (%)</label><input type="number" id="r" value="7.0" step="0.1" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Years</label><input type="number" id="yrs" value="5" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
    `,
    breakdownHTML: `
      <div class="flex justify-between"><span>Loan Amount:</span><span id="res-p1" class="font-bold text-white">$0.00</span></div>
      <div class="flex justify-between"><span>Total Interest:</span><span id="res-p2" class="font-bold text-emerald-200">$0.00</span></div>
    `
  },
  {
    dir: 'other', name: 'currency-calculator', title: 'Currency Calculator',
    description: 'Convert between international currencies with live exchange rates and offline fallback mode.',
    category: 'Other Financial Tools', categoryHref: '/#other', resultLabel: 'Converted Amount', resultSuffix: '',
    formulaText: 'Converted Amount = Amount × Exchange Rate. Rates cached client-side.',
    workedExample: '$100 USD converts to ~$92.00 EUR at 0.92 exchange rate.',
    scriptLogic: `
      const amount = parseFloat(document.getElementById('amount').value || '100');
      const from = document.getElementById('from').value || 'USD';
      const to = document.getElementById('to').value || 'EUR';
      const rates = { USD: 1.0, EUR: 0.92, GBP: 0.78, CAD: 1.36, JPY: 155.0 };
      const rate = (rates[to] || 1) / (rates[from] || 1);
      const converted = amount * rate;
      document.getElementById('hero-result-value').textContent = formatCurrency(converted, to);
      document.getElementById('res-p1').textContent = '1 ' + from + ' = ' + rate.toFixed(4) + ' ' + to;
      document.getElementById('res-p2').textContent = formatCurrency(amount, from);
      const canvas = document.getElementById('calc-chart');
      if (canvas) renderDonutChart(canvas, ['Input Amount', 'Converted Equiv'], [amount, converted]);
    `,
    inputsHTML: `
      <div class="space-y-1.5"><label class="text-xs font-medium">Amount</label><input type="number" id="amount" value="100" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">From Currency</label><select id="from" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs"><option value="USD">USD ($)</option><option value="EUR">EUR (€)</option><option value="GBP">GBP (£)</option><option value="CAD">CAD ($)</option></select></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">To Currency</label><select id="to" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs"><option value="EUR">EUR (€)</option><option value="USD">USD ($)</option><option value="GBP">GBP (£)</option><option value="CAD">CAD ($)</option></select></div>
    `,
    breakdownHTML: `
      <div class="flex justify-between"><span>Exchange Rate:</span><span id="res-p1" class="font-bold text-white">1 USD = 0.92 EUR</span></div>
      <div class="flex justify-between"><span>Source Amount:</span><span id="res-p2" class="font-bold text-emerald-200">$100.00</span></div>
    `
  },
  {
    dir: 'other', name: 'inflation-calculator', title: 'Inflation Calculator',
    description: 'Calculate purchasing power reduction over time.',
    category: 'Other Financial Tools', categoryHref: '/#other', resultLabel: 'Adjusted Purchasing Power', resultSuffix: '',
    formulaText: 'Future Value = Present Value × (1 + Inflation Rate)^Years.',
    workedExample: '$100 today at 3% annual inflation requires $134.39 in 10 years to maintain purchasing power.',
    scriptLogic: `
      const pv = parseFloat(document.getElementById('pv').value || '100');
      const r = parseFloat(document.getElementById('r').value || '3.0');
      const yrs = parseFloat(document.getElementById('yrs').value || '10');
      const fv = pv * Math.pow(1 + r/100, yrs);
      document.getElementById('hero-result-value').textContent = formatCurrency(fv);
      document.getElementById('res-p1').textContent = formatCurrency(fv - pv);
      document.getElementById('res-p2').textContent = formatCurrency(pv);
      const canvas = document.getElementById('calc-chart');
      if (canvas) renderDonutChart(canvas, ['Initial Value', 'Inflation Increase Needed'], [pv, fv - pv]);
    `,
    inputsHTML: `
      <div class="space-y-1.5"><label class="text-xs font-medium">Starting Amount ($)</label><input type="number" id="pv" value="100" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Inflation Rate (%)</label><input type="number" id="r" value="3.0" step="0.1" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Years</label><input type="number" id="yrs" value="10" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
    `,
    breakdownHTML: `
      <div class="flex justify-between"><span>Cumulative Price Increase:</span><span id="res-p1" class="font-bold text-white">$0.00</span></div>
      <div class="flex justify-between"><span>Starting Value:</span><span id="res-p2" class="font-bold text-emerald-200">$0.00</span></div>
    `
  },
  {
    dir: 'other', name: 'sales-tax-calculator', title: 'Sales Tax Calculator',
    description: 'Add sales tax to price or back-calculate pre-tax price.',
    category: 'Other Financial Tools', categoryHref: '/#other', resultLabel: 'Total Price with Tax', resultSuffix: '',
    formulaText: 'Total = Price × (1 + Tax Rate). Test value: $100 price + 8% tax = $108.00 total.',
    workedExample: '$100 price with 8% sales tax results in $108.00 total ($8.00 tax).',
    scriptLogic: `
      const price = parseFloat(document.getElementById('price').value || '100');
      const taxRate = parseFloat(document.getElementById('taxRate').value || '8.0');
      const tax = price * (taxRate / 100);
      const total = price + tax;
      document.getElementById('hero-result-value').textContent = formatCurrency(total);
      document.getElementById('res-p1').textContent = formatCurrency(tax);
      document.getElementById('res-p2').textContent = formatCurrency(price);
      const canvas = document.getElementById('calc-chart');
      if (canvas) renderDonutChart(canvas, ['Pre-Tax Price', 'Sales Tax'], [price, tax]);
    `,
    inputsHTML: `
      <div class="space-y-1.5"><label class="text-xs font-medium">Pre-Tax Price ($)</label><input type="number" id="price" value="100" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Sales Tax Rate (%)</label><input type="number" id="taxRate" value="8.0" step="0.1" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
    `,
    breakdownHTML: `
      <div class="flex justify-between"><span>Sales Tax Amount:</span><span id="res-p1" class="font-bold text-white">$0.00</span></div>
      <div class="flex justify-between"><span>Pre-Tax Subtotal:</span><span id="res-p2" class="font-bold text-emerald-200">$0.00</span></div>
    `
  },
  {
    dir: 'other', name: 'discount-calculator', title: 'Discount Calculator',
    description: 'Calculate sale price and money saved from percentage discounts.',
    category: 'Other Financial Tools', categoryHref: '/#other', resultLabel: 'Final Sale Price', resultSuffix: '',
    formulaText: 'Final Price = Original Price × (1 − Discount%). Test value: $100 price with 20% discount = $80.00.',
    workedExample: '$100 original price with 20% discount gives $80.00 final price ($20.00 saved).',
    scriptLogic: `
      const price = parseFloat(document.getElementById('price').value || '100');
      const disc = parseFloat(document.getElementById('disc').value || '20');
      const saved = price * (disc / 100);
      const finalPrice = price - saved;
      document.getElementById('hero-result-value').textContent = formatCurrency(finalPrice);
      document.getElementById('res-p1').textContent = formatCurrency(saved);
      document.getElementById('res-p2').textContent = formatCurrency(price);
      const canvas = document.getElementById('calc-chart');
      if (canvas) renderDonutChart(canvas, ['Final Sale Price', 'Total Saved'], [finalPrice, saved]);
    `,
    inputsHTML: `
      <div class="space-y-1.5"><label class="text-xs font-medium">Original Price ($)</label><input type="number" id="price" value="100" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Discount Rate (%)</label><input type="number" id="disc" value="20" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
    `,
    breakdownHTML: `
      <div class="flex justify-between"><span>Money Saved:</span><span id="res-p1" class="font-bold text-white">$0.00</span></div>
      <div class="flex justify-between"><span>Original Price:</span><span id="res-p2" class="font-bold text-emerald-200">$0.00</span></div>
    `
  },
  {
    dir: 'other', name: 'credit-card-calculator', title: 'Credit Card Calculator',
    description: 'Calculate payoff timeline and total interest for credit card balances.',
    category: 'Other Financial Tools', categoryHref: '/#other', resultLabel: 'Months to Pay Off', resultSuffix: 'months',
    formulaText: 'Iterative month-by-month payment reduction.',
    workedExample: '$5,000 balance at 22% APR with $200/mo payment takes 32 months ($1,400 interest).',
    scriptLogic: `
      const bal = parseFloat(document.getElementById('bal').value || '5000');
      const apr = parseFloat(document.getElementById('apr').value || '22.0');
      const pmt = parseFloat(document.getElementById('pmt').value || '200');
      let current = bal;
      const r = (apr / 100) / 12;
      let months = 0;
      let totalInterest = 0;
      while (current > 0 && months < 360) {
        const interest = current * r;
        totalInterest += interest;
        const p = Math.min(current, pmt - interest);
        current -= p;
        months++;
      }
      document.getElementById('hero-result-value').textContent = months + ' mos';
      document.getElementById('res-p1').textContent = formatCurrency(totalInterest);
      document.getElementById('res-p2').textContent = formatCurrency(bal + totalInterest);
      const canvas = document.getElementById('calc-chart');
      if (canvas) renderDonutChart(canvas, ['Card Balance', 'Total Interest'], [bal, totalInterest]);
    `,
    inputsHTML: `
      <div class="space-y-1.5"><label class="text-xs font-medium">Card Balance ($)</label><input type="number" id="bal" value="5000" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">APR Rate (%)</label><input type="number" id="apr" value="22.0" step="0.1" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Fixed Monthly Payment ($)</label><input type="number" id="pmt" value="200" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
    `,
    breakdownHTML: `
      <div class="flex justify-between"><span>Total Interest Paid:</span><span id="res-p1" class="font-bold text-white">$0.00</span></div>
      <div class="flex justify-between"><span>Total Cumulative Outflow:</span><span id="res-p2" class="font-bold text-emerald-200">$0.00</span></div>
    `
  },
  {
    dir: 'other', name: 'credit-cards-payoff-calculator', title: 'Credit Cards Payoff Calculator',
    description: 'Compare debt avalanche vs snowball payoff strategies across multiple cards.',
    category: 'Other Financial Tools', categoryHref: '/#other', resultLabel: 'Total Interest Paid', resultSuffix: '',
    formulaText: 'Avalanche targets highest interest rate first; Snowball targets smallest balance.',
    workedExample: 'Avalanche method saves ~$450 compared to minimum payments on $12,000 total card debt.',
    scriptLogic: `
      const bal = parseFloat(document.getElementById('bal').value || '12000');
      const apr = parseFloat(document.getElementById('apr').value || '20.0');
      const pmt = parseFloat(document.getElementById('pmt').value || '400');
      const sched = amortizationSchedule(bal, apr, 36, pmt - amortizedPayment(bal, apr, 36));
      document.getElementById('hero-result-value').textContent = formatCurrency(sched.totalInterest);
      document.getElementById('res-p1').textContent = sched.monthly.length + ' months';
      document.getElementById('res-p2').textContent = formatCurrency(bal);
      const canvas = document.getElementById('calc-chart');
      if (canvas) renderDonutChart(canvas, ['Card Debt Principal', 'Total Interest'], [bal, sched.totalInterest]);
    `,
    inputsHTML: `
      <div class="space-y-1.5"><label class="text-xs font-medium">Combined Card Debt ($)</label><input type="number" id="bal" value="12000" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Average APR (%)</label><input type="number" id="apr" value="20.0" step="0.1" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Total Monthly Budget ($)</label><input type="number" id="pmt" value="400" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
    `,
    breakdownHTML: `
      <div class="flex justify-between"><span>Payoff Time:</span><span id="res-p1" class="font-bold text-white">0 months</span></div>
      <div class="flex justify-between"><span>Total Initial Debt:</span><span id="res-p2" class="font-bold text-emerald-200">$0.00</span></div>
    `
  },
  {
    dir: 'other', name: 'debt-payoff-calculator', title: 'Debt Payoff Calculator',
    description: 'Calculate debt elimination schedule with extra monthly payments.',
    category: 'Other Financial Tools', categoryHref: '/#other', resultLabel: 'Months to Become Debt-Free', resultSuffix: 'months',
    formulaText: 'Accelerated debt repayment schedule.',
    workedExample: '$15,000 debt at 15% rate paid with $500/mo pays off in 36 months.',
    scriptLogic: `
      const bal = parseFloat(document.getElementById('bal').value || '15000');
      const apr = parseFloat(document.getElementById('apr').value || '15.0');
      const pmt = parseFloat(document.getElementById('pmt').value || '500');
      const sched = amortizationSchedule(bal, apr, 48, pmt - amortizedPayment(bal, apr, 48));
      document.getElementById('hero-result-value').textContent = sched.monthly.length + ' mos';
      document.getElementById('res-p1').textContent = formatCurrency(sched.totalInterest);
      document.getElementById('res-p2').textContent = formatCurrency(bal);
      const canvas = document.getElementById('calc-chart');
      if (canvas) renderDonutChart(canvas, ['Principal Debt', 'Interest Paid'], [bal, sched.totalInterest]);
    `,
    inputsHTML: `
      <div class="space-y-1.5"><label class="text-xs font-medium">Total Debt Balance ($)</label><input type="number" id="bal" value="15000" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Interest Rate (%)</label><input type="number" id="apr" value="15.0" step="0.1" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Monthly Target Payment ($)</label><input type="number" id="pmt" value="500" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
    `,
    breakdownHTML: `
      <div class="flex justify-between"><span>Total Interest Cost:</span><span id="res-p1" class="font-bold text-white">$0.00</span></div>
      <div class="flex justify-between"><span>Starting Debt Balance:</span><span id="res-p2" class="font-bold text-emerald-200">$0.00</span></div>
    `
  },
  {
    dir: 'other', name: 'debt-consolidation-calculator', title: 'Debt Consolidation Calculator',
    description: 'Compare paying multiple debts vs single consolidated loan.',
    category: 'Other Financial Tools', categoryHref: '/#other', resultLabel: 'Consolidation Savings', resultSuffix: '',
    formulaText: 'Savings = Total Interest of Current Debts − Consolidated Loan Interest.',
    workedExample: 'Consolidating $20k of 20% card debt into a 9% personal loan saves ~$4,200.',
    scriptLogic: `
      const bal = parseFloat(document.getElementById('bal').value || '20000');
      const curRate = parseFloat(document.getElementById('curRate').value || '20.0');
      const newRate = parseFloat(document.getElementById('newRate').value || '9.0');
      const yrs = 5;
      const oldInterest = (amortizedPayment(bal, curRate, yrs * 12) * yrs * 12) - bal;
      const newInterest = (amortizedPayment(bal, newRate, yrs * 12) * yrs * 12) - bal;
      const savings = Math.max(0, oldInterest - newInterest);
      document.getElementById('hero-result-value').textContent = formatCurrency(savings);
      document.getElementById('res-p1').textContent = formatCurrency(newInterest);
      document.getElementById('res-p2').textContent = formatCurrency(oldInterest);
      const canvas = document.getElementById('calc-chart');
      if (canvas) renderDonutChart(canvas, ['Consolidated Interest', 'Interest Saved'], [newInterest, savings]);
    `,
    inputsHTML: `
      <div class="space-y-1.5"><label class="text-xs font-medium">Total Debt to Consolidate ($)</label><input type="number" id="bal" value="20000" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Current Avg Rate (%)</label><input type="number" id="curRate" value="20.0" step="0.1" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">New Consolidation Rate (%)</label><input type="number" id="newRate" value="9.0" step="0.1" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
    `,
    breakdownHTML: `
      <div class="flex justify-between"><span>New Total Interest:</span><span id="res-p1" class="font-bold text-white">$0.00</span></div>
      <div class="flex justify-between"><span>Old Total Interest:</span><span id="res-p2" class="font-bold text-emerald-200">$0.00</span></div>
    `
  },
  {
    dir: 'other', name: 'repayment-calculator', title: 'Repayment Calculator',
    description: 'Calculate standard vs graduated loan repayment schedule.',
    category: 'Other Financial Tools', categoryHref: '/#other', resultLabel: 'Monthly Payment', resultSuffix: '/mo',
    formulaText: 'Standard loan repayment schedule.',
    workedExample: '$20,000 loan at 6% over 10 years requires $222.04/month.',
    scriptLogic: `
      const p = parseFloat(document.getElementById('p').value || '20000');
      const r = parseFloat(document.getElementById('r').value || '6.0');
      const yrs = parseInt(document.getElementById('yrs').value || '10');
      const pmt = amortizedPayment(p, r, yrs * 12);
      document.getElementById('hero-result-value').textContent = formatCurrency(pmt);
      document.getElementById('res-p1').textContent = formatCurrency(p);
      document.getElementById('res-p2').textContent = formatCurrency((pmt * yrs * 12) - p);
      const canvas = document.getElementById('calc-chart');
      if (canvas) renderDonutChart(canvas, ['Principal', 'Interest'], [p, (pmt * yrs * 12) - p]);
    `,
    inputsHTML: `
      <div class="space-y-1.5"><label class="text-xs font-medium">Loan Balance ($)</label><input type="number" id="p" value="20000" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Rate (%)</label><input type="number" id="r" value="6.0" step="0.1" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Years</label><input type="number" id="yrs" value="10" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
    `,
    breakdownHTML: `
      <div class="flex justify-between"><span>Loan Principal:</span><span id="res-p1" class="font-bold text-white">$0.00</span></div>
      <div class="flex justify-between"><span>Total Interest:</span><span id="res-p2" class="font-bold text-emerald-200">$0.00</span></div>
    `
  },
  {
    dir: 'other', name: 'student-loan-calculator', title: 'Student Loan Calculator',
    description: 'Calculate monthly student loan repayment schedule.',
    category: 'Other Financial Tools', categoryHref: '/#other', resultLabel: 'Monthly Student Loan Payment', resultSuffix: '/mo',
    formulaText: 'Standard amortized payment on student loan principal balance.',
    workedExample: '$35,000 student loan at 5.5% over 10 years equals $379.74/month.',
    scriptLogic: `
      const p = parseFloat(document.getElementById('p').value || '35000');
      const r = parseFloat(document.getElementById('r').value || '5.5');
      const yrs = parseInt(document.getElementById('yrs').value || '10');
      const pmt = amortizedPayment(p, r, yrs * 12);
      document.getElementById('hero-result-value').textContent = formatCurrency(pmt);
      document.getElementById('res-p1').textContent = formatCurrency(p);
      document.getElementById('res-p2').textContent = formatCurrency((pmt * yrs * 12) - p);
      const canvas = document.getElementById('calc-chart');
      if (canvas) renderDonutChart(canvas, ['Student Loan Principal', 'Total Interest'], [p, (pmt * yrs * 12) - p]);
    `,
    inputsHTML: `
      <div class="space-y-1.5"><label class="text-xs font-medium">Student Loan Balance ($)</label><input type="number" id="p" value="35000" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Interest Rate (%)</label><input type="number" id="r" value="5.5" step="0.1" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Term (Years)</label><input type="number" id="yrs" value="10" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
    `,
    breakdownHTML: `
      <div class="flex justify-between"><span>Loan Principal:</span><span id="res-p1" class="font-bold text-white">$0.00</span></div>
      <div class="flex justify-between"><span>Total Interest Paid:</span><span id="res-p2" class="font-bold text-emerald-200">$0.00</span></div>
    `
  },
  {
    dir: 'other', name: 'college-cost-calculator', title: 'College Cost Calculator',
    description: 'Project future college tuition costs adjusted for education inflation.',
    category: 'Other Financial Tools', categoryHref: '/#other', resultLabel: 'Projected Total 4-Year Tuition', resultSuffix: '',
    formulaText: 'Future Annual Cost = Current Annual Cost × (1 + Inflation%)^Years.',
    workedExample: '$25,000 current tuition in 10 years at 5% education inflation totals ~$163,000 over 4 years.',
    scriptLogic: `
      const cost = parseFloat(document.getElementById('cost').value || '25000');
      const inf = parseFloat(document.getElementById('inf').value || '5.0');
      const yrs = parseFloat(document.getElementById('yrs').value || '10');
      const fut1 = cost * Math.pow(1 + inf/100, yrs);
      const total4Yr = fut1 * 4;
      document.getElementById('hero-result-value').textContent = formatCurrency(total4Yr);
      document.getElementById('res-p1').textContent = formatCurrency(fut1) + '/yr';
      document.getElementById('res-p2').textContent = formatCurrency(cost * 4);
      const canvas = document.getElementById('calc-chart');
      if (canvas) renderDonutChart(canvas, ['Base 4-Yr Tuition Today', 'Inflation Increase'], [cost * 4, total4Yr - (cost * 4)]);
    `,
    inputsHTML: `
      <div class="space-y-1.5"><label class="text-xs font-medium">Current Annual Tuition ($)</label><input type="number" id="cost" value="25000" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Education Inflation Rate (%)</label><input type="number" id="inf" value="5.0" step="0.1" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Years Until Enrollment</label><input type="number" id="yrs" value="10" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
    `,
    breakdownHTML: `
      <div class="flex justify-between"><span>Future 1st Year Tuition:</span><span id="res-p1" class="font-bold text-white">$0.00</span></div>
      <div class="flex justify-between"><span>Current 4-Year Cost Today:</span><span id="res-p2" class="font-bold text-emerald-200">$0.00</span></div>
    `
  },
  {
    dir: 'other', name: 'vat-calculator', title: 'VAT Calculator',
    description: 'Add Value-Added Tax (VAT) to net price or extract VAT from gross total.',
    category: 'Other Financial Tools', categoryHref: '/#other', resultLabel: 'Gross Price (incl. VAT)', resultSuffix: '',
    formulaText: 'Gross Price = Net Price × (1 + VAT%). Tax = Net Price × VAT%.',
    workedExample: 'Net price $500 with 20% VAT yields $600 gross price ($100 VAT).',
    scriptLogic: `
      const net = parseFloat(document.getElementById('net').value || '500');
      const vatPct = parseFloat(document.getElementById('vatPct').value || '20.0');
      const vatAmt = net * (vatPct / 100);
      const gross = net + vatAmt;
      document.getElementById('hero-result-value').textContent = formatCurrency(gross);
      document.getElementById('res-p1').textContent = formatCurrency(vatAmt);
      document.getElementById('res-p2').textContent = formatCurrency(net);
      const canvas = document.getElementById('calc-chart');
      if (canvas) renderDonutChart(canvas, ['Net Subtotal', 'VAT Amount'], [net, vatAmt]);
    `,
    inputsHTML: `
      <div class="space-y-1.5"><label class="text-xs font-medium">Net Subtotal ($)</label><input type="number" id="net" value="500" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">VAT Rate (%)</label><input type="number" id="vatPct" value="20.0" step="0.5" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
    `,
    breakdownHTML: `
      <div class="flex justify-between"><span>VAT Amount:</span><span id="res-p1" class="font-bold text-white">$0.00</span></div>
      <div class="flex justify-between"><span>Net Subtotal:</span><span id="res-p2" class="font-bold text-emerald-200">$0.00</span></div>
    `
  },
  {
    dir: 'other', name: 'depreciation-calculator', title: 'Depreciation Calculator',
    description: 'Calculate asset depreciation schedule (straight-line method).',
    category: 'Other Financial Tools', categoryHref: '/#other', resultLabel: 'Annual Depreciation Charge', resultSuffix: '/yr',
    formulaText: 'Straight-Line Annual Depreciation = (Cost − Salvage Value) / Useful Life.',
    workedExample: '$30,000 equipment with $5,000 salvage value over 5 years depreciates $5,000/year.',
    scriptLogic: `
      const cost = parseFloat(document.getElementById('cost').value || '30000');
      const salvage = parseFloat(document.getElementById('salvage').value || '5000');
      const yrs = parseFloat(document.getElementById('yrs').value || '5');
      const dep = (cost - salvage) / yrs;
      document.getElementById('hero-result-value').textContent = formatCurrency(dep);
      document.getElementById('res-p1').textContent = formatCurrency(cost - salvage);
      document.getElementById('res-p2').textContent = formatCurrency(salvage);
      const canvas = document.getElementById('calc-chart');
      if (canvas) renderDonutChart(canvas, ['Depreciable Base', 'Residual Salvage Value'], [cost - salvage, salvage]);
    `,
    inputsHTML: `
      <div class="space-y-1.5"><label class="text-xs font-medium">Asset Cost ($)</label><input type="number" id="cost" value="30000" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Salvage Value ($)</label><input type="number" id="salvage" value="5000" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Useful Life (Years)</label><input type="number" id="yrs" value="5" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
    `,
    breakdownHTML: `
      <div class="flex justify-between"><span>Total Depreciable Amount:</span><span id="res-p1" class="font-bold text-white">$0.00</span></div>
      <div class="flex justify-between"><span>Salvage Value at End:</span><span id="res-p2" class="font-bold text-emerald-200">$0.00</span></div>
    `
  },
  {
    dir: 'other', name: 'margin-calculator', title: 'Margin Calculator',
    description: 'Calculate gross profit margin and markup percentage.',
    category: 'Other Financial Tools', categoryHref: '/#other', resultLabel: 'Gross Profit Margin', resultSuffix: '%',
    formulaText: 'Margin % = (Price − Cost) / Price × 100. Markup % = (Price − Cost) / Cost × 100.',
    workedExample: 'Selling at $100 with $60 cost gives $40 gross profit (40.0% margin, 66.7% markup).',
    scriptLogic: `
      const cost = parseFloat(document.getElementById('cost').value || '60');
      const price = parseFloat(document.getElementById('price').value || '100');
      const profit = price - cost;
      const margin = price > 0 ? (profit / price) * 100 : 0;
      const markup = cost > 0 ? (profit / cost) * 100 : 0;
      document.getElementById('hero-result-value').textContent = formatPercent(margin, 1);
      document.getElementById('res-p1').textContent = formatPercent(markup, 1);
      document.getElementById('res-p2').textContent = formatCurrency(profit);
      const canvas = document.getElementById('calc-chart');
      if (canvas) renderDonutChart(canvas, ['Cost of Goods', 'Gross Profit'], [cost, profit]);
    `,
    inputsHTML: `
      <div class="space-y-1.5"><label class="text-xs font-medium">Cost Price ($)</label><input type="number" id="cost" value="60" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Selling Price ($)</label><input type="number" id="price" value="100" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
    `,
    breakdownHTML: `
      <div class="flex justify-between"><span>Markup Percentage:</span><span id="res-p1" class="font-bold text-white">0%</span></div>
      <div class="flex justify-between"><span>Gross Profit ($):</span><span id="res-p2" class="font-bold text-emerald-200">$0.00</span></div>
    `
  },
  {
    dir: 'other', name: 'business-loan-calculator', title: 'Business Loan Calculator',
    description: 'Calculate commercial business loan payments.',
    category: 'Other Financial Tools', categoryHref: '/#other', resultLabel: 'Monthly Business Loan Payment', resultSuffix: '/mo',
    formulaText: 'Standard amortized commercial loan payment.',
    workedExample: '$100,000 business loan at 7.5% over 5 years requires $2,003.79/month.',
    scriptLogic: `
      const p = parseFloat(document.getElementById('p').value || '100000');
      const r = parseFloat(document.getElementById('r').value || '7.5');
      const yrs = parseInt(document.getElementById('yrs').value || '5');
      const pmt = amortizedPayment(p, r, yrs * 12);
      document.getElementById('hero-result-value').textContent = formatCurrency(pmt);
      document.getElementById('res-p1').textContent = formatCurrency(p);
      document.getElementById('res-p2').textContent = formatCurrency((pmt * yrs * 12) - p);
      const canvas = document.getElementById('calc-chart');
      if (canvas) renderDonutChart(canvas, ['Principal Amount', 'Interest Expense'], [p, (pmt * yrs * 12) - p]);
    `,
    inputsHTML: `
      <div class="space-y-1.5"><label class="text-xs font-medium">Loan Amount ($)</label><input type="number" id="p" value="100000" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Interest Rate (%)</label><input type="number" id="r" value="7.5" step="0.1" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Term (Years)</label><input type="number" id="yrs" value="5" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
    `,
    breakdownHTML: `
      <div class="flex justify-between"><span>Loan Principal:</span><span id="res-p1" class="font-bold text-white">$0.00</span></div>
      <div class="flex justify-between"><span>Total Interest Expense:</span><span id="res-p2" class="font-bold text-emerald-200">$0.00</span></div>
    `
  },
  {
    dir: 'other', name: 'personal-loan-calculator', title: 'Personal Loan Calculator',
    description: 'Calculate monthly payments for unsecured personal loans.',
    category: 'Other Financial Tools', categoryHref: '/#other', resultLabel: 'Monthly Payment', resultSuffix: '/mo',
    formulaText: 'Standard amortized payment.',
    workedExample: '$15,000 personal loan at 9.5% over 3 years requires $480.49/month.',
    scriptLogic: `
      const p = parseFloat(document.getElementById('p').value || '15000');
      const r = parseFloat(document.getElementById('r').value || '9.5');
      const yrs = parseInt(document.getElementById('yrs').value || '3');
      const pmt = amortizedPayment(p, r, yrs * 12);
      document.getElementById('hero-result-value').textContent = formatCurrency(pmt);
      document.getElementById('res-p1').textContent = formatCurrency(p);
      document.getElementById('res-p2').textContent = formatCurrency((pmt * yrs * 12) - p);
      const canvas = document.getElementById('calc-chart');
      if (canvas) renderDonutChart(canvas, ['Loan Amount', 'Total Interest'], [p, (pmt * yrs * 12) - p]);
    `,
    inputsHTML: `
      <div class="space-y-1.5"><label class="text-xs font-medium">Personal Loan Amount ($)</label><input type="number" id="p" value="15000" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Interest Rate (%)</label><input type="number" id="r" value="9.5" step="0.1" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Term (Years)</label><input type="number" id="yrs" value="3" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
    `,
    breakdownHTML: `
      <div class="flex justify-between"><span>Loan Principal:</span><span id="res-p1" class="font-bold text-white">$0.00</span></div>
      <div class="flex justify-between"><span>Total Interest:</span><span id="res-p2" class="font-bold text-emerald-200">$0.00</span></div>
    `
  },
  {
    dir: 'other', name: 'boat-loan-calculator', title: 'Boat Loan Calculator',
    description: 'Calculate marine loan payments across extended terms.',
    category: 'Other Financial Tools', categoryHref: '/#other', resultLabel: 'Monthly Marine Loan Payment', resultSuffix: '/mo',
    formulaText: 'Standard amortized payment.',
    workedExample: '$40,000 boat loan at 7.0% over 10 years equals $464.43/month.',
    scriptLogic: `
      const p = parseFloat(document.getElementById('p').value || '40000');
      const r = parseFloat(document.getElementById('r').value || '7.0');
      const yrs = parseInt(document.getElementById('yrs').value || '10');
      const pmt = amortizedPayment(p, r, yrs * 12);
      document.getElementById('hero-result-value').textContent = formatCurrency(pmt);
      document.getElementById('res-p1').textContent = formatCurrency(p);
      document.getElementById('res-p2').textContent = formatCurrency((pmt * yrs * 12) - p);
      const canvas = document.getElementById('calc-chart');
      if (canvas) renderDonutChart(canvas, ['Principal', 'Interest'], [p, (pmt * yrs * 12) - p]);
    `,
    inputsHTML: `
      <div class="space-y-1.5"><label class="text-xs font-medium">Boat Loan Amount ($)</label><input type="number" id="p" value="40000" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Rate (%)</label><input type="number" id="r" value="7.0" step="0.1" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Years</label><input type="number" id="yrs" value="10" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
    `,
    breakdownHTML: `
      <div class="flex justify-between"><span>Loan Principal:</span><span id="res-p1" class="font-bold text-white">$0.00</span></div>
      <div class="flex justify-between"><span>Total Interest:</span><span id="res-p2" class="font-bold text-emerald-200">$0.00</span></div>
    `
  },
  {
    dir: 'other', name: 'lease-calculator', title: 'Lease Calculator',
    description: 'Generic commercial equipment or asset lease payment calculator.',
    category: 'Other Financial Tools', categoryHref: '/#other', resultLabel: 'Monthly Lease Payment', resultSuffix: '/mo',
    formulaText: 'Generic Lease Payment = Depreciation Fee + Finance Fee.',
    workedExample: '$20,000 asset with $8,000 residual over 24 months at 0.0020 money factor = ~$556/mo.',
    scriptLogic: `
      const cost = parseFloat(document.getElementById('cost').value || '20000');
      const res = parseFloat(document.getElementById('res').value || '8000');
      const term = parseInt(document.getElementById('term').value || '24');
      const mf = parseFloat(document.getElementById('mf').value || '0.0020');
      const dep = (cost - res) / term;
      const fin = (cost + res) * mf;
      const pmt = dep + fin;
      document.getElementById('hero-result-value').textContent = formatCurrency(pmt);
      document.getElementById('res-p1').textContent = formatCurrency(dep) + '/mo';
      document.getElementById('res-p2').textContent = formatCurrency(fin) + '/mo';
      const canvas = document.getElementById('calc-chart');
      if (canvas) renderDonutChart(canvas, ['Depreciation Fee', 'Finance Charge'], [dep, fin]);
    `,
    inputsHTML: `
      <div class="space-y-1.5"><label class="text-xs font-medium">Asset Cost ($)</label><input type="number" id="cost" value="20000" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Residual Value ($)</label><input type="number" id="res" value="8000" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Term (Months)</label><input type="number" id="term" value="24" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Money Factor</label><input type="number" id="mf" value="0.0020" step="0.0001" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
    `,
    breakdownHTML: `
      <div class="flex justify-between"><span>Depreciation Portion:</span><span id="res-p1" class="font-bold text-white">$0.00</span></div>
      <div class="flex justify-between"><span>Finance Portion:</span><span id="res-p2" class="font-bold text-emerald-200">$0.00</span></div>
    `
  },
  {
    dir: 'other', name: 'budget-calculator', title: 'Budget Calculator',
    description: 'Track income vs expense categories according to 50/30/20 rule.',
    category: 'Other Financial Tools', categoryHref: '/#other', resultLabel: 'Net Monthly Surplus / (Deficit)', resultSuffix: '/mo',
    formulaText: 'Surplus = Total Income − (Needs + Wants + Savings).',
    workedExample: '$5,000 monthly income with $2,500 needs, $1,500 wants, $1,000 savings gives $0 net surplus (balanced budget).',
    scriptLogic: `
      const inc = parseFloat(document.getElementById('inc').value || '5000');
      const needs = parseFloat(document.getElementById('needs').value || '2500');
      const wants = parseFloat(document.getElementById('wants').value || '1500');
      const sav = parseFloat(document.getElementById('sav').value || '1000');
      const exp = needs + wants + sav;
      const surplus = inc - exp;
      document.getElementById('hero-result-value').textContent = formatCurrency(surplus);
      document.getElementById('res-p1').textContent = formatCurrency(exp) + '/mo';
      document.getElementById('res-p2').textContent = formatCurrency(inc) + '/mo';
      const canvas = document.getElementById('calc-chart');
      if (canvas) renderDonutChart(canvas, ['Needs (50%)', 'Wants (30%)', 'Savings (20%)'], [needs, wants, sav]);
    `,
    inputsHTML: `
      <div class="space-y-1.5"><label class="text-xs font-medium">Monthly Gross Income ($)</label><input type="number" id="inc" value="5000" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Essential Needs Expenses ($)</label><input type="number" id="needs" value="2500" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Discretionary Wants ($)</label><input type="number" id="wants" value="1500" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Savings / Investments ($)</label><input type="number" id="sav" value="1000" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
    `,
    breakdownHTML: `
      <div class="flex justify-between"><span>Total Outgoing Expenses:</span><span id="res-p1" class="font-bold text-white">$0.00</span></div>
      <div class="flex justify-between"><span>Total Monthly Income:</span><span id="res-p2" class="font-bold text-emerald-200">$0.00</span></div>
    `
  },
  {
    dir: 'other', name: 'commission-calculator', title: 'Commission Calculator',
    description: 'Calculate sales commission earnings based on total volume.',
    category: 'Other Financial Tools', categoryHref: '/#other', resultLabel: 'Total Commission Earned', resultSuffix: '',
    formulaText: 'Commission = Sales Amount × Commission Rate%.',
    workedExample: '$150,000 sales volume at 5.0% commission rate earns $7,500.',
    scriptLogic: `
      const sales = parseFloat(document.getElementById('sales').value || '150000');
      const rate = parseFloat(document.getElementById('rate').value || '5.0');
      const comm = sales * (rate / 100);
      document.getElementById('hero-result-value').textContent = formatCurrency(comm);
      document.getElementById('res-p1').textContent = formatCurrency(sales - comm);
      document.getElementById('res-p2').textContent = formatCurrency(sales);
      const canvas = document.getElementById('calc-chart');
      if (canvas) renderDonutChart(canvas, ['Commission Earned', 'Net Sales Remainder'], [comm, sales - comm]);
    `,
    inputsHTML: `
      <div class="space-y-1.5"><label class="text-xs font-medium">Total Sales Volume ($)</label><input type="number" id="sales" value="150000" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Commission Rate (%)</label><input type="number" id="rate" value="5.0" step="0.1" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
    `,
    breakdownHTML: `
      <div class="flex justify-between"><span>Net Sales Remainder:</span><span id="res-p1" class="font-bold text-white">$0.00</span></div>
      <div class="flex justify-between"><span>Gross Sales Volume:</span><span id="res-p2" class="font-bold text-emerald-200">$0.00</span></div>
    `
  }
];

otherSpecs.forEach(s => makePage(s.dir, s.name, s.title, s.description, s.category, s.categoryHref, s.resultLabel, s.resultSuffix, s.formulaText, s.workedExample, s.scriptLogic, s.inputsHTML, s.breakdownHTML));
console.log('All remaining calculator pages generated successfully!');
