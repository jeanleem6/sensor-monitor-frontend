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
  <div ref="menuRef" class="fixed top-5 right-6 z-50 pointer-events-auto">
    <!-- 触发按钮 -->
    <button
      type="button"
      :class="[
        'relative inline-flex items-center gap-2 px-3.5 py-2 cursor-pointer',
        'border backdrop-blur-[10px] bg-linear-to-br from-primary/12 to-dark/65',
        'text-[0.8125rem] tracking-[0.18em]',
        'transition-[border-color,background,box-shadow,color] duration-250',
        open
          ? 'border-primary/75 text-primary shadow-[inset_0_1px_0_rgb(19_234_235/_0.25),0_0_18px_rgb(19_234_235/_0.25)]'
          : 'border-primary/40 text-body shadow-[inset_0_1px_0_rgb(19_234_235/_0.15),0_4px_16px_rgb(0_0_0/_0.25)]' +
            ' hover:border-primary/75 hover:text-primary hover:shadow-[inset_0_1px_0_rgb(19_234_235/_0.25),0_0_18px_rgb(19_234_235/_0.25)]'
      ]"
      :aria-expanded="open"
      aria-label="子系统切换"
      @click="toggle"
    >
      <!-- <span
        class="pointer-events-none absolute w-1.5 h-1.5 -top-px -left-px border-t border-l border-primary"
        aria-hidden="true"
      />
      <span
        class="pointer-events-none absolute w-1.5 h-1.5 -bottom-px -right-px border-b border-r border-primary"
        aria-hidden="true"
      /> -->

      <span class="inline-flex flex-col justify-center gap-0.75 w-3.5 h-3" aria-hidden="true">
        <span
          class="block w-full h-[1.5px] bg-current transition-[transform,opacity] duration-300"
          :class="open ? 'translate-y-[4.5px] rotate-45' : ''"
        />
        <span
          class="block w-full h-[1.5px] bg-current transition-[transform,opacity] duration-300"
          :class="open ? 'opacity-0' : ''"
        />
        <span
          class="block w-full h-[1.5px] bg-current transition-[transform,opacity] duration-300"
          :class="open ? 'translate-y-[-4.5px] -rotate-45' : ''"
        />
      </span>

      <span class="font-medium">子系统</span>
    </button>

    <!-- 下拉面板 -->
    <Transition name="nav-menu-pop">
      <div
        v-show="open"
        class="absolute top-[calc(100%+0.625rem)] right-0 min-w-60 p-2.5 border border-primary/40 backdrop-blur-[14px] bg-[linear-gradient(165deg,rgb(19_234_235/_0.1)_0%,rgb(6_10_29/_0.85)_50%,rgb(6_10_29/_0.95)_100%)] shadow-[inset_0_1px_0_rgb(19_234_235/_0.2),0_12px_36px_rgb(0_0_0/_0.45),0_0_24px_rgb(19_234_235/_0.12)]"
      >
        <!-- <span class="corner-brackets -top-px -left-px border-t-2 border-l-2" aria-hidden="true" />
        <span class="corner-brackets -top-px -right-px border-t-2 border-r-2" aria-hidden="true" />
        <span class="corner-brackets -bottom-px -left-px border-b-2 border-l-2 border-primary/50!" aria-hidden="true" />
        <span class="corner-brackets -bottom-px -right-px border-b-2 border-r-2 border-primary/50!" aria-hidden="true" /> -->

        <div class="flex items-center gap-2 px-2 pt-1 pb-2 border-b border-primary/18 mb-2">
          <span
            class="w-[0.4rem] h-[0.4rem] rounded-full bg-primary shadow-[0_0_8px_rgb(19_234_235/_0.9)] animate-[nav-dot-pulse_2s_ease-in-out_infinite]"
          />
          <span class="flex-1 text-[0.625rem] tracking-[0.3em] text-primary/70">SUBSYSTEMS</span>
          <span
            class="text-[0.625rem] px-[0.4rem] py-[0.1rem] border border-primary/35 rounded-xs text-primary bg-primary/6"
            >{{ items.length }}</span
          >
        </div>

        <ul class="m-0 p-0 list-none flex flex-col gap-1">
          <li v-for="(item, index) in items" :key="item.name">
            <router-link
              :to="{ name: item.name }"
              :class="[
                'relative flex items-center gap-2.5 px-2.5 py-[0.55rem]',
                'border rounded-xs no-underline',
                'transition-[border-color,background,transform,color,box-shadow] duration-250',
                route.name === item.name
                  ? 'border-primary/60 bg-linear-to-r from-primary/18 to-primary/4 text-primary shadow-[inset_0_0_16px_rgb(19_234_235/_0.1)]'
                  : 'border-primary/10 text-body/78 bg-dark/30 hover:border-primary/40 hover:bg-primary/8 hover:translate-x-0.75'
              ]"
              @click="close"
            >
              <span
                :class="[
                  'shrink-0 w-5.5 h-5.5 flex items-center justify-center',
                  'text-[0.5625rem] font-bold rounded-xs tabular-nums',
                  'border transition-[color,border-color,background] duration-250',
                  route.name === item.name
                    ? 'text-primary border-primary/60 bg-primary/12'
                    : 'text-primary/50 border-primary/22 bg-primary/4'
                ]"
                >{{ String(index + 1).padStart(2, '0') }}</span
              >

              <span class="flex-1 flex flex-col gap-0.5 min-w-0">
                <span
                  :class="[
                    'text-[0.8125rem] tracking-[0.04em] leading-tight',
                    route.name === item.name ? 'text-primary [text-shadow:0_0_8px_rgb(19_234_235/_0.4)]' : ''
                  ]"
                  >{{ item.label }}</span
                >
                <span class="text-[0.5625rem] tracking-[0.18em] text-primary/45">{{ item.sub }}</span>
              </span>

              <span
                :class="[
                  'shrink-0 text-[1.125rem] text-primary',
                  'transition-[opacity,transform] duration-300',
                  '[text-shadow:0_0_8px_rgb(19_234_235/_0.5)]',
                  route.name === item.name ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-1.5'
                ]"
                >›</span
              >
            </router-link>
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>
