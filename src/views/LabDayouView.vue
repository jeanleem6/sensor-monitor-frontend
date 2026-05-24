<script setup>
import { computed, ref } from 'vue'
import BasePanel from '@/components/ui/BasePanel.vue'

const heatTransferParams = [
  { label: '当前温度', value: '24.6 ℃' },
  { label: '当前湿度', value: '58 %RH' },
  { label: '运行状态', value: '在线', highlight: true },
  { label: '当前温度', value: '24.6 ℃' },
  { label: '当前湿度', value: '58 %RH' },
  { label: '运行状态', value: '在线', highlight: true }
]

const menuItems = [
  {
    id: 'GROUP-001',
    title: '数字化综合换热实验平台',
    children: [
      {
        id: 'DEV-001-1',
        title: '数字化综合换热实验平台-1',
        image: '/imgs/devices/dycr.png',
        params: heatTransferParams
      },
      {
        id: 'DEV-001-2',
        title: '数字化综合换热实验平台-2',
        image: '/imgs/devices/dycr.png',
        params: [
          { label: '当前温度', value: '26.2 ℃' },
          { label: '当前湿度', value: '52 %RH' },
          { label: '运行状态', value: '在线', highlight: true }
        ]
      },
      {
        id: 'DEV-001-3',
        title: '数字化综合换热实验平台-3',
        image: '/imgs/devices/dycr.png',
        params: [
          { label: '当前温度', value: '23.8 ℃' },
          { label: '当前湿度', value: '61 %RH' },
          { label: '运行状态', value: '在线', highlight: true }
        ]
      }
    ]
  },
  {
    id: 'DEV-002',
    title: '中央空调全空气系统实验装置',
    image: '/imgs/devices/dykt.png',
    params: [
      { label: 'PM2.5', value: '35 μg/m³' },
      { label: 'CO₂ 浓度', value: '420 ppm' },
      { label: '运行状态', value: '在线', highlight: true },
      { label: 'PM2.5', value: '35 μg/m³' },
      { label: 'CO₂ 浓度', value: '420 ppm' },
      { label: '运行状态', value: '在线', highlight: true }
    ]
  },
  {
    id: 'DEV-003',
    title: '数字化综合换热实验平台',
    image: '/imgs/devices/dygkhr.png',
    params: [
      { label: '噪声等级', value: '52 dB' },
      { label: '采样频率', value: '1 次/分钟' },
      { label: '运行状态', value: '在线', highlight: true },
      { label: 'PM2.5', value: '35 μg/m³' },
      { label: 'CO₂ 浓度', value: '420 ppm' },
      { label: '运行状态', value: '在线', highlight: true }
    ]
  },
  {
    id: 'GROUP-002',
    title: '智能型制冷压缩机实验装置',
    children: [
      {
        id: 'DEV-006-1',
        title: '智能型制冷压缩机实验装置-1',
        image: '/imgs/devices/dyysj.png',
        params: [
          { label: 'pH 值', value: '7.2' },
          { label: '浊度', value: '3.8 NTU' },
          { label: '运行状态', value: '维护中', warn: true },
          { label: 'PM2.5', value: '35 μg/m³' },
          { label: 'CO₂ 浓度', value: '420 ppm' },
          { label: '运行状态', value: '在线', highlight: true }
        ]
      },
      {
        id: 'DEV-006-2',
        title: '智能型制冷压缩机实验装置-2',
        image: '/imgs/devices/dyysj.png',
        params: [
          { label: '风速', value: '3.2 m/s' },
          { label: '风向', value: '东北风' },
          { label: '运行状态', value: '在线', highlight: true },
          { label: '风速', value: '3.2 m/s' },
          { label: '风向', value: '东北风' },
          { label: '运行状态', value: '在线', highlight: true }
        ]
      }
    ]
  }

]

function findDeviceById(id) {
  for (const item of menuItems) {
    if (item.children) {
      const child = item.children.find((c) => c.id === id)
      if (child) return child
    } else if (item.id === id) {
      return item
    }
  }
  return menuItems[0].children[0]
}

const activeDeviceId = ref('DEV-001-1')
const expandedGroups = ref(new Set())

const activeDevice = computed(() => findDeviceById(activeDeviceId.value))

const deviceCount = computed(() =>
  menuItems.reduce((sum, item) => sum + (item.children ? item.children.length : 1), 0)
)

