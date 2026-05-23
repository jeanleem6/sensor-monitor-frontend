<script setup>
import { ref, computed } from 'vue'
import BasePanel from '@/components/ui/BasePanel.vue'
import BaseModal from '@/components/ui/BaseModal.vue'

// ---- 摄像头 ----
const cameras = [
  { id: 'C-01', name: '主入口',   icon: 'mdi:door-sliding-open', stay: 12,  in: 248, out: 235, pass: 96  },
  { id: 'C-02', name: '大堂',     icon: 'mdi:sofa-outline',      stay: 26,  in: 412, out: 388, pass: 142 },
  { id: 'C-03', name: '东侧通道', icon: 'mdi:walk',              stay: 4,   in: 86,  out: 81,  pass: 38  },
  { id: 'C-04', name: '电梯厅',   icon: 'mdi:elevator',          stay: 8,   in: 305, out: 297, pass: 64  }
]

const cameraModal  = ref(false)
const activeCamera = ref(null)
const openCamera   = (c) => { activeCamera.value = c; cameraModal.value = true }

// ---- 手持及其它设备 ----
const deviceSummary = {
  total: 138, online: 124, offline: 14,
  groups: [
    { icon: 'mdi:cellphone-text',    label: '手持终端', total: 42, online: 39 },
    { icon: 'mdi:radio-handheld',    label: '对讲设备', total: 28, online: 26 },
    { icon: 'mdi:tablet-android',    label: '巡检平板', total: 18, online: 15 },
    { icon: 'carbon:iot-platform',   label: '物联网关', total: 24, online: 22 },
    { icon: 'mdi:wifi-marker',       label: '定位信标', total: 26, online: 22 }
  ]
}

const allDevices = [
  { sn: 'HH-001', type: '手持终端', user: '李工',    loc: '3F-机房',  online: true,  battery: 86 },
  { sn: 'HH-002', type: '手持终端', user: '王工',    loc: '5F-走廊',  online: true,  battery: 62 },
  { sn: 'HH-003', type: '手持终端', user: '张工',    loc: '—',        online: false, battery: 0  },
  { sn: 'RD-014', type: '对讲设备', user: '安保-甲', loc: '主入口',   online: true,  battery: 78 },
  { sn: 'RD-021', type: '对讲设备', user: '安保-乙', loc: '东侧通道', online: true,  battery: 45 },
  { sn: 'TB-008', type: '巡检平板', user: '巡检组',  loc: '2F-办公',  online: true,  battery: 91 },
  { sn: 'TB-009', type: '巡检平板', user: '—',        loc: '充电桩',   online: false, battery: 12 },
  { sn: 'GW-A2',  type: '物联网关', user: '系统',    loc: '设备机房', online: true,  battery: 100},
  { sn: 'BC-12',  type: '定位信标', user: '系统',    loc: '4F-走廊',  online: true,  battery: 67 },
  { sn: 'BC-15',  type: '定位信标', user: '系统',    loc: '6F-入口',  online: false, battery: 0  }
]

const deviceModal  = ref(false)
const deviceFilter = ref('全部')
const deviceTypes  = computed(() => ['全部', ...new Set(allDevices.map((d) => d.type))])
const filteredDevices = computed(() =>
  deviceFilter.value === '全部' ? allDevices : allDevices.filter((d) => d.type === deviceFilter.value)
)
</script>

