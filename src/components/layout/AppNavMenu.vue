<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const open = ref(false)
const menuRef = ref(null)

const items = [
  { name: 'monitor', label: '建筑实时监测', sub: 'BUILDING MONITOR' },
  { name: 'lab-dayou', label: '专业实验 · 大有', sub: 'LAB · DAYOU' },
  { name: 'lab-chint', label: '专业实验 · 正泰', sub: 'LAB · CHINT' }
]

function toggle() {
  open.value = !open.value
}

function close() {
  open.value = false
}

function handleClickOutside(event) {
  if (open.value && menuRef.value && !menuRef.value.contains(event.target)) {
    close()
  }
}

function handleEsc(event) {
  if (event.key === 'Escape') close()
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
  document.addEventListener('keydown', handleEsc)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  document.removeEventListener('keydown', handleEsc)
})
</script>

<template>
  <div ref="menuRef" class="nav-menu">
    <button
      type="button"
      class="nav-menu__trigger"
      :class="{ 'nav-menu__trigger--open': open }"
      :aria-expanded="open"
      aria-label="子系统切换"
      @click="toggle"
    >
      <span class="nav-menu__trigger-corner nav-menu__trigger-corner--tl" aria-hidden="true" />
      <span class="nav-menu__trigger-corner nav-menu__trigger-corner--br" aria-hidden="true" />
      <span class="nav-menu__icon" aria-hidden="true">
        <span class="nav-menu__icon-bar" />
        <span class="nav-menu__icon-bar" />
        <span class="nav-menu__icon-bar" />
      </span>
      <span class="nav-menu__trigger-text">子系统</span>
    </button>

    <Transition name="nav-menu-pop">
      <div v-show="open" class="nav-menu__panel">
        <span class="nav-menu__panel-corner nav-menu__panel-corner--tl" aria-hidden="true" />
        <span class="nav-menu__panel-corner nav-menu__panel-corner--tr" aria-hidden="true" />
        <span class="nav-menu__panel-corner nav-menu__panel-corner--bl" aria-hidden="true" />
        <span class="nav-menu__panel-corner nav-menu__panel-corner--br" aria-hidden="true" />

        <div class="nav-menu__panel-header">
          <span class="nav-menu__panel-dot" />
          <span class="nav-menu__panel-title">SUBSYSTEMS</span>
          <span class="nav-menu__panel-count">{{ items.length }}</span>
        </div>

        <ul class="nav-menu__list">
          <li v-for="(item, index) in items" :key="item.name">
            <router-link
              :to="{ name: item.name }"
              class="nav-menu__item"
              :class="{ 'nav-menu__item--active': route.name === item.name }"
              @click="close"
            >
              <span class="nav-menu__item-index">{{ String(index + 1).padStart(2, '0') }}</span>
              <span class="nav-menu__item-text">
                <span class="nav-menu__item-label">{{ item.label }}</span>
                <span class="nav-menu__item-sub">{{ item.sub }}</span>
              </span>
              <span class="nav-menu__item-arrow">›</span>
            </router-link>
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.nav-menu {
  position: fixed;
  top: 1.25rem;
  right: 1.5rem;
  z-index: 50;
  pointer-events: auto;
}

/* ── 触发按钮 ── */
.nav-menu__trigger {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  border: 1px solid rgb(19 234 235 / 0.4);
  background: linear-gradient(135deg, rgb(19 234 235 / 0.12) 0%, rgb(6 10 29 / 0.65) 100%);
  backdrop-filter: blur(10px);
  color: #b6f5fc;
  font-size: 0.8125rem;
  letter-spacing: 0.18em;
  cursor: pointer;
  transition: border-color 0.25s, background 0.25s, box-shadow 0.25s, color 0.25s;
  box-shadow: inset 0 1px 0 rgb(19 234 235 / 0.15), 0 4px 16px rgb(0 0 0 / 0.25);
}

.nav-menu__trigger:hover,
.nav-menu__trigger--open {
  border-color: rgb(19 234 235 / 0.75);
  color: #13eaeb;
  box-shadow: inset 0 1px 0 rgb(19 234 235 / 0.25), 0 0 18px rgb(19 234 235 / 0.25);
}

.nav-menu__trigger-corner {
  position: absolute;
  width: 6px;
  height: 6px;
  pointer-events: none;
}

.nav-menu__trigger-corner--tl {
  top: -1px;
  left: -1px;
  border-top: 1px solid #13eaeb;
  border-left: 1px solid #13eaeb;
}

.nav-menu__trigger-corner--br {
  bottom: -1px;
  right: -1px;
  border-bottom: 1px solid #13eaeb;
  border-right: 1px solid #13eaeb;
}

.nav-menu__icon {
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  gap: 3px;
  width: 14px;
  height: 12px;
}

.nav-menu__icon-bar {
  display: block;
  width: 100%;
  height: 1.5px;
  background: currentColor;
  transition: transform 0.3s, opacity 0.3s;
}

.nav-menu__trigger--open .nav-menu__icon-bar:nth-child(1) {
  transform: translateY(4.5px) rotate(45deg);
}

.nav-menu__trigger--open .nav-menu__icon-bar:nth-child(2) {
  opacity: 0;
}

.nav-menu__trigger--open .nav-menu__icon-bar:nth-child(3) {
  transform: translateY(-4.5px) rotate(-45deg);
}

.nav-menu__trigger-text {
  font-weight: 500;
}