function selectDevice(device) {
  activeDeviceId.value = device.id
}

function toggleGroup(groupId) {
  const next = new Set(expandedGroups.value)
  if (next.has(groupId)) {
    next.delete(groupId)
  } else {
    next.add(groupId)
  }
  expandedGroups.value = next
}

function isGroupExpanded(groupId) {
  return expandedGroups.value.has(groupId)
}

function isGroupActive(item) {
  return item.children?.some((child) => child.id === activeDeviceId.value)
}

function isDeviceActive(id) {
  return activeDeviceId.value === id
}
</script>

<template>
  <div class="device-layout h-[calc(100vh-4rem)] overflow-hidden p-8 pt-6">
      <!-- 左侧设备列表 -->
      <aside class="device-sidebar">
        <span class="sidebar-corner sidebar-corner--tl" aria-hidden="true" />
        <span class="sidebar-corner sidebar-corner--tr" aria-hidden="true" />
        <span class="sidebar-corner sidebar-corner--bl" aria-hidden="true" />
        <span class="sidebar-corner sidebar-corner--br" aria-hidden="true" />
        <div class="device-sidebar__bg-grid" aria-hidden="true" />
        <div class="device-sidebar__scan" aria-hidden="true" />

        <div class="device-sidebar__header">
          <div class="device-sidebar__header-left">
            <span class="device-sidebar__header-dot" />
            <div class="device-sidebar__header-text">
              <span class="device-sidebar__header-title">设备列表</span>
              <span class="device-sidebar__header-sub">DEVICE CATALOG</span>
            </div>
          </div>
          <span class="device-sidebar__header-count">{{ deviceCount }}</span>
        </div>

        <ul class="device-sidebar__list">
          <template v-for="(item, index) in menuItems" :key="item.id">
            <!-- 带子列表的分组 -->
            <li v-if="item.children" class="device-group" :style="{ '--item-delay': `${index * 70}ms` }">
              <div
                class="device-item device-item--parent"
                :class="{
                  'device-item--expanded': isGroupExpanded(item.id),
                  'device-item--group-active': isGroupActive(item)
                }"
                @click="toggleGroup(item.id)"
              >
                <span class="device-item__shine" aria-hidden="true" />
                <span class="device-item__indicator" />
                <span class="device-item__index">{{ String(index + 1).padStart(2, '0') }}</span>
                <span class="device-item__name">{{ item.title }}</span>
                <span class="device-item__badge">GROUP</span>
                <span
                  class="device-item__chevron"
                  :class="{ 'device-item__chevron--open': isGroupExpanded(item.id) }"
                >
                  ›
                </span>
              </div>

              <Transition name="sub-list">
                <ul v-show="isGroupExpanded(item.id)" class="device-sublist">
                  <li
                    v-for="(child, childIndex) in item.children"
                    :key="child.id"
                    class="device-item device-item--child"
                    :class="{ 'device-item--active': isDeviceActive(child.id) }"
                    :style="{ '--item-delay': `${childIndex * 50}ms` }"
                    @click.stop="selectDevice(child)"
                  >
                    <span class="device-item__shine" aria-hidden="true" />
                    <span class="device-item__indicator" />
                    <span class="device-item__sub-dot">{{ childIndex + 1 }}</span>
                    <span class="device-item__name">{{ child.title }}</span>
                    <span class="device-item__arrow">›</span>
                  </li>
                </ul>
              </Transition>
            </li>

            <!-- 普通列表项 -->
            <li
              v-else
              class="device-item"
              :class="{ 'device-item--active': isDeviceActive(item.id) }"
              :style="{ '--item-delay': `${index * 70}ms` }"
              @click="selectDevice(item)"
            >
              <span class="device-item__shine" aria-hidden="true" />
              <span class="device-item__indicator" />
              <span class="device-item__index">{{ String(index + 1).padStart(2, '0') }}</span>
              <span class="device-item__name">{{ item.title }}</span>
              <span class="device-item__arrow">›</span>
            </li>
          </template>
        </ul>
      </aside>

      <!-- 右侧设备详情 -->
      <section class="device-detail">
        <BasePanel :title="activeDevice.title" class="device-detail__panel">
          <Transition name="detail-switch" mode="out-in">
            <div :key="activeDevice.id" class="device-detail__content">
              <!-- 设备图片 -->
              <div class="device-image">
                <div class="device-image__grid" aria-hidden="true" />
                <div class="device-image__scan" aria-hidden="true" />
                <div class="device-image__glow" aria-hidden="true" />
                <div class="device-image__frame" aria-hidden="true" />
                <img
                  :src="activeDevice.image"
                  :alt="activeDevice.title"
                  class="device-image__img"
                />
              </div>

              <!-- 分隔线 -->
              <div class="device-divider">
                <span class="device-divider__line" />
                <span class="device-divider__label">实时参数</span>
                <span class="device-divider__line" />
              </div>

              <!-- 设备参数 -->
              <div class="device-params">
                <div
                  v-for="(item, index) in activeDevice.params"
                  :key="`${item.label}-${index}`"
                  class="param-card"
                  :style="{ '--delay': `${index * 100}ms` }"
                >
                  <span class="param-card__label">{{ item.label }}</span>
                  <span
                    class="param-card__value"
                    :class="{
                      'param-card__value--highlight': item.highlight,
                      'param-card__value--warn': item.warn
                    }"
                  >
                    {{ item.value }}
                  </span>
                  <span class="param-card__bar" aria-hidden="true" />
                </div>
              </div>
            </div>
          </Transition>
        </BasePanel>
      </section>
    </div>
