<script setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useViewerStore } from '@/stores/viewer'
import BasePanel from '@/components/ui/BasePanel.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import GaugeRing from '@/components/ui/GaugeRing.vue'
import EChart from '@/components/ui/EChart.vue'

const store = useViewerStore()
const { level, currentFloor, selectedRoom } = storeToRefs(store)

// ---------- 楼层级 · 各房间传感器 DEMO 数据 ----------
// 当模型无房间数据时的 fallback 房间列表
const DEMO_ROOM_NAMES = [
  '办公室-A',
  '办公室-B',
  '办公室-C',
  '办公室-D',
  '办公室-E',
  '会议室-1',
  '会议室-2',
  '会议室-3',
  '会议室-4',
  '会议室-5',
  '报告厅',
  '展示厅',
  '茶水间',
  '休息室-1',
  '休息室-2',
  '走廊-北',
  '走廊-中',
  '走廊-南',
  '楼梯间-东',
  '楼梯间-西',
  '卫生间-男',
  '卫生间-女',
  '储物间-1',
  '储物间-2',
  '储物间-3',
  '机房',
  '网络机房',
  '配电室',
  '消控室',
  '接待区',
  '档案室',
  '资料室',
  '保密室',
  '财务室',
  '总经理办'
]

// 获取要显示的房间列表（fallback 到 demo 数据确保总有多房间数据）
const roomNames = computed(() => {
  const floorRooms = currentFloor.value?.roomNames
  return Array.isArray(floorRooms) && floorRooms.length > 1 ? floorRooms : DEMO_ROOM_NAMES
})

const seedOf = (name, key) => {
  const s = name + '|' + key
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = ((h ^ s.charCodeAt(i)) * 16777619) >>> 0
  return h
}
const rand01 = (name, key) => seedOf(name, key) / 0xffffffff

const statusText = {
  normal: 'text-cyan-50',
  warning: 'text-amber-300',
  danger: 'text-rose-400'
}

const tempHumidityRows = computed(() =>
  roomNames.value.map((name) => {
    const t = 20 + rand01(name, 'temp') * 10
    const h = 30 + rand01(name, 'hum') * 50
    return {
      name,
      temp: t.toFixed(1),
      tempStatus: t >= 28 ? 'danger' : t >= 26 ? 'warning' : 'normal',
      humidity: h.toFixed(0),
      humStatus: h >= 70 || h < 35 ? 'warning' : 'normal'
    }
  })
)

const co2Rows = computed(() =>
  roomNames.value.map((name) => {
    const v = 400 + Math.floor(rand01(name, 'co2') * 1300)
    return {
      name,
      value: v,
      status: v >= 1500 ? 'danger' : v >= 1000 ? 'warning' : 'normal'
    }
  })
)

const irRows = computed(() =>
  roomNames.value.map((name) => {
    const occupied = seedOf(name, 'ir') % 3 !== 0
    const lastSeen = Math.floor(rand01(name, 'last') * 58) + 1
    return { name, occupied, lastSeen }
  })
)

// ---------- 楼层级 · 温湿度散点图 ----------
const tooltipStyle = {
  backgroundColor: 'rgba(6,10,29,0.92)',
  borderColor: 'rgba(19,234,235,0.5)',
  borderWidth: 1,
  textStyle: { color: '#b6f5fc', fontSize: 12 },
  extraCssText: 'box-shadow: 0 0 12px rgba(19,234,235,0.25)'
}

const axisBase = {
  axisLine: { lineStyle: { color: 'rgba(19,234,235,0.25)' } },
  axisTick: { lineStyle: { color: 'rgba(19,234,235,0.25)' } },
  axisLabel: { color: 'rgba(182,245,252,0.65)', fontSize: 10 },
  splitLine: { lineStyle: { color: 'rgba(19,234,235,0.08)' } }
}

const scatterPoints = computed(() =>
  tempHumidityRows.value.map((r) => {
    const color =
      r.tempStatus === 'danger' || r.humStatus === 'danger'
        ? '#fb7185'
        : r.tempStatus === 'warning' || r.humStatus === 'warning'
          ? '#fcd34d'
          : '#13eaeb'
    return {
      name: r.name,
      value: [parseFloat(r.temp), parseFloat(r.humidity)],
      color,
      itemStyle: { color }
    }
  })
)

const scatterOption = computed(() => ({
  grid: { left: 30, right: 0, top: 2, bottom: 30 },
  tooltip: {
    trigger: 'item',
    ...tooltipStyle,
    formatter: (p) => {
      const color = p.data.color || '#13eaeb'
      const icon = `<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${color};margin-right:6px;vertical-align:middle;"></span>`
      return (
        `<div style="font-weight:600;color:#13eaeb;margin-bottom:4px">${p.data.name}</div>` +
        `<div style="margin-bottom:2px;">${icon}<span>温度</span><span style="margin-left:1.5em;color:${color};font-family:monospace;">${p.data.value[0].toFixed(1)}°C</span></div>` +
        `<div>${icon}<span>湿度</span><span style="margin-left:1.5em;color:${color};font-family:monospace;">${p.data.value[1].toFixed(0)}%</span></div>`
      )
    }
  },
  xAxis: {
    type: 'value',
    name: '温度 °C',
    nameLocation: 'middle',
    nameGap: 18,
    nameTextStyle: { color: 'rgba(182,245,252,0.5)', fontSize: 10 },
    min: 18,
    max: 32,
    ...axisBase
  },
  yAxis: {
    type: 'value',
    name: '湿度 %',
    nameLocation: 'middle',
    nameGap: 28,
    nameTextStyle: { color: 'rgba(182,245,252,0.5)', fontSize: 10 },
    min: 20,
    max: 90,
    ...axisBase
  },
  series: [
    {
      type: 'scatter',
      data: scatterPoints.value,
      symbolSize: 14,
      emphasis: { scale: 1.6, itemStyle: { borderColor: '#13eaeb', borderWidth: 2 } },
      // 舒适区背景 22-26°C, 40-60%
      markArea: {
        silent: true,
        itemStyle: { color: 'rgba(16,185,129,0.12)', borderColor: 'rgba(16,185,129,0.35)', borderWidth: 1 },
        label: {
          show: true,
          position: 'insideTop',
          formatter: '舒适区',
          color: 'rgba(110,231,183,0.8)',
          fontSize: 10
        },
        data: [
          [
            { xAxis: 22, yAxis: 40 },
            { xAxis: 26, yAxis: 60 }
          ]
        ]
      }
    }
  ]
}))

