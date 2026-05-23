// Shared ECharts style constants — import these instead of redeclaring in each component

export const tooltipStyle = {
  backgroundColor: 'rgba(6,10,29,0.92)',
  borderColor: 'rgba(19,234,235,0.5)',
  borderWidth: 1,
  textStyle: { color: '#b6f5fc', fontSize: 12 },
  extraCssText: 'box-shadow: 0 0 12px rgba(19,234,235,0.25)'
}

export const axisBase = {
  axisLine: { lineStyle: { color: 'rgba(19,234,235,0.25)' } },
  axisTick: { lineStyle: { color: 'rgba(19,234,235,0.25)' } },
  axisLabel: { color: 'rgba(182,245,252,0.65)', fontSize: 10 },
  splitLine: { lineStyle: { color: 'rgba(19,234,235,0.08)' } }
}

export const HOURS = Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, '0')}`)

export const DAYS30 = Array.from({ length: 30 }, (_, d) => {
  const dt = new Date(2026, 4, 23 - 29 + d)
  return `${dt.getMonth() + 1}/${dt.getDate()}`
})

// Captured at app boot; API will supersede this with server timestamp
export const NOW_HOUR = new Date().getHours()