</template>

<style scoped>

.device-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 1.5rem;
  align-items: stretch;
}

/* ── 左侧列表 ── */
.device-sidebar {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  border: 1px solid rgb(19 234 235 / 0.28);
  background: linear-gradient(165deg, rgb(19 234 235 / 0.1) 0%, rgb(6 10 29 / 0.72) 45%, rgb(6 10 29 / 0.88) 100%);
  backdrop-filter: blur(12px);
  box-shadow:
    inset 0 1px 0 rgb(19 234 235 / 0.2),
    inset 0 0 30px rgb(19 234 235 / 0.04),
    0 8px 32px rgb(0 0 0 / 0.35);
}

.sidebar-corner {
  position: absolute;
  width: 12px;
  height: 12px;
  pointer-events: none;
  z-index: 2;
}

.sidebar-corner--tl {
  top: -1px;
  left: -1px;
  border-top: 2px solid #13eaeb;
  border-left: 2px solid #13eaeb;
}

.sidebar-corner--tr {
  top: -1px;
  right: -1px;
  border-top: 2px solid #13eaeb;
  border-right: 2px solid #13eaeb;
}

.sidebar-corner--bl {
  bottom: -1px;
  left: -1px;
  border-bottom: 2px solid rgb(19 234 235 / 0.5);
  border-left: 2px solid rgb(19 234 235 / 0.5);
}

.sidebar-corner--br {
  bottom: -1px;
  right: -1px;
  border-bottom: 2px solid rgb(19 234 235 / 0.5);
  border-right: 2px solid rgb(19 234 235 / 0.5);
}

.device-sidebar__bg-grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgb(19 234 235 / 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgb(19 234 235 / 0.035) 1px, transparent 1px);
  background-size: 20px 20px;
  animation: sidebar-grid-drift 24s linear infinite;
  mask-image: linear-gradient(180deg, rgb(0 0 0 / 0.6) 0%, transparent 85%);
}

.device-sidebar__scan {
  position: absolute;
  left: 0;
  right: 0;
  height: 40px;
  pointer-events: none;
  background: linear-gradient(180deg, transparent, rgb(19 234 235 / 0.06), transparent);
  animation: sidebar-scan 5s ease-in-out infinite;
  z-index: 1;
}

.device-sidebar__header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1rem;
  border-bottom: 1px solid rgb(19 234 235 / 0.18);
  background: linear-gradient(90deg, rgb(19 234 235 / 0.08) 0%, transparent 100%);
}

.device-sidebar__header-left {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  min-width: 0;
}

.device-sidebar__header-dot {
  flex-shrink: 0;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: #13eaeb;
  box-shadow: 0 0 10px rgb(19 234 235 / 0.9);
  animation: pulse-dot 2s ease-in-out infinite;
}

