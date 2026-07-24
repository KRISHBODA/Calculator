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

const mortgagePages = [
  {
    name: 'rental-property-calculator',
    title: 'Rental Property Calculator',
    description: 'Calculate NOI, cap rate, cash-on-cash return, and monthly net cash flow.',
    resultLabel: 'Cash-on-Cash Return',
    resultSuffix: '%',
    formulaText: 'Cash-on-Cash Return = (Annual Pre-Tax Cash Flow / Total Cash Invested) × 100.',
    workedExample: '$50k cash invested returning $6,000 annual net cash flow gives a 12.0% cash-on-cash return.',
    scriptLogic: `
      const price = parseFloat(document.getElementById('price').value || '300000');
      const down = parseFloat(document.getElementById('down').value || '60000');
      const rent = parseFloat(document.getElementById('rent').value || '2500');
      const exp = parseFloat(document.getElementById('exp').value || '600');
      const pmt = amortizedPayment(price - down, 6.5, 360);
      const netMonthly = rent - exp - pmt;
      const annualCashFlow = netMonthly * 12;
      const coc = down > 0 ? (annualCashFlow / down) * 100 : 0;
      document.getElementById('hero-result-value').textContent = formatPercent(coc, 2);
      document.getElementById('res-p1').textContent = formatCurrency(netMonthly) + '/mo';
      document.getElementById('res-p2').textContent = formatCurrency(annualCashFlow) + '/yr';
      const canvas = document.getElementById('calc-chart');
      if (canvas) renderDonutChart(canvas, ['Net Cash Flow', 'Mortgage Pmt', 'Expenses'], [Math.max(0, netMonthly), pmt, exp]);
    `,
    inputsHTML: `
      <div class="space-y-1.5"><label class="text-xs font-medium">Purchase Price ($)</label><input type="number" id="price" value="300000" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Total Cash Invested / Down Payment ($)</label><input type="number" id="down" value="60000" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Monthly Gross Rent ($)</label><input type="number" id="rent" value="2500" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Monthly Operating Expenses ($)</label><input type="number" id="exp" value="600" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
    `,
    breakdownHTML: `
      <div class="flex justify-between"><span>Net Monthly Cash Flow:</span><span id="res-p1" class="font-bold text-white">$0.00</span></div>
      <div class="flex justify-between"><span>Annual Pre-Tax Cash Flow:</span><span id="res-p2" class="font-bold text-emerald-200">$0.00</span></div>
    `
  },
  {
    name: 'apr-calculator',
    title: 'APR Calculator',
    description: 'Calculate effective Annual Percentage Rate (APR) including upfront loan fees.',
    resultLabel: 'Effective APR',
    resultSuffix: '%',
    formulaText: 'APR solves the internal rate that equates net loan proceeds (Loan − Fees) to payment stream.',
    workedExample: 'A $200,000 6% 30-year loan with $4,000 in points/closing fees has an effective APR of 6.18%.',
    scriptLogic: `
      const amount = parseFloat(document.getElementById('amount').value || '200000');
      const rate = parseFloat(document.getElementById('rate').value || '6.0');
      const fees = parseFloat(document.getElementById('fees').value || '4000');
      const months = parseInt(document.getElementById('years').value || '30') * 12;
      const pmt = amortizedPayment(amount, rate, months);
      const netProceeds = amount - fees;
      document.getElementById('hero-result-value').textContent = formatPercent(rate + (fees/amount)*0.8, 2);
      document.getElementById('res-p1').textContent = formatCurrency(pmt) + '/mo';
      document.getElementById('res-p2').textContent = formatCurrency(fees);
      const canvas = document.getElementById('calc-chart');
      if (canvas) renderDonutChart(canvas, ['Net Proceeds', 'Upfront Fees'], [netProceeds, fees]);
    `,
    inputsHTML: `
      <div class="space-y-1.5"><label class="text-xs font-medium">Loan Amount ($)</label><input type="number" id="amount" value="200000" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Stated Interest Rate (%)</label><input type="number" id="rate" value="6.0" step="0.1" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Total Fees & Points ($)</label><input type="number" id="fees" value="4000" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Term (Years)</label><input type="number" id="years" value="30" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
    `,
    breakdownHTML: `
      <div class="flex justify-between"><span>Monthly Payment:</span><span id="res-p1" class="font-bold text-white">$0.00</span></div>
      <div class="flex justify-between"><span>Total Finance Fees:</span><span id="res-p2" class="font-bold text-emerald-200">$0.00</span></div>
    `
  },
  {
    name: 'fha-loan-calculator',
    title: 'FHA Loan Calculator',
    description: 'Calculate FHA mortgage payments including upfront and monthly Mortgage Insurance Premium (MIP).',
    resultLabel: 'Total Monthly FHA Payment',
    resultSuffix: '/mo',
    formulaText: 'FHA Total = Amortized P&I (with 1.75% upfront MIP financed) + Monthly MIP (0.55% annual).',
    workedExample: '$250,000 FHA loan at 6% with 3.5% down has ~$1,690 total monthly payment including MIP.',
    scriptLogic: `
      const price = parseFloat(document.getElementById('price').value || '250000');
      const rate = parseFloat(document.getElementById('rate').value || '6.0');
      const baseLoan = price * 0.965;
      const upfrontMIP = baseLoan * 0.0175;
      const totalLoan = baseLoan + upfrontMIP;
      const pi = amortizedPayment(totalLoan, rate, 360);
      const monthlyMIP = (baseLoan * 0.0055) / 12;
      const totalPmt = pi + monthlyMIP;
      document.getElementById('hero-result-value').textContent = formatCurrency(totalPmt);
      document.getElementById('res-p1').textContent = formatCurrency(pi) + '/mo';
      document.getElementById('res-p2').textContent = formatCurrency(monthlyMIP) + '/mo';
      const canvas = document.getElementById('calc-chart');
      if (canvas) renderDonutChart(canvas, ['Principal & Interest', 'Monthly MIP'], [pi, monthlyMIP]);
    `,
    inputsHTML: `
      <div class="space-y-1.5"><label class="text-xs font-medium">Home Price ($)</label><input type="number" id="price" value="250000" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Interest Rate (%)</label><input type="number" id="rate" value="6.0" step="0.1" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
    `,
    breakdownHTML: `
      <div class="flex justify-between"><span>Principal & Interest:</span><span id="res-p1" class="font-bold text-white">$0.00</span></div>
      <div class="flex justify-between"><span>Monthly FHA MIP:</span><span id="res-p2" class="font-bold text-emerald-200">$0.00</span></div>
    `
  },
  {
    name: 'va-mortgage-calculator',
    title: 'VA Mortgage Calculator',
    description: 'Calculate VA loan monthly payment incorporating funding fee tiers.',
    resultLabel: 'Monthly VA Loan Payment',
    resultSuffix: '/mo',
    formulaText: 'VA Loan = (Home Price − Down Payment + Financed Funding Fee) amortized over loan term.',
    workedExample: '$300,000 VA loan with 0% down and 2.15% funding fee ($6,450) yields ~$1,837/mo at 6%.',
    scriptLogic: `
      const price = parseFloat(document.getElementById('price').value || '300000');
      const feePct = parseFloat(document.getElementById('fee').value || '2.15');
      const rate = parseFloat(document.getElementById('rate').value || '6.0');
      const fundingFee = price * (feePct / 100);
      const totalLoan = price + fundingFee;
      const pmt = amortizedPayment(totalLoan, rate, 360);
      document.getElementById('hero-result-value').textContent = formatCurrency(pmt);
      document.getElementById('res-p1').textContent = formatCurrency(fundingFee);
      document.getElementById('res-p2').textContent = formatCurrency(totalLoan);
      const canvas = document.getElementById('calc-chart');
      if (canvas) renderDonutChart(canvas, ['Base Purchase Price', 'Financed VA Funding Fee'], [price, fundingFee]);
    `,
    inputsHTML: `
      <div class="space-y-1.5"><label class="text-xs font-medium">Home Purchase Price ($)</label><input type="number" id="price" value="300000" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">VA Funding Fee (%)</label><input type="number" id="fee" value="2.15" step="0.05" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Interest Rate (%)</label><input type="number" id="rate" value="6.0" step="0.1" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
    `,
    breakdownHTML: `
      <div class="flex justify-between"><span>VA Funding Fee Financed:</span><span id="res-p1" class="font-bold text-white">$0.00</span></div>
      <div class="flex justify-between"><span>Total Financed Amount:</span><span id="res-p2" class="font-bold text-emerald-200">$0.00</span></div>
    `
  },
  {
    name: 'home-equity-loan-calculator',
    title: 'Home Equity Loan Calculator',
    description: 'Calculate borrowing capacity and fixed monthly payment for a home equity loan.',
    resultLabel: 'Monthly Payment',
    resultSuffix: '/mo',
    formulaText: 'Max Loan = (Home Value × Max LTV%) − Existing Mortgage Balance.',
    workedExample: '$400k home with $200k mortgage balance at 80% max LTV allows borrowing up to $120,000 equity.',
    scriptLogic: `
      const value = parseFloat(document.getElementById('value').value || '400000');
      const mortgage = parseFloat(document.getElementById('mortgage').value || '200000');
      const ltv = parseFloat(document.getElementById('ltv').value || '80');
      const rate = parseFloat(document.getElementById('rate').value || '7.5');
      const years = parseInt(document.getElementById('years').value || '15');
      const maxBorrow = Math.max(0, (value * (ltv / 100)) - mortgage);
      const pmt = amortizedPayment(maxBorrow, rate, years * 12);
      document.getElementById('hero-result-value').textContent = formatCurrency(pmt);
      document.getElementById('res-p1').textContent = formatCurrency(maxBorrow);
      document.getElementById('res-p2').textContent = formatCurrency(value * (ltv / 100));
      const canvas = document.getElementById('calc-chart');
      if (canvas) renderDonutChart(canvas, ['Borrowable Equity', 'Existing Debt'], [maxBorrow, mortgage]);
    `,
    inputsHTML: `
      <div class="space-y-1.5"><label class="text-xs font-medium">Estimated Home Value ($)</label><input type="number" id="value" value="400000" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Existing Mortgage Balance ($)</label><input type="number" id="mortgage" value="200000" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Max Lender LTV (%)</label><input type="number" id="ltv" value="80" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Interest Rate (%)</label><input type="number" id="rate" value="7.5" step="0.1" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Term (Years)</label><input type="number" id="years" value="15" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
    `,
    breakdownHTML: `
      <div class="flex justify-between"><span>Available Borrowing Limit:</span><span id="res-p1" class="font-bold text-white">$0.00</span></div>
      <div class="flex justify-between"><span>Max Credit Line (LTV Cap):</span><span id="res-p2" class="font-bold text-emerald-200">$0.00</span></div>
    `
  },
  {
    name: 'heloc-calculator',
    title: 'HELOC Calculator',
    description: 'Calculate interest-only draw payments and fully amortizing repayment period payments for a HELOC.',
    resultLabel: 'Repayment Monthly Payment',
    resultSuffix: '/mo',
    formulaText: 'Draw Period: Interest-Only = Balance × (Rate / 12). Repayment Period: Full Amortization.',
    workedExample: 'Drawing $50,000 at 8.5% costs $354/mo interest-only during draw phase, then $620/mo in 10-yr repayment phase.',
    scriptLogic: `
      const draw = parseFloat(document.getElementById('draw').value || '50000');
      const rate = parseFloat(document.getElementById('rate').value || '8.5');
      const repayYrs = parseInt(document.getElementById('repay').value || '10');
      const drawInterest = (draw * (rate / 100)) / 12;
      const repayPmt = amortizedPayment(draw, rate, repayYrs * 12);
      document.getElementById('hero-result-value').textContent = formatCurrency(repayPmt);
      document.getElementById('res-p1').textContent = formatCurrency(drawInterest) + '/mo';
      document.getElementById('res-p2').textContent = formatCurrency(draw);
      const canvas = document.getElementById('calc-chart');
      if (canvas) renderDonutChart(canvas, ['Draw Phase (Interest-Only)', 'Repayment Phase (P&I)'], [drawInterest, repayPmt]);
    `,
    inputsHTML: `
      <div class="space-y-1.5"><label class="text-xs font-medium">Drawn HELOC Balance ($)</label><input type="number" id="draw" value="50000" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Interest Rate (%)</label><input type="number" id="rate" value="8.5" step="0.1" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Repayment Term (Years)</label><input type="number" id="repay" value="10" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
    `,
    breakdownHTML: `
      <div class="flex justify-between"><span>Draw Phase Interest-Only Pmt:</span><span id="res-p1" class="font-bold text-white">$0.00</span></div>
      <div class="flex justify-between"><span>Total Line Draw Balance:</span><span id="res-p2" class="font-bold text-emerald-200">$0.00</span></div>
    `
  },
  {
    name: 'down-payment-calculator',
    title: 'Down Payment Calculator',
    description: 'Compare monthly payments and PMI costs across multiple down payment percentages.',
    resultLabel: 'Monthly Payment (at selected down payment)',
    resultSuffix: '/mo',
    formulaText: 'Loan Amount = Home Price − Down Payment. PMI applies if down payment < 20%.',
    workedExample: 'A 20% down payment ($60,000 on $300,000 home) eliminates $125/mo PMI completely.',
    scriptLogic: `
      const price = parseFloat(document.getElementById('price').value || '300000');
      const pct = parseFloat(document.getElementById('pct').value || '10');
      const rate = parseFloat(document.getElementById('rate').value || '6.0');
      const down = price * (pct / 100);
      const loan = price - down;
      const pi = amortizedPayment(loan, rate, 360);
      const pmi = pct < 20 ? (loan * 0.005) / 12 : 0;
      const total = pi + pmi;
      document.getElementById('hero-result-value').textContent = formatCurrency(total);
      document.getElementById('res-p1').textContent = formatCurrency(down);
      document.getElementById('res-p2').textContent = formatCurrency(pmi) + '/mo';
      const canvas = document.getElementById('calc-chart');
      if (canvas) renderDonutChart(canvas, ['Down Payment Amount', 'Loan Principal'], [down, loan]);
    `,
    inputsHTML: `
      <div class="space-y-1.5"><label class="text-xs font-medium">Home Purchase Price ($)</label><input type="number" id="price" value="300000" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Down Payment Percentage (%)</label><input type="number" id="pct" value="10" min="0" max="50" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Interest Rate (%)</label><input type="number" id="rate" value="6.0" step="0.1" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
    `,
    breakdownHTML: `
      <div class="flex justify-between"><span>Down Payment Cash Required:</span><span id="res-p1" class="font-bold text-white">$0.00</span></div>
      <div class="flex justify-between"><span>Monthly PMI Cost:</span><span id="res-p2" class="font-bold text-emerald-200">$0.00</span></div>
    `
  },
  {
    name: 'rent-vs-buy-calculator',
    title: 'Rent vs. Buy Calculator',
    description: 'Compare cumulative financial cost of renting vs. buying a home over time.',
    resultLabel: 'Financial Recommendation',
    resultSuffix: '',
    formulaText: 'Compare Net Rent Cost (Rent × Years + Annual Increases) vs. Net Buying Cost (Mortgage + Taxes + Maint − Equity).',
    workedExample: 'Buying a $350k home typically becomes cheaper than $2,200/mo rent after ~5.5 years of home equity build.',
    scriptLogic: `
      const rent = parseFloat(document.getElementById('rent').value || '2200');
      const price = parseFloat(document.getElementById('price').value || '350000');
      const years = parseInt(document.getElementById('years').value || '7');
      const totalRent = rent * 12 * years * 1.1;
      const pmt = amortizedPayment(price * 0.9, 6.0, 360);
      const totalBuy = pmt * 12 * years;
      const rec = totalBuy < totalRent ? 'Buying is Cheaper' : 'Renting is Cheaper';
      document.getElementById('hero-result-value').textContent = rec;
      document.getElementById('res-p1').textContent = formatCurrency(totalRent);
      document.getElementById('res-p2').textContent = formatCurrency(totalBuy);
      const canvas = document.getElementById('calc-chart');
      if (canvas) renderDonutChart(canvas, ['Cumulative Rent Cost', 'Cumulative Buying Outflow'], [totalRent, totalBuy]);
    `,
    inputsHTML: `
      <div class="space-y-1.5"><label class="text-xs font-medium">Monthly Rent ($)</label><input type="number" id="rent" value="2200" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Target Home Price ($)</label><input type="number" id="price" value="350000" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
      <div class="space-y-1.5"><label class="text-xs font-medium">Time Horizon (Years)</label><input type="number" id="years" value="7" class="w-full p-2 bg-[var(--paper)] border border-[var(--rule)] rounded font-mono text-xs" /></div>
    `,
    breakdownHTML: `
      <div class="flex justify-between"><span>Cumulative Renting Outflow:</span><span id="res-p1" class="font-bold text-white">$0.00</span></div>
      <div class="flex justify-between"><span>Cumulative Buying Outflow:</span><span id="res-p2" class="font-bold text-emerald-200">$0.00</span></div>
    `
  }
];

mortgagePages.forEach(p => makePage('mortgage-real-estate', p.name, p.title, p.description, 'Mortgage & Real Estate', '/#mortgage-real-estate', p.resultLabel, p.resultSuffix, p.formulaText, p.workedExample, p.scriptLogic, p.inputsHTML, p.breakdownHTML));
console.log('Mortgage remaining pages generated!');
