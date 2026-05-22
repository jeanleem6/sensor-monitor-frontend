<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useViewerStore } from '@/stores/viewer'
import BasePanel from '@/components/ui/BasePanel.vue'
import MetricCard from '@/components/ui/MetricCard.vue'
import GaugeRing from '@/components/ui/GaugeRing.vue'
import EChart from '@/components/ui/EChart.vue'

const store = useViewerStore()
const { level, materialNames, currentFloor, currentRoom, selectedMaterial } = storeToRefs(store)

const title = computed(() => `组件清单 · ${currentRoom.value ? store.selectedRoom : ''}`)

const itemBase =
  'flex items-center justify-between gap-2 px-2 py-1 rounded cursor-pointer text-cyan-100 transition-colors hover:bg-primary/15'
const itemActive = 'bg-primary/25 text-primary hover:bg-primary/25'

// ---------- 楼栋级 DEMO 数据 ----------
const weatherBasic = [
  { icon: 'lucide:thermometer', label: '温度', value: '24.6', unit: '°C' },
  { icon: 'lucide:droplets', label: '湿度', value: '87', unit: '%', status: 'warning' },
  { icon: 'lucide:droplet', label: '露点', value: '15.8', unit: '°C' },
  { icon: 'lucide:gauge', label: '气压', value: '1013', unit: 'hPa' },
  { icon: 'lucide:compass', label: '风向', value: 'ENE', unit: '67°' },
  { icon: 'lucide:wind', label: '风速', value: '3.2', unit: 'm/s' },
  { icon: 'lucide:cloud-rain', label: '降水量', value: '78.0', unit: 'mm', status: 'danger' }
]

// 阈值类指标 → 环形仪表
const airQuality = [
  { label: 'CO₂', value: 612, max: 1500, unit: 'ppm', status: 'normal' },
  { label: 'PM2.5', value: 42, max: 150, unit: 'μg/m³', status: 'warning' },
  { label: 'PM10', value: 68, max: 200, unit: 'μg/m³', status: 'danger' }
]

const solarRadiation = [
  { icon: 'lucide:sun', label: '直接辐射', value: '786', unit: 'W/m²', status: 'normal' },
  { icon: 'lucide:sun-dim', label: '散射辐射', value: '142', unit: 'W/m²', status: 'warning' },
  { icon: 'lucide:rainbow', label: '光谱辐射', value: '923', unit: 'W/m²', status: 'danger' }
]