const onScatterClick = (params) => {
  const name = params?.data?.name
  if (name) store.enterRoom(name)
}

// ---------- 楼层级 · 红外线 24h 活动热力图 ----------
const HOURS = Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, '0')}`)

const activityIntensity = (name, hour) => {
  // 工作日典型: 9-12 / 14-17 高活跃；夜间 22-6 极低
  let base = 0.1
  if (hour >= 9 && hour <= 11) base = 0.7
  else if (hour >= 14 && hour <= 17) base = 0.65
  else if (hour >= 8 && hour <= 18) base = 0.4
  else if (hour >= 19 && hour <= 21) base = 0.25
  const noise = (rand01(name, `h${hour}`) - 0.5) * 0.35
  return Math.max(0, Math.min(1, base + noise))
}

const heatmapData = computed(() => {
  const data = []
  roomNames.value.forEach((name, ri) => {
    for (let h = 0; h < 24; h++) {
      data.push([h, ri, Math.round(activityIntensity(name, h) * 100)])
    }
  })
  return data
})

const heatmapOption = computed(() => {
  return {
    grid: { left: 60, right: 14, top: 16, bottom: 24 },
    tooltip: {
      ...tooltipStyle,
      position: 'top',
      confine: true,
      formatter: (p) =>
        `<div style="font-weight:600;color:#13eaeb;margin-bottom:4px">${roomNames.value[p.data[1]] ?? ''}</div>` +
        `时段 <span style="font-family:monospace">${String(p.data[0]).padStart(2, '0')}:00</span><br/>` +
        `活跃度 <span style="font-family:monospace">${p.data[2]}</span>`
    },
    xAxis: {
      type: 'category',
      data: HOURS,
      ...axisBase,
      axisLabel: { ...axisBase.axisLabel, interval: 3 },
      splitArea: { show: false }
    },
    yAxis: {
      type: 'category',
      data: roomNames.value,
      ...axisBase,
      axisLabel: { ...axisBase.axisLabel, color: 'rgba(182,245,252,0.8)' },
      splitArea: { show: false }
    },
    visualMap: {
      min: 0,
      max: 100,
      show: false,
      inRange: {
        color: [
          'rgba(19,234,235,0.06)',
          'rgba(19,234,235,0.25)',
          'rgba(252,211,77,0.55)',
          'rgba(251,113,133,0.85)',
          '#fb7185'
        ]
      }
    },
    series: [
      {
        type: 'heatmap',
        data: heatmapData.value,
        itemStyle: { borderColor: 'rgba(6,10,29,0.6)', borderWidth: 1 },
        emphasis: { itemStyle: { borderColor: '#13eaeb', borderWidth: 1.5 } }
      }
    ]
  }
})

const onHeatmapClick = (params) => {
  const name = roomNames.value[params?.data?.[1]]
  if (name) store.enterRoom(name)
}

const itemBase =
  'flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-cyan-100 transition-colors hover:bg-primary/15'
const itemActive = 'bg-primary/25 hover:bg-primary/25'

// ---------- 房间级 DEMO 数据 ----------
const tempModal = ref(false)
const humModal = ref(false)
const co2Modal = ref(false)

const DAYS30 = Array.from({ length: 30 }, (_, d) => {
  const dt = new Date(2026, 4, 23 - 29 + d)
  return `${dt.getMonth() + 1}/${dt.getDate()}`
})

const rrSeed = (key) => rand01(selectedRoom.value || 'room', key)
const NOW_HOUR = new Date().getHours()

// ---- 温度 ----
const tempHourly = computed(() =>
  HOURS.map((_, h) => {
    const r = rrSeed(`t_h${h}`)
    if (h < 6) return +(18 + r * 3).toFixed(1)
    if (h < 8) return +(20 + r * 4).toFixed(1)
    if (h <= 14) return +(23 + r * 6).toFixed(1)
    if (h <= 20) return +(22 + r * 4).toFixed(1)
    return +(19 + r * 3).toFixed(1)
  })
)
const tempCurrent = computed(() => +tempHourly.value[NOW_HOUR])
const tempStatus = computed(() => (tempCurrent.value >= 28 ? 'danger' : tempCurrent.value >= 26 ? 'warning' : 'normal'))
const tempHistory30 = computed(() =>
  DAYS30.map((_, d) => {
    const avg = +(20 + rrSeed(`t_avg${d}`) * 9).toFixed(1)
    const spread = +(2 + rrSeed(`t_sp${d}`) * 3).toFixed(1)
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
    const r = rrSeed(`hum_h${h}`)
    if (h < 8) return Math.round(60 + r * 15)
    if (h <= 20) return Math.round(42 + r * 22)
    return Math.round(55 + r * 15)
  })
)
const humCurrent = computed(() => humHourly.value[NOW_HOUR])
const humStatus = computed(() => (humCurrent.value >= 70 || humCurrent.value < 35 ? 'warning' : 'normal'))
const humHistory30 = computed(() => DAYS30.map((_, d) => Math.round(40 + rrSeed(`hum_d${d}`) * 35)))
const humHistoryStat = computed(() => {
  const v = humHistory30.value
  return {
    today: humCurrent.value,
    max: Math.max(...v),
    min: Math.min(...v),
    avg: Math.round(v.reduce((a, b) => a + b, 0) / v.length)
  }
})

// ---- 二氧化碳 ----
const co2Hourly = computed(() =>
  HOURS.map((_, h) => {
    const r = rrSeed(`co2_h${h}`)
    if (h < 6) return Math.round(400 + r * 80)
    if (h < 8) return Math.round(500 + r * 200)
    if (h >= 9 && h <= 11) return Math.round(900 + r * 500)
    if (h >= 14 && h <= 17) return Math.round(850 + r * 450)
    if (h <= 20) return Math.round(600 + r * 300)
    return Math.round(450 + r * 150)
  })
)
const co2Current = computed(() => co2Hourly.value[NOW_HOUR])
const co2Status = computed(() =>
  co2Current.value >= 1500 ? 'danger' : co2Current.value >= 1000 ? 'warning' : 'normal'
)
const co2History30 = computed(() => DAYS30.map((_, d) => Math.round(500 + rrSeed(`co2_d${d}`) * 900)))
const co2HistoryStat = computed(() => {
  const v = co2History30.value
  return {
    today: co2Current.value,
    max: Math.max(...v),
    min: Math.min(...v),
    avg: Math.round(v.reduce((a, b) => a + b, 0) / v.length)
  }
})

// ---- 图表：温度 ----
const tempTrendOpt = computed(() => ({
  grid: { left: 28, right: 34, top: 12, bottom: 22 },
  tooltip: {
    trigger: 'axis',
    ...tooltipStyle,
    formatter: (params) => {
      const p = params[0]
      return (
        `<div style="font-weight:600;color:#13eaeb;margin-bottom:4px">${p.axisValueLabel}:00</div>` +
        `<div style="display:flex;align-items:center;gap:3em;line-height:1.6"><span>${p.marker}温度</span><span style="margin-left:auto;font-family:monospace;color:#fb7185">${p.value}°C</span></div>`
      )
    }
  },
  xAxis: { type: 'category', data: HOURS, ...axisBase, axisLabel: { ...axisBase.axisLabel, interval: 5 } },
  yAxis: { type: 'value', min: 15, max: 35, ...axisBase, splitNumber: 3 },
  series: [
    {
      type: 'line',
      data: tempHourly.value,
      color: '#fb7185',
      smooth: true,
      symbol: 'none',
      lineStyle: { width: 1.5 },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(251,113,133,0.3)' },
            { offset: 1, color: 'rgba(251,113,133,0)' }
          ]
        }
      },
      markLine: {
        silent: true,
        symbol: 'none',
        data: [
          {
            yAxis: 22,
            lineStyle: { color: 'rgba(19,234,235,0.35)', type: 'dashed', width: 1 },
            label: { formatter: '22°C', color: 'rgba(19,234,235,0.6)', fontSize: 10 }
          },
          {
            yAxis: 26,
            lineStyle: { color: 'rgba(19,234,235,0.35)', type: 'dashed', width: 1 },
            label: { formatter: '26°C', color: 'rgba(19,234,235,0.6)', fontSize: 10 }
          }
        ]
      }
    }
  ]
}))

const tempHistoryOpt = computed(() => ({
  grid: { left: 36, right: 8, top: 28, bottom: 44 },
  tooltip: {
    trigger: 'axis',
    ...tooltipStyle,
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
  legend: {
    top: 0,
    left: 'center',
    icon: 'roundRect',
    itemWidth: 16,
    itemHeight: 6,
    textStyle: { color: 'rgba(182,245,252,0.8)', fontSize: 12 },
    data: ['高低温范围', '日均温']
  },
  xAxis: { type: 'category', data: DAYS30, ...axisBase, axisLabel: { ...axisBase.axisLabel, interval: 4, rotate: 30 } },
  yAxis: {
    type: 'value',
    name: '°C',
    nameTextStyle: { color: 'rgba(182,245,252,0.5)', fontSize: 10 },
    ...axisBase,
    splitNumber: 4
  },
  series: [
    {
      name: '最低',
      type: 'line',
      data: tempHistory30.value.map((d) => d.min),
      stack: 'band',
      lineStyle: { opacity: 0 },
      symbol: 'none',
      color: 'transparent',
      legendHoverLink: false,
      showSymbol: false,
      silent: true
    },
    {
      name: '高低温范围',
      type: 'line',
      data: tempHistory30.value.map((d) => +(d.max - d.min).toFixed(1)),
      stack: 'band',
      lineStyle: { opacity: 0 },
      symbol: 'none',
      areaStyle: { color: 'rgba(251,113,133,0.18)' },
      itemStyle: { color: 'rgba(251,113,133,0.5)' }
    },
    {
      name: '日均温',
      type: 'line',
      data: tempHistory30.value.map((d) => d.avg),
      color: '#fcd34d',
      smooth: true,
      symbol: 'circle',
      symbolSize: 4,
      lineStyle: { width: 2 }
    }
  ]
}))

// ---- 图表：湿度 ----
const humTrendOpt = computed(() => ({
  grid: { left: 28, right: 8, top: 6, bottom: 22 },
  tooltip: {
    trigger: 'axis',
    ...tooltipStyle,
    formatter: (params) => {
      const p = params[0]
      return (
        `<div style="font-weight:600;color:#13eaeb;margin-bottom:4px">${p.axisValueLabel}:00</div>` +
        `<div style="display:flex;align-items:center;gap:3em;line-height:1.6"><span>${p.marker}湿度</span><span style="margin-left:auto;font-family:monospace;color:#60a5fa">${p.value}%</span></div>`
      )
    }
  },
  xAxis: { type: 'category', data: HOURS, ...axisBase, axisLabel: { ...axisBase.axisLabel, interval: 5 } },
  yAxis: { type: 'value', min: 20, max: 90, ...axisBase, splitNumber: 3 },
  series: [
    {
      type: 'line',
      data: humHourly.value,
      color: '#60a5fa',
      smooth: true,
      symbol: 'none',
      lineStyle: { width: 1.5 },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(96,165,250,0.3)' },
            { offset: 1, color: 'rgba(96,165,250,0)' }
          ]
        }
      },
      markArea: {
        silent: true,
        itemStyle: { color: 'rgba(96,165,250,0.07)', borderColor: 'rgba(96,165,250,0.25)', borderWidth: 1 },
        label: { show: true, position: 'insideTop', formatter: '适宜', color: 'rgba(147,197,253,0.7)', fontSize: 10 },
        data: [[{ yAxis: 40 }, { yAxis: 60 }]]
      }
    }
  ]
}))

const humHistoryOpt = computed(() => ({
  grid: { left: 36, right: 48, top: 28, bottom: 44 },
  tooltip: {
    trigger: 'axis',
    ...tooltipStyle,
    formatter: (params) => {
      const p = params[0]
      return (
        `<div style="font-weight:600;color:#13eaeb;margin-bottom:4px">${p.axisValueLabel}</div>` +
        `<div style="display:flex;align-items:center;gap:3em;line-height:1.6"><span>${p.marker}日均湿度</span><span style="margin-left:auto;font-family:monospace;color:#60a5fa">${p.value}%</span></div>`
      )
    }
  },
  xAxis: { type: 'category', data: DAYS30, ...axisBase, axisLabel: { ...axisBase.axisLabel, interval: 4, rotate: 30 } },
  yAxis: {
    type: 'value',
    name: '%',
    nameTextStyle: { color: 'rgba(182,245,252,0.5)', fontSize: 10 },
    min: 20,
    max: 90,
    ...axisBase,
    splitNumber: 4
  },
  series: [
    {
      name: '日均湿度',
      type: 'line',
      data: humHistory30.value,
      color: '#60a5fa',
      smooth: true,
      symbol: 'circle',
      symbolSize: 4,
      lineStyle: { width: 2 },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(96,165,250,0.25)' },
            { offset: 1, color: 'rgba(96,165,250,0)' }
          ]
        }
      },
      markArea: {
        silent: true,
        itemStyle: { color: 'rgba(96,165,250,0.07)', borderColor: 'rgba(96,165,250,0.2)', borderWidth: 1 },
        data: [[{ yAxis: 40 }, { yAxis: 60 }]]
      },
      markLine: {
        silent: true,
        symbol: 'none',
        lineStyle: { color: '#fcd34d', type: 'dashed', width: 1 },
        label: { position: 'end', formatter: (p) => `均 ${Math.round(+p.value)}%`, color: '#fcd34d', fontSize: 11 },
        data: [{ type: 'average' }]
      }
    }
  ]
}))

// ---- 图表：CO₂ ----
const co2TrendOpt = computed(() => ({
  grid: { left: 36, right: 34, top: 12, bottom: 22 },
  tooltip: {
    trigger: 'axis',
    ...tooltipStyle,
    formatter: (params) => {
      const p = params[0]
      return (
        `<div style="font-weight:600;color:#13eaeb;margin-bottom:4px">${p.axisValueLabel}:00</div>` +
        `<div style="display:flex;align-items:center;gap:3em;line-height:1.6"><span>${p.marker}CO₂ 浓度</span><span style="margin-left:auto;font-family:monospace;color:#34d399">${p.value} ppm</span></div>`
      )
    }
  },
  xAxis: { type: 'category', data: HOURS, ...axisBase, axisLabel: { ...axisBase.axisLabel, interval: 5 } },
  yAxis: { type: 'value', ...axisBase, splitNumber: 3 },
  series: [
    {
      type: 'line',
      data: co2Hourly.value,
      color: '#34d399',
      smooth: true,
      symbol: 'none',
      lineStyle: { width: 1.5 },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(52,211,153,0.3)' },
            { offset: 1, color: 'rgba(52,211,153,0)' }
          ]
        }
      },
      markLine: {
        silent: true,
        symbol: 'none',
        data: [
          {
            yAxis: 1000,
            lineStyle: { color: '#fcd34d', type: 'dashed', width: 1 },
            label: { formatter: '1000', color: '#fcd34d', fontSize: 10 }
          },
          {
            yAxis: 1500,
            lineStyle: { color: '#fb7185', type: 'dashed', width: 1 },
            label: { formatter: '1500', color: '#fb7185', fontSize: 10 }
          }
        ]
      }
    }
  ]
}))

const co2HistoryOpt = computed(() => ({
  grid: { left: 40, right: 48, top: 28, bottom: 44 },
  tooltip: {
    trigger: 'axis',
    ...tooltipStyle,
    formatter: (params) => {
      const p = params[0]
      return (
        `<div style="font-weight:600;color:#13eaeb;margin-bottom:4px">${p.axisValueLabel}</div>` +
        `<div style="display:flex;align-items:center;gap:3em;line-height:1.6"><span>${p.marker}CO₂ 日均浓度</span><span style="margin-left:auto;font-family:monospace;color:#34d399">${p.value} ppm</span></div>`
      )
    }
  },
  xAxis: { type: 'category', data: DAYS30, ...axisBase, axisLabel: { ...axisBase.axisLabel, interval: 4, rotate: 30 } },
  yAxis: {
    type: 'value',
    name: 'ppm',
    nameTextStyle: { color: 'rgba(182,245,252,0.5)', fontSize: 10 },
    ...axisBase,
    splitNumber: 4
  },
  series: [
    {
      name: 'CO₂ 日均浓度',
      type: 'bar',
      data: co2History30.value.map((v, i) => ({
        value: v,
        itemStyle: {
          color:
            i === 29
              ? v >= 1500
                ? '#fb7185'
                : v >= 1000
                  ? '#fcd34d'
                  : '#34d399'
              : v >= 1500
                ? 'rgba(251,113,133,0.55)'
                : v >= 1000
                  ? 'rgba(252,211,77,0.45)'
                  : 'rgba(52,211,153,0.45)',
          borderRadius: [2, 2, 0, 0]
        }
      })),
      barWidth: '60%',
      markLine: {
        silent: true,
        symbol: 'none',
        lineStyle: { color: '#fcd34d', type: 'dashed', width: 1 },
        label: { position: 'end', formatter: (p) => `均 ${Math.round(+p.value)}`, color: '#fcd34d', fontSize: 11 },
        data: [{ type: 'average' }]
      }
    }
  ]
}))

// ---------- 楼栋级 DEMO 数据 ----------
const cameras = [
  { id: 'C-01', name: '主入口', icon: 'mdi:door-sliding-open', stay: 12, in: 248, out: 235, pass: 96 },
  { id: 'C-02', name: '大堂', icon: 'mdi:sofa-outline', stay: 26, in: 412, out: 388, pass: 142 },
  { id: 'C-03', name: '东侧通道', icon: 'mdi:walk', stay: 4, in: 86, out: 81, pass: 38 },
  { id: 'C-04', name: '电梯厅', icon: 'mdi:elevator', stay: 8, in: 305, out: 297, pass: 64 }
]

const deviceSummary = {
  total: 138,
  online: 124,
  offline: 14,
  groups: [
    { icon: 'mdi:cellphone-text', label: '手持终端', total: 42, online: 39 },
    { icon: 'mdi:radio-handheld', label: '对讲设备', total: 28, online: 26 },
    { icon: 'mdi:tablet-android', label: '巡检平板', total: 18, online: 15 },
    { icon: 'carbon:iot-platform', label: '物联网关', total: 24, online: 22 },
    { icon: 'mdi:wifi-marker', label: '定位信标', total: 26, online: 22 }
  ]
}

const allDevices = [
  { sn: 'HH-001', type: '手持终端', user: '李工', loc: '3F-机房', online: true, battery: 86 },
  { sn: 'HH-002', type: '手持终端', user: '王工', loc: '5F-走廊', online: true, battery: 62 },
  { sn: 'HH-003', type: '手持终端', user: '张工', loc: '—', online: false, battery: 0 },
  { sn: 'RD-014', type: '对讲设备', user: '安保-甲', loc: '主入口', online: true, battery: 78 },
  { sn: 'RD-021', type: '对讲设备', user: '安保-乙', loc: '东侧通道', online: true, battery: 45 },
  { sn: 'TB-008', type: '巡检平板', user: '巡检组', loc: '2F-办公', online: true, battery: 91 },
  { sn: 'TB-009', type: '巡检平板', user: '—', loc: '充电桩', online: false, battery: 12 },
  { sn: 'GW-A2', type: '物联网关', user: '系统', loc: '设备机房', online: true, battery: 100 },
  { sn: 'BC-12', type: '定位信标', user: '系统', loc: '4F-走廊', online: true, battery: 67 },
  { sn: 'BC-15', type: '定位信标', user: '系统', loc: '6F-入口', online: false, battery: 0 }
]

const cameraModal = ref(false)
const activeCamera = ref(null)
const openCamera = (c) => {
  activeCamera.value = c
  cameraModal.value = true
}

const deviceModal = ref(false)
const deviceFilter = ref('全部')
const deviceTypes = computed(() => ['全部', ...new Set(allDevices.map((d) => d.type))])
const filteredDevices = computed(() =>
  deviceFilter.value === '全部' ? allDevices : allDevices.filter((d) => d.type === deviceFilter.value)
)
</script>

<template>
  <div class="level-side right-3">
    <!-- ========== 楼栋级 ========== -->
    <template v-if="level === 'building'">
      <BasePanel title="摄像头监控">
        <div class="grid grid-cols-1 gap-3 my-2">
          <div
            v-for="c in cameras"
            :key="c.id"
            class="group rounded border border-primary/20 bg-primary/4 hover:bg-primary/10 hover:border-primary/50 transition-all cursor-pointer overflow-hidden"
            @click="openCamera(c)"
          >
            <div class="flex items-center justify-between px-2.5 py-1.5 border-b border-primary/15">
              <div class="flex items-center gap-1.5 text-cyan-100">
                <Icon :icon="c.icon" class="text-base text-primary" />
                <span class="text-sm font-semibold">{{ c.name }}</span>
                <span class="text-sm text-cyan-200/50">{{ c.id }}</span>
              </div>
              <Icon
                icon="lucide:play-circle"
                class="text-lg text-cyan-200/40 group-hover:text-primary transition-colors"
              />
            </div>
            <div class="grid grid-cols-4 px-2 py-1.5 text-center text-sm divide-x divide-primary/10">
              <div>
                <div class="text-cyan-200/60">滞留</div>
                <div class="font-mono font-bold text-cyan-50">{{ c.stay }}</div>
              </div>
              <div>
                <div class="text-cyan-200/60">进入</div>
                <div class="font-mono font-bold text-emerald-300">{{ c.in }}</div>
              </div>
              <div>
                <div class="text-cyan-200/60">离开</div>
                <div class="font-mono font-bold text-amber-300">{{ c.out }}</div>
              </div>
              <div>
                <div class="text-cyan-200/60">经过</div>
                <div class="font-mono font-bold text-cyan-50">{{ c.pass }}</div>
              </div>
            </div>
          </div>
        </div>
      </BasePanel>

      <BasePanel title="手持及其它设备" class="mt-5">
        <!-- 总数 -->
        <div
          class="flex items-center justify-between mt-2 px-2 py-2.25 rounded border border-primary/30 bg-primary/8 cursor-pointer hover:bg-primary/15 transition-colors"
          @click="deviceModal = true"
        >
          <div class="flex items-center gap-2">
            <Icon icon="mdi:devices" class="text-2xl text-primary" />
            <div>
              <div class="text-sm text-cyan-200/70">设备总数</div>
              <div class="text-2xl font-bold font-mono text-cyan-50 leading-none">
                {{ deviceSummary.total }}
              </div>
            </div>
          </div>
          <div class="text-right text-sm">
            <div class="flex items-center justify-end gap-1 text-emerald-300">
              <span class="size-1.5 rounded-full bg-emerald-300"></span>
              在线 {{ deviceSummary.online }}
            </div>
            <div class="flex items-center justify-end gap-1 text-rose-400 mt-0.5">
              <span class="size-1.5 rounded-full bg-rose-400"></span>
              离线 {{ deviceSummary.offline }}
            </div>
          </div>
        </div>

        <!-- 分组 -->
        <div class="mt-3 space-y-1.75">
          <div
            v-for="g in deviceSummary.groups"
            :key="g.label"
            class="flex items-center gap-2 px-2 py-1 text-sm rounded hover:bg-primary/8 transition-colors"
          >
            <Icon :icon="g.icon" class="text-base text-cyan-300" />
            <span class="flex-1 text-cyan-100">{{ g.label }}</span>
            <span class="font-mono text-cyan-200/70">{{ g.online }} / {{ g.total }}</span>
          </div>
        </div>

        <div
          class="mt-3 pt-2 border-t border-primary/20 flex items-center justify-center gap-1 text-sm text-primary/80 hover:text-primary cursor-pointer"
          @click="deviceModal = true"
        >
          <span>查看所有设备</span>
          <Icon icon="lucide:arrow-right" class="text-sm" />
        </div>
      </BasePanel>
    </template>

    <!-- ========== 楼层级 ========== -->
    <template v-else-if="level === 'floor'">
      <!-- 温湿度散点 -->
      <BasePanel title="温湿度监测">
        <div v-if="!tempHumidityRows.length" class="px-2 py-1 text-sm text-cyan-200/50">本层未侦测到房间</div>
        <EChart v-else :option="scatterOption" height="190px" @chart-click="onScatterClick" />
        <div class="mt-2 pt-2 border-t border-primary/20 flex items-center justify-between text-sm text-cyan-200/60">
          <span class="flex items-center gap-1">
            <span class="size-2 rounded-sm bg-emerald-400/40 border border-emerald-400/60"></span>
            舒适区 22-26°C · 40-60%
          </span>
          <span class="flex items-center gap-1 text-cyan-200/50">
            <Icon icon="lucide:mouse-pointer-click" class="text-primary" />
            点击点进入房间
          </span>
        </div>
      </BasePanel>

      <!-- 二氧化碳 -->
      <BasePanel title="二氧化碳监测" class="mt-5">
        <div class="overflow-y-auto max-h-38">
          <div v-if="!co2Rows.length" class="px-2 py-1 text-sm text-cyan-200/50">本层未侦测到房间</div>
          <div
            v-for="r in co2Rows"
            :key="r.name"
            :class="[itemBase, selectedRoom === r.name && itemActive]"
            @click="store.enterRoom(r.name)"
          >
            <Icon icon="mdi:molecule-co2" :class="['text-base shrink-0', statusText[r.status]]" />
            <span class="flex-1 truncate text-sm">{{ r.name }}</span>
            <div class="flex-1 h-1.5 rounded bg-cyan-400/10 overflow-hidden">
              <div
                class="h-full transition-all"
                :class="{
                  'bg-emerald-400': r.status === 'normal',
                  'bg-amber-300': r.status === 'warning',
                  'bg-rose-400': r.status === 'danger'
                }"
                :style="{ width: Math.min(100, (r.value / 2000) * 100) + '%' }"
              ></div>
            </div>
            <span :class="['font-mono text-sm shrink-0 w-16 text-right', statusText[r.status]]">{{ r.value }} ppm</span>
          </div>
        </div>
      </BasePanel>

      <!-- 红外线活动热力图 -->
      <BasePanel title="红外线监测" class="mt-5">
        <div v-if="!irRows.length" class="px-2 py-1 text-sm text-cyan-200/50">本层未侦测到房间</div>
        <template v-else>
          <div class="flex items-center justify-between text-sm text-cyan-200/70">
            <span class="flex items-center gap-1">
              <Icon icon="mdi:motion-sensor" class="text-primary text-base" />
              房间 × 时段 活跃度
            </span>
            <span class="text-cyan-200/50">24h</span>
          </div>
          <div class="mt-1 overflow-y-auto max-h-41.75 rounded border border-primary/10 bg-primary/4 p-1">
            <EChart
              :option="heatmapOption"
              :height="Math.max(200, Math.min(600, roomNames.length * 24 + 60)) + 'px'"
              @chart-click="onHeatmapClick"
            />
          </div>
          <div class="mt-2 pt-2 border-t border-primary/20 flex items-center justify-between text-sm text-cyan-200/60">
            <span class="flex items-center gap-1">
              <Icon icon="mdi:account-group" class="text-primary text-base" />
              当前活跃房间
              <span class="font-mono text-cyan-100 ml-1">
                {{ irRows.filter((r) => r.occupied).length }} / {{ roomNames.length }}
              </span>
            </span>
            <span class="flex items-center gap-1 text-cyan-200/50">
              <span class="text-sm mr-1">低</span>
              <span class="h-2 w-3 rounded-sm bg-[rgba(19,234,235,0.25)] border border-primary/20"></span>
              <span class="h-2 w-3 rounded-sm bg-amber-300/55"></span>
              <span class="h-2 w-3 rounded-sm bg-rose-400"></span>
              <span class="text-sm ml-1">高</span>
            </span>
          </div>
        </template>
      </BasePanel>
    </template>

    <!-- ========== 房间级 ========== -->
    <template v-else>
      <!-- 温度监测 -->
      <BasePanel title="温度监测">
        <div class="flex items-center gap-3 mb-2">
          <GaugeRing :value="+tempCurrent.toFixed(1)" :max="35" unit="°C" :status="tempStatus" :size="60" />
          <div class="flex-1 text-sm space-y-1">
            <div class="flex justify-between text-cyan-200/70">
              <span>当前温度</span>
              <span class="flex items-baseline gap-1.5">
                <span
                  :class="[
                    'font-mono font-bold text-base',
                    tempStatus === 'danger'
                      ? 'text-rose-400'
                      : tempStatus === 'warning'
                        ? 'text-amber-300'
                        : 'text-cyan-50'
                  ]"
                  >{{ tempCurrent.toFixed(1) }}°C</span
                >
                <span
                  :class="[
                    'text-xs',
                    tempStatus === 'danger'
                      ? 'text-rose-400'
                      : tempStatus === 'warning'
                        ? 'text-amber-300'
                        : 'text-emerald-300'
                  ]"
                  >{{ tempStatus === 'danger' ? '过高' : tempStatus === 'warning' ? '偏高' : '正常' }}</span
                >
              </span>
            </div>
            <div class="flex justify-between text-cyan-200/60">
              <span>舒适区间</span>
              <span class="font-mono">22 – 26°C</span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-1 text-sm text-cyan-200/60">
          <Icon icon="mdi:thermometer" class="text-rose-400 text-base" />
          24小时温度曲线
        </div>
        <EChart :option="tempTrendOpt" height="77px" />
        <div
          class="mt-2 pt-2 border-t border-primary/20 flex items-center justify-center gap-1 text-sm text-primary/80 hover:text-primary cursor-pointer"
          @click="tempModal = true"
        >
          <Icon icon="lucide:history" class="text-sm" />
          <span>查看历史数据</span>
          <Icon icon="lucide:chevron-right" class="text-sm" />
        </div>
      </BasePanel>

      <!-- 湿度监测 -->
      <BasePanel title="湿度监测" class="mt-5">
        <div class="flex items-center gap-3 mb-2">
          <GaugeRing :value="humCurrent" :max="100" unit="%" :status="humStatus" :size="60" inline />
          <div class="flex-1 text-sm space-y-1">
            <div class="flex justify-between text-cyan-200/70">
              <span>当前湿度</span>
              <span class="flex items-baseline gap-1.5">
                <span
                  :class="[
                    'font-mono font-bold text-base',
                    humStatus === 'warning' ? 'text-amber-300' : 'text-cyan-50'
                  ]"
                  >{{ humCurrent }}%</span
                >
                <span :class="['text-xs', humStatus === 'warning' ? 'text-amber-300' : 'text-emerald-300']">{{
                  humStatus === 'warning' ? '异常' : '正常'
                }}</span>
              </span>
            </div>
            <div class="flex justify-between text-cyan-200/60">
              <span>适宜区间</span>
              <span class="font-mono">40 – 60%</span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-1 text-sm text-cyan-200/60">
          <Icon icon="mdi:water-percent" class="text-blue-400 text-base" />
          24小时湿度曲线
        </div>
        <EChart :option="humTrendOpt" height="78px" />
        <div
          class="mt-2 pt-2 border-t border-primary/20 flex items-center justify-center gap-1 text-sm text-primary/80 hover:text-primary cursor-pointer"
          @click="humModal = true"
        >
          <Icon icon="lucide:history" class="text-sm" />
          <span>查看历史数据</span>
          <Icon icon="lucide:chevron-right" class="text-sm" />
        </div>
      </BasePanel>

      <!-- 二氧化碳监测 -->
      <BasePanel title="二氧化碳监测" class="mt-5">
        <div class="flex items-center gap-3 mb-2">
          <GaugeRing :value="co2Current" :max="2000" unit="ppm" :status="co2Status" :size="60" />
          <div class="flex-1 text-sm space-y-0.5">
            <div class="flex justify-between text-cyan-200/70">
              <span>当前浓度</span>
              <span class="flex items-baseline gap-1.5">
                <span
                  :class="[
                    'font-mono font-bold text-base',
                    co2Status === 'danger'
                      ? 'text-rose-400'
                      : co2Status === 'warning'
                        ? 'text-amber-300'
                        : 'text-cyan-50'
                  ]"
                  >{{ co2Current }} ppm</span
                >
              </span>
            </div>
            <div class="flex items-center justify-between gap-1">
              <div class="flex items-center gap-1">
                <span class="text-amber-300/80">预警</span>/
                <span class="text-rose-400/80">危险</span>
              </div>
              <div class="flex items-center justify-between gap-1">
                <span class="font-mono text-amber-300"> 1000ppm</span>/
                <span class="font-mono text-rose-400"> 1500ppm</span>
              </div>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-1 text-sm text-cyan-200/60">
          <Icon icon="mdi:molecule-co2" class="text-emerald-400 text-base" />
          24小时 CO₂ 曲线
        </div>
        <EChart :option="co2TrendOpt" height="77px" />
        <div
          class="mt-2 pt-2 border-t border-primary/20 flex items-center justify-center gap-1 text-sm text-primary/80 hover:text-primary cursor-pointer"
          @click="co2Modal = true"
        >
          <Icon icon="lucide:history" class="text-sm" />
          <span>查看历史数据</span>
          <Icon icon="lucide:chevron-right" class="text-sm" />
        </div>
      </BasePanel>

      <!-- ---- 历史数据 Modals ---- -->
      <BaseModal v-model="tempModal" title="温度历史数据" icon="mdi:thermometer-lines" width="700px">
        <div class="grid grid-cols-4 gap-3 mb-4">
          <div
            v-for="s in [
              { key: 'today', label: '今日', unit: '°C', cls: 'text-primary' },
              { key: 'max', label: '30日最高', unit: '°C', cls: 'text-rose-400' },
              { key: 'min', label: '30日最低', unit: '°C', cls: 'text-sky-300' },
              { key: 'avg', label: '30日均值', unit: '°C', cls: 'text-amber-300' }
            ]"
            :key="s.key"
            class="rounded border border-primary/20 bg-primary/6 p-2.5 text-center"
          >
            <div class="text-sm text-cyan-200/60">{{ s.label }}</div>
            <div :class="['text-xl font-bold font-mono mt-1', s.cls]">{{ tempHistoryStat[s.key] }}</div>
            <div class="text-sm text-cyan-200/50">{{ s.unit }}</div>
          </div>
        </div>
        <EChart :option="tempHistoryOpt" height="260px" />
        <template #footer>
          <button class="btn" @click="tempModal = false">关闭</button>
        </template>
      </BaseModal>

      <BaseModal v-model="humModal" title="湿度历史数据" icon="mdi:water-percent" width="700px">
        <div class="grid grid-cols-4 gap-3 mb-4">
          <div
            v-for="s in [
              { key: 'today', label: '今日', unit: '%', cls: 'text-primary' },
              { key: 'max', label: '30日最高', unit: '%', cls: 'text-rose-400' },
              { key: 'min', label: '30日最低', unit: '%', cls: 'text-emerald-300' },
              { key: 'avg', label: '30日均值', unit: '%', cls: 'text-cyan-50' }
            ]"
            :key="s.key"
            class="rounded border border-primary/20 bg-primary/6 p-2.5 text-center"
          >
            <div class="text-sm text-cyan-200/60">{{ s.label }}</div>
            <div :class="['text-xl font-bold font-mono mt-1', s.cls]">{{ humHistoryStat[s.key] }}</div>
            <div class="text-sm text-cyan-200/50">{{ s.unit }}</div>
          </div>
        </div>
        <EChart :option="humHistoryOpt" height="260px" />
        <template #footer>
          <button class="btn" @click="humModal = false">关闭</button>
        </template>
      </BaseModal>

      <BaseModal v-model="co2Modal" title="二氧化碳历史数据" icon="mdi:molecule-co2" width="700px">
        <div class="grid grid-cols-4 gap-3 mb-4">
          <div
            v-for="s in [
              { key: 'today', label: '今日', unit: 'ppm', cls: 'text-primary' },
              { key: 'max', label: '30日最高', unit: 'ppm', cls: 'text-rose-400' },
              { key: 'min', label: '30日最低', unit: 'ppm', cls: 'text-emerald-300' },
              { key: 'avg', label: '30日均值', unit: 'ppm', cls: 'text-cyan-50' }
            ]"
            :key="s.key"
            class="rounded border border-primary/20 bg-primary/6 p-2.5 text-center"
          >
            <div class="text-sm text-cyan-200/60">{{ s.label }}</div>
            <div :class="['text-xl font-bold font-mono mt-1', s.cls]">{{ co2HistoryStat[s.key] }}</div>
            <div class="text-sm text-cyan-200/50">{{ s.unit }}</div>
          </div>
        </div>
        <EChart :option="co2HistoryOpt" height="260px" />
        <template #footer>
          <button class="btn" @click="co2Modal = false">关闭</button>
        </template>
      </BaseModal>
    </template>

    <!-- ========== 摄像头视频 Modal ========== -->
    <BaseModal
      v-model="cameraModal"
      :title="activeCamera ? `实时视频 · ${activeCamera.name}` : '实时视频'"
      icon="mdi:cctv"
      width="760px"
    >
      <template v-if="activeCamera">
        <div
          class="relative aspect-video rounded border border-primary/30 bg-linear-to-br from-cyan-950 via-dark to-cyan-950/40 overflow-hidden"
        >
          <!-- 模拟视频内容 -->
          <div class="absolute inset-0 flex items-center justify-center">
            <Icon icon="mdi:cctv" class="text-7xl text-primary/30" />
          </div>
          <!-- 扫描线动画 -->
          <div
            class="pointer-events-none absolute inset-x-0 top-0 h-px bg-primary/60 animate-[scan_3s_linear_infinite]"
            style="box-shadow: 0 0 10px #13eaeb"
          ></div>
          <!-- 角标 -->
          <div class="absolute top-3 left-3 flex items-center gap-2 text-sm">
            <span class="size-2 rounded-full bg-rose-400 animate-pulse"></span>
            <span class="text-rose-300 font-semibold">REC</span>
          </div>
          <div class="absolute top-3 right-3 px-2 py-0.5 text-sm rounded bg-dark/60 text-cyan-100">
            {{ activeCamera.id }} · {{ activeCamera.name }}
          </div>
          <div class="absolute bottom-3 left-3 text-sm text-cyan-200/70 font-mono">
            2026-05-21 14:32:08 · 1920×1080 · 25fps
          </div>
        </div>
        <div class="mt-4 grid grid-cols-4 gap-2">
          <div class="rounded border border-primary/20 bg-primary/4 p-2 text-center">
            <div class="text-sm text-cyan-200/70">区域滞留</div>
            <div class="text-2xl font-bold text-cyan-50 font-mono">{{ activeCamera.stay }}</div>
          </div>
          <div class="rounded border border-primary/20 bg-primary/4 p-2 text-center">
            <div class="text-sm text-cyan-200/70">今日进入</div>
            <div class="text-2xl font-bold text-emerald-300 font-mono">{{ activeCamera.in }}</div>
          </div>
          <div class="rounded border border-primary/20 bg-primary/4 p-2 text-center">
            <div class="text-sm text-cyan-200/70">今日离开</div>
            <div class="text-2xl font-bold text-amber-300 font-mono">{{ activeCamera.out }}</div>
          </div>
          <div class="rounded border border-primary/20 bg-primary/4 p-2 text-center">
            <div class="text-sm text-cyan-200/70">今日经过</div>
            <div class="text-2xl font-bold text-cyan-50 font-mono">{{ activeCamera.pass }}</div>
          </div>
        </div>
      </template>
      <template #footer>
        <button class="btn" @click="cameraModal = false">关闭</button>
        <button class="btn-primary">
          <Icon icon="lucide:download" class="inline-block mr-1" />
          下载录像
        </button>
      </template>
    </BaseModal>

    <!-- ========== 设备清单 Modal ========== -->
    <BaseModal v-model="deviceModal" title="设备清单" icon="mdi:devices" width="820px">
      <div class="flex flex-wrap items-center gap-1.5 mb-3">
        <button
          v-for="t in deviceTypes"
          :key="t"
          :class="deviceFilter === t ? 'btn-primary' : 'btn'"
          @click="deviceFilter = t"
        >
          {{ t }}
        </button>
      </div>
      <div class="rounded border border-primary/20 overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-primary/8 text-cyan-200/80">
            <tr>
              <th class="text-left px-3 py-2 font-semibold">SN</th>
              <th class="text-left px-3 py-2 font-semibold">类型</th>
              <th class="text-left px-3 py-2 font-semibold">使用人</th>
              <th class="text-left px-3 py-2 font-semibold">位置</th>
              <th class="text-left px-3 py-2 font-semibold">状态</th>
              <th class="text-left px-3 py-2 font-semibold">电量</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="d in filteredDevices"
              :key="d.sn"
              class="border-t border-primary/10 hover:bg-primary/8 transition-colors"
            >
              <td class="px-3 py-2 font-mono text-cyan-100">{{ d.sn }}</td>
              <td class="px-3 py-2 text-cyan-100">{{ d.type }}</td>
              <td class="px-3 py-2 text-cyan-200/80">{{ d.user }}</td>
              <td class="px-3 py-2 text-cyan-200/80">{{ d.loc }}</td>
              <td class="px-3 py-2">
                <span
                  :class="[
                    'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-sm',
                    d.online ? 'bg-emerald-400/15 text-emerald-300' : 'bg-rose-400/15 text-rose-300'
                  ]"
                >
                  <Icon :icon="d.online ? 'lucide:wifi' : 'lucide:wifi-off'" class="text-sm" />
                  {{ d.online ? '在线' : '离线' }}
                </span>
              </td>
              <td class="px-3 py-2">
                <div class="flex items-center gap-1.5">
                  <div class="relative w-14 h-2 rounded bg-cyan-400/15 overflow-hidden">
                    <div
                      class="absolute inset-y-0 left-0 transition-all"
                      :class="d.battery > 30 ? 'bg-emerald-400' : 'bg-rose-400'"
                      :style="{ width: d.battery + '%' }"
                    ></div>
                  </div>
                  <span class="font-mono text-cyan-200/70 text-sm">{{ d.battery }}%</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="mt-2 text-sm text-cyan-200/60">
        共 {{ filteredDevices.length }} 台 · 在线 {{ filteredDevices.filter((d) => d.online).length }} 台
      </div>
    </BaseModal>
  </div>
</template>

<style>
@keyframes scan {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(100vh);
  }
}
</style>
