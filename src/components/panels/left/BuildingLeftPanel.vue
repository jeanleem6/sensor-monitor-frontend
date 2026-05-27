<script setup>
import { storeToRefs } from 'pinia'
import { useViewerStore } from '@/stores/viewer'
import BasePanel from '@/components/ui/BasePanel.vue'
import MetricCard from '@/components/ui/MetricCard.vue'
import GaugeRing from '@/components/ui/GaugeRing.vue'
import EChart from '@/components/ui/EChart.vue'
import CollapsedSummary from '@/components/panels/CollapsedSummary.vue'
import {
  weatherMetrics,
  airQualityGauges,
  solarMetrics,
  solarTrendOption,
  airTrendOption
} from '@/composables/useBuildingData.js'

const { sidesCollapsed } = storeToRefs(useViewerStore())

// 状态字段统一成 normal/warning/danger（数据源里 normal 用 undefined 省略）
const toMetric = (m) => ({ icon: m.icon, label: m.label, value: m.value, unit: m.unit, status: m.status || 'normal' })
</script>

<template>
  <!-- 折叠态：纯数据摘要 -->
  <template v-if="sidesCollapsed">
    <CollapsedSummary title="气象站" icon="lucide:cloud-sun" :metrics="weatherMetrics.map(toMetric)" />
    <CollapsedSummary title="太阳辐射" icon="mdi:solar-power-variant" :metrics="solarMetrics.map(toMetric)" />
  </template>

  <!-- 展开态：完整内容 -->
  <template v-else>
    <BasePanel title="全参数气象站" class="flex-5 min-h-max">
      <div class="grid grid-cols-4 gap-1">
        <MetricCard
          v-for="m in weatherMetrics"
          :key="m.label"
          :icon="m.icon"
          :label="m.label"
          :value="m.value"
          :unit="m.unit"
          :status="m.status"
        />
      </div>

      <div class="mt-3 pt-3 border-t border-primary/20 flex-1 min-h-0 flex flex-col">
        <div class="flex items-center justify-between mb-2 text-sm">
          <div class="flex items-center gap-1.5 text-cyan-200/80">
            <Icon icon="mdi:weather-fog" class="text-primary text-base" />
            <span>空气质量</span>
          </div>
          <span class="text-cyan-200/50">当前 / 24h 趋势</span>
        </div>
        <div class="grid grid-cols-3 gap-1">
          <GaugeRing
            v-for="a in airQualityGauges"
            :key="a.label"
            :value="a.value"
            :max="a.max"
            :label="a.label"
            :unit="a.unit"
            :status="a.status"
            :size="78"
          />
        </div>
        <div class="flex items-center gap-1 text-sm text-cyan-200/60 mt-3 mb-1">
          <Icon icon="mdi:chart-line" class="text-primary text-base" />
          24小时污染物浓度趋势
        </div>
        <div class="flex-1 min-h-32">
          <EChart :option="airTrendOption" height="100%" />
        </div>
      </div>
    </BasePanel>

    <BasePanel title="太阳辐射观测系统" class="flex-3 min-h-max">
      <div class="grid grid-cols-3 gap-1.5">
        <div
          v-for="s in solarMetrics"
          :key="s.label"
          class="rounded border border-primary/25 bg-primary/10 px-2 py-1.5 text-center transition-colors hover:border-primary/60 hover:bg-primary/20"
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
      <div class="flex items-center gap-1 text-sm text-cyan-200/60 mt-3 mb-1">
        <Icon icon="mdi:solar-power-variant" class="text-amber-300 text-base" />
        当日太阳辐射逐时趋势
      </div>
      <div class="flex-1 min-h-34">
        <EChart :option="solarTrendOption" height="100%" />
      </div>
    </BasePanel>
  </template>
</template>