.device-sidebar__header-text {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.device-sidebar__header-title {
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  color: #13eaeb;
  text-shadow: 0 0 10px rgb(19 234 235 / 0.35);
}

.device-sidebar__header-sub {
  font-size: 0.5625rem;
  letter-spacing: 0.22em;
  color: rgb(19 234 235 / 0.45);
}

.device-sidebar__header-count {
  flex-shrink: 0;
  font-size: 0.6875rem;
  padding: 0.2rem 0.55rem;
  border: 1px solid rgb(19 234 235 / 0.35);
  border-radius: 2px;
  color: #13eaeb;
  font-variant-numeric: tabular-nums;
  background: rgb(19 234 235 / 0.06);
  box-shadow: inset 0 0 8px rgb(19 234 235 / 0.08);
  animation: count-glow 3s ease-in-out infinite;
}

.device-sidebar__list {
  position: relative;
  z-index: 2;
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem;
  list-style: none;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.device-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.75rem 0.875rem;
  border: 1px solid rgb(19 234 235 / 0.08);
  border-radius: 2px;
  cursor: pointer;
  overflow: hidden;
  background: rgb(6 10 29 / 0.25);
  animation: slide-in-left 0.5s ease both;
  animation-delay: var(--item-delay);
  transition: border-color 0.3s, background 0.3s, transform 0.3s, box-shadow 0.3s;
}

.device-item__shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 60%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgb(19 234 235 / 0.12), transparent);
  transform: skewX(-20deg);
  transition: left 0.6s ease;
  pointer-events: none;
}

.device-item:hover {
  border-color: rgb(19 234 235 / 0.35);
  background: rgb(19 234 235 / 0.07);
  transform: translateX(5px);
  box-shadow: -4px 0 16px rgb(19 234 235 / 0.08);
}

.device-item:hover .device-item__shine {
  left: 150%;
}

.device-item--active {
  border-color: rgb(19 234 235 / 0.55);
  background: linear-gradient(90deg, rgb(19 234 235 / 0.18) 0%, rgb(19 234 235 / 0.04) 100%);
  box-shadow:
    inset 0 0 24px rgb(19 234 235 / 0.08),
    0 0 20px rgb(19 234 235 / 0.1);
  animation: slide-in-left 0.5s ease both, active-border-pulse 2.5s ease-in-out infinite;
  animation-delay: var(--item-delay), 0s;
}

.device-item--active .device-item__indicator {
  opacity: 1;
  height: 75%;
  box-shadow: 0 0 8px rgb(19 234 235 / 0.6);
}

.device-item--active .device-item__name {
  color: #13eaeb;
  text-shadow: 0 0 10px rgb(19 234 235 / 0.45);
}

.device-item--active .device-item__index {
  color: #13eaeb;
  border-color: rgb(19 234 235 / 0.6);
  background: rgb(19 234 235 / 0.12);
}

.device-item--active .device-item__arrow {
  opacity: 1;
  transform: translateX(0);
}

.device-item__indicator {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 0;
  background: linear-gradient(180deg, #13eaeb, rgb(19 234 235 / 0.2));
  border-radius: 0 2px 2px 0;
  opacity: 0;
  transition: height 0.3s ease, opacity 0.3s ease;
}

.device-item__index {
  flex-shrink: 0;
  width: 1.375rem;
  height: 1.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.5625rem;
  font-weight: 700;
  color: rgb(19 234 235 / 0.45);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
  border: 1px solid rgb(19 234 235 / 0.2);
  border-radius: 2px;
  background: rgb(19 234 235 / 0.04);
  transition: color 0.25s, border-color 0.25s, background 0.25s;
}

.device-item__name {
  flex: 1;
  font-size: 0.8125rem;
  color: rgb(182 245 252 / 0.78);
  letter-spacing: 0.03em;
  line-height: 1.35;
  transition: color 0.25s, text-shadow 0.25s;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.device-item__badge {
  flex-shrink: 0;
  font-size: 0.5rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  padding: 0.15rem 0.35rem;
  border: 1px solid rgb(19 234 235 / 0.25);
  border-radius: 2px;
  color: rgb(19 234 235 / 0.55);
  background: rgb(19 234 235 / 0.05);
}

.device-item__arrow {
  flex-shrink: 0;
  font-size: 1.125rem;
  color: #13eaeb;
  opacity: 0;
  transform: translateX(-8px);
  transition: opacity 0.3s, transform 0.3s;
  text-shadow: 0 0 8px rgb(19 234 235 / 0.5);
}

.device-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  animation: slide-in-left 0.5s ease both;
  animation-delay: var(--item-delay);
}

.device-item--parent {
  font-weight: 600;
}

.device-item--parent.device-item--expanded {
  border-color: rgb(19 234 235 / 0.3);
  background: rgb(19 234 235 / 0.06);
}

.device-item--parent.device-item--group-active {
  border-color: rgb(19 234 235 / 0.3);
  background: rgb(19 234 235 / 0.05);
}

.device-item--parent.device-item--group-active .device-item__name {
  color: rgb(19 234 235 / 0.9);
}

.device-item__chevron {
  flex-shrink: 0;
  font-size: 1.125rem;
  color: rgb(19 234 235 / 0.5);
  transform: rotate(90deg);
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), color 0.25s ease;
}