<template>
  <!-- 摄像头监控 -->
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
          <Icon icon="lucide:play-circle" class="text-lg text-cyan-200/40 group-hover:text-primary transition-colors" />
        </div>
        <div class="grid grid-cols-4 px-2 py-1.5 text-center text-sm divide-x divide-primary/10">
          <div><div class="text-cyan-200/60">滞留</div><div class="font-mono font-bold text-cyan-50">{{ c.stay }}</div></div>
          <div><div class="text-cyan-200/60">进入</div><div class="font-mono font-bold text-emerald-300">{{ c.in }}</div></div>
          <div><div class="text-cyan-200/60">离开</div><div class="font-mono font-bold text-amber-300">{{ c.out }}</div></div>
          <div><div class="text-cyan-200/60">经过</div><div class="font-mono font-bold text-cyan-50">{{ c.pass }}</div></div>
        </div>
      </div>
    </div>
  </BasePanel>

  <!-- 手持及其它设备 -->
  <BasePanel title="手持及其它设备" class="mt-5">
    <div
      class="flex items-center justify-between mt-2 px-2 py-2.25 rounded border border-primary/30 bg-primary/8 cursor-pointer hover:bg-primary/15 transition-colors"
      @click="deviceModal = true"
    >
      <div class="flex items-center gap-2">
        <Icon icon="mdi:devices" class="text-2xl text-primary" />
        <div>
          <div class="text-sm text-cyan-200/70">设备总数</div>
          <div class="text-2xl font-bold font-mono text-cyan-50 leading-none">{{ deviceSummary.total }}</div>
        </div>
      </div>
      <div class="text-right text-sm">
        <div class="flex items-center justify-end gap-1 text-emerald-300">
          <span class="size-1.5 rounded-full bg-emerald-300"></span>在线 {{ deviceSummary.online }}
        </div>
        <div class="flex items-center justify-end gap-1 text-rose-400 mt-0.5">
          <span class="size-1.5 rounded-full bg-rose-400"></span>离线 {{ deviceSummary.offline }}
        </div>
      </div>
    </div>
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

  <!-- 摄像头视频 Modal -->
  <BaseModal
    v-model="cameraModal"
    :title="activeCamera ? `实时视频 · ${activeCamera.name}` : '实时视频'"
    icon="mdi:cctv"
    width="760px"
  >
    <template v-if="activeCamera">
      <div class="relative aspect-video rounded border border-primary/30 bg-linear-to-br from-cyan-950 via-dark to-cyan-950/40 overflow-hidden">
        <div class="absolute inset-0 flex items-center justify-center">
          <Icon icon="mdi:cctv" class="text-7xl text-primary/30" />
        </div>
        <div class="pointer-events-none absolute inset-x-0 top-0 h-px bg-primary/60 animate-[scan_3s_linear_infinite]" style="box-shadow: 0 0 10px #13eaeb"></div>
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
        <div v-for="(stat, key) in { '区域滞留': activeCamera.stay, '今日进入': activeCamera.in, '今日离开': activeCamera.out, '今日经过': activeCamera.pass }" :key="key" class="rounded border border-primary/20 bg-primary/4 p-2 text-center">
          <div class="text-sm text-cyan-200/70">{{ key }}</div>
          <div class="text-2xl font-bold font-mono" :class="key === '今日进入' ? 'text-emerald-300' : key === '今日离开' ? 'text-amber-300' : 'text-cyan-50'">{{ stat }}</div>
        </div>
      </div>
    </template>
    <template #footer>
      <button class="btn" @click="cameraModal = false">关闭</button>
      <button class="btn-primary"><Icon icon="lucide:download" class="inline-block mr-1" />下载录像</button>
    </template>
  </BaseModal>

  <!-- 设备清单 Modal -->
  <BaseModal v-model="deviceModal" title="设备清单" icon="mdi:devices" width="820px">
    <div class="flex flex-wrap items-center gap-1.5 mb-3">
      <button v-for="t in deviceTypes" :key="t" :class="deviceFilter === t ? 'btn-primary' : 'btn'" @click="deviceFilter = t">{{ t }}</button>
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
          <tr v-for="d in filteredDevices" :key="d.sn" class="border-t border-primary/10 hover:bg-primary/8 transition-colors">
            <td class="px-3 py-2 font-mono text-cyan-100">{{ d.sn }}</td>
            <td class="px-3 py-2 text-cyan-100">{{ d.type }}</td>
            <td class="px-3 py-2 text-cyan-200/80">{{ d.user }}</td>
            <td class="px-3 py-2 text-cyan-200/80">{{ d.loc }}</td>
            <td class="px-3 py-2">
              <span :class="['inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-sm', d.online ? 'bg-emerald-400/15 text-emerald-300' : 'bg-rose-400/15 text-rose-300']">
                <Icon :icon="d.online ? 'lucide:wifi' : 'lucide:wifi-off'" class="text-sm" />
                {{ d.online ? '在线' : '离线' }}
              </span>
            </td>
            <td class="px-3 py-2">
              <div class="flex items-center gap-1.5">
                <div class="relative w-14 h-2 rounded bg-cyan-400/15 overflow-hidden">
                  <div class="absolute inset-y-0 left-0 transition-all" :class="d.battery > 30 ? 'bg-emerald-400' : 'bg-rose-400'" :style="{ width: d.battery + '%' }"></div>
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
</template>

<style>
@keyframes scan {
  0%   { transform: translateY(0); }
  100% { transform: translateY(100vh); }
}
</style>