// 24h 横坐标
const HOURS = Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, '0')}`)

// 太阳辐射 24h 趋势 DEMO
const SOLAR_DIRECT = [0, 0, 0, 0, 0, 0, 35, 180, 380, 580, 740, 850, 920, 905, 825, 690, 510, 290, 110, 25, 0, 0, 0, 0]
const SOLAR_DIFFUSE = [0, 0, 0, 0, 0, 8, 28, 65, 105, 135, 152, 168, 175, 172, 158, 138, 108, 68, 35, 12, 0, 0, 0, 0]
const SOLAR_SPECTRUM = [
  0, 0, 0, 0, 0, 0, 48, 220, 460, 680, 850, 990, 1080, 1055, 950, 800, 590, 340, 150, 35, 0, 0, 0, 0
]

const tooltipStyle = {
  backgroundColor: 'rgba(6,10,29,0.92)',
  borderColor: 'rgba(19,234,235,0.5)',
  borderWidth: 1,
  textStyle: { color: '#b6f5fc', fontSize: 12 },
  extraCssText: 'box-shadow: 0 0 12px rgba(19,234,235,0.25)'
}

const axisStyleBase = {
  axisLine: { lineStyle: { color: 'rgba(19,234,235,0.25)' } },
  axisTick: { lineStyle: { color: 'rgba(19,234,235,0.25)' } },
  axisLabel: { color: 'rgba(182,245,252,0.65)', fontSize: 10 },
  splitLine: { lineStyle: { color: 'rgba(19,234,235,0.08)' } }
}

const solarTrendOption = {
  grid: { left: 38, right: 8, top: 26, bottom: 22 },
  tooltip: {
    trigger: 'axis',
    ...tooltipStyle,
    axisPointer: {
      lineStyle: { color: 'rgba(19,234,235,0.4)' },
      label: { formatter: (params) => `${params.value} 点` }
    },
    valueFormatter: (v) => `${v} W/m²`
  },
  legend: {
    top: 0,
    right: 0,
    icon: 'roundRect',
    itemWidth: 8,
    itemHeight: 4,
    textStyle: { color: 'rgba(182,245,252,0.8)', fontSize: 10 }
  },
  xAxis: { type: 'category', data: HOURS, ...axisStyleBase, axisLabel: { ...axisStyleBase.axisLabel, interval: 3 } },
  yAxis: { type: 'value', ...axisStyleBase, splitNumber: 3 },
  series: [
    {
      name: '直接辐射',
      type: 'line',
      color: '#13eaeb',
      smooth: true,
      symbol: 'none',
      data: SOLAR_DIRECT,
      lineStyle: { width: 1.5 },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(19,234,235,0.35)' },
            { offset: 1, color: 'rgba(19,234,235,0)' }
          ]
        }
      },
      markPoint: {
        symbol: 'pin',
        symbolSize: 32,
        itemStyle: { color: '#13eaeb' },
        label: { fontSize: 10, color: '#060a1d' },
        data: [{ type: 'max', name: '峰值' }]
      }
    },
    {
      name: '散射辐射',
      type: 'line',
      color: '#fcd34d',
      smooth: true,
      symbol: 'none',
      data: SOLAR_DIFFUSE,
      lineStyle: { width: 1.5 }
    },
    {
      name: '光谱辐射',
      type: 'line',
      color: '#fb7185',
      smooth: true,
      symbol: 'none',
      data: SOLAR_SPECTRUM,
      lineStyle: { width: 1.5, type: 'dashed' }
    }
  ]
}

// 空气质量 24h 趋势 DEMO（与圆环仪表当前值对应的趋势补充）
const CO2_TREND = [
  420, 425, 430, 430, 435, 450, 520, 680, 850, 920, 870, 780, 620, 590, 720, 820, 750, 680, 580, 520, 480, 450, 430, 420
]
const PM25_TREND = [28, 25, 22, 20, 18, 22, 35, 48, 55, 62, 58, 52, 42, 38, 45, 56, 68, 72, 65, 55, 48, 42, 38, 32]
const PM10_TREND = [
  58, 55, 50, 48, 45, 52, 72, 95, 105, 118, 110, 102, 85, 78, 88, 105, 125, 138, 128, 108, 92, 82, 72, 65
]

const airTrendOption = {
  grid: { left: 32, right: 32, top: 22, bottom: 22 },
  tooltip: {
    trigger: 'axis',
    ...tooltipStyle,
    axisPointer: {
      lineStyle: { color: 'rgba(19,234,235,0.4)' },
      label: { formatter: (params) => `${params.value} 点` }
    }
  },
  legend: {
    top: 0,
    left: 'center',
    icon: 'roundRect',
    itemWidth: 8,
    itemHeight: 4,
    textStyle: { color: 'rgba(182,245,252,0.8)', fontSize: 10 }
  },
  xAxis: { type: 'category', data: HOURS, ...axisStyleBase, axisLabel: { ...axisStyleBase.axisLabel, interval: 5 } },
  yAxis: [
    {
      type: 'value',
      name: 'ppm',
      nameTextStyle: { color: 'rgba(182,245,252,0.5)', fontSize: 10 },
      ...axisStyleBase,
      splitNumber: 3
    },
    {
      type: 'value',
      name: 'μg/m³',
      nameTextStyle: { color: 'rgba(182,245,252,0.5)', fontSize: 10 },
      ...axisStyleBase,
      splitLine: { show: false },
      splitNumber: 3
    }
  ],
  series: [
    {
      name: 'CO₂',
      type: 'line',
      color: '#13eaeb',
      smooth: true,
      symbol: 'none',
      data: CO2_TREND,
      yAxisIndex: 0,
      lineStyle: { width: 1.5 }
    },
    {
      name: 'PM2.5',
      type: 'line',
      color: '#fcd34d',
      smooth: true,
      symbol: 'none',
      data: PM25_TREND,
      yAxisIndex: 1,
      lineStyle: { width: 1.5 }
    },
    {
      name: 'PM10',
      type: 'line',
      color: '#fb7185',
      smooth: true,
      symbol: 'none',
      data: PM10_TREND,
      yAxisIndex: 1,
      lineStyle: { width: 1.5 }
    }
  ]
}

// ---------- 楼层级 DEMO 数据 ----------
const envSensors = computed(() => {
  const rooms = currentFloor.value?.roomNames?.length ?? 0
  const seed = (currentFloor.value?.index ?? 0) + 1
  const off = (total, mod) => (total > 0 ? seed % mod : 0)
  // 各类传感器按实际安装习惯差异化布点：
  //  - 温度 / 湿度：每个房间 1 套
  //  - 二氧化碳：仅重点房间（约 60%）
  //  - 红外线：房间 + 公共区域（走廊、出入口约多 25%）
  const list = [
    { key: 'temp', icon: 'mdi:thermometer-lines', label: '温度传感器', total: rooms },
    { key: 'hum', icon: 'mdi:water-percent', label: '湿度传感器', total: rooms },
    { key: 'co2', icon: 'mdi:molecule-co2', label: '二氧化碳传感器', total: Math.ceil(rooms * 0.6) },
    { key: 'ir', icon: 'carbon:motion-sensor', label: '红外线传感器', total: rooms + Math.ceil(rooms / 4) }
  ]
  return list.map((s, i) => {
    const offline = off(s.total, [3, 4, 2, 5][i])
    return { ...s, offline, online: Math.max(0, s.total - offline) }
  })
})

const energyDevices = computed(() => {
  const rooms = Math.max(currentFloor.value?.roomNames?.length ?? 0, 6)
  const seed = (currentFloor.value?.index ?? 0) + 1
  const off = (total, mod) => (total > 0 ? (seed * 7 + total) % mod : 0)
  const list = [
    { key: 'ac', icon: 'mdi:air-conditioner', label: '空调电表', total: rooms },
    { key: 'lightPlug', icon: 'mdi:lightbulb-on-outline', label: '照明和插座电表', total: rooms * 2 },
    { key: 'water', icon: 'mdi:water-pump', label: '水表', total: Math.max(1, Math.ceil(rooms / 4)) }
  ]
  return list.map((d) => {
    const offline = off(d.total, 4)
    return { ...d, offline, online: Math.max(0, d.total - offline) }
  })
})

const energyTotalSummary = computed(() => {
  const idx = (currentFloor.value?.index ?? 0) + 1
  const ac = 260 + idx * 38.5
  const plug = 120 + idx * 22.4
  const water = 3.2 + idx * 0.7
  return [
    { icon: 'mdi:air-conditioner', label: '空调能耗', value: ac.toFixed(1), unit: 'kWh', status: 'normal' },
    {
      icon: 'mdi:lightbulb-on-outline',
      label: '照明插座',
      value: plug.toFixed(1),
      unit: 'kWh',
      status: 'normal'
    },
    {
      icon: 'mdi:water',
      label: '用水量',
      value: water.toFixed(2),
      unit: 'm³',
      status: water > 5 ? 'warning' : 'normal'
    }
  ]
})

// ---------- 图表 1：传感器分布饼图 / 能耗设备在线率 ----------
const summarizeOnline = (list) => {
  const total = list.reduce((s, x) => s + x.total, 0)
  const online = list.reduce((s, x) => s + x.online, 0)
  const ratio = total > 0 ? Math.round((online / total) * 100) : 0
  return { total, online, ratio, status: ratio >= 90 ? 'normal' : ratio >= 70 ? 'warning' : 'danger' }
}
const energyOnlineSummary = computed(() => summarizeOnline(energyDevices.value))

const energyDeviceBarOption = computed(() => {
  const devices = energyDevices.value
  return {
    grid: { left: 4, right: 16, top: 6, bottom: 28, containLabel: true },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      ...tooltipStyle,
      valueFormatter: (v) => `${v} 台`
    },
    legend: {
      bottom: 0,
      left: 'center',
      icon: 'roundRect',
      itemWidth: 10,
      itemHeight: 6,
      itemGap: 16,
      textStyle: { color: 'rgba(182,245,252,0.85)', fontSize: 11 }
    },
    xAxis: { type: 'value', ...axisStyleBase, splitNumber: 3 },
    yAxis: {
      type: 'category',
      data: devices.map((d) => d.label),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: 'rgba(182,245,252,0.85)', fontSize: 11 }
    },
    series: [
      {
        name: '在线',
        type: 'bar',
        data: devices.map((d) => d.online),
        color: '#34d399',
        barWidth: 12,
        barGap: 0,
        itemStyle: { borderRadius: [0, 2, 2, 0] },
        label: {
          show: true,
          position: 'right',
          color: '#34d399',
          fontSize: 11,
          fontFamily: 'monospace',
          formatter: '{c}'
        }
      },
      {
        name: '离线',
        type: 'bar',
        data: devices.map((d) => d.offline),
        color: '#fb7185',
        barWidth: 12,
        barGap: 0,
        itemStyle: { borderRadius: [0, 2, 2, 0] },
        label: {
          show: true,
          position: 'right',
          color: '#fb7185',
          fontSize: 11,
          fontFamily: 'monospace',
          formatter: '{c}'
        }
      }
    ]
  }
})

const envSensorColors = {
  temp: '#fb7185',
  hum: '#60a5fa',
  co2: '#34d399',
  ir: '#fcd34d'
}

const envSensorTotals = computed(() => {
  const total = envSensors.value.reduce((s, x) => s + x.total, 0)
  const online = envSensors.value.reduce((s, x) => s + x.online, 0)
  return { total, online, offline: total - online }
})

const envSensorPieOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    ...tooltipStyle,
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
      </div>
    `
  },
  legend: {
    orient: 'vertical',
    right: 4,
    top: 'center',
    icon: 'circle',
    itemWidth: 10,
    itemHeight: 10,
    itemGap: 10,
    textStyle: { color: 'rgba(182,245,252,0.9)', fontSize: 14 },
    inactiveColor: 'rgba(182,245,252,0.25)',
    emphasis: {
      selectorLabel: { fontSize: 14, color: '#13eaeb' }
    },
    selectedMode: 'multiple'
  },
  series: [
    {
      type: 'pie',
      radius: ['52%', '82%'],
      center: ['30%', '50%'],
      padAngle: 2,
      // avoidLabelOverlap: false,
      label: { show: false, position: 'center' },
      labelLine: { show: false },
      itemStyle: {
        borderRadius: 3
      },
      emphasis: {
        scale: true,
        scaleSize: 3,
        itemStyle: { shadowBlur: 6, shadowColor: 'rgba(19,234,235,0.55)' },
        label: { show: true, fontSize: 12, color: '#13eaeb' }
      },
      data: envSensors.value.map((s) => ({
        name: s.label,
        value: s.total,
        online: s.online,
        offline: s.offline,
        itemStyle: { color: envSensorColors[s.key] }
      }))
    }
  ]
}))

