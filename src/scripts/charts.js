import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

/**
 * Gets active theme colors from root CSS variables
 */
export function getThemeColors() {
  const style = getComputedStyle(document.documentElement);
  return {
    green: style.getPropertyValue('--green').trim() || '#2F6F52',
    greenDark: style.getPropertyValue('--green-dark').trim() || '#1E4E38',
    amber: style.getPropertyValue('--amber').trim() || '#C98A2C',
    ink: style.getPropertyValue('--ink').trim() || '#16231D',
    inkSoft: style.getPropertyValue('--ink-soft').trim() || '#4A554C',
    paper: style.getPropertyValue('--paper').trim() || '#EEF2ED',
    paperRaised: style.getPropertyValue('--paper-raised').trim() || '#F7F9F6',
    rule: style.getPropertyValue('--rule').trim() || '#C7CBC0',
  };
}

/**
 * Creates or updates a Donut Chart
 */
export function renderDonutChart(canvasEl, labels, data, colors) {
  if (!canvasEl) return null;
  const theme = getThemeColors();
  const bgColors = colors || [theme.green, theme.amber, '#4A90E2', '#E74C3C'];
  
  if (canvasEl.chartInstance) {
    canvasEl.chartInstance.destroy();
  }

  const chart = new Chart(canvasEl, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: bgColors,
        borderWidth: 2,
        borderColor: theme.paperRaised,
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: theme.ink,
            font: { family: 'Inter', size: 12 },
            padding: 16
          }
        },
        tooltip: {
          backgroundColor: theme.ink,
          titleColor: theme.paper,
          bodyColor: theme.paper,
          bodyFont: { family: 'IBM Plex Mono' },
          padding: 10,
          cornerRadius: 6
        }
      },
      cutout: '70%'
    }
  });

  canvasEl.chartInstance = chart;
  return chart;
}

/**
 * Creates or updates a Line Chart (e.g., Amortization balance over time)
 */
export function renderLineChart(canvasEl, labels, datasets) {
  if (!canvasEl) return null;
  const theme = getThemeColors();

  if (canvasEl.chartInstance) {
    canvasEl.chartInstance.destroy();
  }

  const chart = new Chart(canvasEl, {
    type: 'line',
    data: {
      labels: labels,
      datasets: datasets.map((ds, idx) => ({
        label: ds.label,
        data: ds.data,
        borderColor: ds.borderColor || (idx === 0 ? theme.green : theme.amber),
        backgroundColor: ds.backgroundColor || 'transparent',
        borderWidth: 2,
        pointRadius: ds.data.length > 50 ? 0 : 3,
        tension: 0.2,
        fill: ds.fill || false
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: { color: theme.rule + '40' },
          ticks: { color: theme.inkSoft, font: { family: 'Inter', size: 11 } }
        },
        y: {
          grid: { color: theme.rule + '40' },
          ticks: {
            color: theme.inkSoft,
            font: { family: 'IBM Plex Mono', size: 11 },
            callback: (val) => '$' + Number(val).toLocaleString()
          }
        }
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: theme.ink, font: { family: 'Inter', size: 12 } }
        },
        tooltip: {
          backgroundColor: theme.ink,
          titleColor: theme.paper,
          bodyColor: theme.paper,
          bodyFont: { family: 'IBM Plex Mono' }
        }
      }
    }
  });

  canvasEl.chartInstance = chart;
  return chart;
}
