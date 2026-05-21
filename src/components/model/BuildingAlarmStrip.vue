<script setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useViewerStore } from '@/stores/viewer'
import BaseModal from '@/components/ui/BaseModal.vue'

const store = useViewerStore()
const { transparentMode } = storeToRefs(store)

// ---------- 突发报警 DEMO 数据 ----------
const alarms = ref([
  {
    id: 'A-2026052114301',
    time: '14:30:18',
    level: 'critical',
    icon: 'mdi:fire',
    location: '5F-机房A',
    message: '烟雾浓度超阈值，疑似火情',
    handled: false
  },
  {
    id: 'A-2026052114281',
    time: '14:28:42',
    level: 'critical',
    icon: 'mdi:water-alert',
    location: '地下室-水泵房',
    message: '水浸传感器触发',
    handled: false
  },
  {
    id: 'A-2026052114220',
    time: '14:22:05',
    level: 'warning',
    icon: 'mdi:molecule-co2',
    location: '3F-会议室B',
    message: 'CO₂ 浓度 1820 ppm，已超舒适阈值',
    handled: false
  },
  {
    id: 'A-2026052114180',
    time: '14:18:31',
    level: 'warning',
    icon: 'carbon:warning-alt',
    location: '主入口',
    message: '区域滞留人数超过预警值（45/30）',
    handled: false
  },
  {
    id: 'A-2026052114120',
    time: '14:12:09',
    level: 'info',
    icon: 'lucide:wifi-off',
    location: '6F-入口信标',
    message: '设备离线 BC-15',
    handled: true
  },
  {
    id: 'A-2026052113580',
    time: '13:58:47',
    level: 'warning',
    icon: 'mdi:weather-windy',
    location: '楼顶气象站',
    message: '风速达 12.3 m/s，强风预警',
    handled: false
  }
])

const levelStyle = {
  critical: {
    badge: 'bg-rose-400/20 text-rose-300 border-rose-400/40',
    icon: 'text-rose-400',
    label: '严重',
    pulse: true
  },
  warning: {
    badge: 'bg-amber-400/20 text-amber-300 border-amber-400/40',
    icon: 'text-amber-300',
    label: '警告',
    pulse: false
  },
  info: {
    badge: 'bg-cyan-400/20 text-cyan-300 border-cyan-400/40',
    icon: 'text-cyan-300',
    label: '通知',
    pulse: false
  }
}

const unhandled = computed(() => alarms.value.filter((a) => !a.handled).length)
const showAll = ref(false)
</script>

<template>
  <div
    class="absolute left-88 right-88 bottom-5 z-10 flex items-stretch border border-primary/40 bg-primary/4 backdrop-blur shadow-(--shadow-glow-md) rounded-0 overflow-hidden"
  >
    <!-- 标题 -->
    <div class="flex items-center gap-2 px-4 py-2 border-r border-primary/25 bg-primary/8 select-none shrink-0">
      <Icon icon="mdi:alarm-light" class="text-2xl text-rose-400 animate-pulse" />
      <div>
        <div class="text-sm tracking-widest text-cyan-200/80">突发报警</div>
        <div class="text-base font-bold text-cyan-50 leading-none mt-0.5">
          <span class="text-rose-400">{{ unhandled }}</span>
          <span class="text-cyan-200/50 text-sm"> / {{ alarms.length }}</span>
        </div>
      </div>
    </div>

    <!-- 滚动列表 -->
    <div class="flex-1 min-w-0 overflow-hidden relative group">
      <div
        class="flex items-center gap-3 px-3 py-3 animate-[marquee_45s_linear_infinite] group-hover:[animation-play-state:paused]"
      >
        <div
          v-for="a in [...alarms, ...alarms]"
          :key="a.id + Math.random()"
          :class="[
            'shrink-0 flex items-center gap-2 px-3 py-1.5 rounded border text-sm whitespace-nowrap',
            levelStyle[a.level].badge,
            a.handled && 'opacity-50'
          ]"
        >
          <Icon
            :icon="a.icon"
            :class="[
              'text-base shrink-0',
              levelStyle[a.level].icon,
              levelStyle[a.level].pulse && !a.handled && 'animate-pulse'
            ]"
          />
          <span class="font-mono text-cyan-200/70">{{ a.time }}</span>
          <span class="px-1.5 py-0.5 text-xs rounded bg-dark/40 font-semibold">{{ levelStyle[a.level].label }}</span>
          <span class="text-cyan-100">{{ a.location }}</span>
          <span class="text-cyan-200/80">{{ a.message }}</span>
          <span v-if="a.handled" class="text-emerald-300 text-sm flex items-center gap-0.5">
            <Icon icon="lucide:check" class="text-sm" />已处理
          </span>
        </div>
      </div>
    </div>

    <!-- 右侧：查看 + 视图控制 -->
    <div class="flex items-center gap-1.5 px-3 border-l border-primary/25 shrink-0">
      <button class="btn flex items-center gap-1" @click="showAll = true">
        <Icon icon="lucide:list" />
        全部
      </button>
      <button :class="transparentMode ? 'btn-primary' : 'btn'" @click="store.toggleTransparent" title="透明模式 (T)">
        <Icon icon="lucide:square-dashed" class="inline-block mr-0.5" />透明
      </button>
      <button class="btn" @click="store.fitView" title="重新适配 (F)">
        <Icon icon="lucide:maximize" class="inline-block mr-0.5" />适配
      </button>
      <button class="btn" @click="store.resetView" title="重设视图 (R)">
        <Icon icon="lucide:rotate-ccw" class="inline-block mr-0.5" />重设
      </button>
    </div>

    <!-- 全部报警 Modal -->
    <BaseModal v-model="showAll" title="全部报警" icon="mdi:alarm-light" width="780px">
      <div class="space-y-1.5">
        <div
          v-for="a in alarms"
          :key="a.id"
          :class="[
            'flex items-center gap-3 px-3 py-2 rounded border',
            levelStyle[a.level].badge,
            a.handled && 'opacity-60'
          ]"
        >
          <Icon :icon="a.icon" :class="['text-2xl shrink-0', levelStyle[a.level].icon]" />
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 text-sm">
              <span class="font-mono text-cyan-200/70">{{ a.time }}</span>
              <span class="px-1.5 py-0.5 text-xs rounded bg-dark/40 font-semibold">{{
                levelStyle[a.level].label
              }}</span>
              <span class="font-semibold text-cyan-100">{{ a.location }}</span>
            </div>
            <div class="mt-0.5 text-cyan-200/80">{{ a.message }}</div>
          </div>
          <!-- <div class="shrink-0">
            <span
              v-if="a.handled"
              class="px-2 py-1 text-sm rounded bg-emerald-400/15 text-emerald-300 flex items-center gap-1"
            >
              <Icon icon="lucide:check-circle-2" />已处理
            </span>
            <button v-else class="btn-primary" @click="a.handled = true">
              <Icon icon="lucide:check" class="inline-block mr-1" />标记处理
            </button>
          </div> -->
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<style>
@keyframes marquee {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}
</style>
