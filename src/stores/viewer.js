import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useViewerStore = defineStore('viewer', () => {
  // ---- 加载状态 ----
  const loading = ref(true)

  // ---- 三层级别状态机 ----
  // 'building' → 'floor' → 'room'
  const level = ref('building')

  // ---- 模型结构 ----
  const materialNames = ref([])
  const floors = ref([]) // [{ index, name, meshCount, materialCount, roomNames }]
  const rooms = ref({}) // { roomName: { floorIndex, meshCount } }

  // ---- 选取状态 ----
  const selectedMaterial = ref(null)
  const selectedFloor = ref(null)
  const selectedRoom = ref(null)

  // ---- 视觉模式 ----
  const transparentMode = ref(true)

  // ---- 两侧面板折叠（三层级共用一个全局开关，会话内记忆） ----
  const sidesCollapsed = ref(false)
  const toggleSides = () => {
    sidesCollapsed.value = !sidesCollapsed.value
  }

  // ---- 命中信息 ----
  const infoPanel = ref({ visible: false, meshName: '', materialName: '' })

  // ---- Three.js 场景控制器（非响应式） ----
  let scene = null
  const bindScene = (api) => {
    scene = api
  }

  // ---- 计算属性 ----
  const floorCount = computed(() => floors.value.length)
  const roomCount = computed(() => Object.keys(rooms.value).length)
  const currentFloor = computed(() => (selectedFloor.value !== null ? floors.value[selectedFloor.value] : null))
  const currentFloorRooms = computed(() => currentFloor.value?.roomNames || [])
  const currentRoom = computed(() => (selectedRoom.value ? rooms.value[selectedRoom.value] : null))

  const breadcrumb = computed(() => {
    const crumbs = [{ key: 'building', label: '整栋楼' }]
    if (level.value !== 'building' && currentFloor.value) {
      crumbs.push({ key: 'floor', label: currentFloor.value.name })
    }
    if (level.value === 'room' && selectedRoom.value) {
      crumbs.push({ key: 'room', label: selectedRoom.value })
    }
    return crumbs
  })

  // ---- Actions ----
  const selectMaterial = (name) => {
    if (!scene) return
    selectedMaterial.value = selectedMaterial.value === name ? null : name
    scene.highlightMaterial(selectedMaterial.value)
  }

  const selectFloor = (i) => {
    if (!scene || i == null || i < 0 || i >= floors.value.length) return
    selectedMaterial.value = null
    selectedRoom.value = null
    selectedFloor.value = i
    level.value = 'floor'
    scene.focusFloor(i)
  }

  const enterRoom = (name) => {
    if (!scene || !rooms.value[name]) return
    selectedMaterial.value = null
    selectedRoom.value = name
    // 若直接从 building 跳进 room，自动设定 floor
    const floorIdx = rooms.value[name].floorIndex
    if (floorIdx != null) selectedFloor.value = floorIdx
    level.value = 'room'
    scene.focusRoom(name)
  }

  const goBack = () => {
    if (level.value === 'room') {
      selectedRoom.value = null
      level.value = 'floor'
      scene?.focusFloor(selectedFloor.value)
    } else if (level.value === 'floor') {
      selectedFloor.value = null
      level.value = 'building'
      scene?.showBuilding()
    }
  }

  const goTo = (target) => {
    if (target === 'building') resetView()
    else if (target === 'floor' && selectedFloor.value !== null) {
      selectedRoom.value = null
      level.value = 'floor'
      scene?.focusFloor(selectedFloor.value)
    }
  }

  const toggleTransparent = () => {
    if (!scene) return
    transparentMode.value = !transparentMode.value
    scene.toggleTransparent(transparentMode.value)
  }

  const resetView = () => {
    if (!scene) return
    selectedMaterial.value = null
    selectedFloor.value = null
    selectedRoom.value = null
    level.value = 'building'
    transparentMode.value = false
    infoPanel.value.visible = false
    scene.showBuilding()
  }

  const fitView = () => scene?.fitView()

  const showInfo = (meshName, materialName) => {
    infoPanel.value = { visible: true, meshName, materialName }
  }

  const hideInfo = () => {
    infoPanel.value.visible = false
  }

  return {
    loading,
    level,
    materialNames,
    floors,
    rooms,
    selectedMaterial,
    selectedFloor,
    selectedRoom,
    transparentMode,
    sidesCollapsed,
    infoPanel,
    floorCount,
    roomCount,
    currentFloor,
    currentFloorRooms,
    currentRoom,
    breadcrumb,
    bindScene,
    selectMaterial,
    selectFloor,
    enterRoom,
    goBack,
    goTo,
    toggleTransparent,
    toggleSides,
    resetView,
    fitView,
    showInfo,
    hideInfo
  }
})
