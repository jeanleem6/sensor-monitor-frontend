<script setup>
import { ref } from 'vue'
import BasePanel from '@/components/ui/BasePanel.vue'
import GaugeRing from '@/components/ui/GaugeRing.vue'
import EChart from '@/components/ui/EChart.vue'
import MetricHistoryModal from '@/components/ui/MetricHistoryModal.vue'
import { useRoomData } from '@/composables/useRoomData.js'

const {
  tempCurrent,
  tempStatus,
  tempHistoryStat,
  tempTrendOpt,
  tempHistoryOpt,
  humCurrent,
  humStatus,
  humHistoryStat,
  humTrendOpt,
  humHistoryOpt,
  co2Current,
  co2Status,
  co2HistoryStat,
  co2TrendOpt,
  co2HistoryOpt
} = useRoomData()

const tempModal = ref(false)
const humModal = ref(false)
const co2Modal = ref(false)

const TEMP_STATS = [
  { key: 'today', label: '今日', cls: 'text-primary', unit: '°C' },
  { key: 'max', label: '30日最高', cls: 'text-rose-400', unit: '°C' },
  { key: 'min', label: '30日最低', cls: 'text-sky-300', unit: '°C' },
  { key: 'avg', label: '30日均值', cls: 'text-amber-300', unit: '°C' }
]
const HUM_STATS = [
  { key: 'today', label: '今日', cls: 'text-primary', unit: '%' },
  { key: 'max', label: '30日最高', cls: 'text-rose-400', unit: '%' },
  { key: 'min', label: '30日最低', cls: 'text-emerald-300', unit: '%' },
  { key: 'avg', label: '30日均值', cls: 'text-cyan-50', unit: '%' }
]
const CO2_STATS = [
  { key: 'today', label: '今日', cls: 'text-primary', unit: 'ppm' },
  { key: 'max', label: '30日最高', cls: 'text-rose-400', unit: 'ppm' },
  { key: 'min', label: '30日最低', cls: 'text-emerald-300', unit: 'ppm' },
  { key: 'avg', label: '30日均值', cls: 'text-cyan-50', unit: 'ppm' }
]
</script>

