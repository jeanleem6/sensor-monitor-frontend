// Floor-level DEMO data & chart options for both left and right panels.
// All computed values depend on currentFloor / roomNames from the store.
// To connect to an API: replace the computed body with an async fetch,
// store the response in a reactive ref, and derive the same shape.

import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useViewerStore } from '@/stores/viewer'
import { tooltipStyle, axisBase, HOURS } from './useChartStyle.js'
import { rand01, seedOf } from './useDemoSeed.js'

// Fallback room list when the 3-D model has no parsed rooms
const DEMO_ROOM_NAMES = [
  '办公室-A', '办公室-B', '办公室-C', '办公室-D', '办公室-E',
  '会议室-1', '会议室-2', '会议室-3', '会议室-4', '会议室-5',
  '报告厅', '展示厅', '茶水间', '休息室-1', '休息室-2',
  '走廊-北', '走廊-中', '走廊-南', '楼梯间-东', '楼梯间-西',
  '卫生间-男', '卫生间-女', '储物间-1', '储物间-2', '储物间-3',
  '机房', '网络机房', '配电室', '消控室', '接待区',
  '档案室', '资料室', '保密室', '财务室', '总经理办'
]

const ENV_SENSOR_COLORS = { temp: '#fb7185', hum: '#60a5fa', co2: '#34d399', ir: '#fcd34d' }

