<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useViewerStore } from '@/stores/viewer'
import BasePanel from '@/components/ui/BasePanel.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import CollapsedSummary from '@/components/panels/CollapsedSummary.vue'

const { sidesCollapsed } = storeToRefs(useViewerStore())

// ---- 摄像头 ----
const cameras = [
  { id: 'C-01', name: '主入口', icon: 'mdi:door-sliding-open', online: true, stay: 12, in: 248, out: 235, pass: 96 },
  { id: 'C-02', name: '大堂', icon: 'mdi:sofa-outline', online: true, stay: 26, in: 412, out: 388, pass: 142 },
  { id: 'C-03', name: '东侧通道', icon: 'mdi:walk', online: false, stay: 0, in: 0, out: 0, pass: 0 },
  { id: 'C-04', name: '电梯厅', icon: 'mdi:elevator', online: true, stay: 8, in: 305, out: 297, pass: 64 },
  { id: 'C-05', name: '西侧通道', icon: 'mdi:walk', online: true, stay: 3, in: 74, out: 71, pass: 29 },
  { id: 'C-06', name: '停车场', icon: 'mdi:parking', online: false, stay: 0, in: 0, out: 0, pass: 0 }
]

const cameraModal = ref(false)
const activeCamera = ref(null)
const openCamera = (c) => {
  activeCamera.value = c
  cameraModal.value = true
}

const cameraSummary = computed(() => {
  const total = cameras.length
  const online = cameras.filter((c) => c.online).length
  return {
    total,
    online,
    offline: total - online,
    stay: cameras.reduce((s, c) => s + c.stay, 0),
    in: cameras.reduce((s, c) => s + c.in, 0),
    out: cameras.reduce((s, c) => s + c.out, 0),
    pass: cameras.reduce((s, c) => s + c.pass, 0)
  }
})

// ---- 能耗·水耗·环境 ----
// 阈值规则：number 表示「越大越糟」，>= 触发；[min, max] 表示「正常区间」，越界触发
const energyMetrics = [
  { label: '今日用电量', value: 12480, unit: 'kWh' },
  { label: '当前用电负荷', value: 845, unit: 'kW', warn: 800, danger: 1000 },
  { label: '本周峰值负荷', value: 1180, unit: 'kW', warn: 1000, danger: 1200 },
  { label: '单位面积能耗', value: 0.42, unit: 'kWh/m²', warn: 0.5, danger: 0.7 },
  { label: '碳排放量', value: 7488, unit: 'kg' },
  { label: '用能费用', value: 9856, unit: '元' }
]

const waterMetrics = [
  { label: '今日用水量', value: 86.5, unit: 'm³' },
  { label: '当前用水负荷', value: 11.2, unit: 'm³/h', warn: 6, danger: 10 },
  { label: '用水费用', value: 432, unit: '元' }
]

const envMetrics = [
  { label: '楼层停留人数', value: 326, unit: '人', warn: 500, danger: 800 },
  { label: '平均温度', value: 27.2, unit: '℃', warn: [20, 26], danger: [18, 28] },
  { label: '平均湿度', value: 52, unit: '%', warn: [40, 65], danger: [30, 70] },
  { label: 'CO₂浓度', value: 950, unit: 'ppm', warn: 800, danger: 1200 }
]

const STATUS_CLASS = {
  ok: { box: 'border-primary/20 bg-primary/4 hover:border-primary/60 hover:bg-primary/12', value: 'text-cyan-50', dot: '' },
  warn: { box: 'border-amber-400/40 bg-amber-400/8 hover:border-amber-400/70 hover:bg-amber-400/15', value: 'text-amber-300', dot: 'bg-amber-400' },
  danger: { box: 'border-rose-400/50 bg-rose-400/8 hover:border-rose-400/80 hover:bg-rose-400/16', value: 'text-rose-300', dot: 'bg-rose-400 animate-pulse' }
}

const statusOf = (m) => {
  const exceed = (t) => {
    if (t == null) return false
    if (Array.isArray(t)) return m.value < t[0] || m.value > t[1]
    return m.value >= t
  }
  if (exceed(m.danger)) return STATUS_CLASS.danger
  if (exceed(m.warn)) return STATUS_CLASS.warn
  return STATUS_CLASS.ok
}

// ---- 折叠态摘要 ----
const statusKey = (m) => {
  const exceed = (t) => (t == null ? false : Array.isArray(t) ? m.value < t[0] || m.value > t[1] : m.value >= t)
  if (exceed(m.danger)) return 'danger'
  if (exceed(m.warn)) return 'warning'
  return 'normal'
}
const toMetric = (m) => ({ label: m.label, value: m.value, unit: m.unit, status: statusKey(m) })