/* ── 下拉面板 ── */
.nav-menu__panel {
  position: absolute;
  top: calc(100% + 0.625rem);
  right: 0;
  min-width: 240px;
  padding: 0.625rem;
  border: 1px solid rgb(19 234 235 / 0.4);
  background: linear-gradient(165deg, rgb(19 234 235 / 0.1) 0%, rgb(6 10 29 / 0.85) 50%, rgb(6 10 29 / 0.95) 100%);
  backdrop-filter: blur(14px);
  box-shadow:
    inset 0 1px 0 rgb(19 234 235 / 0.2),
    0 12px 36px rgb(0 0 0 / 0.45),
    0 0 24px rgb(19 234 235 / 0.12);
}

.nav-menu__panel-corner {
  position: absolute;
  width: 10px;
  height: 10px;
  pointer-events: none;
}

.nav-menu__panel-corner--tl {
  top: -1px;
  left: -1px;
  border-top: 2px solid #13eaeb;
  border-left: 2px solid #13eaeb;
}

.nav-menu__panel-corner--tr {
  top: -1px;
  right: -1px;
  border-top: 2px solid #13eaeb;
  border-right: 2px solid #13eaeb;
}

.nav-menu__panel-corner--bl {
  bottom: -1px;
  left: -1px;
  border-bottom: 2px solid rgb(19 234 235 / 0.5);
  border-left: 2px solid rgb(19 234 235 / 0.5);
}

.nav-menu__panel-corner--br {
  bottom: -1px;
  right: -1px;
  border-bottom: 2px solid rgb(19 234 235 / 0.5);
  border-right: 2px solid rgb(19 234 235 / 0.5);
}

.nav-menu__panel-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem 0.5rem;
  border-bottom: 1px solid rgb(19 234 235 / 0.18);
  margin-bottom: 0.5rem;
}

.nav-menu__panel-dot {
  width: 0.4rem;
  height: 0.4rem;
  border-radius: 50%;
  background: #13eaeb;
  box-shadow: 0 0 8px rgb(19 234 235 / 0.9);
  animation: nav-dot-pulse 2s ease-in-out infinite;
}

.nav-menu__panel-title {
  flex: 1;
  font-size: 0.625rem;
  letter-spacing: 0.3em;
  color: rgb(19 234 235 / 0.7);
}

.nav-menu__panel-count {
  font-size: 0.625rem;
  padding: 0.1rem 0.4rem;
  border: 1px solid rgb(19 234 235 / 0.35);
  border-radius: 2px;
  color: #13eaeb;
  background: rgb(19 234 235 / 0.06);
}

/* ── 列表项 ── */
.nav-menu__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nav-menu__item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.55rem 0.625rem;
  border: 1px solid rgb(19 234 235 / 0.1);
  border-radius: 2px;
  color: rgb(182 245 252 / 0.78);
  background: rgb(6 10 29 / 0.3);
  text-decoration: none;
  transition: border-color 0.25s, background 0.25s, transform 0.25s, color 0.25s, box-shadow 0.25s;
}

.nav-menu__item:hover {
  border-color: rgb(19 234 235 / 0.4);
  background: rgb(19 234 235 / 0.08);
  transform: translateX(3px);
}

.nav-menu__item--active {
  border-color: rgb(19 234 235 / 0.6);
  background: linear-gradient(90deg, rgb(19 234 235 / 0.18) 0%, rgb(19 234 235 / 0.04) 100%);
  color: #13eaeb;
  box-shadow: inset 0 0 16px rgb(19 234 235 / 0.1);
}

.nav-menu__item--active .nav-menu__item-index {
  color: #13eaeb;
  border-color: rgb(19 234 235 / 0.6);
  background: rgb(19 234 235 / 0.12);
}

.nav-menu__item--active .nav-menu__item-label {
  color: #13eaeb;
  text-shadow: 0 0 8px rgb(19 234 235 / 0.4);
}

.nav-menu__item--active .nav-menu__item-arrow {
  opacity: 1;
  transform: translateX(0);
}

.nav-menu__item-index {
  flex-shrink: 0;
  width: 1.375rem;
  height: 1.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.5625rem;
  font-weight: 700;
  color: rgb(19 234 235 / 0.5);
  border: 1px solid rgb(19 234 235 / 0.22);
  border-radius: 2px;
  background: rgb(19 234 235 / 0.04);
  font-variant-numeric: tabular-nums;
  transition: color 0.25s, border-color 0.25s, background 0.25s;
}

.nav-menu__item-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.nav-menu__item-label {
  font-size: 0.8125rem;
  letter-spacing: 0.04em;
  line-height: 1.25;
}

.nav-menu__item-sub {
  font-size: 0.5625rem;
  letter-spacing: 0.18em;
  color: rgb(19 234 235 / 0.45);
}

.nav-menu__item-arrow {
  flex-shrink: 0;
  font-size: 1.125rem;
  color: #13eaeb;
  opacity: 0;
  transform: translateX(-6px);
  transition: opacity 0.3s, transform 0.3s;
  text-shadow: 0 0 8px rgb(19 234 235 / 0.5);
}

/* ── 动画 ── */
.nav-menu-pop-enter-active,
.nav-menu-pop-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.nav-menu-pop-enter-from,
.nav-menu-pop-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}

@keyframes nav-dot-pulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 8px rgb(19 234 235 / 0.8); }
  50% { opacity: 0.5; box-shadow: 0 0 4px rgb(19 234 235 / 0.4); }
}
</style>
