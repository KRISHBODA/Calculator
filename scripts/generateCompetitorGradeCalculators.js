import fs from 'fs';
import path from 'path';

const root = path.resolve(process.cwd(), 'src/pages');

function makePage(dir, name, title, description, category, categoryHref, resultLabel, resultSuffix, formulaText, workedExample, scriptLogic, inputsHTML, breakdownHTML, compareInputsHTML = '') {
  const content = `---
import CalculatorShell from '../../components/CalculatorShell.astro';
import ResultChart from '../../components/ResultChart.astro';
import ScheduleTable from '../../components/ScheduleTable.astro';
---

<CalculatorShell
  title="${title}"
  description="${description}"
  category="${category}"
  categoryHref="${categoryHref}"
  resultLabel="${resultLabel}"
  resultSuffix="${resultSuffix}"
>
  <!-- Input Controls -->
  <div slot="inputs" class="space-y-4">
    ${inputsHTML}
  </div>

  ${compareInputsHTML ? `
  <!-- Comparison Inputs -->
  <div slot="compare-inputs" class="space-y-4">
    ${compareInputsHTML}
  </div>
  ` : ''}

  <!-- Result Breakdown -->
  <div slot="result-breakdown" class="space-y-2">
    ${breakdownHTML}
  </div>

  <!-- Chart -->
  <div slot="chart">
    <ResultChart id="calc-chart" type="donut" title="${title} Breakdown" />
  </div>

  <!-- Schedule Table -->
  <div slot="table">
    <ScheduleTable id="calc-schedule" title="${title} Schedule & Trajectory" />
  </div>

  <!-- Formula Explanation -->
  <div slot="formula-explanation" class="space-y-2">
    <p>${formulaText}</p>
  </div>

  <!-- Worked Example -->
  <div slot="worked-example" class="space-y-2 text-xs">
    <p class="font-semibold text-[var(--ink)]">Standard Test Case:</p>
    <p>${workedExample}</p>
  </div>
</CalculatorShell>

<script>
  import { amortizedPayment, amortizationSchedule, futureValueLumpSum, futureValueSeries, investmentGrowth, presentValue, solveRate, irr, applyProgressiveTax, formatCurrency, formatPercent, formatNumber } from '../../scripts/finance.js';
  import { TAX_BRACKETS_2024, STANDARD_DEDUCTION_2024 } from '../../scripts/taxData.js';
  import { renderDonutChart } from '../../scripts/charts.js';

  let currentScheduleMode = 'annual';
  let cachedSchedule: any = null;

  function renderScheduleTable(sched: any) {
    if (sched) cachedSchedule = sched;
    if (!cachedSchedule) return;

    const tableContainer = document.getElementById('calc-schedule');
    if (tableContainer) tableContainer.classList.remove('hidden');

    const tbody = document.getElementById('schedule-table-body');
    if (!tbody) return;

    const rows = currentScheduleMode === 'annual' ? (cachedSchedule.annual || cachedSchedule.trajectory) : (cachedSchedule.monthly || cachedSchedule.trajectory);
    if (!rows || rows.length === 0) return;

    tbody.innerHTML = rows.map((r: any) => {
      const periodLabel = currentScheduleMode === 'annual' ? (r.year ? 'Year ' + r.year : r.dateStr || 'Period ' + r.month) : (r.dateStr || 'Month ' + r.month);
      const pmtVal = formatCurrency(r.payment || r.contributions || (r.principal + r.interest) || 0);
      const prinVal = formatCurrency(r.principal || r.contributions || 0);
      const intVal = formatCurrency(r.interest || 0);
      const totIntVal = formatCurrency(r.totalInterest || r.interest || 0);
      const balVal = formatCurrency(r.balance || 0);

      return '<tr class="hover:bg-[var(--paper)] transition-colors border-b border-[var(--rule-light)]">' +
        '<td class="py-2 px-3">' + periodLabel + '</td>' +
        '<td class="py-2 px-3 text-right font-medium">' + pmtVal + '</td>' +
        '<td class="py-2 px-3 text-right text-[var(--green)]">' + prinVal + '</td>' +
        '<td class="py-2 px-3 text-right text-[var(--amber)]">' + intVal + '</td>' +
        '<td class="py-2 px-3 text-right">' + totIntVal + '</td>' +
        '<td class="py-2 px-3 text-right font-semibold">' + balVal + '</td>' +
      '</tr>';
    }).join('');
  }

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

    document.getElementById('schedule-toggle-annual')?.addEventListener('click', (e) => {
      currentScheduleMode = 'annual';
      (e.target as HTMLElement).classList.add('bg-[var(--paper-raised)]', 'text-[var(--ink)]', 'shadow-sm');
      document.getElementById('schedule-toggle-monthly')?.classList.remove('bg-[var(--paper-raised)]', 'text-[var(--ink)]', 'shadow-sm');
      renderScheduleTable(null);
    });

    document.getElementById('schedule-toggle-monthly')?.addEventListener('click', (e) => {
      currentScheduleMode = 'monthly';
      (e.target as HTMLElement).classList.add('bg-[var(--paper-raised)]', 'text-[var(--ink)]', 'shadow-sm');
      document.getElementById('schedule-toggle-annual')?.classList.remove('bg-[var(--paper-raised)]', 'text-[var(--ink)]', 'shadow-sm');
      renderScheduleTable(null);
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

const specs = [
  // 1. MORTGAGE & REAL ESTATE (Additional)
  {
    dir: 'mortgage-real-estate', name: 'amortization-calculator', title: 'Amortization Calculator',
    description: 'Detailed loan amortization schedule with monthly and annual payoff breakdown.',
    category: 'Mortgage & Real Estate', categoryHref: '/#mortgage-real-estate', resultLabel: 'Monthly Payment', resultSuffix: '/mo',
    formulaText: 'M = P[r(1+r)^n]/[(1+r)^n − 1]. Generates complete month-by-month principal and interest reduction schedules.',
    workedExample: '$200,000 loan at 6% interest for 30 years yields $1,199.10/month ($231,676 total interest).',
    scriptLogic: `
      const p = parseFloat((document.getElementById('p-num') as HTMLInputElement)?.value || '200000');
      const r = parseFloat((document.getElementById('r-num') as HTMLInputElement)?.value || '6.0');
      const yrs = parseInt((document.getElementById('yrs-select') as HTMLSelectElement)?.value || '30');
      (document.getElementById('p-slider') as HTMLInputElement).value = String(p);
      (document.getElementById('r-slider') as HTMLInputElement).value = String(r);

      const pmt = amortizedPayment(p, r, yrs * 12);
      const sched = amortizationSchedule(p, r, yrs * 12);

      (document.getElementById('hero-result-value') as HTMLElement).textContent = formatCurrency(pmt);
      (document.getElementById('res-p1') as HTMLElement).textContent = formatCurrency(p);
      (document.getElementById('res-p2') as HTMLElement).textContent = formatCurrency(sched.totalInterest);
      (document.getElementById('res-p3') as HTMLElement).textContent = formatCurrency(p + sched.totalInterest);

      const canvas = document.getElementById('calc-chart') as HTMLCanvasElement;
      if (canvas) renderDonutChart(canvas, ['Principal Amount', 'Total Interest'], [p, sched.totalInterest]);
      renderScheduleTable(sched);
    `,
    inputsHTML: `
      <div class="space-y-1.5 border-b border-[var(--rule-light)] pb-3">
        <div class="flex justify-between items-center text-xs font-medium">
          <label for="p-num" class="text-[var(--ink)]">Loan Principal Amount</label>
          <span class="font-mono text-[var(--ink-soft)]">$<input type="number" id="p-num" value="200000" min="5000" max="2000000" step="5000" class="w-24 text-right bg-transparent border-b border-[var(--rule)] focus:border-[var(--green)] focus:outline-none font-mono" /></span>
        </div>
        <input type="range" id="p-slider" value="200000" min="10000" max="1000000" step="5000" class="w-full accent-[var(--green)] cursor-pointer" />
      </div>
      <div class="space-y-1.5 border-b border-[var(--rule-light)] pb-3">
        <div class="flex justify-between items-center text-xs font-medium">
          <label for="r-num" class="text-[var(--ink)]">Annual Interest Rate (%)</label>
          <span class="font-mono text-[var(--ink-soft)]"><input type="number" id="r-num" value="6.0" min="0.1" max="20.0" step="0.1" class="w-16 text-right bg-transparent border-b border-[var(--rule)] focus:border-[var(--green)] focus:outline-none font-mono" /> %</span>
        </div>
        <input type="range" id="r-slider" value="6.0" min="0.1" max="15.0" step="0.1" class="w-full accent-[var(--green)] cursor-pointer" />
      </div>
      <div class="space-y-1.5">
        <div class="flex justify-between items-center text-xs font-medium">
          <label for="yrs-select" class="text-[var(--ink)]">Loan Term</label>
          <select id="yrs-select" class="bg-[var(--paper)] border border-[var(--rule)] text-[var(--ink)] text-xs rounded px-2 py-1 font-mono">
            <option value="30" selected>30 Years (360 mos)</option>
            <option value="20">20 Years (240 mos)</option>
            <option value="15">15 Years (180 mos)</option>
            <option value="10">10 Years (120 mos)</option>
          </select>
        </div>
      </div>
    `,
    breakdownHTML: `
      <div class="flex justify-between"><span>Loan Principal:</span><span id="res-p1" class="font-bold text-white">$0.00</span></div>
      <div class="flex justify-between"><span>Total Interest Paid:</span><span id="res-p2" class="font-bold text-emerald-200">$0.00</span></div>
      <div class="flex justify-between pt-1 border-t border-emerald-800/60 font-bold text-white"><span>Total Outflow:</span><span id="res-p3">$0.00</span></div>
    `
  },

  // 2. INVESTMENT & SAVINGS (Additional)
  {
    dir: 'investment', name: 'investment-calculator', title: 'Investment Calculator',
    description: 'Project long-term compound growth of initial savings and recurring deposits.',
    category: 'Investment & Savings', categoryHref: '/#investment', resultLabel: 'Projected Future Balance', resultSuffix: '',
    formulaText: 'FV = PV(1+r)^t + PMT × [((1+r)^t − 1)/r]. Computes compound growth with inflation adjustment.',
    workedExample: '$10,000 initial balance + $500 monthly deposit at 7% over 20 years yields ~$260,000.',
    scriptLogic: `
      const pv = parseFloat((document.getElementById('inv-pv-num') as HTMLInputElement)?.value || '10000');
      const pmt = parseFloat((document.getElementById('inv-pmt-num') as HTMLInputElement)?.value || '500');
      const rate = parseFloat((document.getElementById('inv-rate-num') as HTMLInputElement)?.value || '7.0');
      const yrs = parseInt((document.getElementById('inv-yrs-num') as HTMLInputElement)?.value || '20');

      (document.getElementById('inv-pv-slider') as HTMLInputElement).value = String(pv);
      (document.getElementById('inv-pmt-slider') as HTMLInputElement).value = String(pmt);

      const res = investmentGrowth(pv, pmt, rate, yrs);

      (document.getElementById('hero-result-value') as HTMLElement).textContent = formatCurrency(res.totalBalance);
      (document.getElementById('res-p1') as HTMLElement).textContent = formatCurrency(res.totalContributions);
      (document.getElementById('res-p2') as HTMLElement).textContent = formatCurrency(res.totalInterest);

      const canvas = document.getElementById('calc-chart') as HTMLCanvasElement;
      if (canvas) renderDonutChart(canvas, ['Contributions', 'Interest Growth'], [res.totalContributions, res.totalInterest]);
      renderScheduleTable(res);
    `,
    inputsHTML: `
      <div class="space-y-1.5 border-b border-[var(--rule-light)] pb-3">
        <div class="flex justify-between items-center text-xs font-medium">
          <label for="inv-pv-num" class="text-[var(--ink)]">Starting Principal ($)</label>
          <span class="font-mono text-[var(--ink-soft)]">$<input type="number" id="inv-pv-num" value="10000" min="0" max="1000000" step="1000" class="w-24 text-right bg-transparent border-b border-[var(--rule)] focus:border-[var(--green)] focus:outline-none font-mono" /></span>
        </div>
        <input type="range" id="inv-pv-slider" value="10000" min="0" max="250000" step="1000" class="w-full accent-[var(--green)] cursor-pointer" />
      </div>
      <div class="space-y-1.5 border-b border-[var(--rule-light)] pb-3">
        <div class="flex justify-between items-center text-xs font-medium">
          <label for="inv-pmt-num" class="text-[var(--ink)]">Monthly Contribution ($)</label>
          <span class="font-mono text-[var(--ink-soft)]">$<input type="number" id="inv-pmt-num" value="500" min="0" max="10000" step="50" class="w-20 text-right bg-transparent border-b border-[var(--rule)] focus:border-[var(--green)] focus:outline-none font-mono" /></span>
        </div>
        <input type="range" id="inv-pmt-slider" value="500" min="0" max="2500" step="50" class="w-full accent-[var(--green)] cursor-pointer" />
      </div>
      <div class="grid grid-cols-2 gap-3 text-xs">
        <div>
          <label for="inv-rate-num" class="block text-[var(--ink-soft)] mb-1">Return Rate (%)</label>
          <input type="number" id="inv-rate-num" value="7.0" min="0.1" max="20" step="0.1" class="w-full p-1.5 bg-[var(--paper)] border border-[var(--rule)] rounded text-right font-mono text-[var(--ink)]" />
        </div>
        <div>
          <label for="inv-yrs-num" class="block text-[var(--ink-soft)] mb-1">Investment Years</label>
          <input type="number" id="inv-yrs-num" value="20" min="1" max="50" class="w-full p-1.5 bg-[var(--paper)] border border-[var(--rule)] rounded text-right font-mono text-[var(--ink)]" />
        </div>
      </div>
    `,
    breakdownHTML: `
      <div class="flex justify-between"><span>Total Contributions:</span><span id="res-p1" class="font-bold text-white">$0.00</span></div>
      <div class="flex justify-between"><span>Total Interest Earned:</span><span id="res-p2" class="font-bold text-emerald-200">$0.00</span></div>
    `
  },

  // 3. RETIREMENT PLANNING (Additional)
  {
    dir: 'retirement', name: 'retirement-calculator', title: 'Retirement Calculator',
    description: 'Calculate nest egg accumulation and annual retirement drawdowns using the 4% rule.',
    category: 'Retirement Planning', categoryHref: '/#retirement', resultLabel: 'Total Nest Egg at Retirement', resultSuffix: '',
    formulaText: 'Projects total capital accumulation and safe monthly withdrawal rate (4% rule).',
    workedExample: '$50,000 current savings + $1,000 monthly contributions at 7% return over 25 years yields ~$1.1M nest egg.',
    scriptLogic: `
      const pv = parseFloat((document.getElementById('ret-pv-num') as HTMLInputElement)?.value || '50000');
      const pmt = parseFloat((document.getElementById('ret-pmt-num') as HTMLInputElement)?.value || '1000');
      const rate = parseFloat((document.getElementById('ret-rate-num') as HTMLInputElement)?.value || '7.0');
      const yrs = parseInt((document.getElementById('ret-yrs-num') as HTMLInputElement)?.value || '25');

      (document.getElementById('ret-pv-slider') as HTMLInputElement).value = String(pv);
      (document.getElementById('ret-pmt-slider') as HTMLInputElement).value = String(pmt);

      const res = investmentGrowth(pv, pmt, rate, yrs);
      const safeMonthly = (res.totalBalance * 0.04) / 12;

      (document.getElementById('hero-result-value') as HTMLElement).textContent = formatCurrency(res.totalBalance);
      (document.getElementById('res-p1') as HTMLElement).textContent = formatCurrency(safeMonthly) + '/mo';
      (document.getElementById('res-p2') as HTMLElement).textContent = formatCurrency(res.totalContributions);

      const canvas = document.getElementById('calc-chart') as HTMLCanvasElement;
      if (canvas) renderDonutChart(canvas, ['Contributions', 'Compound Growth'], [res.totalContributions, res.totalInterest]);
      renderScheduleTable(res);
    `,
    inputsHTML: `
      <div class="space-y-1.5 border-b border-[var(--rule-light)] pb-3">
        <div class="flex justify-between items-center text-xs font-medium">
          <label for="ret-pv-num" class="text-[var(--ink)]">Current Retirement Savings ($)</label>
          <span class="font-mono text-[var(--ink-soft)]">$<input type="number" id="ret-pv-num" value="50000" min="0" max="2000000" step="5000" class="w-24 text-right bg-transparent border-b border-[var(--rule)] focus:border-[var(--green)] focus:outline-none font-mono" /></span>
        </div>
        <input type="range" id="ret-pv-slider" value="50000" min="0" max="500000" step="5000" class="w-full accent-[var(--green)] cursor-pointer" />
      </div>
      <div class="space-y-1.5 border-b border-[var(--rule-light)] pb-3">
        <div class="flex justify-between items-center text-xs font-medium">
          <label for="ret-pmt-num" class="text-[var(--ink)]">Monthly Savings Contribution ($)</label>
          <span class="font-mono text-[var(--ink-soft)]">$<input type="number" id="ret-pmt-num" value="1000" min="0" max="15000" step="100" class="w-24 text-right bg-transparent border-b border-[var(--rule)] focus:border-[var(--green)] focus:outline-none font-mono" /></span>
        </div>
        <input type="range" id="ret-pmt-slider" value="1000" min="0" max="5000" step="100" class="w-full accent-[var(--green)] cursor-pointer" />
      </div>
      <div class="grid grid-cols-2 gap-3 text-xs">
        <div>
          <label for="ret-rate-num" class="block text-[var(--ink-soft)] mb-1">Annual Return (%)</label>
          <input type="number" id="ret-rate-num" value="7.0" min="0.1" max="15" step="0.1" class="w-full p-1.5 bg-[var(--paper)] border border-[var(--rule)] rounded text-right font-mono text-[var(--ink)]" />
        </div>
        <div>
          <label for="ret-yrs-num" class="block text-[var(--ink-soft)] mb-1">Years to Retirement</label>
          <input type="number" id="ret-yrs-num" value="25" min="1" max="50" class="w-full p-1.5 bg-[var(--paper)] border border-[var(--rule)] rounded text-right font-mono text-[var(--ink)]" />
        </div>
      </div>
    `,
    breakdownHTML: `
      <div class="flex justify-between"><span>Safe Monthly Income (4% Rule):</span><span id="res-p1" class="font-bold text-white">$0.00</span></div>
      <div class="flex justify-between"><span>Total Contributions:</span><span id="res-p2" class="font-bold text-emerald-200">$0.00</span></div>
    `
  },

  // 4. OTHER FINANCIAL TOOLS (Debt Payoff)
  {
    dir: 'other', name: 'debt-payoff-calculator', title: 'Debt Payoff Calculator',
    description: 'Calculate debt elimination schedule and interest saved with extra monthly payments.',
    category: 'Other Financial Tools', categoryHref: '/#other', resultLabel: 'Months to Debt-Free Status', resultSuffix: 'months',
    formulaText: 'Accelerated debt payoff amortization comparing standard minimum vs extra monthly target.',
    workedExample: '$15,000 balance at 15% rate paid at $500/mo pays off in 36 months ($3,780 total interest).',
    scriptLogic: `
      const bal = parseFloat((document.getElementById('debt-bal-num') as HTMLInputElement)?.value || '15000');
      const rate = parseFloat((document.getElementById('debt-rate-num') as HTMLInputElement)?.value || '15.0');
      const pmt = parseFloat((document.getElementById('debt-pmt-num') as HTMLInputElement)?.value || '500');

      (document.getElementById('debt-bal-slider') as HTMLInputElement).value = String(bal);

      const sched = amortizationSchedule(bal, rate, 360, pmt - amortizedPayment(bal, rate, 360));
      const mos = sched.monthly.length;

      (document.getElementById('hero-result-value') as HTMLElement).textContent = mos + ' mos';
      (document.getElementById('res-p1') as HTMLElement).textContent = formatCurrency(sched.totalInterest);
      (document.getElementById('res-p2') as HTMLElement).textContent = formatCurrency(bal + sched.totalInterest);

      const canvas = document.getElementById('calc-chart') as HTMLCanvasElement;
      if (canvas) renderDonutChart(canvas, ['Principal Balance', 'Total Interest'], [bal, sched.totalInterest]);
      renderScheduleTable(sched);
    `,
    inputsHTML: `
      <div class="space-y-1.5 border-b border-[var(--rule-light)] pb-3">
        <div class="flex justify-between items-center text-xs font-medium">
          <label for="debt-bal-num" class="text-[var(--ink)]">Total Debt Balance ($)</label>
          <span class="font-mono text-[var(--ink-soft)]">$<input type="number" id="debt-bal-num" value="15000" min="500" max="250000" step="500" class="w-24 text-right bg-transparent border-b border-[var(--rule)] focus:border-[var(--green)] focus:outline-none font-mono" /></span>
        </div>
        <input type="range" id="debt-bal-slider" value="15000" min="1000" max="100000" step="500" class="w-full accent-[var(--green)] cursor-pointer" />
      </div>
      <div class="grid grid-cols-2 gap-3 text-xs">
        <div>
          <label for="debt-rate-num" class="block text-[var(--ink-soft)] mb-1">Interest Rate (%)</label>
          <input type="number" id="debt-rate-num" value="15.0" min="0.1" max="35" step="0.1" class="w-full p-1.5 bg-[var(--paper)] border border-[var(--rule)] rounded text-right font-mono text-[var(--ink)]" />
        </div>
        <div>
          <label for="debt-pmt-num" class="block text-[var(--ink-soft)] mb-1">Monthly Target Payment ($)</label>
          <input type="number" id="debt-pmt-num" value="500" min="50" max="10000" step="25" class="w-full p-1.5 bg-[var(--paper)] border border-[var(--rule)] rounded text-right font-mono text-[var(--ink)]" />
        </div>
      </div>
    `,
    breakdownHTML: `
      <div class="flex justify-between"><span>Total Interest Owed:</span><span id="res-p1" class="font-bold text-white">$0.00</span></div>
      <div class="flex justify-between"><span>Total Cumulative Outflow:</span><span id="res-p2" class="font-bold text-emerald-200">$0.00</span></div>
    `
  }
];

specs.forEach(s => makePage(s.dir, s.name, s.title, s.description, s.category, s.categoryHref, s.resultLabel, s.resultSuffix, s.formulaText, s.workedExample, s.scriptLogic, s.inputsHTML, s.breakdownHTML));
console.log('Competitor-grade calculator script generated successfully!');
