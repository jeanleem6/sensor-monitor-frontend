<script setup>
/**
 * CollapsedSummary —— 折叠态紧凑摘要卡片
 *
 * 折叠两侧面板后，用它替代完整的 BasePanel：去掉标题装饰 SVG，只留 14px 小标题，
 * 纯数据呈现（label + 数值 + 单位 + 状态色），不渲染图表 / 仪表盘。
 *
 * 两种数据渲染模式：
 *   - 静态列表：直接渲染 metrics。
 *   - 纵向轮播：marquee=true 时上下滚动（参考 BuildingAlarmStrip 的水平 marquee 改纵向），hover 暂停。
 *
 * metric 字段：
 *   { icon?, label, value?, unit?, status?('normal'|'warning'|'danger'),
 *     valueIcon?(用图标替代数值，如红外有人/无人), room?(传入则该行可点击并 emit select) }
 *
 * 默认插槽渲染在 metrics 之后，供仪表盘等自定义内容（如 Room 的 GaugeRing）使用。
 */
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, default: '' },
  icon: { type: String, default: '' },
  metrics: { type: Array, default: () => [] },
  marquee: { type: Boolean, default: false },
  // 轮播视口高度（仅 marquee 模式生效）
  marqueeHeight: { type: String, default: '12rem' }
})

const emit = defineEmits(['select'])

const valueColor = {
  normal: 'text-cyan-50',
  warning: 'text-amber-300',
  danger: 'text-rose-400'
}
const iconColor = {
  normal: 'text-primary',
  warning: 'text-amber-300',
  danger: 'text-rose-400'
}

// 轮播：复制一份首尾相接，匀速滚动；时长随条目数线性增长，保证速度一致
const loopMetrics = computed(() => [...props.metrics, ...props.metrics])
const marqueeStyle = computed(() => ({
  animation: `marquee-vertical ${Math.max(8, props.metrics.length * 2.2)}s linear infinite`
}))

const onRow = (m) => {
  if (m.room) emit('select', m)
}
</script>

<template>
  <div class="panel-hoverable shrink-0 flex flex-col border border-primary/30 bg-primary/4 backdrop-blur-md overflow-hidden">
    <!-- 紧凑小标题（无 SVG 装饰） -->
    <div
      v-if="title"
      class="flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-semibold text-primary border-b border-primary/15 select-none"
    >
      <Icon v-if="icon" :icon="icon" class="text-base shrink-0" />
      <span class="truncate">{{ title }}</span>
    </div>

    <div class="px-2.5 py-2 flex flex-col gap-1.5">
      <!-- 自定义头部（如摄像头在线/离线汇总） -->
      <slot name="header" />

      <!-- 轮播列表 -->
      <div v-if="marquee && metrics.length" class="relative overflow-hidden group" :style="{ height: marqueeHeight }">
        <div class="flex flex-col gap-1.5 group-hover:[animation-play-state:paused]" :style="marqueeStyle">
          <component
            :is="m.room ? 'button' : 'div'"
            v-for="(m, i) in loopMetrics"
            :key="i"
            :class="[
              'shrink-0 flex items-center justify-between gap-1.5 text-sm w-full text-left',
              m.room && 'px-1 py-0.5 rounded cursor-pointer hover:bg-primary/15 transition-colors'
            ]"
            @click="onRow(m)"
          >
            <span class="flex items-center gap-1 min-w-0 text-cyan-200/70">
              <Icon v-if="m.icon" :icon="m.icon" :class="['text-base shrink-0', iconColor[m.status] || iconColor.normal]" />
              <span class="truncate">{{ m.label }}</span>
            </span>
            <span class="shrink-0 flex items-center gap-1 font-mono">
              <Icon v-if="m.valueIcon" :icon="m.valueIcon" :class="['text-base', valueColor[m.status] || valueColor.normal]" />
              <span v-if="m.value != null" :class="['font-bold', valueColor[m.status] || valueColor.normal]">{{ m.value }}</span>
              <span v-if="m.unit" class="text-xs text-cyan-200/55">{{ m.unit }}</span>
            </span>
          </component>
        </div>
      </div>

      <!-- 静态列表 -->
      <template v-else>
        <component
          :is="m.room ? 'button' : 'div'"
          v-for="(m, i) in metrics"
          :key="i"
          :class="[
            'flex items-center justify-between gap-1.5 text-sm w-full text-left',
            m.room && 'px-1 py-0.5 -mx-1 rounded cursor-pointer hover:bg-primary/15 transition-colors'
          ]"
          @click="onRow(m)"
        >
          <span class="flex items-center gap-1 min-w-0 text-cyan-200/70">
            <Icon v-if="m.icon" :icon="m.icon" :class="['text-base shrink-0', iconColor[m.status] || iconColor.normal]" />
            <span class="truncate">{{ m.label }}</span>
          </span>
          <span class="shrink-0 flex items-center gap-1 font-mono">
            <Icon v-if="m.valueIcon" :icon="m.valueIcon" :class="['text-base', valueColor[m.status] || valueColor.normal]" />
            <span v-if="m.value != null" :class="['font-bold', valueColor[m.status] || valueColor.normal]">{{ m.value }}</span>
            <span v-if="m.unit" class="text-xs text-cyan-200/55">{{ m.unit }}</span>
          </span>
        </component>
      </template>

      <!-- 自定义内容（如圆环仪表） -->
      <slot />
    </div>
  </div>
</template>