.device-item__chevron--open {
  transform: rotate(-90deg);
  color: #13eaeb;
  text-shadow: 0 0 8px rgb(19 234 235 / 0.5);
}

.device-sublist {
  list-style: none;
  margin: 0;
  padding: 0.25rem 0 0.25rem 0.875rem;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  border-left: 1px dashed rgb(19 234 235 / 0.22);
  margin-left: 1.375rem;
  position: relative;
}

.device-sublist::before {
  content: '';
  position: absolute;
  left: -1px;
  top: 0;
  bottom: 0;
  width: 1px;
  background: linear-gradient(180deg, #13eaeb, rgb(19 234 235 / 0.1));
  animation: sublist-line-pulse 2s ease-in-out infinite;
}

.device-item--child {
  padding: 0.625rem 0.75rem;
  font-size: 0.8125rem;
  animation: sub-item-in 0.4s ease both;
  animation-delay: var(--item-delay);
}

.device-item--child .device-item__name {
  font-size: 0.75rem;
}

.device-item__sub-dot {
  flex-shrink: 0;
  width: 1.125rem;
  height: 1.125rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.5625rem;
  font-weight: 700;
  color: rgb(19 234 235 / 0.65);
  border: 1px solid rgb(19 234 235 / 0.3);
  border-radius: 50%;
  font-variant-numeric: tabular-nums;
  transition: all 0.3s ease;
}

.device-item--child.device-item--active .device-item__sub-dot {
  color: #060a1d;
  background: #13eaeb;
  border-color: #13eaeb;
  box-shadow: 0 0 12px rgb(19 234 235 / 0.65);
  animation: sub-dot-pulse 2s ease-in-out infinite;
}

.sub-list-enter-active,
.sub-list-leave-active {
  transition: opacity 0.3s ease, max-height 0.35s ease, transform 0.3s ease;
  overflow: hidden;
}

.sub-list-enter-from,
.sub-list-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-8px);
}

.sub-list-enter-to,
.sub-list-leave-from {
  opacity: 1;
  max-height: 280px;
  transform: translateY(0);
}

/* ── 右侧详情 ── */
.device-detail {
  min-height: 0;
  min-width: 0;
}

.device-detail__panel {
  height: 100%;
}

.device-detail__content {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 1rem;
}

/* 切换动画 */
.detail-switch-enter-active,
.detail-switch-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}

.detail-switch-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.detail-switch-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* 设备图片区 */
.device-image {
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
  border: 1px solid rgb(19 234 235 / 0.25);
  border-radius: 2px;
  background: linear-gradient(180deg, rgb(19 234 235 / 0.1) 0%, rgb(6 10 29 / 0.4) 100%);
  box-shadow: inset 0 0 40px rgb(19 234 235 / 0.06);
}

.device-image__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgb(19 234 235 / 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgb(19 234 235 / 0.04) 1px, transparent 1px);
  background-size: 24px 24px;
  animation: grid-drift 20s linear infinite;
}

.device-image__scan {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgb(19 234 235 / 0.6), transparent);
  box-shadow: 0 0 12px rgb(19 234 235 / 0.5);
  animation: scan-line 3s ease-in-out infinite;
}

.device-image__glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200px;
  height: 200px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: radial-gradient(circle, rgb(19 234 235 / 0.18) 0%, transparent 70%);
  animation: glow-pulse 3s ease-in-out infinite;
}

.device-image__frame {
  position: absolute;
  inset: 12px;
  border: 1px dashed rgb(19 234 235 / 0.2);
  border-radius: 2px;
  pointer-events: none;
}