export function useFloorData() {
  const store = useViewerStore()
  const { currentFloor } = storeToRefs(store)

  // ========== Right panel: per-room sensor readings ==========

  const roomNames = computed(() => {
    const floorRooms = currentFloor.value?.roomNames
    return Array.isArray(floorRooms) && floorRooms.length > 1 ? floorRooms : DEMO_ROOM_NAMES
  })

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
      return { name, value: v, status: v >= 1500 ? 'danger' : v >= 1000 ? 'warning' : 'normal' }
    })
  )

  const irRows = computed(() =>
    roomNames.value.map((name) => ({
      name,
      occupied: seedOf(name, 'ir') % 3 !== 0,
      lastSeen: Math.floor(rand01(name, 'last') * 58) + 1
    }))
  )

  // Temperature/humidity scatter chart
  const scatterOption = computed(() => ({
    grid: { left: 30, right: 0, top: 2, bottom: 30 },
    tooltip: {
      trigger: 'item',
      ...tooltipStyle,
      formatter: (p) => {
        const color = p.data.color || '#13eaeb'
        const dot = `<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${color};margin-right:6px;vertical-align:middle;"></span>`
        return (
          `<div style="font-weight:600;color:#13eaeb;margin-bottom:4px">${p.data.name}</div>` +
          `<div style="margin-bottom:2px;">${dot}<span>温度</span><span style="margin-left:1.5em;color:${color};font-family:monospace;">${p.data.value[0].toFixed(1)}°C</span></div>` +
          `<div>${dot}<span>湿度</span><span style="margin-left:1.5em;color:${color};font-family:monospace;">${p.data.value[1].toFixed(0)}%</span></div>`
        )
      }
    },
    xAxis: {
      type: 'value', name: '温度 °C', nameLocation: 'middle', nameGap: 18,
      nameTextStyle: { color: 'rgba(182,245,252,0.5)', fontSize: 10 },
      min: 18, max: 32, ...axisBase
    },
    yAxis: {
      type: 'value', name: '湿度 %', nameLocation: 'middle', nameGap: 28,
      nameTextStyle: { color: 'rgba(182,245,252,0.5)', fontSize: 10 },
      min: 20, max: 90, ...axisBase
    },
    series: [{
      type: 'scatter',
      data: tempHumidityRows.value.map((r) => {
        const color = r.tempStatus === 'danger' || r.humStatus === 'danger' ? '#fb7185'
          : r.tempStatus === 'warning' || r.humStatus === 'warning' ? '#fcd34d' : '#13eaeb'
        return { name: r.name, value: [parseFloat(r.temp), parseFloat(r.humidity)], color, itemStyle: { color } }
      }),
      symbolSize: 14,
      emphasis: { scale: 1.6, itemStyle: { borderColor: '#13eaeb', borderWidth: 2 } },
      markArea: {
        silent: true,
        itemStyle: { color: 'rgba(16,185,129,0.12)', borderColor: 'rgba(16,185,129,0.35)', borderWidth: 1 },
        label: { show: true, position: 'insideTop', formatter: '舒适区', color: 'rgba(110,231,183,0.8)', fontSize: 10 },
        data: [[{ xAxis: 22, yAxis: 40 }, { xAxis: 26, yAxis: 60 }]]
      }
    }]
  }))

  // IR activity heatmap
  const activityIntensity = (name, hour) => {
    let base = 0.1
    if (hour >= 9 && hour <= 11) base = 0.7
    else if (hour >= 14 && hour <= 17) base = 0.65
    else if (hour >= 8 && hour <= 18) base = 0.4
    else if (hour >= 19 && hour <= 21) base = 0.25
    return Math.max(0, Math.min(1, base + (rand01(name, `h${hour}`) - 0.5) * 0.35))
  }

  const heatmapData = computed(() => {
    const data = []
    roomNames.value.forEach((name, ri) => {
      for (let h = 0; h < 24; h++) data.push([h, ri, Math.round(activityIntensity(name, h) * 100)])
    })
    return data
  })

  const heatmapOption = computed(() => ({
    grid: { left: 60, right: 14, top: 16, bottom: 24 },
    tooltip: {
      ...tooltipStyle, position: 'top', confine: true,
      formatter: (p) =>
        `<div style="font-weight:600;color:#13eaeb;margin-bottom:4px">${roomNames.value[p.data[1]] ?? ''}</div>` +
        `时段 <span style="font-family:monospace">${String(p.data[0]).padStart(2, '0')}:00</span><br/>` +
        `活跃度 <span style="font-family:monospace">${p.data[2]}</span>`
    },
    xAxis: { type: 'category', data: HOURS, ...axisBase, axisLabel: { ...axisBase.axisLabel, interval: 3 }, splitArea: { show: false } },
    yAxis: { type: 'category', data: roomNames.value, ...axisBase, axisLabel: { ...axisBase.axisLabel, color: 'rgba(182,245,252,0.8)' }, splitArea: { show: false } },
    visualMap: {
      min: 0, max: 100, show: false,
      inRange: { color: ['rgba(19,234,235,0.06)', 'rgba(19,234,235,0.25)', 'rgba(252,211,77,0.55)', 'rgba(251,113,133,0.85)', '#fb7185'] }
    },
    series: [{ type: 'heatmap', data: heatmapData.value, itemStyle: { borderColor: 'rgba(6,10,29,0.6)', borderWidth: 1 }, emphasis: { itemStyle: { borderColor: '#13eaeb', borderWidth: 1.5 } } }]
  }))

  // ========== Left panel: device stats ==========

  const envSensors = computed(() => {
    const rooms = currentFloor.value?.roomNames?.length ?? 0
    const seed = (currentFloor.value?.index ?? 0) + 1
    const off = (total, mod) => total > 0 ? seed % mod : 0
    const list = [
      { key: 'temp', icon: 'mdi:thermometer-lines', label: '温度传感器', total: rooms },
      { key: 'hum',  icon: 'mdi:water-percent',     label: '湿度传感器', total: rooms },
      { key: 'co2',  icon: 'mdi:molecule-co2',       label: '二氧化碳传感器', total: Math.ceil(rooms * 0.6) },
      { key: 'ir',   icon: 'mdi:motion-sensor',      label: '红外线传感器', total: rooms + Math.ceil(rooms / 4) }
    ]
    return list.map((s, i) => {
      const offline = off(s.total, [3, 4, 2, 5][i])
      return { ...s, offline, online: Math.max(0, s.total - offline) }
    })
  })

  const envSensorTotals = computed(() => {
    const total = envSensors.value.reduce((s, x) => s + x.total, 0)
    const online = envSensors.value.reduce((s, x) => s + x.online, 0)
    return { total, online, offline: total - online }
  })

  const energyDevices = computed(() => {
    const rooms = Math.max(currentFloor.value?.roomNames?.length ?? 0, 6)
    const seed = (currentFloor.value?.index ?? 0) + 1
    const off = (total, mod) => total > 0 ? (seed * 7 + total) % mod : 0
    const list = [
      { key: 'ac',        icon: 'mdi:air-conditioner',        label: '空调电表',      total: rooms },
      { key: 'lightPlug', icon: 'mdi:lightbulb-on-outline',  label: '照明和插座电表', total: rooms * 2 },
      { key: 'water',     icon: 'mdi:water-pump',             label: '水表',          total: Math.max(1, Math.ceil(rooms / 4)) }
    ]
    return list.map((d) => { const offline = off(d.total, 4); return { ...d, offline, online: Math.max(0, d.total - offline) } })
  })

  const energyTotal = computed(() => {
    const idx = (currentFloor.value?.index ?? 0) + 1
    return [
      { icon: 'mdi:air-conditioner',       label: '空调能耗', value: (260 + idx * 38.5).toFixed(1), unit: 'kWh', status: 'normal' },
      { icon: 'mdi:lightbulb-on-outline',  label: '照明插座', value: (120 + idx * 22.4).toFixed(1), unit: 'kWh', status: 'normal' },
      { icon: 'mdi:water',                 label: '用水量',   value: (3.2 + idx * 0.7).toFixed(2),  unit: 'm³',  status: (3.2 + idx * 0.7) > 5 ? 'warning' : 'normal' }
    ]
  })

  const energyOnlineSummary = computed(() => {
    const total = energyDevices.value.reduce((s, x) => s + x.total, 0)
    const online = energyDevices.value.reduce((s, x) => s + x.online, 0)
    const ratio = total > 0 ? Math.round((online / total) * 100) : 0
    return { total, online, ratio, status: ratio >= 90 ? 'normal' : ratio >= 70 ? 'warning' : 'danger' }
  })

  const envSensorPieOption = computed(() => ({
    tooltip: {
      trigger: 'item', ...tooltipStyle,
      formatter: (p) => `
        <div style="font-weight:600;margin-bottom:4px;color:#b6f5fc">${p.data.name}</div>
        <div style="display:flex;align-items:center;gap:6px;line-height:1.6">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#34d399"></span>
          <span style="color:#b6f5fc">在线</span>
          <span style="margin-left:auto;font-family:monospace;color:#34d399">${p.data.online}</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;line-height:1.6">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#fb7185"></span>
          <span style="color:#b6f5fc">离线</span>
          <span style="margin-left:auto;font-family:monospace;color:#fb7185">${p.data.offline}</span>
        </div>`
    },
    legend: {
      orient: 'vertical', right: 4, top: 'center', icon: 'circle',
      itemWidth: 10, itemHeight: 10, itemGap: 10,
      textStyle: { color: 'rgba(182,245,252,0.9)', fontSize: 14 },
      inactiveColor: 'rgba(182,245,252,0.25)',
      selectedMode: 'multiple'
    },
    series: [{
      type: 'pie', radius: ['65%', '95%'], center: ['30%', '50%'],
      padAngle: 2,
      label: { show: false, position: 'center', formatter: '{b}', color: '#13eaeb', fontSize: 12, fontWeight: 'bold' },
      labelLine: { show: false },
      itemStyle: { borderRadius: 3 },
      emphasis: { scale: true, scaleSize: 3, itemStyle: { shadowBlur: 6, shadowColor: 'rgba(19,234,235,0.55)' }, label: { show: true } },
      data: envSensors.value.map((s) => ({
        name: s.label, value: s.total, online: s.online, offline: s.offline,
        itemStyle: { color: ENV_SENSOR_COLORS[s.key] }
      }))
    }]
  }))

  const energyDeviceBarOption = computed(() => {
    const devices = energyDevices.value
    return {
      grid: { left: 4, right: 16, top: 6, bottom: 28, containLabel: true },
      tooltip: {
        trigger: 'axis', axisPointer: { type: 'shadow' }, ...tooltipStyle,
        formatter: (params) => {
          const label = params[0].axisValueLabel
          return (
            `<div style="font-weight:600;color:#13eaeb;margin-bottom:4px">${label}</div>` +
            params.map((p) => `<div style="display:flex;align-items:center;gap:3em;line-height:1.6"><span>${p.marker}${p.seriesName}</span><span style="margin-left:auto;font-family:monospace;color:${p.color}">${p.value} 台</span></div>`).join('')
          )
        }
      },
      legend: {
        bottom: 0, left: 'center', icon: 'roundRect',
        itemWidth: 16, itemHeight: 6, itemGap: 16,
        textStyle: { color: 'rgba(182,245,252,0.85)', fontSize: 12 }
      },
      xAxis: { type: 'value', ...axisBase, splitNumber: 3 },
      yAxis: { type: 'category', data: devices.map((d) => d.label), axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: 'rgba(182,245,252,0.85)', fontSize: 11 } },
      series: [
        { name: '在线', type: 'bar', data: devices.map((d) => d.online), color: '#34d399', barWidth: 12, barGap: 0, itemStyle: { borderRadius: [0, 2, 2, 0] }, label: { show: true, position: 'right', color: '#34d399', fontSize: 11, fontFamily: 'monospace', formatter: '{c}' } },
        { name: '离线', type: 'bar', data: devices.map((d) => d.offline), color: '#fb7185', barWidth: 12, barGap: 0, itemStyle: { borderRadius: [0, 2, 2, 0] }, label: { show: true, position: 'right', color: '#fb7185', fontSize: 11, fontFamily: 'monospace', formatter: '{c}' } }
      ]
    }
  })

  const floorEnergyTrendOption = computed(() => {
    const idx = (currentFloor.value?.index ?? 0) + 1
    const ac = HOURS.map((_, h) => {
      const base = 8 + idx * 0.6
      const peak = h >= 8 && h <= 20 ? Math.sin(((h - 8) / 12) * Math.PI) * (12 + idx * 1.1) : 0
      return Number((base + peak).toFixed(1))
    })
    const plug = HOURS.map((_, h) => {
      const base = 3 + idx * 0.25
      const peak = h >= 18 && h <= 23 ? (h - 17) * 1.2 : h >= 7 && h <= 9 ? (h - 6) * 0.8 : 0
      return Number((base + peak).toFixed(1))
    })
    const water = HOURS.map((_, h) => {
      const base = 0.05
      const peak = h >= 7 && h <= 9 ? 0.3 : h >= 12 && h <= 13 ? 0.25 : h >= 18 && h <= 21 ? 0.4 : 0
      return Number((base + peak + idx * 0.02).toFixed(2))
    })
    return {
      grid: { left: 32, right: 32, top: 20, bottom: 12 },
      tooltip: {
        trigger: 'axis', ...tooltipStyle,
        axisPointer: { lineStyle: { color: 'rgba(19,234,235,0.4)' } },
        formatter: (params) => {
          const hour = params[0].axisValueLabel
          const units = { 空调: 'kWh', 照明插座: 'kWh', 用水: 'm³' }
          return (
            `<div style="font-weight:600;color:#13eaeb;margin-bottom:4px">${hour}:00</div>` +
            params.map((p) => `<div style="display:flex;align-items:center;gap:3em;line-height:1.6"><span>${p.marker}${p.seriesName}</span><span style="margin-left:auto;font-family:monospace;color:${p.color}">${p.value} ${units[p.seriesName] ?? ''}</span></div>`).join('')
          )
        }
      },
      legend: { top: -3, left: 'center', icon: 'roundRect', itemWidth: 16, itemHeight: 6, textStyle: { color: 'rgba(182,245,252,0.8)', fontSize: 12 } },
      xAxis: { type: 'category', data: HOURS, ...axisBase, axisLabel: { ...axisBase.axisLabel, interval: 5 } },
      yAxis: [
        { type: 'value', name: 'kWh', nameTextStyle: { color: 'rgba(182,245,252,0.5)', fontSize: 10 }, ...axisBase, splitNumber: 3 },
        { type: 'value', name: 'm³',  nameTextStyle: { color: 'rgba(182,245,252,0.5)', fontSize: 10 }, ...axisBase, splitLine: { show: false }, splitNumber: 3 }
      ],
      series: [
        { name: '空调', type: 'line', color: '#13eaeb', smooth: true, symbol: 'none', data: ac, yAxisIndex: 0, lineStyle: { width: 1.5 }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(19,234,235,0.3)' }, { offset: 1, color: 'rgba(19,234,235,0)' }] } } },
        { name: '照明插座', type: 'line', color: '#fcd34d', smooth: true, symbol: 'none', data: plug, yAxisIndex: 0, lineStyle: { width: 1.5 } },
        { name: '用水', type: 'line', color: '#60a5fa', smooth: true, symbol: 'none', data: water, yAxisIndex: 1, lineStyle: { width: 1.5, type: 'dashed' } }
      ]
    }
  })

  return {
    // right panel
    roomNames, tempHumidityRows, co2Rows, irRows, scatterOption, heatmapOption,
    // left panel
    envSensors, envSensorTotals, energyDevices, energyTotal, energyOnlineSummary,
    envSensorPieOption, energyDeviceBarOption, floorEnergyTrendOption
  }
}