const energyCollapsed = computed(() => energyMetrics.map(toMetric))
const waterCollapsed = computed(() => waterMetrics.map(toMetric))
const envCollapsed = computed(() => envMetrics.map(toMetric))
const cameraMetrics = computed(() =>
  cameras.map((c) => ({
    icon: c.icon,
    label: c.name,
    valueIcon: c.online ? 'mdi:cctv' : 'mdi:cctv-off',
    value: c.online ? '在线' : '离线',
    status: c.online ? 'normal' : 'danger',
    room: c.id // 标记可点击，点击打开实时视频
  }))
)
const onCameraSelect = (m) => {
  const c = cameras.find((x) => x.id === m.room)
  if (c) openCamera(c)
}
</script>

<template>
  <!-- 折叠态：纯数据摘要 -->
  <template v-if="sidesCollapsed">
    <CollapsedSummary
      title="摄像头"
      icon="mdi:cctv"
      :metrics="cameraMetrics"
      marquee
      marquee-height="9rem"
      @select="onCameraSelect"
    >
      <template #header>
        <div class="flex items-center justify-between text-sm pb-1.5 mb-0.5 border-b border-primary/15">
          <span class="flex items-center gap-1 text-cyan-50">
            <span class="font-mono font-bold text-base">{{ cameraSummary.total }}</span>总数
          </span>
          <span class="flex items-center gap-1 text-emerald-300">
            <span class="size-1.5 rounded-full bg-emerald-300"></span>{{ cameraSummary.online }}
          </span>
          <span class="flex items-center gap-1 text-neutral-300">
            <span class="size-1.5 rounded-full bg-neutral-400"></span>{{ cameraSummary.offline }}
          </span>
        </div>
      </template>
    </CollapsedSummary>
    <CollapsedSummary title="用电" icon="mdi:lightning-bolt" :metrics="energyCollapsed" />
    <CollapsedSummary title="用水" icon="mdi:water" :metrics="waterCollapsed" />
    <CollapsedSummary title="环境" icon="mdi:leaf" :metrics="envCollapsed" />
  </template>

  <!-- 展开态：完整内容 -->
  <template v-else>
  <!-- 摄像头监控 -->
  <BasePanel title="摄像头监控" class="flex-1 min-h-max">
    <div class="flex items-center justify-between p-2 rounded border border-primary/30 bg-primary/8">
      <div class="flex items-center gap-2">
        <Icon icon="mdi:cctv" class="text-2xl text-primary" />
        <div>
          <div class="text-sm text-cyan-200/70">摄像头总数</div>
          <div class="text-2xl font-bold font-mono text-cyan-50 leading-none">{{ cameraSummary.total }}</div>
        </div>
      </div>
      <div class="text-right text-sm">
        <div class="flex items-center justify-end gap-1 text-emerald-300">
          <span class="size-1.5 rounded-full bg-emerald-300"></span>在线 {{ cameraSummary.online }}
        </div>
        <div class="flex items-center justify-end gap-1 text-neutral-300 mt-0.5">
          <span class="size-1.5 rounded-full bg-neutral-400"></span>离线 {{ cameraSummary.offline }}
        </div>
      </div>
    </div>
    <div class="grid grid-cols-2 gap-2 mt-2 flex-1 min-h-0 content-around">
      <div
        v-for="c in cameras"
        :key="c.id"
        class="group relative aspect-video rounded border border-primary/20 bg-primary/4 hover:border-primary/60 transition-all cursor-pointer overflow-hidden"
        @click="openCamera(c)"
      >
        <!-- 在线：实时画面 -->
        <template v-if="c.online">
          <div class="absolute inset-0 bg-linear-to-br from-cyan-950 via-dark to-cyan-950/40">
            <div class="absolute inset-0 flex items-center justify-center">
              <Icon :icon="c.icon" class="text-4xl text-primary/30 group-hover:text-primary/50 transition-colors" />
            </div>
            <div
              class="pointer-events-none absolute inset-x-0 top-0 h-px bg-primary/60 animate-[scan_3s_linear_infinite]"
              style="box-shadow: 0 0 8px #13eaeb"
            ></div>
          </div>
          <div class="absolute top-1.5 left-1.5 flex items-center gap-1 text-xs">
            <span class="size-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span class="text-emerald-300 font-semibold">REC</span>
          </div>
          <div class="absolute top-1.5 right-1.5 px-1 py-0.5 text-xs rounded bg-dark/60 text-cyan-100 font-mono">
            {{ c.id }}
          </div>
        </template>
        <!-- 离线：占位 -->
        <template v-else>
          <div class="absolute inset-0 bg-neutral-800/60 flex flex-col items-center justify-center gap-1">
            <Icon icon="mdi:cctv-off" class="text-3xl text-neutral-400/70" />
            <span class="text-xs text-neutral-300 font-semibold">设备离线</span>
          </div>
          <div
            class="absolute top-1.5 right-1.5 px-1 py-0.5 text-xs rounded bg-neutral-900/60 text-neutral-300 font-mono"
          >
            {{ c.id }}
          </div>
        </template>
        <!-- 名称条 -->
        <div
          class="absolute bottom-0 inset-x-0 px-1.5 py-1 flex items-center gap-1"
          :class="
            c.online
              ? 'bg-linear-to-t from-dark/90 to-transparent'
              : 'bg-linear-to-t from-neutral-900/90 to-transparent'
          "
        >
          <Icon :icon="c.icon" class="text-sm shrink-0" :class="c.online ? 'text-primary' : 'text-neutral-400'" />
          <span class="text-xs font-semibold truncate" :class="c.online ? 'text-cyan-50' : 'text-neutral-300'">{{
            c.name
          }}</span>
        </div>
      </div>
    </div>
    <!-- <div class="mt-3 pt-3 border-t border-primary/20">
      <div class="flex items-center gap-1 text-sm text-cyan-200/70 mb-1.5">
        <Icon icon="mdi:account-multiple" class="text-primary text-base" />
        今日全域客流
      </div>
      <div
        class="grid grid-cols-4 rounded border border-primary/20 bg-primary/4 divide-x divide-primary/10 text-center text-sm"
      >
        <div class="py-1.5">
          <div class="text-cyan-200/60">滞留</div>
          <div class="font-mono font-bold text-cyan-50">{{ cameraSummary.stay }}</div>
        </div>
        <div class="py-1.5">
          <div class="text-cyan-200/60">进入</div>
          <div class="font-mono font-bold text-emerald-300">{{ cameraSummary.in }}</div>
        </div>
        <div class="py-1.5">
          <div class="text-cyan-200/60">离开</div>
          <div class="font-mono font-bold text-amber-300">{{ cameraSummary.out }}</div>
        </div>
        <div class="py-1.5">
          <div class="text-cyan-200/60">经过</div>
          <div class="font-mono font-bold text-cyan-50">{{ cameraSummary.pass }}</div>
        </div>
      </div>
    </div> -->
  </BasePanel>

  <!-- 能耗·水耗·环境 -->
  <BasePanel title="能耗·水耗·环境" class="flex-1 min-h-max">
    <div class="flex-1 min-h-0 flex flex-col justify-around gap-1.5">
      <!-- 能耗相关 -->
      <div>
        <div class="flex items-center gap-1.5 text-sm mb-1.5">
          <Icon icon="mdi:lightning-bolt" class="text-amber-300 text-base" />
          <span class="font-semibold text-cyan-100">能耗相关</span>
        </div>
        <div class="grid grid-cols-3 gap-1.5">
          <div
            v-for="m in energyMetrics"
            :key="m.label"
            class="relative rounded border px-2 py-1.5 transition-colors"
            :class="statusOf(m).box"
          >
            <div class="text-xs text-cyan-200/60 truncate">{{ m.label }}</div>
            <div class="font-mono leading-tight">
              <span class="text-base font-bold" :class="statusOf(m).value">{{ m.value }}</span>
              <span class="text-xs text-cyan-200/60 ml-0.5">{{ m.unit }}</span>
            </div>
            <span
              v-if="statusOf(m).dot"
              class="absolute top-1 right-1 size-1.5 rounded-full"
              :class="statusOf(m).dot"
            ></span>
          </div>
        </div>
      </div>

      <!-- 水耗相关 -->
      <div>
        <div class="flex items-center gap-1.5 text-sm mb-1.5">
          <Icon icon="mdi:water" class="text-sky-300 text-base" />
          <span class="font-semibold text-cyan-100">水耗相关</span>
        </div>
        <div class="grid grid-cols-3 gap-1.5">
          <div
            v-for="m in waterMetrics"
            :key="m.label"
            class="relative rounded border px-2 py-1.5 transition-colors"
            :class="statusOf(m).box"
          >
            <div class="text-xs text-cyan-200/60 truncate">{{ m.label }}</div>
            <div class="font-mono leading-tight">
              <span class="text-base font-bold" :class="statusOf(m).value">{{ m.value }}</span>
              <span class="text-xs text-cyan-200/60 ml-0.5">{{ m.unit }}</span>
            </div>
            <span
              v-if="statusOf(m).dot"
              class="absolute top-1 right-1 size-1.5 rounded-full"
              :class="statusOf(m).dot"
            ></span>
          </div>
        </div>
      </div>

      <!-- 环境相关 -->
      <div>
        <div class="flex items-center gap-1.5 text-sm mb-1.5">
          <Icon icon="mdi:leaf" class="text-emerald-300 text-base" />
          <span class="font-semibold text-cyan-100">环境相关</span>
        </div>
        <div class="grid grid-cols-4 gap-1.5">
          <div
            v-for="m in envMetrics"
            :key="m.label"
            class="relative rounded border px-2 py-1.5 transition-colors"
            :class="statusOf(m).box"
          >
            <div class="text-xs text-cyan-200/60 truncate">{{ m.label }}</div>
            <div class="font-mono leading-tight">
              <span class="text-base font-bold" :class="statusOf(m).value">{{ m.value }}</span>
              <span class="text-xs text-cyan-200/60 ml-0.5">{{ m.unit }}</span>
            </div>
            <span
              v-if="statusOf(m).dot"
              class="absolute top-1 right-1 size-1.5 rounded-full"
              :class="statusOf(m).dot"
            ></span>
          </div>
        </div>
      </div>
    </div>
  </BasePanel>
  </template>

  <!-- 摄像头视频 Modal -->
  <BaseModal
    v-model="cameraModal"
    :title="activeCamera ? `实时视频 · ${activeCamera.name}` : '实时视频'"
    icon="mdi:cctv"
    width="760px"
  >
    <template v-if="activeCamera">
      <div
        class="relative aspect-video rounded border overflow-hidden"
        :class="
          activeCamera.online
            ? 'border-primary/30 bg-linear-to-br from-cyan-950 via-dark to-cyan-950/40'
            : 'border-neutral-600/40 bg-neutral-800/60'
        "
      >
        <template v-if="activeCamera.online">
          <div class="absolute inset-0 flex items-center justify-center">
            <Icon icon="mdi:cctv" class="text-7xl text-primary/30" />
          </div>
          <div
            class="pointer-events-none absolute inset-x-0 top-0 h-px bg-primary/60 animate-[scan_3s_linear_infinite]"
            style="box-shadow: 0 0 10px #13eaeb"
          ></div>
          <div class="absolute top-3 left-3 flex items-center gap-2 text-sm">
            <span class="size-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span class="text-emerald-300 font-semibold">REC</span>
          </div>
          <div class="absolute top-3 right-3 px-2 py-0.5 text-sm rounded bg-dark/60 text-cyan-100">
            {{ activeCamera.id }} · {{ activeCamera.name }}
          </div>
          <div class="absolute bottom-3 left-3 text-sm text-cyan-200/70 font-mono">
            2026-05-21 14:32:08 · 1920×1080 · 25fps
          </div>
        </template>
        <template v-else>
          <div class="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <Icon icon="mdi:cctv-off" class="text-7xl text-neutral-400/70" />
            <span class="text-base text-neutral-300 font-semibold">设备离线</span>
            <span class="text-sm text-neutral-400"
              >{{ activeCamera.id }} · {{ activeCamera.name }} 当前无法获取实时画面</span
            >
          </div>
        </template>
      </div>
      <div class="mt-4 grid grid-cols-4 gap-2">
        <div
          v-for="(stat, key) in {
            区域滞留: activeCamera.stay,
            今日进入: activeCamera.in,
            今日离开: activeCamera.out,
            今日经过: activeCamera.pass
          }"
          :key="key"
          class="rounded border border-primary/20 bg-primary/4 p-2 text-center"
        >
          <div class="text-sm text-cyan-200/70">{{ key }}</div>
          <div
            class="text-2xl font-bold font-mono"
            :class="key === '今日进入' ? 'text-emerald-300' : key === '今日离开' ? 'text-amber-300' : 'text-cyan-50'"
          >
            {{ stat }}
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <button class="btn" @click="cameraModal = false">关闭</button>
      <button class="btn-primary"><Icon icon="lucide:download" class="inline-block mr-1" />下载录像</button>
    </template>
  </BaseModal>
</template>
