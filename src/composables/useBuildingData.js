// Building-level DEMO data & chart options.
// All values are static (no reactive deps) — swap the raw arrays/objects
// for API response fields when the endpoint is ready.

import { tooltipStyle, axisBase, HOURS } from './useChartStyle.js'

// ---- 气象站 ----
export const weatherMetrics = [
  { icon: 'lucide:thermometer', label: '温度', value: '24.6', unit: '°C' },
  { icon: 'lucide:droplets', label: '湿度', value: '87', unit: '%', status: 'warning' },
  { icon: 'lucide:droplet', label: '露点', value: '15.8', unit: '°C' },
  { icon: 'lucide:gauge', label: '气压', value: '1013', unit: 'hPa' },
  { icon: 'lucide:compass', label: '风向', value: 'ENE', unit: '67°' },
  { icon: 'lucide:wind', label: '风速', value: '3.2', unit: 'm/s' },
  { icon: 'lucide:cloud-rain', label: '降水量', value: '78.0', unit: 'mm', status: 'danger' }
]

// ---- 空气质量（环形仪表） ----
export const airQualityGauges = [
  { label: 'CO₂', value: 612, max: 1500, unit: 'ppm', status: 'normal' },
  { label: 'PM2.5', value: 42, max: 150, unit: 'μg/m³', status: 'warning' },
  { label: 'PM10', value: 68, max: 200, unit: 'μg/m³', status: 'danger' }
]

// ---- 太阳辐射（当前值） ----
export const solarMetrics = [
  { icon: 'lucide:sun', label: '直接辐射', value: '786', unit: 'W/m²', status: 'normal' },
  { icon: 'lucide:sun-dim', label: '散射辐射', value: '142', unit: 'W/m²', status: 'warning' },
  { icon: 'lucide:rainbow', label: '光谱辐射', value: '923', unit: 'W/m²', status: 'danger' }
]

// ---- 太阳辐射 24h 趋势 ----
const SOLAR_DIRECT   = [0, 0, 0, 0, 0, 0, 35, 180, 380, 580, 740, 850, 920, 905, 825, 690, 510, 290, 110, 25, 0, 0, 0, 0]
const SOLAR_DIFFUSE  = [0, 0, 0, 0, 0, 8, 28, 65, 105, 135, 152, 168, 175, 172, 158, 138, 108, 68, 35, 12, 0, 0, 0, 0]
const SOLAR_SPECTRUM = [0, 0, 0, 0, 0, 0, 48, 220, 460, 680, 850, 990, 1080, 1055, 950, 800, 590, 340, 150, 35, 0, 0, 0, 0]

export const solarTrendOption = {
  grid: { left: 38, right: 8, top: 26, bottom: 22 },
  tooltip: {
    trigger: 'axis',
    ...tooltipStyle,
    axisPointer: { lineStyle: { color: 'rgba(19,234,235,0.4)' } },
    formatter: (params) => {
      const hour = params[0].axisValueLabel
      return (
        `<div style="font-weight:600;color:#13eaeb;margin-bottom:4px">${hour}:00</div>` +
        params.map((p) => `<div style="display:flex;align-items:center;gap:3em;line-height:1.6"><span>${p.marker}${p.seriesName}</span><span style="margin-left:auto;font-family:monospace;color:${p.color}">${p.value} W/m²</span></div>`).join('')
      )
    }
  },
  legend: {
    top: 0, right: 0, icon: 'roundRect', itemWidth: 8, itemHeight: 4,
    textStyle: { color: 'rgba(182,245,252,0.8)', fontSize: 12 }
  },
  xAxis: { type: 'category', data: HOURS, ...axisBase, axisLabel: { ...axisBase.axisLabel, interval: 3 } },
  yAxis: { type: 'value', ...axisBase, splitNumber: 3 },
  series: [
    {
      name: '直接辐射', type: 'line', color: '#13eaeb', smooth: true, symbol: 'none',
      data: SOLAR_DIRECT, lineStyle: { width: 1.5 },
      areaStyle: {
        color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(19,234,235,0.35)' }, { offset: 1, color: 'rgba(19,234,235,0)' }] }
      },
      markPoint: { symbol: 'pin', symbolSize: 32, itemStyle: { color: '#13eaeb' }, label: { fontSize: 10, color: '#060a1d' }, data: [{ type: 'max', name: '峰值' }] }
    },
    { name: '散射辐射', type: 'line', color: '#fcd34d', smooth: true, symbol: 'none', data: SOLAR_DIFFUSE, lineStyle: { width: 1.5 } },
    { name: '光谱辐射', type: 'line', color: '#fb7185', smooth: true, symbol: 'none', data: SOLAR_SPECTRUM, lineStyle: { width: 1.5, type: 'dashed' } }
  ]
}

