import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js'
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh'
import gsap from 'gsap'

THREE.Mesh.prototype.raycast = acceleratedRaycast
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree

const DRAG_THRESHOLD = 5

export function createThreeScene(container, store) {
  let scene, camera, renderer, controls
  let building = null
  let clippingPlane = null
  let rafId = null
  let disposed = false

  const raycaster = new THREE.Raycaster()
  const mouse = new THREE.Vector2()

  const materialGroups = {}
  const floorGroups = [] // [meshes[]]
  const floorBoxes = [] // Box3[]
  const roomMeshes = {} // { name: meshes[] }
  const roomMeta = {} // { name: { floorIndex, box, meshCount } }

  let buildingSize = 1
  let explodeGap = 0
  // 静止状态（未爆炸）的 building 盒子；用于回到楼栋视角时正确居中，避免读取仍在动画中的盒子
  let restBuildingBox = null

  let sectionY = 0
  let draggingSection = false
  let isDragging = false
  const mouseDownPos = { x: 0, y: 0 }

  // ---------- 初始化 ----------
  function init() {
    scene = new THREE.Scene()
    scene.background = null

    const { clientWidth: w, clientHeight: h } = container
    camera = new THREE.PerspectiveCamera(60, w / h, 0.01, 1000000)

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(w, h)
    renderer.localClippingEnabled = true
    container.appendChild(renderer.domElement)

    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.addEventListener('start', () => (isDragging = true))
    controls.addEventListener('end', () => {
      setTimeout(() => (isDragging = false), 50)
    })

    createLights()
    bindEvents()
  }

  function createLights() {
    const dir = new THREE.DirectionalLight(0xffffff, 1)
    dir.position.set(100, 200, 100)
    scene.add(dir)
    scene.add(new THREE.AmbientLight(0xffffff, 0.8))
  }

  // ---------- 模型加载 ----------
  function loadModel() {
    return new Promise((resolve, reject) => {
      const mtlLoader = new MTLLoader()
      mtlLoader.setPath('/model/')
      mtlLoader.load(
        'house.mtl',
        (materials) => {
          materials.preload()
          const objLoader = new OBJLoader()
          objLoader.setMaterials(materials)
          objLoader.setPath('/model/')
          objLoader.load(
            'house.obj',
            (obj) => {
              building = obj
              scene.add(building)
              normalizeModel()
              prepareMeshes()
              buildMaterialGroups()
              detectFloors()
              detectRooms()
              mapRoomsToFloors()
              syncStore()
              resolve()
            },
            undefined,
            reject
          )
        },
        undefined,
        reject
      )
    })
  }

  function normalizeModel() {
    const box = new THREE.Box3().setFromObject(building)
    const center = box.getCenter(new THREE.Vector3())
    building.position.x -= center.x
    building.position.y -= center.y
    building.position.z -= center.z
    // 此时尚未爆炸，缓存静止盒子用于后续回到楼栋视角时的居中计算
    restBuildingBox = new THREE.Box3().setFromObject(building)
    fitCameraToObject()
  }

  function fitCameraToObject(offset = 0.7) {
    const box = new THREE.Box3().setFromObject(building)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    buildingSize = maxDim
    explodeGap = Math.max(size.y * 0.25, maxDim * 0.08)

    const fov = (camera.fov * Math.PI) / 180
    let distance = Math.abs(maxDim / 2 / Math.tan(fov / 2))
    distance *= offset

    camera.position.set(center.x + distance, center.y + distance * 0.6, center.z + distance)
    camera.near = maxDim / 100
    camera.far = maxDim * 100
    camera.updateProjectionMatrix()

    controls.target.copy(center)
    controls.maxDistance = maxDim * 20
    controls.update()

    clippingPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), size.y)
  }

  function focusBox(box, paddingScale = 1.3) {
    if (!box || box.isEmpty()) return
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    const fov = (camera.fov * Math.PI) / 180
    let distance = Math.abs(maxDim / 2 / Math.tan(fov / 2))
    distance *= paddingScale
    const targetPos = center.clone().add(new THREE.Vector3(distance, distance * 0.6, distance))
    gsap.to(camera.position, { x: targetPos.x, y: targetPos.y, z: targetPos.z, duration: 1.0 })
    gsap.to(controls.target, { x: center.x, y: center.y, z: center.z, duration: 1.0 })
  }

  // ---------- Mesh 处理 ----------
  function eachMaterial(mesh, cb) {
    if (!mesh.material) return
    if (Array.isArray(mesh.material)) mesh.material.forEach((m) => m && cb(m))
    else cb(mesh.material)
  }

  function prepareMeshes() {
    building.traverse((child) => {
      if (!child.isMesh) return
      child.geometry.computeBoundsTree()
      child.userData.baseY = 0 // 爆炸时用的 y 偏移基准
      eachMaterial(child, (mat) => {
        if (mat.color) mat.userData.originalColor = mat.color.clone()
        mat.clippingPlanes = [clippingPlane]
        mat.side = THREE.DoubleSide
      })
    })
  }

  function buildMaterialGroups() {
    building.traverse((mesh) => {
      if (!mesh.isMesh) return
      eachMaterial(mesh, (mat) => {
        const name = mat.name || 'default'
        if (!materialGroups[name]) materialGroups[name] = []
        if (!materialGroups[name].includes(mesh)) materialGroups[name].push(mesh)
      })
    })
  }

  // 用 bbox 中心 Y 来分楼层，自适应阈值（OBJLoader 出来 mesh.position 通常都是 0）
  function detectFloors() {
    const items = []
    building.traverse((o) => {
      if (!o.isMesh) return
      const box = new THREE.Box3().setFromObject(o)
      items.push({ mesh: o, y: (box.min.y + box.max.y) / 2, box })
    })
    if (!items.length) return
    items.sort((a, b) => a.y - b.y)

    const buildingBox = new THREE.Box3().setFromObject(building)
    const height = buildingBox.max.y - buildingBox.min.y
    const gapThreshold = Math.max(0.5, height / 30)

    let current = [items[0].mesh]
    let lastY = items[0].y
    for (let i = 1; i < items.length; i++) {
      if (items[i].y - lastY > gapThreshold) {
        floorGroups.push(current)
        current = []
      }
      current.push(items[i].mesh)
      lastY = items[i].y
    }
    if (current.length) floorGroups.push(current)

    floorGroups.forEach((meshes) => {
      const box = new THREE.Box3()
      meshes.forEach((m) => box.expandByObject(m))
      floorBoxes.push(box)
    })
  }

  // 用 bbox 中心做空间聚类，阈值与模型大小成正比
  function detectRooms() {
    const items = []
    building.traverse((m) => {
      if (!m.isMesh) return
      const box = new THREE.Box3().setFromObject(m)
      items.push({ mesh: m, center: box.getCenter(new THREE.Vector3()) })
    })
    const buildingBox = new THREE.Box3().setFromObject(building)
    const size = buildingBox.getSize(new THREE.Vector3())
    const threshold = Math.max(Math.min(size.x, size.z) * 0.12, 1.0)

    const clusters = []
    items.forEach(({ mesh, center }) => {
      let assigned = false
      for (const room of clusters) {
        if (center.distanceTo(room.center) < threshold) {
          room.meshes.push(mesh)
          // 重新加权平均中心
          const n = room.meshes.length
          room.center.multiplyScalar((n - 1) / n).add(center.clone().multiplyScalar(1 / n))
          assigned = true
          break
        }
      }
      if (!assigned) clusters.push({ meshes: [mesh], center: center.clone() })
    })
    clusters
      .sort((a, b) => b.meshes.length - a.meshes.length) // 大房间排前面
      .forEach((r, i) => {
        const name = `Room ${i + 1}`
        roomMeshes[name] = r.meshes
      })
  }

  function mapRoomsToFloors() {
    Object.entries(roomMeshes).forEach(([name, meshes]) => {
      const box = new THREE.Box3()
      meshes.forEach((m) => box.expandByObject(m))
      const cy = (box.min.y + box.max.y) / 2
      let bestIdx = 0
      let bestDist = Infinity
      floorBoxes.forEach((fb, i) => {
        const fy = (fb.min.y + fb.max.y) / 2
        const d = Math.abs(fy - cy)
        if (d < bestDist) {
          bestDist = d
          bestIdx = i
        }
      })
      roomMeta[name] = { floorIndex: bestIdx, box, meshCount: meshes.length }
    })
  }

  function syncStore() {
    store.materialNames = Object.keys(materialGroups)

    // 收集每层的房间
    const floorRoomsMap = {}
    Object.entries(roomMeta).forEach(([name, meta]) => {
      if (!floorRoomsMap[meta.floorIndex]) floorRoomsMap[meta.floorIndex] = []
      floorRoomsMap[meta.floorIndex].push(name)
    })

    store.floors = floorGroups.map((meshes, i) => {
      const materials = new Set()
      meshes.forEach((m) => eachMaterial(m, (mat) => materials.add(mat.name || 'default')))
      return {
        index: i,
        name: `F${i + 1}`,
        meshCount: meshes.length,
        materialCount: materials.size,
        roomNames: floorRoomsMap[i] || []
      }
    })

    const roomsOut = {}
    Object.entries(roomMeta).forEach(([name, meta]) => {
      roomsOut[name] = { floorIndex: meta.floorIndex, meshCount: meta.meshCount }
    })
    store.rooms = roomsOut
  }

  // ---------- 视图切换：三层 ----------
  function resetMeshAppearance() {
    building.traverse((m) => {
      if (!m.isMesh) return
      m.visible = true
      eachMaterial(m, (mat) => {
        if (mat.userData.originalColor) mat.color.copy(mat.userData.originalColor)
        mat.transparent = false
        mat.opacity = 1
      })
    })
  }

  function animateExplode(active) {
    floorGroups.forEach((floor, i) => {
      const targetOffset = active ? i * explodeGap : 0
      floor.forEach((m) => {
        const baseY = m.userData.baseY ?? 0
        gsap.to(m.position, {
          y: m.position.y - baseY + targetOffset,
          duration: 0.8,
          ease: 'power2.out',
          onUpdate: () => {
            m.userData.baseY = targetOffset
          }
        })
      })
    })
  }

  // 视图切换后，依 store.transparentMode 重新套用透明状态，避免 UI 与模型不同步
  function reapplyTransparent() {
    if (store.transparentMode) toggleTransparent(true)
  }

  function showBuilding() {
    if (!building) return
    resetMeshAppearance()
    animateExplode(false)
    // 用静止盒子平滑动画镜头：避免读取仍在爆炸状态下的盒子导致中心偏移，
    // 同时 gsap 会覆盖前一个 focusFloor/focusRoom 未完成的 camera tween
    if (restBuildingBox) focusBox(restBuildingBox, 0.7)
    else fitCameraToObject()
    reapplyTransparent()
  }

  // 楼层爆炸 → 隐藏其它层 → 镜头聚焦
  function focusFloor(index) {
    if (!building || !floorGroups[index]) return
    resetMeshAppearance()
    // 先按透明模式重设基线：避免 resetMeshAppearance 把目标层冲为 opacity=1
    // 导致动画过程中目标层先变不透明、动画结束才突然回到透明的闪烁
    reapplyTransparent()
    animateExplode(true)

    // 动画途中淡出其它层（gsap 从当前 opacity 起 tween：透明模式下 0.25→0，否则 1→0）
    floorGroups.forEach((floor, i) => {
      if (i === index) return
      floor.forEach((m) => {
        eachMaterial(m, (mat) => {
          mat.transparent = true
          gsap.to(mat, { opacity: 0, duration: 0.6, delay: 0.3 })
        })
      })
    })
    setTimeout(() => {
      floorGroups.forEach((floor, i) => {
        if (i === index) return
        floor.forEach((m) => (m.visible = false))
      })
    }, 950)

    // 聚焦目标层（用爆炸后的盒子）
    setTimeout(() => {
      const box = new THREE.Box3()
      floorGroups[index].forEach((m) => box.expandByObject(m))
      focusBox(box, 1.5)
    }, 100)
  }

  function focusRoom(name) {
    if (!building || !roomMeshes[name]) return
    const targetMeshes = new Set(roomMeshes[name])
    building.traverse((m) => {
      if (!m.isMesh) return
      const visible = targetMeshes.has(m)
      m.visible = visible
      if (visible) {
        eachMaterial(m, (mat) => {
          mat.transparent = false
          mat.opacity = 1
          if (mat.userData.originalColor) mat.color.copy(mat.userData.originalColor)
        })
      }
    })
    const box = new THREE.Box3()
    roomMeshes[name].forEach((m) => box.expandByObject(m))
    focusBox(box, 1.6)
    reapplyTransparent()
  }

  // ---------- 材质高亮（building 层级用） ----------
  function highlightMaterial(name) {
    if (!building) return
    if (!name) {
      resetMeshAppearance()
      return
    }
    if (!materialGroups[name]) return
    building.traverse((mesh) => {
      if (!mesh.isMesh) return
      eachMaterial(mesh, (mat) => {
        mat.transparent = true
        mat.opacity = 0.15
        if (mat.userData.originalColor) mat.color.copy(mat.userData.originalColor)
      })
    })
    materialGroups[name].forEach((mesh) => {
      eachMaterial(mesh, (mat) => {
        mat.opacity = 0.85
        mat.transparent = true
        mat.color.set(0x00ffff)
      })
    })
    const box = new THREE.Box3()
    materialGroups[name].forEach((m) => box.expandByObject(m))
    focusBox(box, 1.4)
  }

  function toggleTransparent(on) {
    if (!building) return
    building.traverse((mesh) => {
      if (!mesh.isMesh || !mesh.visible) return
      eachMaterial(mesh, (mat) => {
        mat.transparent = true
        mat.opacity = on ? 0.25 : 1
      })
    })
  }

  function fitView() {
    if (!building) return
    // 依目前层级决定 fit 范围
    if (store.level === 'room' && store.selectedRoom && roomMeshes[store.selectedRoom]) {
      const box = new THREE.Box3()
      roomMeshes[store.selectedRoom].forEach((m) => box.expandByObject(m))
      focusBox(box, 1.6)
    } else if (store.level === 'floor' && floorGroups[store.selectedFloor]) {
      const box = new THREE.Box3()
      floorGroups[store.selectedFloor].forEach((m) => box.expandByObject(m))
      focusBox(box, 1.5)
    } else if (restBuildingBox) {
      focusBox(restBuildingBox, 0.7)
    } else {
      fitCameraToObject()
    }
  }

  // ---------- 事件 ----------
  function bindEvents() {
    container.addEventListener('mousemove', onMouseMove)
    container.addEventListener('mousedown', onMouseDown)
    container.addEventListener('mouseup', onMouseUp)
    container.addEventListener('click', onClick)
    window.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)
  }

  function unbindEvents() {
    container.removeEventListener('mousemove', onMouseMove)
    container.removeEventListener('mousedown', onMouseDown)
    container.removeEventListener('mouseup', onMouseUp)
    container.removeEventListener('click', onClick)
    window.removeEventListener('keydown', onKey)
    window.removeEventListener('resize', onResize)
  }

  function pickerCoords(e) {
    const rect = container.getBoundingClientRect()
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
  }

  function onMouseMove(e) {
    pickerCoords(e)
    const dx = e.clientX - mouseDownPos.x
    const dy = e.clientY - mouseDownPos.y
    if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) isDragging = true

    if (!building) return
    raycaster.setFromCamera(mouse, camera)
    const hit = raycaster.intersectObjects(building.children, true)
    if (hit.length && draggingSection && clippingPlane) {
      sectionY = hit[0].point.y
      clippingPlane.constant = sectionY
    }
  }

  function onMouseDown(e) {
    mouseDownPos.x = e.clientX
    mouseDownPos.y = e.clientY
    isDragging = false
    if (e.shiftKey) draggingSection = true
  }

  function onMouseUp() {
    draggingSection = false
  }

  // 点击行为依层级切换：
  // - building：点击 mesh → 进入该 mesh 所属楼层
  // - floor   ：点击 mesh → 进入该 mesh 所属房间
  // - room    ：点击 mesh → 显示 mesh 详细信息
  function onClick(e) {
    if (draggingSection || isDragging || !building) return
    pickerCoords(e)
    raycaster.setFromCamera(mouse, camera)
    const hits = raycaster.intersectObjects(building.children, true).filter((h) => h.object.visible)
    if (hits.length === 0) return
    const mesh = hits[0].object
    const materialName = Array.isArray(mesh.material)
      ? mesh.material.map((m) => m.name).join(', ')
      : mesh.material?.name || 'unknown'

    store.showInfo(mesh.name || 'Unnamed', materialName)

    if (store.level === 'building') {
      const idx = floorGroups.findIndex((g) => g.includes(mesh))
      if (idx >= 0) store.selectFloor(idx)
    } else if (store.level === 'floor') {
      const roomName = Object.keys(roomMeshes).find((n) => roomMeshes[n].includes(mesh))
      if (roomName) store.enterRoom(roomName)
    }
  }

  function onKey(e) {
    if (e.key === 'Escape') store.goBack()
    if (e.key === 't') store.toggleTransparent()
    if (e.key === 'r') store.resetView()
    if (e.key === 'f') store.fitView()
  }

  function onResize() {
    if (!container || !renderer) return
    const w = container.clientWidth
    const h = container.clientHeight
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
  }

  // ---------- 渲染 ----------
  function animate() {
    if (disposed) return
    rafId = requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
  }

  function dispose() {
    disposed = true
    if (rafId) cancelAnimationFrame(rafId)
    unbindEvents()
    controls?.dispose()
    if (building) {
      building.traverse((child) => {
        if (child.isMesh) {
          child.geometry?.disposeBoundsTree?.()
          child.geometry?.dispose()
          eachMaterial(child, (mat) => mat.dispose())
        }
      })
      scene.remove(building)
    }
    renderer?.dispose()
    if (renderer?.domElement && container.contains(renderer.domElement)) {
      container.removeChild(renderer.domElement)
    }
  }

  // ---------- 启动 ----------
  init()
  animate()

  return {
    loadModel,
    highlightMaterial,
    focusFloor,
    focusRoom,
    showBuilding,
    toggleTransparent,
    fitView,
    dispose
  }
}
