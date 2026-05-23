// Room-level DEMO data & chart options for both left and right panels.
// All computed values depend on selectedRoom from the store.
// API integration point: replace the computed bodies with reactive API responses.

import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useViewerStore } from '@/stores/viewer'
import { tooltipStyle, axisBase, HOURS, DAYS30, NOW_HOUR } from './useChartStyle.js'
import { rand01 } from './useDemoSeed.js'

export function useRoomData() {
  const { selectedRoom } = storeToRefs(useViewerStore())

  const seed = (key) => rand01(selectedRoom.value || 'room', key)

  // ========================================================
  // LEFT PANEL — Energy & IR
  // ========================================================

  // ---- 空调能耗 ----
  const acHourly = computed(() =>
    HOURS.map((_, h) => {
      const r = seed(`ac_h${h}`)
      if (h < 6)   return +(0.5 + r * 0.5).toFixed(1)
      if (h < 8)   return +(2 + r * 3).toFixed(1)
      if (h <= 20) return +(8 + r * 7).toFixed(1)
      if (h <= 22) return +(3 + r * 3).toFixed(1)
      return +(0.4 + r * 0.3).toFixed(1)
    })
  )

  const acTodayKwh = computed(() =>
    acHourly.value.slice(0, NOW_HOUR + 1).reduce((a, b) => a + b, 0).toFixed(1)
  )

  const acPeakHour = computed(() => {
    let maxVal = -Infinity, maxH = 0
    acHourly.value.forEach((v, h) => { if (v > maxVal) { maxVal = v; maxH = h } })
    return { hour: `${String(maxH).padStart(2, '0')}:00`, value: maxVal.toFixed(1) }
  })

  const acHistory30 = computed(() => DAYS30.map((_, d) => +(75 + seed(`ac_d${d}`) * 95).toFixed(1)))

  const acHistoryStat = computed(() => {
    const v = acHistory30.value
    return { today: v[29], max: Math.max(...v).toFixed(1), min: Math.min(...v).toFixed(1), avg: (v.reduce((a, b) => a + b, 0) / v.length).toFixed(1) }
  })

  // ---- 灯光插座 ----
  const lightHourly = computed(() =>
    HOURS.map((_, h) => {
      const r = seed(`light_h${h}`)
      if (h < 7)   return +(0.05 + r * 0.1).toFixed(2)
      if (h <= 21) return +(1.5 + r * 2).toFixed(1)
      return +(0.2 + r * 0.4).toFixed(1)
    })
  )

  const lightTodayKwh = computed(() =>
    lightHourly.value.slice(0, NOW_HOUR + 1).reduce((a, b) => a + b, 0).toFixed(1)
  )

  const lightHistory30 = computed(() => DAYS30.map((_, d) => +(25 + seed(`light_d${d}`) * 45).toFixed(1)))

  const lightHistoryStat = computed(() => {
    const v = lightHistory30.value
    return { today: v[29], max: Math.max(...v).toFixed(1), min: Math.min(...v).toFixed(1), avg: (v.reduce((a, b) => a + b, 0) / v.length).toFixed(1) }
  })

  // ---- 红外线 ----
  const irHourly = computed(() =>
    HOURS.map((_, h) => {
      const r = seed(`ir_h${h}`)
      if (h < 6)   return Math.round(r * 8)
      if (h < 8)   return Math.round(15 + r * 30)
      if (h >= 9 && h <= 11) return Math.round(60 + r * 35)
      if (h >= 14 && h <= 17) return Math.round(55 + r * 38)
      if (h <= 20) return Math.round(25 + r * 30)
      if (h <= 22) return Math.round(8 + r * 18)
      return Math.round(r * 5)
    })
  )

  const irCurrentActivity = computed(() => irHourly.value[NOW_HOUR])
  const irOccupied = computed(() => irCurrentActivity.value > 30)

  const irHistory30 = computed(() => DAYS30.map((_, d) => Math.round(5 + seed(`ir_d${d}`) * 11)))

  const irHistoryStat = computed(() => {
    const v = irHistory30.value
    return { today: v[29], max: Math.max(...v), min: Math.min(...v), avg: (v.reduce((a, b) => a + b, 0) / v.length).toFixed(1) }
  })

  // ---- Chart options (left) ----
  const acTrendOpt = computed(() => ({
    grid: { left: 28, right: 6, top: 6, bottom: 22 },
    tooltip: {
      trigger: 'axis', ...tooltipStyle,
      formatter: (params) => {
        const p = params[0]
        return `<div style="font-weight:600;color:#13eaeb;margin-bottom:4px">${p.axisValueLabel}:00</div><div style="display:flex;align-items:center;gap:3em;line-height:1.6"><span>${p.marker}空调用电</span><span style="margin-left:auto;font-family:monospace;color:#13eaeb">${p.value} kWh</span></div>`
      }
    },
    xAxis: { type: 'category', data: HOURS, ...axisBase, axisLabel: { ...axisBase.axisLabel, interval: 5 } },
    yAxis: { type: 'value', ...axisBase, splitNumber: 3 },
    series: [{ type: 'bar', data: acHourly.value.map((v, h) => ({ value: v, itemStyle: { color: h === NOW_HOUR ? '#13eaeb' : 'rgba(19,234,235,0.45)', borderRadius: [2, 2, 0, 0] } })), barWidth: '65%' }]
  }))

  const acHistoryOpt = computed(() => ({
    grid: { left: 36, right: 48, top: 28, bottom: 44 },
    tooltip: {
      trigger: 'axis', ...tooltipStyle,
      formatter: (params) => {
        const p = params[0]
        return `<div style="font-weight:600;color:#13eaeb;margin-bottom:4px">${p.axisValueLabel}</div><div style="display:flex;align-items:center;gap:3em;line-height:1.6"><span>${p.marker}空调能耗</span><span style="margin-left:auto;font-family:monospace;color:#13eaeb">${p.value} kWh</span></div>`
      }
    },
    xAxis: { type: 'category', data: DAYS30, ...axisBase, axisLabel: { ...axisBase.axisLabel, interval: 4, rotate: 30 } },
    yAxis: { type: 'value', name: 'kWh', nameTextStyle: { color: 'rgba(182,245,252,0.5)', fontSize: 10 }, ...axisBase, splitNumber: 4 },
    series: [{
      type: 'bar',
      data: acHistory30.value.map((v, i) => ({ value: v, itemStyle: { color: i === 29 ? '#13eaeb' : 'rgba(19,234,235,0.5)', borderRadius: [2, 2, 0, 0] } })),
      barWidth: '60%',
      markLine: { silent: true, symbol: 'none', lineStyle: { color: '#fcd34d', type: 'dashed', width: 1 }, label: { position: 'end', formatter: (p) => `均 ${(+p.value).toFixed(1)}`, color: '#fcd34d', fontSize: 11 }, data: [{ type: 'average' }] }
    }]
  }))

  const lightTrendOpt = computed(() => ({
    grid: { left: 28, right: 6, top: 6, bottom: 22 },
    tooltip: {
      trigger: 'axis', ...tooltipStyle,
      formatter: (params) => {
        const p = params[0]
        return `<div style="font-weight:600;color:#13eaeb;margin-bottom:4px">${p.axisValueLabel}:00</div><div style="display:flex;align-items:center;gap:3em;line-height:1.6"><span>${p.marker}灯光用电</span><span style="margin-left:auto;font-family:monospace;color:#fcd34d">${p.value} kWh</span></div>`
      }
    },
    xAxis: { type: 'category', data: HOURS, ...axisBase, axisLabel: { ...axisBase.axisLabel, interval: 5 } },
    yAxis: { type: 'value', ...axisBase, splitNumber: 3 },
    series: [{ type: 'bar', data: lightHourly.value.map((v, h) => ({ value: v, itemStyle: { color: h === NOW_HOUR ? '#fcd34d' : 'rgba(252,211,77,0.45)', borderRadius: [2, 2, 0, 0] } })), barWidth: '65%' }]
  }))

  const lightHistoryOpt = computed(() => ({
    grid: { left: 36, right: 48, top: 28, bottom: 44 },
    tooltip: {
      trigger: 'axis', ...tooltipStyle,
      formatter: (params) => {
        const p = params[0]
        return `<div style="font-weight:600;color:#13eaeb;margin-bottom:4px">${p.axisValueLabel}</div><div style="display:flex;align-items:center;gap:3em;line-height:1.6"><span>${p.marker}灯光插座能耗</span><span style="margin-left:auto;font-family:monospace;color:#fcd34d">${p.value} kWh</span></div>`
      }
    },
    xAxis: { type: 'category', data: DAYS30, ...axisBase, axisLabel: { ...axisBase.axisLabel, interval: 4, rotate: 30 } },
    yAxis: { type: 'value', name: 'kWh', nameTextStyle: { color: 'rgba(182,245,252,0.5)', fontSize: 10 }, ...axisBase, splitNumber: 4 },
    series: [{
      type: 'bar',
      data: lightHistory30.value.map((v, i) => ({ value: v, itemStyle: { color: i === 29 ? '#fcd34d' : 'rgba(252,211,77,0.45)', borderRadius: [2, 2, 0, 0] } })),
      barWidth: '60%',
      markLine: { silent: true, symbol: 'none', lineStyle: { color: '#13eaeb', type: 'dashed', width: 1 }, label: { position: 'end', formatter: (p) => `均 ${(+p.value).toFixed(1)}`, color: '#13eaeb', fontSize: 11 }, data: [{ type: 'average' }] }
    }]
  }))

  const irTrendOpt = computed(() => ({
    grid: { left: 28, right: 6, top: 6, bottom: 22 },
    tooltip: {
      trigger: 'axis', ...tooltipStyle,
      formatter: (params) => {
        const p = params[0]
        const v = p.value
        const color = v > 60 ? '#fb7185' : v > 30 ? '#fcd34d' : '#13eaeb'
        return `<div style="font-weight:600;color:#13eaeb;margin-bottom:4px">${p.axisValueLabel}:00</div><div style="display:flex;align-items:center;gap:3em;line-height:1.6"><span>${p.marker}活跃度</span><span style="margin-left:auto;font-family:monospace;color:${color}">${v}%</span></div>`
      }
    },
    xAxis: { type: 'category', data: HOURS, ...axisBase, axisLabel: { ...axisBase.axisLabel, interval: 5 } },
    yAxis: { type: 'value', min: 0, max: 100, ...axisBase, splitNumber: 2 },
    series: [{
      type: 'bar',
      data: irHourly.value.map((v, h) => ({
        value: v,
        itemStyle: {
          color: h === NOW_HOUR
            ? (v > 60 ? '#fb7185' : v > 30 ? '#fcd34d' : '#13eaeb')
            : (v > 60 ? 'rgba(251,113,133,0.55)' : v > 30 ? 'rgba(252,211,77,0.45)' : 'rgba(19,234,235,0.4)'),
          borderRadius: [2, 2, 0, 0]
        }
      })),
      barWidth: '65%'
    }]
  }))

  const irHistoryOpt = computed(() => ({
    grid: { left: 36, right: 48, top: 28, bottom: 44 },
    tooltip: {
      trigger: 'axis', ...tooltipStyle,
      formatter: (params) => {
        const p = params[0]
        const v = p.value
        const color = v > 10 ? '#fb7185' : v > 7 ? '#fcd34d' : '#34d399'
        return `<div style="font-weight:600;color:#13eaeb;margin-bottom:4px">${p.axisValueLabel}</div><div style="display:flex;align-items:center;gap:3em;line-height:1.6"><span>${p.marker}日均使用时长</span><span style="margin-left:auto;font-family:monospace;color:${color}">${v} h</span></div>`
      }
    },
    xAxis: { type: 'category', data: DAYS30, ...axisBase, axisLabel: { ...axisBase.axisLabel, interval: 4, rotate: 30 } },
    yAxis: { type: 'value', name: '小时', nameTextStyle: { color: 'rgba(182,245,252,0.5)', fontSize: 10 }, min: 0, max: 24, ...axisBase, splitNumber: 4 },
    series: [{
      type: 'bar',
      data: irHistory30.value.map((v, i) => ({
        value: v,
        itemStyle: {
          color: i === 29
            ? (v > 10 ? '#fb7185' : v > 7 ? '#fcd34d' : '#34d399')
            : (v > 10 ? 'rgba(251,113,133,0.5)' : v > 7 ? 'rgba(252,211,77,0.4)' : 'rgba(52,211,153,0.4)'),
          borderRadius: [2, 2, 0, 0]
        }
      })),
      barWidth: '60%',
      markLine: { silent: true, symbol: 'none', lineStyle: { color: '#60a5fa', type: 'dashed', width: 1 }, label: { position: 'end', formatter: (p) => `均 ${(+p.value).toFixed(1)}h`, color: '#60a5fa', fontSize: 11 }, data: [{ type: 'average' }] }
    }]
  }))

  // ========================================================
  // RIGHT PANEL — Environment sensors
  // ========================================================

  // ---- 温度 ----
  const tempHourly = computed(() =>
    HOURS.map((_, h) => {
      const r = seed(`t_h${h}`)
      if (h < 6)   return +(18 + r * 3).toFixed(1)
      if (h < 8)   return +(20 + r * 4).toFixed(1)
      if (h <= 14) return +(23 + r * 6).toFixed(1)
      if (h <= 20) return +(22 + r * 4).toFixed(1)
      return +(19 + r * 3).toFixed(1)
    })
  )

  const tempCurrent = computed(() => +tempHourly.value[NOW_HOUR])
  const tempStatus = computed(() => tempCurrent.value >= 28 ? 'danger' : tempCurrent.value >= 26 ? 'warning' : 'normal')

  const tempHistory30 = computed(() =>
    DAYS30.map((_, d) => {
      const avg = +(20 + seed(`t_avg${d}`) * 9).toFixed(1)
      const spread = +(2 + seed(`t_sp${d}`) * 3).toFixed(1)
      return { avg, min: +(avg - spread * 0.6).toFixed(1), max: +(avg + spread * 0.4).toFixed(1) }
    })
  )

  const tempHistoryStat = computed(() => {
    const avgs = tempHistory30.value.map((d) => d.avg)
    return {
      today: tempCurrent.value.toFixed(1),
      max: Math.max(...tempHistory30.value.map((d) => d.max)).toFixed(1),
      min: Math.min(...tempHistory30.value.map((d) => d.min)).toFixed(1),
      avg: (avgs.reduce((a, b) => a + b, 0) / avgs.length).toFixed(1)
    }
  })

  // ---- 湿度 ----
  const humHourly = computed(() =>
    HOURS.map((_, h) => {
      const r = seed(`hum_h${h}`)
      if (h < 8)   return Math.round(60 + r * 15)
      if (h <= 20) return Math.round(42 + r * 22)
      return Math.round(55 + r * 15)
    })
  )

  const humCurrent = computed(() => humHourly.value[NOW_HOUR])
  const humStatus = computed(() => humCurrent.value >= 70 || humCurrent.value < 35 ? 'warning' : 'normal')
  const humHistory30 = computed(() => DAYS30.map((_, d) => Math.round(40 + seed(`hum_d${d}`) * 35)))

  const humHistoryStat = computed(() => {
    const v = humHistory30.value
    return { today: humCurrent.value, max: Math.max(...v), min: Math.min(...v), avg: Math.round(v.reduce((a, b) => a + b, 0) / v.length) }
  })

  // ---- CO₂ ----
  const co2Hourly = computed(() =>
    HOURS.map((_, h) => {
      const r = seed(`co2_h${h}`)
      if (h < 6)   return Math.round(400 + r * 80)
      if (h < 8)   return Math.round(500 + r * 200)
      if (h >= 9 && h <= 11) return Math.round(900 + r * 500)
      if (h >= 14 && h <= 17) return Math.round(850 + r * 450)
      if (h <= 20) return Math.round(600 + r * 300)
      return Math.round(450 + r * 150)
    })
  )

  const co2Current = computed(() => co2Hourly.value[NOW_HOUR])
  const co2Status = computed(() => co2Current.value >= 1500 ? 'danger' : co2Current.value >= 1000 ? 'warning' : 'normal')
  const co2History30 = computed(() => DAYS30.map((_, d) => Math.round(500 + seed(`co2_d${d}`) * 900)))

  const co2HistoryStat = computed(() => {
    const v = co2History30.value
    return { today: co2Current.value, max: Math.max(...v), min: Math.min(...v), avg: Math.round(v.reduce((a, b) => a + b, 0) / v.length) }
  })

  // ---- Chart options (right) ----
  const tempTrendOpt = computed(() => ({
    grid: { left: 28, right: 34, top: 12, bottom: 22 },
    tooltip: {
      trigger: 'axis', ...tooltipStyle,
      formatter: (params) => {
        const p = params[0]
        return `<div style="font-weight:600;color:#13eaeb;margin-bottom:4px">${p.axisValueLabel}:00</div><div style="display:flex;align-items:center;gap:3em;line-height:1.6"><span>${p.marker}温度</span><span style="margin-left:auto;font-family:monospace;color:#fb7185">${p.value}°C</span></div>`
      }
    },
    xAxis: { type: 'category', data: HOURS, ...axisBase, axisLabel: { ...axisBase.axisLabel, interval: 5 } },
    yAxis: { type: 'value', min: 15, max: 35, ...axisBase, splitNumber: 3 },
    series: [{
      type: 'line', data: tempHourly.value, color: '#fb7185', smooth: true, symbol: 'none', lineStyle: { width: 1.5 },
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(251,113,133,0.3)' }, { offset: 1, color: 'rgba(251,113,133,0)' }] } },
      markLine: { silent: true, symbol: 'none', data: [{ yAxis: 22, lineStyle: { color: 'rgba(19,234,235,0.35)', type: 'dashed', width: 1 }, label: { formatter: '22°C', color: 'rgba(19,234,235,0.6)', fontSize: 10 } }, { yAxis: 26, lineStyle: { color: 'rgba(19,234,235,0.35)', type: 'dashed', width: 1 }, label: { formatter: '26°C', color: 'rgba(19,234,235,0.6)', fontSize: 10 } }] }
    }]
  }))

  const tempHistoryOpt = computed(() => ({
    grid: { left: 36, right: 8, top: 28, bottom: 44 },
    tooltip: {
      trigger: 'axis', ...tooltipStyle,
      formatter: (params) => {
        const [minS, rangeS, avgS] = params
        const dayMin = +minS.data
        const dayMax = +(dayMin + rangeS.data).toFixed(1)
        return (
          `<div style="font-weight:600;color:#13eaeb;margin-bottom:4px">${minS.axisValueLabel}</div>` +
          `<div style="display:flex;align-items:center;gap:3em;line-height:1.6"><span>最高</span><span style="margin-left:auto;font-family:monospace;color:#fb7185">${dayMax}°C</span></div>` +
          `<div style="display:flex;align-items:center;gap:3em;line-height:1.6"><span>均值</span><span style="margin-left:auto;font-family:monospace;color:#fcd34d">${+avgS.data}°C</span></div>` +
          `<div style="display:flex;align-items:center;gap:3em;line-height:1.6"><span>最低</span><span style="margin-left:auto;font-family:monospace;color:#60a5fa">${dayMin}°C</span></div>`
        )
      }
    },
    legend: { top: 0, left: 'center', icon: 'roundRect', itemWidth: 16, itemHeight: 6, textStyle: { color: 'rgba(182,245,252,0.8)', fontSize: 12 }, data: ['高低温范围', '日均温'] },
    xAxis: { type: 'category', data: DAYS30, ...axisBase, axisLabel: { ...axisBase.axisLabel, interval: 4, rotate: 30 } },
    yAxis: { type: 'value', name: '°C', nameTextStyle: { color: 'rgba(182,245,252,0.5)', fontSize: 10 }, ...axisBase, splitNumber: 4 },
    series: [
      { name: '最低', type: 'line', data: tempHistory30.value.map((d) => d.min), stack: 'band', lineStyle: { opacity: 0 }, symbol: 'none', color: 'transparent', legendHoverLink: false, showSymbol: false, silent: true },
      { name: '高低温范围', type: 'line', data: tempHistory30.value.map((d) => +(d.max - d.min).toFixed(1)), stack: 'band', lineStyle: { opacity: 0 }, symbol: 'none', areaStyle: { color: 'rgba(251,113,133,0.18)' }, itemStyle: { color: 'rgba(251,113,133,0.5)' } },
      { name: '日均温', type: 'line', data: tempHistory30.value.map((d) => d.avg), color: '#fcd34d', smooth: true, symbol: 'circle', symbolSize: 4, lineStyle: { width: 2 } }
    ]
  }))

  const humTrendOpt = computed(() => ({
    grid: { left: 28, right: 8, top: 6, bottom: 22 },
    tooltip: {
      trigger: 'axis', ...tooltipStyle,
      formatter: (params) => {
        const p = params[0]
        return `<div style="font-weight:600;color:#13eaeb;margin-bottom:4px">${p.axisValueLabel}:00</div><div style="display:flex;align-items:center;gap:3em;line-height:1.6"><span>${p.marker}湿度</span><span style="margin-left:auto;font-family:monospace;color:#60a5fa">${p.value}%</span></div>`
      }
    },
    xAxis: { type: 'category', data: HOURS, ...axisBase, axisLabel: { ...axisBase.axisLabel, interval: 5 } },
    yAxis: { type: 'value', min: 20, max: 90, ...axisBase, splitNumber: 3 },
    series: [{
      type: 'line', data: humHourly.value, color: '#60a5fa', smooth: true, symbol: 'none', lineStyle: { width: 1.5 },
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(96,165,250,0.3)' }, { offset: 1, color: 'rgba(96,165,250,0)' }] } },
      markArea: { silent: true, itemStyle: { color: 'rgba(96,165,250,0.07)', borderColor: 'rgba(96,165,250,0.25)', borderWidth: 1 }, label: { show: true, position: 'insideTop', formatter: '适宜', color: 'rgba(147,197,253,0.7)', fontSize: 10 }, data: [[{ yAxis: 40 }, { yAxis: 60 }]] }
    }]
  }))

  const humHistoryOpt = computed(() => ({
    grid: { left: 36, right: 48, top: 28, bottom: 44 },
    tooltip: {
      trigger: 'axis', ...tooltipStyle,
      formatter: (params) => {
        const p = params[0]
        return `<div style="font-weight:600;color:#13eaeb;margin-bottom:4px">${p.axisValueLabel}</div><div style="display:flex;align-items:center;gap:3em;line-height:1.6"><span>${p.marker}日均湿度</span><span style="margin-left:auto;font-family:monospace;color:#60a5fa">${p.value}%</span></div>`
      }
    },
    xAxis: { type: 'category', data: DAYS30, ...axisBase, axisLabel: { ...axisBase.axisLabel, interval: 4, rotate: 30 } },
    yAxis: { type: 'value', name: '%', nameTextStyle: { color: 'rgba(182,245,252,0.5)', fontSize: 10 }, min: 20, max: 90, ...axisBase, splitNumber: 4 },
    series: [{
      name: '日均湿度', type: 'line', data: humHistory30.value, color: '#60a5fa', smooth: true, symbol: 'circle', symbolSize: 4, lineStyle: { width: 2 },
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(96,165,250,0.25)' }, { offset: 1, color: 'rgba(96,165,250,0)' }] } },
      markArea: { silent: true, itemStyle: { color: 'rgba(96,165,250,0.07)', borderColor: 'rgba(96,165,250,0.2)', borderWidth: 1 }, data: [[{ yAxis: 40 }, { yAxis: 60 }]] },
      markLine: { silent: true, symbol: 'none', lineStyle: { color: '#fcd34d', type: 'dashed', width: 1 }, label: { position: 'end', formatter: (p) => `均 ${Math.round(+p.value)}%`, color: '#fcd34d', fontSize: 11 }, data: [{ type: 'average' }] }
    }]
  }))

  const co2TrendOpt = computed(() => ({
    grid: { left: 36, right: 34, top: 12, bottom: 22 },
    tooltip: {
      trigger: 'axis', ...tooltipStyle,
      formatter: (params) => {
        const p = params[0]
        return `<div style="font-weight:600;color:#13eaeb;margin-bottom:4px">${p.axisValueLabel}:00</div><div style="display:flex;align-items:center;gap:3em;line-height:1.6"><span>${p.marker}CO₂ 浓度</span><span style="margin-left:auto;font-family:monospace;color:#34d399">${p.value} ppm</span></div>`
      }
    },
    xAxis: { type: 'category', data: HOURS, ...axisBase, axisLabel: { ...axisBase.axisLabel, interval: 5 } },
    yAxis: { type: 'value', ...axisBase, splitNumber: 3 },
    series: [{
      type: 'line', data: co2Hourly.value, color: '#34d399', smooth: true, symbol: 'none', lineStyle: { width: 1.5 },
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(52,211,153,0.3)' }, { offset: 1, color: 'rgba(52,211,153,0)' }] } },
      markLine: { silent: true, symbol: 'none', data: [{ yAxis: 1000, lineStyle: { color: '#fcd34d', type: 'dashed', width: 1 }, label: { formatter: '1000', color: '#fcd34d', fontSize: 10 } }, { yAxis: 1500, lineStyle: { color: '#fb7185', type: 'dashed', width: 1 }, label: { formatter: '1500', color: '#fb7185', fontSize: 10 } }] }
    }]
  }))

  const co2HistoryOpt = computed(() => ({
    grid: { left: 40, right: 48, top: 28, bottom: 44 },
    tooltip: {
      trigger: 'axis', ...tooltipStyle,
      formatter: (params) => {
        const p = params[0]
        return `<div style="font-weight:600;color:#13eaeb;margin-bottom:4px">${p.axisValueLabel}</div><div style="display:flex;align-items:center;gap:3em;line-height:1.6"><span>${p.marker}CO₂ 日均浓度</span><span style="margin-left:auto;font-family:monospace;color:#34d399">${p.value} ppm</span></div>`
      }
    },
    xAxis: { type: 'category', data: DAYS30, ...axisBase, axisLabel: { ...axisBase.axisLabel, interval: 4, rotate: 30 } },
    yAxis: { type: 'value', name: 'ppm', nameTextStyle: { color: 'rgba(182,245,252,0.5)', fontSize: 10 }, ...axisBase, splitNumber: 4 },
    series: [{
      name: 'CO₂ 日均浓度', type: 'bar',
      data: co2History30.value.map((v, i) => ({
        value: v,
        itemStyle: {
          color: i === 29
            ? (v >= 1500 ? '#fb7185' : v >= 1000 ? '#fcd34d' : '#34d399')
            : (v >= 1500 ? 'rgba(251,113,133,0.55)' : v >= 1000 ? 'rgba(252,211,77,0.45)' : 'rgba(52,211,153,0.45)'),
          borderRadius: [2, 2, 0, 0]
        }
      })),
      barWidth: '60%',
      markLine: { silent: true, symbol: 'none', lineStyle: { color: '#fcd34d', type: 'dashed', width: 1 }, label: { position: 'end', formatter: (p) => `均 ${Math.round(+p.value)}`, color: '#fcd34d', fontSize: 11 }, data: [{ type: 'average' }] }
    }]
  }))

  return {
    // left panel — energy & IR
    acHourly, acTodayKwh, acPeakHour, acHistoryStat, acTrendOpt, acHistoryOpt,
    lightHourly, lightTodayKwh, lightHistoryStat, lightTrendOpt, lightHistoryOpt,
    irCurrentActivity, irOccupied, irHistoryStat, irTrendOpt, irHistoryOpt,
    // right panel — environment
    tempCurrent, tempStatus, tempHistoryStat, tempTrendOpt, tempHistoryOpt,
    humCurrent, humStatus, humHistoryStat, humTrendOpt, humHistoryOpt,
    co2Current, co2Status, co2HistoryStat, co2TrendOpt, co2HistoryOpt
  }
}