// ---------- 图表 2：楼层 24h 能耗趋势 ----------
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
      trigger: 'axis',
      ...tooltipStyle,
      axisPointer: {
        lineStyle: { color: 'rgba(19,234,235,0.4)' },
        label: { formatter: (params) => `${params.value} 点` }
      }
    },
    legend: {
      top: -3,
      left: 'center',
      icon: 'roundRect',
      itemWidth: 8,
      itemHeight: 4,
      textStyle: { color: 'rgba(182,245,252,0.8)', fontSize: 12 }
    },
    xAxis: { type: 'category', data: HOURS, ...axisStyleBase, axisLabel: { ...axisStyleBase.axisLabel, interval: 5 } },
    yAxis: [
      {
        type: 'value',
        name: 'kWh',
        nameTextStyle: { color: 'rgba(182,245,252,0.5)', fontSize: 10 },
        ...axisStyleBase,
        splitNumber: 3
      },
      {
        type: 'value',
        name: 'm³',
        nameTextStyle: { color: 'rgba(182,245,252,0.5)', fontSize: 10 },
        ...axisStyleBase,
        splitLine: { show: false },
        splitNumber: 3
      }
    ],
    series: [
      {
        name: '空调',
        type: 'line',
        color: '#13eaeb',
        smooth: true,
        symbol: 'none',
        data: ac,
        yAxisIndex: 0,
        lineStyle: { width: 1.5 },
        tooltip: { valueFormatter: (v) => `${v} kWh` },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(19,234,235,0.3)' },
              { offset: 1, color: 'rgba(19,234,235,0)' }
            ]
          }
        }
      },
      {
        name: '照明插座',
        type: 'line',
        color: '#fcd34d',
        smooth: true,
        symbol: 'none',
        data: plug,
        yAxisIndex: 0,
        lineStyle: { width: 1.5 },
        tooltip: { valueFormatter: (v) => `${v} kWh` }
      },
      {
        name: '用水',
        type: 'line',
        color: '#60a5fa',
        smooth: true,
        symbol: 'none',
        data: water,
        yAxisIndex: 1,
        lineStyle: { width: 1.5, type: 'dashed' },
        tooltip: { valueFormatter: (v) => `${v} m³` }
      }
    ]
  }
})
</script>

