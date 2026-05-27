<script setup>
import BasePanel from '@/components/ui/BasePanel.vue'

const devices = [
  {
    title: '设备物联控制教具-1',
    image: '/imgs/devices/zt.png',
    params: [
      //{ label: '设备编号', value: 'TH-001' },
      { label: '当前温度', value: '24.6 ℃' },
      { label: '当前湿度', value: '58 %RH' }
      // { label: '运行状态', value: '在线', highlight: true }
    ]
  },
  {
    title: '设备物联控制教具-2',
    image: '/imgs/devices/zt.png',
    params: [
      //{ label: '设备编号', value: 'AQ-002' },
      { label: 'PM2.5', value: '35 μg/m³' },
      { label: 'CO₂ 浓度', value: '420 ppm' }
      // { label: '运行状态', value: '在线', highlight: true }
    ]
  },
  {
    title: '设备物联控制教具-3',
    image: '/imgs/devices/zt.png',
    params: [
      //{ label: '设备编号', value: 'NS-003' },
      { label: '噪声等级', value: '52 dB' },
      { label: '采样频率', value: '1 次/分钟' }
      // { label: '运行状态', value: '在线', highlight: true }
    ]
  },
  {
    title: '设备物联控制教具-4',
    image: '/imgs/devices/zt.png',
    params: [
      //{ label: '设备编号', value: 'WQ-004' },
      { label: 'pH 值', value: '7.2' },
      { label: '浊度', value: '3.8 NTU' }
      // { label: '运行状态', value: '维护中', warn: true }
    ]
  },
  {
    title: '设备物联控制教具-5',
    image: '/imgs/devices/zt.png',
    params: [
      //{ label: '设备编号', value: 'WS-005' },
      { label: '风速', value: '3.2 m/s' },
      { label: '风向', value: '东北风' }
      // { label: '运行状态', value: '在线', highlight: true }
    ]
  },
  {
    title: '设备物联控制教具-6',
    image: '/imgs/devices/zt.png',
    params: [
      //{ label: '设备编号', value: 'CAM-006' },
      { label: '分辨率', value: '1920×1080' },
      { label: '帧率', value: '25 fps' }
      // { label: '运行状态', value: '在线', highlight: true }
    ]
  }
]
</script>

<template>
  <div class="h-[calc(100vh-4rem)] grid grid-cols-3 grid-rows-2 gap-8 p-12 min-h-0 items-stretch">
    <BasePanel v-for="device in devices" :key="device.title" :title="device.title" class="min-h-0 h-full">
      <div class="flex flex-col h-full gap-3">
        <!-- 设备图片 -->
        <div
          class="relative flex-1 min-h-0 flex items-center justify-center overflow-hidden rounded-sm border border-primary/25 bg-linear-to-b from-primary/10 via-primary/5 to-transparent shadow-[inset_0_0_24px_rgb(19_234_235_/0.08)]"
        >
          <div
            class="pointer-events-none absolute inset-3 border border-dashed border-primary/15 rounded-sm"
            aria-hidden="true"
          />
          <div
            class="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full bg-radial from-primary/20 to-primary/0 opacity-60"
            aria-hidden="true"
          />
          <img
            :src="device.image"
            :alt="device.title"
            class="relative z-1 max-h-full max-w-[72%] object-contain drop-shadow-[0_0_12px_rgb(19_234_235_/0.35)] transition-transform duration-300 hover:scale-105"
          />
        </div>

        <!-- 分隔线 -->
        <div class="relative h-px shrink-0">
          <div class="absolute inset-0 bg-linear-to-r from-transparent via-primary/40 to-transparent" />
          <div
            class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rotate-45 border border-primary/60 bg-dark"
          />
        </div>

        <!-- 设备参数 -->
        <div class="params-panel shrink-0">
          <div class="params-panel__header">
            <span class="params-panel__header-line" />
            <span class="params-panel__header-title">实时参数</span>
            <span class="params-panel__header-line" />
          </div>

          <div class="params-panel__grid">
            <div
              v-for="(item, index) in device.params"
              :key="index"
              class="param-card"
              :style="{ '--delay': `${index * 80}ms` }"
            >
              <div class="param-card__corner param-card__corner--tl" />
              <div class="param-card__corner param-card__corner--br" />

              <span class="param-card__index">{{ String(index + 1).padStart(2, '0') }}</span>
              <span class="param-card__label">{{ item.label }}</span>

              <div class="param-card__value-wrap">
                <span
                  class="param-card__value"
                  :class="{
                    'param-card__value--highlight': item.highlight,
                    'param-card__value--warn': item.warn
                  }"
                >
                  {{ item.value }}
                </span>
                <span class="param-card__glow" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </BasePanel>
  </div>
