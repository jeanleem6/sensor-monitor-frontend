<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useViewerStore } from '@/stores/viewer'
import { createThreeScene } from '@/composables/useThreeScene'

const container = ref(null)
const store = useViewerStore()
let api = null

// 折叠/展开两侧面板时，重新按当前层级 fit 镜头：
// 折叠后中间可视区变宽，fitView 会读取新的 layoutZoom 把模型放大填满（gsap 平滑过渡）
watch(
  () => store.sidesCollapsed,
  () => api?.fitView()
)

onMounted(async () => {
  api = createThreeScene(container.value, store)
  store.bindScene(api)
  try {
    await api.loadModel()
    if (store.transparentMode) api.toggleTransparent(true)
    // 路由切走再回到本页：组件重挂、scene 是新的，但 store 里的 level/selectedFloor/selectedRoom 还活着；
    // 模型默认渲染在 building 视角，需要把场景重新对齐到之前停留的层级，否则面包屑/面板显示 floor/room 而模型却是整栋
    if (store.level === 'room' && store.selectedRoom) {
      api.focusRoom(store.selectedRoom)
    } else if (store.level === 'floor' && store.selectedFloor != null) {
      api.focusFloor(store.selectedFloor)
    }
  } catch (err) {
    console.error('[ThreeViewer] failed to load model', err)
  } finally {
    store.loading = false
  }
})

onBeforeUnmount(() => {
  api?.dispose()
})
</script>

<template>
  <transition
    enter-active-class="transition duration-600"
    leave-active-class="transition duration-600"
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
  >
    <div ref="container" class="absolute inset-0 z-0"></div>
  </transition>
</template>
