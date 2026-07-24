# Build Prompt: "Ledger" — Financial Calculator Suite (Astro, Static)

## 0. Project Details

- **Name:** Free Online Calculator
- **Domain:** freeonlinecalculator.com
- **Status:** Astro project already initialized — build into the existing project, don't scaffold a new one.
- **Design reference:** Follow `@DESIGN.md` in the project as the primary design source of truth, with the overall visual direction styled like Vercel's site (near-black/high-contrast surfaces, tight geometric sans type, sharp edges, generous whitespace, restrained accent color).
- **Required tooling for every step of the build:**
  - Use the **Astro Docs MCP server** to check current Astro APIs (routing, `output: 'static'` config, content collections, etc.) rather than relying on memory.
  - Use the **`tailwind-4-docs`** skill for all Tailwind v4 usage, config, and utility-class decisions.
  - Use the **`web-design-guidelines`** skill to audit every page after it's built, fixing anything flagged before moving to the next calculator.

> **Note on design direction:** Section 3 below documents a "Ledger" design system (parchment background, serif display type, hairline rules) that was designed earlier in this project's planning. That direction and "styled like Vercel" (dark, geometric, sans-only) pull in different directions — Vercel's aesthetic doesn't use a serif display face or a paper/ledger metaphor. Treat `@DESIGN.md` and this Vercel-like direction as the **authoritative override** for color, type, and surface treatment; keep from Section 3 only what's direction-agnostic (the ledger-row list pattern for calculator navigation, right-aligned tabular mono numerals for figures, the two-column input/result layout, the big live-updating result figure as the signature moment). Antigravity should resolve any remaining conflict in favor of `@DESIGN.md`.

---

## 1. Competitive Analysis: calculator.net & What "Better" Means Here

**Do not copy calculator.net's design, layout, or UI in any form.** The analysis below is about *what to build* (features, scope, content), never *how it should look*. Visual direction comes entirely from `@DESIGN.md` / Section 3.