.device-image__img {
  position: relative;
  z-index: 1;
  max-height: 120%;
  max-width: 105%;
  object-fit: contain;
  filter: drop-shadow(0 0 16px rgb(19 234 235 / 0.35));
  animation: img-float 4s ease-in-out infinite;
}

/* 分隔线 */
.device-divider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.device-divider__line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgb(19 234 235 / 0.4), transparent);
}

.device-divider__label {
  flex-shrink: 0;
  font-size: 0.625rem;
  letter-spacing: 0.3em;
  color: rgb(19 234 235 / 0.65);
  text-transform: uppercase;
}

/* 参数区 */
.device-params {
  flex-shrink: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.625rem;
}

.param-card {
  position: relative;
  overflow: hidden;
  padding: 0.75rem 1rem;
  border: 1px solid rgb(19 234 235 / 0.15);
  border-radius: 2px;
  background: linear-gradient(135deg, rgb(19 234 235 / 0.08) 0%, rgb(6 10 29 / 0.4) 100%);
  animation: param-rise 0.5s ease both;
  animation-delay: var(--delay);
  transition: border-color 0.25s, box-shadow 0.25s;
}

.param-card:hover {
  border-color: rgb(19 234 235 / 0.35);
  box-shadow: 0 0 16px rgb(19 234 235 / 0.1);
}

.param-card__label {
  display: block;
  margin-bottom: 0.375rem;
  font-size: 0.6875rem;
  color: rgb(182 245 252 / 0.55);
  letter-spacing: 0.08em;
}

.param-card__value {
  display: block;
  font-size: 1.0625rem;
  font-weight: 600;
  color: #b6f5fc;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 0 8px rgb(19 234 235 / 0.15);
}

.param-card__value--highlight {
  color: #13eaeb;
  text-shadow: 0 0 8px rgb(19 234 235 / 0.6), 0 0 20px rgb(19 234 235 / 0.3);
}

.param-card__value--warn {
  color: #fcd34d;
  text-shadow: 0 0 8px rgb(252 211 77 / 0.5);
}

.param-card__bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, rgb(19 234 235 / 0.6), transparent);
  transform: scaleX(0);
  transform-origin: left;
  animation: bar-grow 0.6s ease both;
  animation-delay: calc(var(--delay) + 200ms);
}

/* ── 动画 ── */
@keyframes pulse-dot {
  0%,
  100% {
    opacity: 1;
    box-shadow: 0 0 8px rgb(19 234 235 / 0.8);
  }
  50% {
    opacity: 0.5;
    box-shadow: 0 0 4px rgb(19 234 235 / 0.4);
  }
}

@keyframes slide-in-left {
  from {
    opacity: 0;
    transform: translateX(-16px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes sidebar-grid-drift {
  from {
    background-position: 0 0;
  }
  to {
    background-position: 20px 20px;
  }
}

@keyframes sidebar-scan {
  0% {
    top: -40px;
    opacity: 0;
  }
  15% {
    opacity: 1;
  }
  85% {
    opacity: 1;
  }
  100% {
    top: 100%;
    opacity: 0;
  }
}

@keyframes count-glow {
  0%,
  100% {
    box-shadow: inset 0 0 8px rgb(19 234 235 / 0.08);
  }
  50% {
    box-shadow: inset 0 0 14px rgb(19 234 235 / 0.18);
  }
}

@keyframes active-border-pulse {
  0%,
  100% {
    border-color: rgb(19 234 235 / 0.45);
  }
  50% {
    border-color: rgb(19 234 235 / 0.7);
  }
}

@keyframes sublist-line-pulse {
  0%,
  100% {
    opacity: 0.4;
  }
  50% {
    opacity: 1;
  }
}

@keyframes sub-item-in {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes sub-dot-pulse {
  0%,
  100% {
    box-shadow: 0 0 8px rgb(19 234 235 / 0.5);
  }
  50% {
    box-shadow: 0 0 16px rgb(19 234 235 / 0.8);
  }
}

@keyframes scan-line {
  0% {
    top: 0;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    top: 100%;
    opacity: 0;
  }
}

@keyframes grid-drift {
  from {
    background-position: 0 0;
  }
  to {
    background-position: 24px 24px;
  }
}

@keyframes glow-pulse {
  0%,
  100% {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.15);
  }
}

@keyframes img-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

@keyframes param-rise {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bar-grow {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}
</style>
