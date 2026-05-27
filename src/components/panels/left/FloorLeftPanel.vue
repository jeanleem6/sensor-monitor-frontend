<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useViewerStore } from '@/stores/viewer'
import BasePanel from '@/components/ui/BasePanel.vue'
import MetricCard from '@/components/ui/MetricCard.vue'
import GaugeRing from '@/components/ui/GaugeRing.vue'
import EChart from '@/components/ui/EChart.vue'
import CollapsedSummary from '@/components/panels/CollapsedSummary.vue'
import { useFloorData } from '@/composables/useFloorData.js'

const { sidesCollapsed } = storeToRefs(useViewerStore())

const {
  envSensors,
  energyDevices,
  energyTotal,
  energyOnlineSummary,
  envSensorPieOption,
  energyDeviceBarOption,
  floorEnergyTrendOption
} = useFloorData()

// ---- 折叠态摘要 ----
const envSensorMetrics = computed(() =>
  envSensors.value.map((s) => ({
    icon: s.icon,
    label: s.label,
    value: `${s.online}/${s.total}`,
    unit: '台',
    status: s.offline > 0 ? 'warning' : 'normal'
  }))
)
const energyDeviceMetrics = computed(() => [
  {
    icon: 'mdi:check-network-outline',
    label: '整体在线率',
    value: energyOnlineSummary.value.ratio,
    unit: '%',
    status: energyOnlineSummary.value.status
  },
  ...energyDevices.value.map((d) => ({
    icon: d.icon,
    label: d.label,
    value: `${d.online}/${d.total}`,
    unit: '台',
    status: d.offline > 0 ? 'warning' : 'normal'
  }))
])
const energyTotalMetrics = computed(() =>
  energyTotal.value.map((e) => ({
    icon: e.icon,
    label: e.label,
    value: e.value,
    unit: e.unit,
    status: e.status || 'normal'
  }))
)
</script>

<template>
  <!-- 折叠态：纯数据摘要 -->
  <template v-if="sidesCollapsed">
    <CollapsedSummary title="环境传感器" icon="mdi:access-point" :metrics="envSensorMetrics" />
    <CollapsedSummary title="能耗设备" icon="mdi:meter-electric-outline" :metrics="energyDeviceMetrics" />
    <CollapsedSummary title="能耗总量" icon="mdi:chart-box-outline" :metrics="energyTotalMetrics" />
  </template>

  <!-- 展开态：完整内容 -->
  <template v-else>
    <BasePanel title="环境传感器设备" class="flex-2 min-h-max">
      <div class="flex-1 min-h-35">
        <EChart :option="envSensorPieOption" height="100%" />
      </div>
    </BasePanel>

    <BasePanel title="能耗监测设备" class="flex-3 min-h-max">
      <div class="flex items-center justify-center gap-3 pb-2 mb-2 border-b border-primary/20">
        <div class="text-cyan-200/70">整体在线率</div>
        <GaugeRing
          :value="energyOnlineSummary.ratio"
          :max="100"
          unit="%"
          :size="64"
          :status="energyOnlineSummary.status"
          inline
        />
        <div class="text-sm leading-tight">
          <div class="text-cyan-100">
            <span class="font-mono text-lg font-semibold text-emerald-300">{{ energyOnlineSummary.online }}</span>
            <span class="text-cyan-200/60"> / {{ energyOnlineSummary.total }} 台在线</span>
          </div>
          <div class="text-cyan-200/60">
            离线
            <span class="font-mono text-rose-400">{{ energyOnlineSummary.total - energyOnlineSummary.online }}</span> 台
          </div>
        </div>
      </div>
      <div class="flex-1 min-h-35">
        <EChart :option="energyDeviceBarOption" height="100%" />
      </div>
    </BasePanel>

    <BasePanel title="能耗监测总量" class="flex-3 min-h-max">
      <div class="grid grid-cols-3 gap-2">
        <MetricCard
          v-for="e in energyTotal"
          :key="e.label"
          :icon="e.icon"
          :label="e.label"
          :value="e.value"
          :unit="e.unit"
          :status="e.status"
        />
      </div>
      <div class="mt-3 pt-3 border-t border-primary/20 flex-1 min-h-0 flex flex-col">
        <div class="flex items-center gap-1 text-sm text-cyan-200/60 mb-1">
          <Icon icon="mdi:chart-areaspline" class="text-primary text-base" />
          24小时分类能耗趋势
        </div>
        <div class="flex-1 min-h-32">
          <EChart :option="floorEnergyTrendOption" height="100%" />
        </div>
      </div>
    </BasePanel>
  </template>
</template>