// ---- 空气质量 24h 趋势 ----
const CO2_TREND  = [420, 425, 430, 430, 435, 450, 520, 680, 850, 920, 870, 780, 620, 590, 720, 820, 750, 680, 580, 520, 480, 450, 430, 420]
const PM25_TREND = [28, 25, 22, 20, 18, 22, 35, 48, 55, 62, 58, 52, 42, 38, 45, 56, 68, 72, 65, 55, 48, 42, 38, 32]
const PM10_TREND = [58, 55, 50, 48, 45, 52, 72, 95, 105, 118, 110, 102, 85, 78, 88, 105, 125, 138, 128, 108, 92, 82, 72, 65]

export const airTrendOption = {
  grid: { left: 32, right: 32, top: 22, bottom: 22 },
  tooltip: {
    trigger: 'axis',
    ...tooltipStyle,
    axisPointer: { lineStyle: { color: 'rgba(19,234,235,0.4)' } },
    formatter: (params) => {
      const hour = params[0].axisValueLabel
      const units = { 'CO₂': 'ppm', 'PM2.5': 'μg/m³', PM10: 'μg/m³' }
      return (
        `<div style="font-weight:600;color:#13eaeb;margin-bottom:4px">${hour}:00</div>` +
        params.map((p) => `<div style="display:flex;align-items:center;gap:3em;line-height:1.6"><span>${p.marker}${p.seriesName}</span><span style="margin-left:auto;font-family:monospace;color:${p.color}">${p.value} ${units[p.seriesName] ?? ''}</span></div>`).join('')
      )
    }
  },
  legend: {
    top: 0, left: 'center', icon: 'roundRect', itemWidth: 8, itemHeight: 4,
    textStyle: { color: 'rgba(182,245,252,0.8)', fontSize: 12 }
  },
  xAxis: { type: 'category', data: HOURS, ...axisBase, axisLabel: { ...axisBase.axisLabel, interval: 5 } },
  yAxis: [
    { type: 'value', name: 'ppm', nameTextStyle: { color: 'rgba(182,245,252,0.5)', fontSize: 10 }, ...axisBase, splitNumber: 3 },
    { type: 'value', name: 'μg/m³', nameTextStyle: { color: 'rgba(182,245,252,0.5)', fontSize: 10 }, ...axisBase, splitLine: { show: false }, splitNumber: 3 }
  ],
  series: [
    { name: 'CO₂',   type: 'line', color: '#13eaeb', smooth: true, symbol: 'none', data: CO2_TREND,  yAxisIndex: 0, lineStyle: { width: 1.5 } },
    { name: 'PM2.5', type: 'line', color: '#fcd34d', smooth: true, symbol: 'none', data: PM25_TREND, yAxisIndex: 1, lineStyle: { width: 1.5 } },
    { name: 'PM10',  type: 'line', color: '#fb7185', smooth: true, symbol: 'none', data: PM10_TREND, yAxisIndex: 1, lineStyle: { width: 1.5 } }
  ]
}
