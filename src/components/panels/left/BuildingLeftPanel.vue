<script setup>
import BasePanel from '@/components/ui/BasePanel.vue'
import MetricCard from '@/components/ui/MetricCard.vue'
import GaugeRing from '@/components/ui/GaugeRing.vue'
import EChart from '@/components/ui/EChart.vue'
import { weatherMetrics, airQualityGauges, solarMetrics, solarTrendOption, airTrendOption } from '@/composables/useBuildingData.js'
</script>

<template>
  <BasePanel title="全参数气象站">
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
      <EChart :option="airTrendOption" height="139px" />
    </div>
  </BasePanel>

  <BasePanel title="太阳辐射观测系统" class="mt-5">
    <div class="grid grid-cols-3 gap-1.5">
      <div
        v-for="s in solarMetrics"
        :key="s.label"
        class="rounded border border-primary/25 bg-primary/10 px-2 py-1.5 text-center"
      >
        <div class="flex items-center justify-center gap-1 text-sm text-cyan-200/70">
          <Icon
            :icon="s.icon"
            :class="s.status === 'danger' ? 'text-rose-400' : s.status === 'warning' ? 'text-amber-300' : 'text-primary'"
          />
          <span class="truncate">{{ s.label }}</span>
        </div>
        <div :class="['mt-0.5 text-lg font-bold font-mono leading-none', s.status === 'danger' ? 'text-rose-400' : s.status === 'warning' ? 'text-amber-300' : 'text-cyan-50']">
          {{ s.value }}
          <span class="text-sm text-cyan-200/50">{{ s.unit }}</span>
        </div>
      </div>
    </div>
    <div class="flex items-center gap-1 text-sm text-cyan-200/60 mt-3 mb-1">
      <Icon icon="mdi:solar-power-variant" class="text-amber-300 text-base" />
      当日太阳辐射逐时趋势
    </div>
    <EChart :option="solarTrendOption" height="140px" />
  </BasePanel>
</template>
