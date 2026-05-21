<script setup>
/**
 * BaseModal —— 通用弹窗
 *
 * 特性：Teleport 至 body、ESC / 遮罩关闭、四角直角括号 + 主题光晕，视觉与 FloatPanel 统一。
 * Props：
 *   - modelValue: 控制显示，配合 v-model 使用
 *   - title:      标题文本
 *   - icon:       iconify 图标名（可选，留空则不显示）
 *   - width:      内容宽度，默认 720px
 *   - closable:   是否允许关闭，默认 true
 * 插槽：
 *   - default:    弹窗主体内容
 *   - footer:     底部操作区（可选，存在时自动渲染分割线）
 */
import { onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  icon: { type: String, default: '' },
  width: { type: String, default: '720px' },
  closable: { type: Boolean, default: true }
})

const emit = defineEmits(['update:modelValue', 'close'])

const close = () => {
  if (!props.closable) return
  emit('update:modelValue', false)
  emit('close')
}

const onKey = (e) => {
  if (e.key === 'Escape' && props.modelValue) close()
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

watch(
  () => props.modelValue,
  (v) => {
    document.body.style.overflow = v ? 'hidden' : ''
  }
)
</script>

<template>
  <Teleport to="body">
    <transition
      enter-active-class="transition duration-200"
      leave-active-class="transition duration-200"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center bg-dark/70 backdrop-blur-sm"
        @click.self="close"
      >
        <transition
          enter-active-class="transition duration-200"
          leave-active-class="transition duration-150"
          enter-from-class="opacity-0 scale-95"
          leave-to-class="opacity-0 scale-95"
          appear
        >
          <div
            v-if="modelValue"
            class="relative flex flex-col max-h-[85vh] border border-primary/40 bg-dark/95 backdrop-blur-md shadow-(--shadow-glow-md)"
            :style="{ width }"
          >
            <span class="corner-brackets -top-px -left-px border-t-2 border-l-2"></span>
            <span class="corner-brackets -top-px -right-px border-t-2 border-r-2"></span>
            <span class="corner-brackets -bottom-px -left-px border-b-2 border-l-2"></span>
            <span class="corner-brackets -bottom-px -right-px border-b-2 border-r-2"></span>

            <div class="flex items-center justify-between px-5 py-3 border-b border-primary/25 select-none">
              <div class="flex items-center gap-2 text-base font-semibold text-primary tracking-wider">
                <Icon v-if="icon" :icon="icon" class="text-xl" />
                <span>{{ title }}</span>
              </div>
              <button
                v-if="closable"
                class="text-cyan-200/70 hover:text-primary transition-colors cursor-pointer"
                @click="close"
              >
                <Icon icon="lucide:x" class="text-xl" />
              </button>
            </div>

            <div class="flex-1 overflow-y-auto p-5">
              <slot />
            </div>

            <div v-if="$slots.footer" class="px-5 py-3 border-t border-primary/25 flex justify-end gap-2">
              <slot name="footer" />
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </Teleport>
</template>