<template>
  <!-- 温度监测 -->
  <BasePanel title="温度监测" class="flex-1 min-h-max">
    <div class="flex items-center gap-3 mb-2">
      <GaugeRing :value="+tempCurrent.toFixed(1)" :max="35" unit="°C" :status="tempStatus" :size="60" />
      <div class="flex-1 text-sm space-y-1">
        <div class="flex justify-between text-cyan-200/70">
          <span>当前温度</span>
          <span class="flex items-baseline gap-1.5">
            <span
              :class="[
                'font-mono font-bold text-base',
                tempStatus === 'danger' ? 'text-rose-400' : tempStatus === 'warning' ? 'text-amber-300' : 'text-cyan-50'
              ]"
            >
              {{ tempCurrent.toFixed(1) }}°C
            </span>
            <span
              :class="[
                'text-xs',
                tempStatus === 'danger'
                  ? 'text-rose-400'
                  : tempStatus === 'warning'
                    ? 'text-amber-300'
                    : 'text-emerald-300'
              ]"
            >
              {{ tempStatus === 'danger' ? '过高' : tempStatus === 'warning' ? '偏高' : '正常' }}
            </span>
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
    <div class="flex-1 min-h-19">
      <EChart :option="tempTrendOpt" height="100%" />
    </div>
    <div
      class="mt-2 pt-2 border-t border-primary/20 flex items-center justify-center gap-1 text-sm text-primary/80 hover:text-primary cursor-pointer"
      @click="tempModal = true"
    >
      <Icon icon="lucide:history" class="text-sm" /><span>查看历史数据</span
      ><Icon icon="lucide:chevron-right" class="text-sm" />
    </div>
  </BasePanel>

  <!-- 湿度监测 -->
  <BasePanel title="湿度监测" class="flex-1 min-h-max">
    <div class="flex items-center gap-3 mb-2">
      <GaugeRing :value="humCurrent" :max="100" unit="%" :status="humStatus" :size="60" inline />
      <div class="flex-1 text-sm space-y-1">
        <div class="flex justify-between text-cyan-200/70">
          <span>当前湿度</span>
          <span class="flex items-baseline gap-1.5">
            <span
              :class="['font-mono font-bold text-base', humStatus === 'warning' ? 'text-amber-300' : 'text-cyan-50']"
              >{{ humCurrent }}%</span
            >
            <span :class="['text-xs', humStatus === 'warning' ? 'text-amber-300' : 'text-emerald-300']">{{
              humStatus === 'warning' ? '异常' : '正常'
            }}</span>
          </span>
        </div>
        <div class="flex justify-between text-cyan-200/60">
          <span>适宜区间</span><span class="font-mono">40 – 60%</span>
        </div>
      </div>
    </div>
    <div class="flex items-center gap-1 text-sm text-cyan-200/60">
      <Icon icon="mdi:water-percent" class="text-blue-400 text-base" />
      24小时湿度曲线
    </div>
    <div class="flex-1 min-h-19">
      <EChart :option="humTrendOpt" height="100%" />
    </div>
    <div
      class="mt-2 pt-2 border-t border-primary/20 flex items-center justify-center gap-1 text-sm text-primary/80 hover:text-primary cursor-pointer"
      @click="humModal = true"
    >
      <Icon icon="lucide:history" class="text-sm" /><span>查看历史数据</span
      ><Icon icon="lucide:chevron-right" class="text-sm" />
    </div>
  </BasePanel>

  <!-- CO₂ 监测 -->
  <BasePanel title="二氧化碳监测" class="flex-1 min-h-max">
    <div class="flex items-center gap-3 mb-2">
      <GaugeRing :value="co2Current" :max="2000" unit="ppm" :status="co2Status" :size="60" />
      <div class="flex-1 text-sm space-y-0.5">
        <div class="flex justify-between text-cyan-200/70">
          <span>当前浓度</span>
          <span
            :class="[
              'font-mono font-bold text-base',
              co2Status === 'danger' ? 'text-rose-400' : co2Status === 'warning' ? 'text-amber-300' : 'text-cyan-50'
            ]"
          >
            {{ co2Current }} ppm
          </span>
        </div>
        <div class="flex items-center justify-between gap-1">
          <div class="flex items-center gap-1">
            <span class="text-amber-300/80">预警</span>/<span class="text-rose-400/80">危险</span>
          </div>
          <div class="flex items-center justify-between gap-1">
            <span class="font-mono text-amber-300"> 1000ppm</span>/<span class="font-mono text-rose-400"> 1500ppm</span>
          </div>
        </div>
      </div>
    </div>
    <div class="flex items-center gap-1 text-sm text-cyan-200/60">
      <Icon icon="mdi:molecule-co2" class="text-emerald-400 text-base" />
      24小时 CO₂ 曲线
    </div>
    <div class="flex-1 min-h-19">
      <EChart :option="co2TrendOpt" height="100%" />
    </div>
    <div
      class="mt-2 pt-2 border-t border-primary/20 flex items-center justify-center gap-1 text-sm text-primary/80 hover:text-primary cursor-pointer"
      @click="co2Modal = true"
    >
      <Icon icon="lucide:history" class="text-sm" /><span>查看历史数据</span
      ><Icon icon="lucide:chevron-right" class="text-sm" />
    </div>
  </BasePanel>

  <!-- 历史 Modals -->
  <MetricHistoryModal
    v-model="tempModal"
    title="温度历史数据"
    icon="mdi:thermometer-lines"
    :stat-defs="TEMP_STATS"
    :stat-values="tempHistoryStat"
    :chart-option="tempHistoryOpt"
  />
  <MetricHistoryModal
    v-model="humModal"
    title="湿度历史数据"
    icon="mdi:water-percent"
    :stat-defs="HUM_STATS"
    :stat-values="humHistoryStat"
    :chart-option="humHistoryOpt"
  />
  <MetricHistoryModal
    v-model="co2Modal"
    title="二氧化碳历史数据"
    icon="mdi:molecule-co2"
    :stat-defs="CO2_STATS"
    :stat-values="co2HistoryStat"
    :chart-option="co2HistoryOpt"
  />
</template>