**What calculator.net actually is, factually:** ~200 calculators total across 4 categories — Financial (71, spec'd in Section 5), Fitness & Health (BMI, calorie, body fat, BMR, ideal weight, pace, pregnancy, conception, due date, etc.), Math (scientific calculator, fraction, percentage, random number generator, triangle, standard deviation, etc.), and Other (age, date, time, hours, GPA, grade, concrete, subnet, password generator, unit conversion, etc.). No login required, everything free, in-house built since 2007–2008. This scope (Fitness/Math/Other categories) is **not** part of this build — this project stays scoped to the 71 financial calculators in Section 5 unless you decide later to expand into those categories too.

**Where calculator.net is genuinely weak — build these as real advantages, not just claims:**

1. **Numbers-only results, no visualization.** Most calculators output plain text/tables with no charts. Every calculator in this build should pair its numeric result with a simple visual where one adds understanding (amortization schedules get a payoff-over-time line, loan/investment breakdowns get a principal-vs-interest or contributions-vs-growth proportion bar, tax calculators get a bracket breakdown bar) — already planned into the result panel in Section 3/5.
2. **No scenario comparison.** You can't compare "15-year vs 30-year mortgage" or "extra $200/month vs not" without opening two tabs and re-entering everything. Build a **compare mode** on the amortizing-loan and investment-growth calculators: let the user duplicate their inputs into a second column with one variable changed, and see both results side by side.
3. **No shareable/saveable results.** Every calculation is lost on refresh. Since this is a static site with no backend, do this client-side: encode the current inputs into the URL query string, so a calculation can be shared/bookmarked/reopened exactly as entered — no login or database needed.
4. **No inline explanation of terms.** Jargon like PMI, APR, AIME, cap rate appears with no definition, forcing users to leave the page. Add short inline tooltips/definitions next to fields that use financial jargon, sourced from the plain-English explanation already required per page in Section 2.
5. **Ad-heavy, slow, and visually dated.** This is inherent to their ad-supported model, not something to imitate. Keep this site fast (static output, no heavy ad scripts blocking rendering) and uncluttered — that's a real, measurable differentiator, not just a design opinion.
6. **US-centric on tax/salary calculators**, with little support for other currencies or locales. Where feasible, let currency symbol/locale be a user-adjustable setting rather than hardcoded USD, even if the underlying tax bracket data stays US-specific for now.
7. **No accessibility polish** — this is exactly what the `web-design-guidelines` skill audit (Section 7) is for; treat passing that audit as a genuine competitive gap being closed, not busywork.
8. **Weak content depth per calculator** — often just a form and a result, with a wall of generic disclaimer text. Section 2 already requires a real worked example and plain-English formula explanation per page; that content is itself a differentiator for both users and SEO, since it's what calculator.net is thinnest on.

**Positioning summary for Antigravity:** match calculator.net's *coverage* (the 71 calculators, accurate formulas), beat it on *experience* (visualized results, comparison mode, shareable URLs, inline explanations, speed, accessibility) — and never reference or reproduce its visual design while doing it.

---

## 2. Project Summary

Build a static, fast, SEO-friendly financial calculator website using **Astro** (no server/backend required — every calculator runs client-side in the browser). The product is a competitor to calculator.net's Financial Calculators section, covering the same 71 calculators, but with a distinctive, modern UI and clearer explanations than the competitor.

Non-negotiables:
- **Scope: all 71 calculators listed in Section 5 must be built and shipped — not a subset, not just the highest-traffic ones.** The build order in Section 6 phases the work for practicality, it does not reduce the deliverable.
- Astro static output (`output: 'static'`), deployable to Netlify/Vercel/Cloudflare Pages.
- No backend/database. All math runs in the browser via vanilla JS (`<script>` in `.astro` files) — no framework required unless you choose one for convenience.
- Every calculator page: input panel + live result panel that updates on input change, no "Submit" button required (recalculate on the fly).
- Each calculator gets its own route/page (e.g. `/mortgage-calculator`, `/compound-interest-calculator`) for SEO.
- Mobile-first responsive layout, keyboard accessible, visible focus states.
- Each page includes a short, genuinely useful written explanation of the formula and a worked example below the calculator (this is the main differentiator from the competitor, whose pages are thin and ad-heavy).

---

## 3. Design System — "The Ledger"

**Concept:** the page reads like an actual paper ledger book — hairline rules, right-aligned tabular numerals, and one oversized serif result number that acts as the page's hero, since with a calculator the *answer* is the product, not a headline.

**Built in Tailwind CSS v4** (per Section 7's `tailwind-4-docs` skill). Map every token below into `tailwind.config` / the `@theme` block as named design tokens (`ink`, `paper`, `green`, `amber`, `rule`, etc.) rather than hardcoding hex values in `class="..."` strings across 71 pages — this is what keeps the design centrally editable and is required, not optional.

**Light theme tokens (default):**
- `--ink: #16231D` — primary text, near-black warm green
- `--ink-soft: #4A554C` — secondary text
- `--paper: #EEF2ED` — page background, cool parchment (not warm cream)
- `--paper-raised: #F7F9F6` — card/hover background
- `--green: #2F6F52` — primary accent (growth/money)
- `--green-dark: #1E4E38` — dark green for result panels
- `--amber: #C98A2C` — active states, highlights, chart secondary color
- `--rule: #C7CBC0` — hairline dividers
- `--rule-light: #DBDED4`

**Dark theme tokens:**
- `--ink: #EDEFEA` — primary text, warm off-white
- `--ink-soft: #A9B3AB` — secondary text
- `--paper: #10160F` — page background, near-black warm charcoal (not pure black)
- `--paper-raised: #171F16` — card/hover background
- `--green: #5FA985` — primary accent, brightened for dark-surface contrast
- `--green-dark: #0E1A14` — result panel background (even darker than page bg, for depth)
- `--amber: #E3A94A` — active states, brightened for dark-surface contrast
- `--rule: #2C362B` — hairline dividers
- `--rule-light: #202A1F`

**Theme toggle requirements:**
- Use Tailwind's `darkMode: 'class'` strategy (not `media`), so the toggle is explicit and user-controlled rather than only following OS settings.
- On first visit, default to the visitor's `prefers-color-scheme` OS setting; after that, respect an explicit user choice.
- Persist the choice in `localStorage` (this is a purely client-side, no-login site, so no server-side preference storage is needed or appropriate).
- Toggle control lives in the header (sun/moon icon), visible and reachable on every page, not buried in a settings page.
- Apply the theme class before first paint (a small inline script in `Layout.astro`'s `<head>`, not a post-load script) to avoid a flash of the wrong theme on load.
- Every component — including chart colors (Section 3a below) — must read from the Tailwind theme tokens so dark mode isn't just an inverted background but a fully considered second palette (this is why full token pairs are specified above, not just a `bg-black` swap).

**Typography:**
- Display/headings: **Fraunces** (serif, variable, used for H1s and the big result figure)
- Body/UI: **Inter**
- All numeric inputs and outputs: **IBM Plex Mono**, tabular figures, so numbers align like a real ledger

**Layout pattern (every calculator page):**
- Two-column grid on desktop, stacked on mobile: left = input fields as "ledger rows" (label left, right-aligned mono value, hairline rule under each row, range slider + editable number input); right = dark result panel (`--green-dark` background in light mode) with the big serif result figure, a breakdown of components (e.g. principal vs interest), and a simple horizontal proportion bar in green/amber.
- Homepage and category pages: same ledger-row list pattern used as navigation — each calculator is a row with title, one-line description, and an arrow.
- Signature motion: result figure does a subtle roll/fade transition (150–250ms) on recalculation. No other decorative animation.

### 3a. Charts — matching calculator.net's data visualization, not its visual style

calculator.net pairs many results with a chart (a pie/donut for a one-time breakdown like principal vs. interest, and a stacked line/bar for a running balance over time like an amortization schedule). Match that *functionality* — every calculator result should show a chart where one adds real understanding — while keeping the Ledger palette and typography, not calculator.net's chart styling.

**Which chart type per result:**
- **Donut/pie** — one-time proportional breakdown: loan principal vs. total interest, income tax bracket breakdown, budget category split, margin/markup breakdown.
- **Line chart** — value changing over time: amortization balance-over-time, compound growth curve, retirement savings projection, debt payoff timeline.
- **Stacked bar chart** — period-by-period composition: amortization schedule shown as principal (green) + interest (amber) per year, credit card payoff showing balance reduction per month.
- Simple two-segment proportion bars (already specified in the result panel above) remain the default for the at-a-glance summary; a full chart is the "see more detail" expansion below it, not a replacement.

**Implementation:** use a lightweight charting library that reads Tailwind CSS variables for its colors rather than hardcoded hex, so charts automatically match both the Ledger palette and the active light/dark theme. Chart.js (canvas-based, small footprint, works fine with static Astro output and no backend) is a reasonable default — confirm current best practice via the Astro Docs MCP server (Section 7) before committing, since integration patterns can change between Astro versions.

---

## 4. Site Architecture

```
src/
  layouts/Layout.astro          — shared <head> (incl. inline pre-paint theme script), fonts, header, footer
  components/
    Header.astro
    Footer.astro
    ThemeToggle.astro            — light/dark toggle, persists to localStorage
    LedgerRow.astro             — reusable nav/list row
    CalculatorShell.astro       — shared two-column input/result layout
    ResultChart.astro            — shared chart wrapper (donut/line/stacked-bar variants), themed via Tailwind tokens
  pages/
    index.astro                  — homepage, categories overview
    mortgage-real-estate/[16 pages]
    auto/[3 pages]
    investment/[16 pages]
    retirement/[9 pages]
    tax-and-salary/[5 pages]
    other/[22 pages]
  scripts/
    finance.js                   — shared formula library (see below)
    charts.js                    — shared chart-config helpers (colors pulled from CSS variables, dark/light aware)
  styles/global.css              — design tokens as CSS variables (both light and dark sets from Section 3)
tailwind.config.[js|ts]          — darkMode: 'class', theme tokens mapped from Section 3
```

**Shared formula library (`finance.js`)** — build these once, reuse across calculators instead of writing 71 one-off formulas:
- `amortizedPayment(principal, annualRate, months)` — standard loan payment formula, used by ~12 calculators
- `amortizationSchedule(principal, annualRate, months, extraPayment)` — full payment-by-payment breakdown, used by amortization/payoff/debt calculators
- `futureValueLumpSum(pv, annualRate, years, compoundsPerYear)`
- `futureValueSeries(pmt, annualRate, years, compoundsPerYear)` — annuity/savings/401k/investment growth
- `presentValue(fv, annualRate, years)`
- `solveRate(pv, fv, periods)` — for "interest rate calculator" style solving
- `irr(cashflows[])` — Newton's method iterative solver
- `applyProgressiveTax(income, brackets[])` — shared by income tax, estate tax, marriage tax

Building this library first means most of the 71 pages become **configuration** (which fields, which formula, which labels) rather than new logic.

---

## 5. Full Calculator Spec (71 calculators, grouped, with formulas)

### A. Mortgage & Real Estate (16)

1. **Mortgage Calculator** — Inputs: home price, down payment, rate, term, property tax, insurance, HOA, PMI. `M = P[r(1+r)^n]/[(1+r)^n − 1]` where r = monthly rate, n = months. Add tax/insurance/HOA/PMI as separate monthly line items summed into total.
2. **Amortization Calculator** — Same payment formula, then output full month-by-month table: interest = balance × r, principal = payment − interest, balance −= principal.
3. **Mortgage Payoff Calculator** — Run amortization schedule with an extra monthly/one-time payment applied to principal each period; report new payoff date and interest saved vs. original schedule.
4. **House Affordability Calculator** — Back-solve max loan: target monthly payment = income × max DTI% − other debts; solve for P given that payment, rate, term.
5. **Rent Calculator** — Rule-of-thumb: recommended rent = gross monthly income × 0.28–0.30, adjustable by user-set ratio; show for multiple income scenarios.
6. **Debt-to-Income Ratio Calculator** — `DTI = (total monthly debt payments / gross monthly income) × 100`. Show front-end (housing only) vs back-end (all debt) ratio.
7. **Real Estate Calculator** — Cap rate = NOI / property value; NOI = gross rental income − operating expenses.
8. **Refinance Calculator** — Compare current loan remaining payments vs new loan payment (incl. closing costs); compute break-even month = closing costs / monthly savings.
9. **Rental Property Calculator** — NOI, cap rate, cash-on-cash return `= annual pre-tax cash flow / total cash invested`, and monthly cash flow after mortgage.
10. **APR Calculator** — Solve effective rate that equates loan proceeds to payment stream including fees, via iterative solve (Newton's method on the payment formula with adjusted principal = loan − fees).
11. **FHA Loan Calculator** — Standard amortized payment + upfront MIP (1.75% of loan, financed) + annual MIP (0.15–0.75%, added monthly).
12. **VA Mortgage Calculator** — Standard amortized payment + VA funding fee (varies by down payment % and usage, financed into loan or paid upfront).
13. **Home Equity Loan Calculator** — Standard amortized payment formula on `(home value × max LTV%) − existing mortgage balance`.
14. **HELOC Calculator** — Draw period: interest-only payment = balance × monthly rate. Repayment period: standard amortized payment on remaining balance over repayment term.
15. **Down Payment Calculator** — Loan amount = price − down payment; flag PMI required if down payment < 20%; show payment at multiple down-payment percentages side by side.
16. **Rent vs. Buy Calculator** — Total cost of renting (rent × months, with annual increase %) vs. total cost of buying (mortgage payments + taxes + maintenance + closing costs − equity built − appreciation); compare net cost over N years.

### B. Auto (3)

17. **Auto Loan Calculator** — Standard amortized payment on `(price + tax + fees − trade-in − down payment)`.
18. **Cash Back or Low Interest Calculator** — Compute total cost (payments) under scenario A (rebate applied, standard rate) vs scenario B (no rebate, promotional low rate); recommend lower total cost.
19. **Auto Lease Calculator** — `Monthly payment = (depreciation fee + finance fee)`, where depreciation fee = (capitalized cost − residual value) / term, finance fee = (capitalized cost + residual value) × money factor.

### C. Investment (16)

20. **Interest Calculator** — Toggle simple vs compound; simple `A = P(1+rt)`, compound `A = P(1+r/n)^(nt)`.
21. **Investment Calculator** — `FV = P(1+r)^t + PMT × [((1+r)^t − 1)/r]` — lump sum plus regular contributions.
22. **Finance Calculator (TVM solver)** — General time-value-of-money: given any 4 of {PV, FV, PMT, rate, N}, solve the 5th algebraically or via iteration.
23. **Compound Interest Calculator** — `A = P(1 + r/n)^(n×t)`, support daily/monthly/quarterly/annual compounding.
24. **Interest Rate Calculator** — Solve `r` from `FV = PV(1+r)^n` → `r = (FV/PV)^(1/n) − 1`.
25. **Savings Calculator** — Future value with regular deposits, same formula as #21 without the lump sum term optional.
26. **Simple Interest Calculator** — `Interest = P × r × t`.
27. **CD Calculator** — Compound interest over fixed term at fixed rate; optional early-withdrawal penalty = X months' interest deducted.
28. **Bond Calculator** — Price = Σ [coupon / (1+y)^t] + [face value / (1+y)^n]; also solve YTM iteratively given price.
29. **Mutual Fund Calculator** — Future value formula (#21) with annual expense ratio deducted from the effective rate: `r_effective = r − expense_ratio`.
30. **Average Return Calculator** — Arithmetic mean of period returns vs geometric mean: `((1+r1)(1+r2)...(1+rn))^(1/n) − 1`.
31. **IRR Calculator** — Solve rate where `Σ CFt / (1+IRR)^t = 0` via Newton-Raphson or bisection over a cash flow series.
32. **ROI Calculator** — `ROI % = (Final Value − Cost) / Cost × 100`, optionally annualized.
33. **Payback Period Calculator** — Accumulate cash flows period by period until cumulative ≥ initial investment; interpolate for fractional period.
34. **Present Value Calculator** — `PV = FV / (1+r)^n`.
35. **Future Value Calculator** — `FV = PV × (1+r)^n`.

### D. Retirement (9)

36. **Retirement Calculator** — Project current savings + contributions growing at expected return to retirement age; then model withdrawal phase against life expectancy to flag if savings run out.
37. **401K Calculator** — Same as #21 but with employer match added (typically match% up to a cap of salary) and contributions capped at IRS annual limit (make this a configurable constant).
38. **Pension Calculator** — `Annual pension = years of service × accrual rate % × final average salary` (standard defined-benefit formula; note this varies by plan).
39. **Social Security Calculator** — Approximate: compute Average Indexed Monthly Earnings (AIME) from top 35 years of indexed earnings, apply SSA bend-point formula to get Primary Insurance Amount. **Flag clearly in the UI that this is an estimate** — the real formula depends on SSA's published bend points and indexing factors, which change yearly.
40. **Annuity Calculator** — Future value of ordinary annuity: `FV = PMT × [((1+r)^n − 1)/r]`; annuity due multiplies by `(1+r)`.
41. **Annuity Payout Calculator** — Solve `PMT` from a lump sum designed to pay out over n periods: `PMT = PV × r / (1 − (1+r)^−n)`.
42. **Roth IRA Calculator** — Future value formula (#21) on after-tax contributions (no tax on withdrawal); show side-by-side with Traditional IRA for comparison.
43. **IRA Calculator** — Future value formula (#21) on pre-tax contributions; apply ordinary income tax on withdrawal for after-tax comparison.
44. **RMD Calculator** — `RMD = account balance (as of Dec 31 prior year) / IRS Uniform Lifetime Table distribution period factor for the account holder's age`. Include the IRS table as a lookup constant.

### E. Tax & Salary (5)

45. **Income Tax Calculator** — Apply progressive bracket table to taxable income (income minus standard/itemized deduction); sum tax owed per bracket. Bracket data should be a configurable/updatable dataset, not hardcoded logic, since brackets change yearly.
46. **Salary Calculator** — Convert between hourly ⇄ daily ⇄ weekly ⇄ monthly ⇄ annual using a configurable hours/week and weeks/year.
47. **Marriage Tax Calculator** — Compute tax owed filing jointly (combined income against joint brackets) vs separately (each income against single brackets); show the difference ("marriage bonus/penalty").
48. **Estate Tax Calculator** — `Taxable estate = gross estate − exemption`; apply estate tax bracket table to the remainder (bracket data configurable, changes yearly).
49. **Take-Home-Paycheck Calculator** — Gross pay − federal income tax (bracket calc) − state tax (configurable rate/table) − FICA (Social Security 6.2% up to wage base + Medicare 1.45%) − pre-tax deductions = net pay.

### F. Other (22)

50. **Loan Calculator** — Generic version of the amortized payment formula (#1 without mortgage-specific extras).
51. **Payment Calculator** — Solve for payment given principal/rate/term, or solve for principal given a target payment — reuses `amortizedPayment` in both directions.
52. **Currency Calculator** — **This one needs a live data source** (only non-fully-static calculator): fetch current exchange rates client-side from a free FX API at page load, then `converted = amount × rate`. Cache the rates client-side for the session.
53. **Inflation Calculator** — `Future value = present value × (1 + inflation rate)^years`; also support solving with historical CPI data if you want it accurate to real history (optional dataset).
54. **Sales Tax Calculator** — `Total = price × (1 + tax rate)`; also solve pre-tax price from a tax-inclusive total.
55. **Credit Card Calculator** — Given balance, APR, and a fixed or minimum payment, iterate month by month (interest = balance × monthly rate, principal = payment − interest) until balance reaches 0; report months and total interest.
56. **Credit Cards Payoff Calculator** — Same monthly iteration across multiple card balances, using avalanche (highest rate first) or snowball (smallest balance first) payment allocation strategy.
57. **Debt Payoff Calculator** — Same iterative payoff engine as #55, generalized to any debt with optional extra payment.
58. **Debt Consolidation Calculator** — Compare total interest/time of paying off multiple debts separately vs. one consolidated loan at a blended/new rate.
59. **Repayment Calculator** — General amortized repayment schedule; support standard, graduated (increasing payments), and income-driven (payment = % of discretionary income) modes.
60. **Student Loan Calculator** — Standard amortized payment (#1 style), plus optional income-driven repayment mode (payment = fixed % of income above a poverty-line threshold).
61. **College Cost Calculator** — Project future tuition cost: `future cost = current cost × (1 + education inflation rate)^years until enrollment`; then solve required monthly savings using the future-value-series formula (#21) to hit that target.
62. **VAT Calculator** — Add VAT: `total = price × (1 + vat rate)`. Remove VAT: `net = total / (1 + vat rate)`.
63. **Depreciation Calculator** — Support straight-line `(cost − salvage)/useful life`, declining balance `book value × rate`, and sum-of-years-digits methods as selectable modes.
64. **Margin Calculator** — `Margin % = (price − cost)/price × 100`. Also solve `Markup % = (price − cost)/cost × 100` and the price given cost + target margin.
65. **Discount Calculator** — `Final price = price × (1 − discount%)`; show amount saved.
66. **Business Loan Calculator** — Standard amortized payment (#1 style) plus optional origination fee added to APR calc.
67. **Personal Loan Calculator** — Standard amortized payment (#1 style).
68. **Boat Loan Calculator** — Standard amortized payment (#1 style), typically longer terms.
69. **Lease Calculator** — Generic version of #19's lease-payment formula, not vehicle-specific.
70. **Budget Calculator** — Sum income categories minus sum expense categories = surplus/deficit; show as proportional bar chart by category (needs/wants/savings or custom categories).
71. **Commission Calculator** — `Commission = sale amount × commission rate`; support tiered/graduated commission structures as an advanced mode.

---

## 6. Build Order (recommended for Antigravity to follow)

**Scope requirement: all 71 calculators from Section 5 must be built. The phased order below is a sequencing strategy, not a scope cut — do not stop after Phase 1 or treat the "top 10" as the deliverable. Every calculator listed in Section 5, across all 6 categories, must exist as a live, working page in the finished site.**

0. Complete the tooling setup in Section 7 (connect the Astro Docs MCP server, install the two skills) before writing any code.
1. Design tokens + `Layout.astro` + `Header`/`Footer` + homepage with all 6 category ledger-lists (all 6 categories linked from day one, even before every page under them exists).
2. `finance.js` shared formula library + `CalculatorShell.astro` reusable two-column pattern.
3. **Phase 1 — build these 10 first** to validate the pattern end-to-end: Mortgage, Loan, Auto Loan, Compound Interest, Investment, Retirement, 401K, Income Tax, Salary, Take-Home-Paycheck.
4. **Phase 2 — build the remaining 6 calculators** in Mortgage & Real Estate and the remaining 14 in Investment (reuse `amortizedPayment` / `futureValueSeries` heavily — most are config, not new code).
5. **Phase 3 — build the remaining 7 in Retirement and remaining 4 in Tax & Salary** (these need the bracket/table datasets — build those as clean, updatable JSON/JS constants, not hardcoded numbers, since tax brackets and IRS tables change yearly).
6. **Phase 4 — build all 22 in the "Other" category.**
7. **Phase 5 — Currency Calculator last** (only one requiring a live API integration).
8. **Phase 6 — completeness check:** confirm all 71 pages from Section 5 exist and are linked from their category page and the homepage. Nothing in Section 5 should be missing, stubbed, or left as a "coming soon" placeholder.
9. Accessibility + performance pass: keyboard nav through all sliders, screen-reader labels on inputs, Lighthouse pass on every template.

---

## 7. Tooling Setup (run before building)

**Step A — Connect the Astro Docs MCP server (do this first, inside Antigravity itself, not the terminal):**

1. Open `~/.gemini/antigravity/mcp_config.json` (see Antigravity's [Connecting Custom MCP Servers guide](https://antigravity.google/docs/mcp#connecting-custom-mcp-servers)).
2. Add this configuration:

```json
{
  "mcpServers": {
    "astro-docs": {
      "serverUrl": "https://mcp.docs.astro.build/mcp"
    }
  }
}
```

3. Save the file, then click **Refresh** in the **Manage MCPs** tab.

This gives Antigravity live access to official Astro documentation while it builds — it should use this MCP to look up current Astro APIs (routing, `output: 'static'` config, content collections, etc.) instead of relying on possibly-stale training data, especially since Astro's API has changed across versions.

**Step B — Install the skills below in the project's terminal:**

Before writing any code, install these skills so every page gets built against current docs and audited automatically:

```bash
npx skills add https://github.com/vercel-labs/agent-skills --skill web-design-guidelines
npx getdesign@latest add vercel
npx skills add Lombiq/Tailwind-Agent-Skills --skill tailwind-4-docs
```

- `web-design-guidelines` is an auditor skill: after building each page, fetch the latest Web Interface Guidelines and check the page against them (accessibility, performance, UX — 100+ rules), fixing anything flagged before moving to the next calculator.
- `getdesign vercel` pulls in Vercel's design-token/component reference conventions as supporting material for spacing, type scale, and component structure discipline — it does not override the Ledger design system in Section 3. If the two conflict, the Ledger tokens (colors, fonts, layout pattern) in Section 3 always win; only use the Vercel guidelines for the universal rules (contrast, focus states, tap targets, responsive breakpoints, semantic HTML) that apply regardless of visual style.
- `tailwind-4-docs` gives the agent an indexed local snapshot of official Tailwind CSS v4 docs plus a curated gotchas list, so it writes correct v4 utility classes and config instead of guessing or mixing v3/v4 syntax. This project is built in Tailwind CSS v4 (Section 3) — map the Ledger design tokens (colors, font families, the hairline-rule/ledger-row spacing scale) into `tailwind.config`/`@theme` rather than hardcoding hex values in class names, so the design stays centrally editable. This skill needs a one-time local docs sync (requires Python 3.8+, git, and internet access) and requires accepting Tailwind's upstream docs license before the snapshot downloads — Antigravity should surface that prompt rather than skip it silently.

**Workflow per calculator page (a page is not done until all 5 steps pass):**
1. Build the page using the `CalculatorShell` pattern and the relevant formula from Section 5.
2. Run it in the local dev server (`npm run dev`) and manually exercise every input — sliders, number fields, dropdowns — confirming the result panel updates live with no page reload and no console errors.
3. Verify the output against the known test value for that calculator (see Section 9) before moving on. If there's no test value listed, compute one by hand or via a trusted independent source and check the page against it.
4. Run the `web-design-guidelines` skill against the new file(s) and fix anything flagged.
5. Move to the next calculator.

---

## 8. Accuracy Notes for Antigravity

- Flag on-page (small note under the result) for any calculator whose formula depends on data that changes yearly or is inherently an approximation: Social Security, RMD table, Income Tax brackets, Estate Tax brackets, FICA wage base. Store these as named constants in one config file so they're easy to update later, not scattered through calculator logic.
- Every amortization-based calculator should share one tested function — do not reimplement the payment formula per page, since a rounding or sign bug in one copy won't get caught by testing another.
- Test each formula against a known example (e.g. a $250,000 mortgage at 6% for 30 years should give a ~$1,498.88 monthly payment) before wiring it to the UI.

---

## 9. Functional QA — Every Calculator Must Actually Run (not just look right)

A calculator that renders correctly but doesn't compute is worse than a missing page — it looks finished and isn't. Every one of the 71 pages must be manually confirmed working in the browser, not just visually reviewed.

**Common reasons a calculator silently fails in Astro — check for these explicitly:**
- Script runs before the DOM elements exist. In `.astro` files, `<script>` tags execute once per page load, but if the script queries an element (`document.getElementById(...)`) before it's rendered, `getElementById` returns `null` and every listener attach silently fails. Put calculator scripts at the end of the component, after the markup, or wrap logic in a `DOMContentLoaded` check.
- Astro's client-side script isolation: each `.astro` file's `<script>` is bundled separately and does not share scope with another page's script by default. If `finance.js` is meant to be shared, it must be a real importable module (`import { amortizedPayment } from '../scripts/finance.js'`), not copy-pasted inline per page and not assumed to be globally available.
- Reused `id` attributes across a shared component (e.g. `CalculatorShell` used 71 times) causing `getElementById` to grab the wrong page's element, or silently grab nothing if the component is used more than once on a page. Prefer scoped queries (`this.closest(...)`, or query within a specific container) over bare global IDs once the same component is reused across many pages.
- Event listeners attached to the initial value only, not re-attached or updating on every `input` event — confirm every field uses `input` (fires continuously while dragging/typing), not just `change` (fires only on blur), so results update live as required in Section 2.
- Division by zero or `NaN` results when a field is temporarily empty or a rate is set to 0 — every formula that divides by rate (`r`) needs a zero-rate fallback path (see Section 5 formulas that already note this, e.g. Mortgage/Loan formulas should fall back to `P/n` when `r = 0`).
- Number formatting functions (like the `toLocaleString` currency formatting) throwing on `NaN`/`undefined` input during the brief moment a field is cleared while being edited — guard against this so the page doesn't crash mid-edit.
- Build passing (`npm run build`) is not the same as the page working — Astro's static build can succeed while client-side JS is broken, since build-time doesn't execute browser scripts. Always verify in the running dev server or a build preview (`npm run preview`), not just a clean build log.

**Required test values — verify each of these exactly before considering that calculator done:**

| Calculator | Inputs | Expected result |
|---|---|---|
| Mortgage / Loan | $250,000, 6% annual, 30 years | ~$1,498.88/month |
| Auto Loan | $30,000, 5% annual, 5 years (60 months) | ~$566.14/month |
| Compound Interest | $10,000 principal, 5% annual, compounded monthly, 10 years | ~$16,470.09 |
| Simple Interest | $10,000 principal, 5% annual, 10 years | $15,000.00 total ($5,000 interest) |
| Future Value | $1,000 present value, 7% annual, 10 years | ~$1,967.15 |
| Present Value | $10,000 future value, 7% annual, 10 years | ~$5,083.49 |
| Sales Tax | $100 price, 8% tax | $108.00 total |
| Discount | $100 price, 20% discount | $80.00 final price |

For any calculator not listed here (Section 5 covers all 71), Antigravity should generate its own hand-verifiable test case using round, simple numbers and cross-check the result against an independent source (a financial calculator reference, not another AI's guess) before marking that page complete.

**Final acceptance check for the whole project:** every calculator listed in Section 5 must (a) exist as a real route, (b) update its result live from user input with no console errors, (c) match its expected value on at least one hand-verified test case, and (d) pass the `web-design-guidelines` audit. A page that fails any of these four is not done — same bar your competitor's 71 working calculators meet today, and the bar this project has to clear to be a credible replacement.