<template>
  <div class="level-side left-3">
    <!-- ========== 楼栋级 ========== -->
    <template v-if="level === 'building'">
      <BasePanel title="全参数气象站">
        <!-- 基础参数 -->
        <div class="grid grid-cols-3 gap-2">
          <MetricCard
            v-for="m in weatherBasic"
            :key="m.label"
            :icon="m.icon"
            :label="m.label"
            :value="m.value"
            :unit="m.unit"
            :status="m.status"
          />
        </div>

        <!-- 空气质量（带阈值） -->
        <div class="mt-3 pt-3 border-t border-primary/20">
          <div class="flex items-center justify-between mb-2 text-sm">
            <div class="flex items-center gap-1.5 text-cyan-200/80">
              <Icon icon="mdi:weather-fog" class="text-primary text-base" />
              <span>空气质量</span>
            </div>
            <span class="text-cyan-200/50">当前 / 24h 趋势</span>
          </div>
          <div class="grid grid-cols-3 gap-1">
            <GaugeRing
              v-for="a in airQuality"
              :key="a.label"
              :value="a.value"
              :max="a.max"
              :label="a.label"
              :unit="a.unit"
              :status="a.status"
              :size="78"
            />
          </div>
          <EChart :option="airTrendOption" height="112px" class="mt-3" />
        </div>
      </BasePanel>

      <BasePanel title="太阳辐射观测系统" class="mt-5">
        <div class="grid grid-cols-3 gap-1.5">
          <div
            v-for="s in solarRadiation"
            :key="s.label"
            class="rounded border border-primary/25 bg-primary/10 px-2 py-1.5 text-center"
          >
            <div class="flex items-center justify-center gap-1 text-sm text-cyan-200/70">
              <Icon
                :icon="s.icon"
                :class="
                  s.status === 'danger' ? 'text-rose-400' : s.status === 'warning' ? 'text-amber-300' : 'text-primary'
                "
              />
              <span class="truncate">{{ s.label }}</span>
            </div>
            <div
              :class="[
                'mt-0.5 text-lg font-bold font-mono leading-none',
                s.status === 'danger' ? 'text-rose-400' : s.status === 'warning' ? 'text-amber-300' : 'text-cyan-50'
              ]"
            >
              {{ s.value }}
              <span class="text-sm text-cyan-200/50">{{ s.unit }}</span>
            </div>
          </div>
        </div>
        <!-- <div class="mt-2 flex items-center justify-between text-sm">
          <span class="flex items-center gap-1 text-cyan-200/70">
            <Icon icon="mdi:solar-power-variant" class="text-amber-300 text-base" />
            当日辐射趋势
          </span>
          <span class="text-cyan-200/50">峰值 1080 W/m² · 12:00</span>
        </div> -->
        <EChart :option="solarTrendOption" height="140px" class="mt-3" />
      </BasePanel>
    </template>

    <!-- ========== 楼层级 ========== -->
    <template v-else-if="level === 'floor'">
      <BasePanel title="环境传感器设备">
        <EChart :option="envSensorPieOption" height="150px" />
      </BasePanel>

      <BasePanel title="能耗监测设备" class="mt-5">
        <div class="flex items-center justify-center gap-3 pb-2 mb-2 border-b border-primary/20">
          <GaugeRing
            :value="energyOnlineSummary.ratio"
            :max="100"
            unit="%"
            :size="64"
            :status="energyOnlineSummary.status"
            inline
          />
          <div class="text-sm leading-tight">
            <div class="text-cyan-200/70">整体在线率</div>
            <div class="text-cyan-100">
              <span class="font-mono text-lg font-semibold text-emerald-300">{{ energyOnlineSummary.online }}</span>
              <span class="text-cyan-200/60"> / {{ energyOnlineSummary.total }} 台在线</span>
            </div>
            <div class="text-cyan-200/60">
              离线
              <span class="font-mono text-rose-400">{{ energyOnlineSummary.total - energyOnlineSummary.online }}</span>
              台
            </div>
          </div>
        </div>
        <EChart :option="energyDeviceBarOption" height="158px" />
      </BasePanel>

      <BasePanel title="能耗监测总量" class="mt-5">
        <div class="grid grid-cols-3 gap-2">
          <MetricCard
            v-for="e in energyTotalSummary"
            :key="e.label"
            :icon="e.icon"
            :label="e.label"
            :value="e.value"
            :unit="e.unit"
            :status="e.status"
          />
        </div>
        <div class="mt-3 pt-3 border-t border-primary/20">
          <EChart :option="floorEnergyTrendOption" height="130px" />
        </div>
      </BasePanel>
    </template>

    <!-- ========== 房间级 ========== -->
    <template v-else>
      <BasePanel :title="title" class="min-h-60">
        <div class="px-2 py-1.5 text-sm text-cyan-200/70 border-b border-cyan-400/20">
          所属：{{ currentFloor?.name ?? '—' }}
        </div>
        <div class="px-2 py-1.5 flex items-center justify-between">
          <span class="text-cyan-100">组件数</span>
          <span class="font-mono font-semibold text-primary">{{ currentRoom?.meshCount ?? 0 }}</span>
        </div>

        <div class="shrink-0 mt-2 pt-2 px-1 text-sm font-semibold text-primary border-t border-cyan-400/25">
          材质 ({{ materialNames.length }})
        </div>
        <div class="max-h-48 mt-1 overflow-y-auto">
          <div v-if="materialNames.length === 0" class="px-2 py-1 text-cyan-200/50">无资料</div>
          <div
            v-for="name in materialNames"
            :key="name"
            :class="[itemBase, 'text-sm', selectedMaterial === name && itemActive]"
            @click="store.selectMaterial(name)"
          >
            <span class="truncate">{{ name }}</span>
          </div>
        </div>
      </BasePanel>
    </template>
  </div>
</template>