</template>

<style scoped>
.params-panel {
  position: relative;
  padding: 0.625rem 0.5rem 0.5rem;
  border-radius: 2px;
  border: 1px solid rgb(19 234 235 / 0.18);
  background: linear-gradient(180deg, rgb(19 234 235 / 0.06) 0%, rgb(19 234 235 / 0.02) 100%);
  box-shadow:
    inset 0 1px 0 rgb(19 234 235 / 0.12),
    0 4px 16px rgb(0 0 0 / 0.15);
}

.params-panel__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  padding: 0 0.25rem;
}

.params-panel__header-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgb(19 234 235 / 0.45), transparent);
}

.params-panel__header-title {
  flex-shrink: 0;
  font-size: 0.625rem;
  letter-spacing: 0.28em;
  color: rgb(19 234 235 / 0.75);
  text-transform: uppercase;
}

.params-panel__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
}

.param-card {
  position: relative;
  overflow: hidden;
  padding: 0.5rem 0.625rem 0.625rem;
  border-radius: 2px;
  border: 1px solid rgb(19 234 235 / 0.12);
  background: linear-gradient(135deg, rgb(19 234 235 / 0.08) 0%, rgb(6 10 29 / 0.35) 100%);
  transition:
    border-color 0.25s ease,
    box-shadow 0.25s ease,
    transform 0.25s ease;
  animation: param-fade-in 0.5s ease both;
  animation-delay: var(--delay);
}

.param-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(180deg, rgb(19 234 235 / 0.9), rgb(19 234 235 / 0.15));
  opacity: 0.7;
}

.param-card:hover {
  border-color: rgb(19 234 235 / 0.35);
  box-shadow: 0 0 14px rgb(19 234 235 / 0.12);
  transform: translateY(-1px);
}

.param-card__corner {
  position: absolute;
  width: 0.5rem;
  height: 0.5rem;
  pointer-events: none;
}

.param-card__corner--tl {
  top: 0;
  right: 0;
  border-top: 1px solid rgb(19 234 235 / 0.45);
  border-right: 1px solid rgb(19 234 235 / 0.45);
}

.param-card__corner--br {
  bottom: 0;
  right: 0;
  border-bottom: 1px solid rgb(19 234 235 / 0.25);
  border-right: 1px solid rgb(19 234 235 / 0.25);
}

.param-card__index {
  position: absolute;
  top: 0.3rem;
  right: 0.45rem;
  font-size: 0.5625rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: rgb(19 234 235 / 0.28);
  font-variant-numeric: tabular-nums;
}

.param-card__label {
  display: block;
  margin-bottom: 0.35rem;
  padding-right: 1.25rem;
  font-size: 0.6875rem;
  line-height: 1.2;
  color: rgb(182 245 252 / 0.62);
  letter-spacing: 0.06em;
}

.param-card__value-wrap {
  position: relative;
  display: flex;
  align-items: baseline;
}

.param-card__value {
  position: relative;
  z-index: 1;
  font-size: 0.9375rem;
  font-weight: 600;
  line-height: 1.2;
  color: #b6f5fc;
  letter-spacing: 0.02em;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 0 8px rgb(19 234 235 / 0.15);
}

.param-card__value--highlight {
  color: #13eaeb;
  text-shadow:
    0 0 6px rgb(19 234 235 / 0.7),
    0 0 14px rgb(19 234 235 / 0.35);
}

.param-card__value--warn {
  color: #fcd34d;
  text-shadow: 0 0 8px rgb(252 211 77 / 0.45);
}

.param-card__glow {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 60%;
  height: 1px;
  background: linear-gradient(90deg, rgb(19 234 235 / 0.55), transparent);
  opacity: 0.6;
}

@keyframes param-fade-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
