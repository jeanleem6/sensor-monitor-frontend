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
// 进入楼层视角时，剖切面从该层顶部往下切掉的比例（切掉天花板/楼板，俯视看进室内）
const CEILING_CUT = 0.12
// 房间视角配色：房间内部网格(M<编号>)原材质近黑，单独显示时整片发黑，
// 进入房间层级时统一改成可读的中性灰蓝（偏冷，与 UI 协调）。
// 取中等明度而非浅色：场景光照(尤其 decay=0 不衰减的聚光灯)会再叠加亮度，
// 浅色叠光后整片发白刺眼，调暗一档叠光后才落在舒适区间。
const ROOM_COLOR = 0x7c828c

export function createThreeScene(container, store) {
  let scene, camera, renderer, controls
  let building = null
  let clippingPlane = null
  let spotLight = null // 楼顶聚光灯：灯位/朝向待模型加载后依包围盒对准楼顶
  let rafId = null
  let disposed = false

  const raycaster = new THREE.Raycaster()
  const mouse = new THREE.Vector2()

  const materialGroups = {}
  const floorGroups = [] // [meshes[]]，下标即楼层数组序号
  const floorBoxes = [] // Box3[]
  const floorNumbers = [] // floorGroups 下标 → 模型里的真实楼层号(用于显示名)
  const floorNumberToIndex = new Map() // 真实楼层号 → floorGroups 下标
  const roomMeshes = {} // { name: meshes[] }
  const roomMeta = {} // { name: { floorIndex, box, meshCount } }

  let buildingSize = 1
  // 静止状态的 building 盒子；用于回到楼栋视角时正确居中
  let restBuildingBox = null
  // 不剖切时剖切面的 constant（置于模型最高点之上，等效于关闭剖切）
  let noClipConstant = Infinity

  let sectionY = 0
  let draggingSection = false
  let isDragging = false
  const mouseDownPos = { x: 0, y: 0 }

  // canvas 铺满全屏(absolute inset-0)，而两侧面板/顶部面包屑/底部浮动条都是浮在其上的 UI。
  // 若把模型居中到整块 canvas，下半部分会被底部浮动条遮住（楼层视角尤甚），两侧也被面板压住。
  // 解决：让相机去框「可视矩形」= canvas 扣掉两侧面板宽 + 顶部面包屑 + 底部浮动条 后剩下的中间区域，
  // 用 camera.setViewOffset 把这块矩形当作有效视口。模型因此自动居中在浮动条之上、并随折叠/展开
  // 自动放大缩小填满空出的横向空间——无需任何手工缩放系数。
  // 下列常量为对应 Tailwind 类换算的 CSS 像素（REM=16）：
  const REM = 16
  // 两侧面板占据宽度：left/right-3(0.75rem) + 面板宽 w-100(25rem 展开) / w-44(11rem 折叠)
  const SIDE_W_EXPANDED = (0.75 + 25) * REM // 412
  const SIDE_W_COLLAPSED = (0.75 + 11) * REM // 188
  // 顶部面包屑/面板锚定在 top-20(5rem)，再留出按钮高度余量
  const INSET_TOP = 5 * REM + 8 // ~88
  // 底部浮动条 bottom-5(1.25rem) + 条体高度(约 3.5rem) + 余量，保证模型不被其遮挡
  const INSET_BOTTOM = (1.25 + 3.5) * REM + 8 // ~84

  // 当前可视矩形（CSS 逻辑像素）：{x,y,w,h} 为中间可用区域，{W,H} 为整块 canvas
  function computeViewport() {
    const W = container.clientWidth
    const H = container.clientHeight
    const side = store.sidesCollapsed ? SIDE_W_COLLAPSED : SIDE_W_EXPANDED
    const w = Math.max(W - side * 2, 1)
    const h = Math.max(H - INSET_TOP - INSET_BOTTOM, 1)
    return { x: side, y: INSET_TOP, w, h, W, H }
  }

  // 把相机的有效视口对齐到可视矩形：setViewOffset 让整块 canvas 渲染「以可视矩形为画面」的视图，
  // 多出来的部分（面板/浮动条所在区域）正好落到它们背后(canvas z-0 在面板 z-10 之下)。
  // 经此变换后有效投影宽高比仍为 W/H，不产生拉伸。
  function applyViewport() {
    if (!camera) return
    const { x, y, w, h, W, H } = computeViewport()
    camera.aspect = w / h
    camera.setViewOffset(w, h, -x, -y, W, H)
    camera.updateProjectionMatrix()
  }

  // 全局缩放微调：把模型整体再缩小 25%（= 显示尺寸 ×0.75 → 相机距离 ×1/0.75）。
  // 各层级/展开折叠统一受此影响，单独调某层级改对应 margin 即可。
  const GLOBAL_ZOOM = 0.75

  // 楼栋层级 margin：基准 0.85（略溢到面板背后）；折叠时再缩小 20%（显示 ×0.8 → margin ×1/0.8）
  const BUILDING_MARGIN = 0.85
  const buildingMargin = () => (store.sidesCollapsed ? BUILDING_MARGIN / 0.8 : BUILDING_MARGIN)

  // 依相机视线方向 dir 把 box 八角投影到屏幕的横/纵轴，分别按横/纵 FOV 求所需相机距离，取较大者→完整框住。
  // margin 为外边距系数：>1 留白、=1 紧贴、<1 刻意溢出（楼栋视角用于让模型略微溢到面板背后）。
  function distanceToFit(box, dir, margin) {
    const fovY = (camera.fov * Math.PI) / 180
    const fovX = 2 * Math.atan(Math.tan(fovY / 2) * camera.aspect)
    const forward = dir.clone().normalize()
    const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize()
    const up = new THREE.Vector3().crossVectors(right, forward).normalize()
    const half = box.getSize(new THREE.Vector3()).multiplyScalar(0.5)
    let halfW = 0
    let halfH = 0
    for (let sx = -1; sx <= 1; sx += 2) {
      for (let sy = -1; sy <= 1; sy += 2) {
        for (let sz = -1; sz <= 1; sz += 2) {
          const corner = new THREE.Vector3(sx * half.x, sy * half.y, sz * half.z)
          halfW = Math.max(halfW, Math.abs(corner.dot(right)))
          halfH = Math.max(halfH, Math.abs(corner.dot(up)))
        }
      }
    }
    const dW = halfW / Math.tan(fovX / 2)
    const dH = halfH / Math.tan(fovY / 2)
    return (Math.max(dW, dH) * margin) / GLOBAL_ZOOM
  }

  // 视图切换中的延后任务（setTimeout / gsap tween）：用户快速连续切换层级时，
  // 必须取消上一段还未完成的隐藏/淡出/相机动画，否则会覆盖新视图的状态
  let pendingTimeouts = []

  function cancelTransitions() {
    pendingTimeouts.forEach(clearTimeout)
    pendingTimeouts = []
    if (!building) return
    building.traverse((m) => {
      if (!m.isMesh) return
      gsap.killTweensOf(m.position)
      eachMaterial(m, (mat) => gsap.killTweensOf(mat))
    })
    if (camera) gsap.killTweensOf(camera.position)
    if (controls) gsap.killTweensOf(controls.target)
    if (clippingPlane) gsap.killTweensOf(clippingPlane)
  }

  // ---------- 初始化 ----------
  function init() {
    scene = new THREE.Scene()
    scene.background = null

    const { clientWidth: w, clientHeight: h } = container
    camera = new THREE.PerspectiveCamera(60, w / h, 0.01, 1000000)

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    // 高分屏下 devicePixelRatio 可达 2~3，像素量呈平方增长。封顶 2 足够清晰，避免 4~9 倍片元开销
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
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
    // 整体打底光（环境光 + 方向光）刻意压低：聚光灯亮斑要明显，就必须让周围环境暗一档，
    // 否则环境光太强会把模型整体照到接近白，聚光灯那点额外亮度被淹没看不出差别。
    const dir = new THREE.DirectionalLight(0xffffff, 0.7)
    dir.position.set(100, 200, 100)
    scene.add(dir)
    // 顶光：从左上方斜射的聚光灯，在楼顶打出一束明显的亮光斑。
    // 强度给足且 decay=0 不衰减，使光锥内显著高于环境光 → 亮斑与周围拉开对比、清晰可见；
    // angle 控制光锥张角(越小越聚拢)、penumbra 让光斑边缘柔和过渡。
    // 灯位与 target 此时是占位值，待模型加载后由 aimSpotAtRoof() 依包围盒对准真正的楼顶。
    spotLight = new THREE.SpotLight(0xffffff, 6, 0, Math.PI / 9, 0.3, 0)
    scene.add(spotLight)
    scene.add(spotLight.target)
    scene.add(new THREE.AmbientLight(0xffffff, 0.55))
  }

  // 把聚光灯对准楼顶：灯放在楼顶左上方，target 指向屋顶中心，使光束落在楼顶而非中下部。
  // 必须在模型加载并居中(normalizeModel)后调用——此时才知道包围盒/楼顶高度与模型尺度。
  function aimSpotAtRoof() {
    if (!spotLight || !restBuildingBox) return
    const size = restBuildingBox.getSize(new THREE.Vector3())
    const center = restBuildingBox.getCenter(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    const roofY = restBuildingBox.max.y
    const pos = new THREE.Vector3(center.x - maxDim * 0.4, roofY + maxDim * 0.8, center.z + maxDim * 0.4)
    const target = new THREE.Vector3(center.x, roofY, center.z)
    spotLight.position.copy(pos)
    spotLight.target.position.copy(target)
    spotLight.target.updateMatrixWorld()

    // 自适应光锥张角：取灯到包围盒八角中相对光轴的最大偏角，确保整栋(含左侧/远侧)都落在锥内。
    // ×1.12 留一点余量；钳到 60° 以内避免极端比例下光锥过宽失去"光束"的聚拢感。
    const axis = target.clone().sub(pos).normalize()
    let maxHalf = 0
    for (let sx = -1; sx <= 1; sx += 2) {
      for (let sy = -1; sy <= 1; sy += 2) {
        for (let sz = -1; sz <= 1; sz += 2) {
          const corner = new THREE.Vector3(
            sx < 0 ? restBuildingBox.min.x : restBuildingBox.max.x,
            sy < 0 ? restBuildingBox.min.y : restBuildingBox.max.y,
            sz < 0 ? restBuildingBox.min.z : restBuildingBox.max.z
          )
          const toCorner = corner.sub(pos).normalize()
          maxHalf = Math.max(maxHalf, Math.acos(THREE.MathUtils.clamp(axis.dot(toCorner), -1, 1)))
        }
      }
    }
    spotLight.angle = Math.min(maxHalf * 1.12, Math.PI / 3)
  }

  // ---------- 模型加载 ----------
  function loadModel() {
    return new Promise((resolve, reject) => {
      const mtlLoader = new MTLLoader()
      mtlLoader.setPath('/model/')
      mtlLoader.load(
        'building.mtl',
        (materials) => {
          materials.preload()
          const objLoader = new OBJLoader()
          objLoader.setMaterials(materials)
          objLoader.setPath('/model/')
          objLoader.load(
            'building.obj',
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
    aimSpotAtRoof() // 包围盒已知，把楼顶聚光灯对准真正的屋顶
    fitCameraToObject()
  }

  // margin：外边距系数（见 distanceToFit）。楼栋默认 0.85，让整栋略微溢到两侧面板背后，更具沉浸感
  function fitCameraToObject(margin = 0.85, topRatio = 0.6) {
    const box = new THREE.Box3().setFromObject(building)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    buildingSize = maxDim

    applyViewport()
    const dir = new THREE.Vector3(1, topRatio, 1)
    const distance = distanceToFit(box, dir, margin)
    camera.position.copy(center.clone().add(dir.clone().normalize().multiplyScalar(distance)))
    camera.near = maxDim / 100
    camera.far = maxDim * 100
    camera.updateProjectionMatrix()

    controls.target.copy(center)
    controls.maxDistance = maxDim * 20
    controls.update()

    // 剖切面法线朝下：切掉 y > constant 的部分。constant 默认置于模型顶部之上 → 不剖切
    noClipConstant = box.max.y + maxDim
    if (!clippingPlane) clippingPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), noClipConstant)
    else clippingPlane.constant = noClipConstant
  }

  // 把镜头平滑动画到「框住 box」的位置。
  // margin：外边距系数；topRatio：视线垂直抬升比例（默认 0.6 斜视，楼层剖切用更大值偏俯视看进室内）。
  // 每次都先 applyViewport()：折叠/展开后可视矩形宽高比变了，相机距离须据此重算才能恰好填满中间区域。
  function focusBox(box, margin = 1.1, { topRatio = 0.6 } = {}) {
    if (!box || box.isEmpty()) return
    applyViewport()
    const center = box.getCenter(new THREE.Vector3())
    const dir = new THREE.Vector3(1, topRatio, 1)
    const distance = distanceToFit(box, dir, margin)
    const targetPos = center.clone().add(dir.clone().normalize().multiplyScalar(distance))
    gsap.to(camera.position, { x: targetPos.x, y: targetPos.y, z: targetPos.z, duration: 1.0 })
    gsap.to(controls.target, { x: center.x, y: center.y, z: center.z, duration: 1.0 })
  }

  // ---------- Mesh 处理 ----------
  function eachMaterial(mesh, cb) {
    if (!mesh.material) return
    if (Array.isArray(mesh.material)) mesh.material.forEach((m) => m && cb(m))
    else cb(mesh.material)
  }

  // 按材质合并几何分组：导出端把同材质的面来回穿插（本模型 8 种材质却有近万次 usemtl 切换），
  // OBJLoader 对每次切换都生成一个 draw group，渲染时即近万次 draw call。
  // 这里把同 materialIndex 的顶点重排为连续段，使每种材质只剩 1 个 group → draw call 降到材质数量级。
  // 仅处理 OBJLoader 输出的非索引几何，且必须在 computeBoundsTree（会生成索引）之前调用。
  function compactGeometryByMaterial(geometry) {
    const groups = geometry.groups
    if (geometry.index || !groups || groups.length <= 1) return

    // 按首次出现顺序，将各 group 的顶点区间按 materialIndex 归桶
    const order = []
    const buckets = new Map()
    for (const g of groups) {
      const mi = g.materialIndex ?? 0
      if (!buckets.has(mi)) {
        buckets.set(mi, [])
        order.push(mi)
      }
      buckets.get(mi).push([g.start, g.count])
    }
    if (order.length === groups.length) return // 已是一材质一分组，无可合并

    const attrs = geometry.attributes
    const names = Object.keys(attrs)
    const dst = {}
    for (const name of names) dst[name] = new attrs[name].array.constructor(attrs[name].array.length)

    const newGroups = []
    let cursor = 0 // 已写入的顶点数
    for (const mi of order) {
      const start = cursor
      for (const [s, count] of buckets.get(mi)) {
        for (const name of names) {
          const is = attrs[name].itemSize
          dst[name].set(attrs[name].array.subarray(s * is, (s + count) * is), cursor * is)
        }
        cursor += count
      }
      newGroups.push({ start, count: cursor - start, materialIndex: mi })
    }

    for (const name of names) {
      geometry.setAttribute(name, new THREE.BufferAttribute(dst[name], attrs[name].itemSize))
    }
    geometry.clearGroups()
    newGroups.forEach((g) => geometry.addGroup(g.start, g.count, g.materialIndex))
  }

  // 楼栋/楼层层级沿用模型自带的材质色，但其"白色"墙体/楼板的 Kd 实际偏灰，
  // 渲染出来发暗发灰。这里只把近中性（低饱和度）的浅灰/白材质提亮到接近纯白，
  // 带明显色相的材质（蓝/绿/木色等）以及近黑的房间内部网格都保持原色不动。
  // 墙体"白色"构件 MTL 里 Kd 是 0.33 灰，经 three 的 sRGB→linear 转换后 mat.color 实际约 0.088
  // （即诊断里看到的 0.09），加上暗场景光照偏弱，渲染出来发暗发灰。
  // 注意：下列阈值都按 linear 空间取值（不是 MTL 里的 sRGB 数字）。
  // 仅对"近乎纯中性、且属最亮一档"的灰下手：把漫反射提到柔和的浅灰白，并叠加少量自发光
  // （emissive 不受场景光照影响，能把背光/侧光面也托起来消除发灰，但过量会让整片墙体发白刺眼）。
  // 取值经过收敛：色相提到 0.82 的中性浅灰（而非纯白），emissive 仅 0.12 微微补光，
  // 整体亮度与房间浅色(0xccd6e4)及场景光照协调，人眼看久不累。
  // 其余更暗的灰(lambert5SG≈0.023 / 玻璃≈0.019)、带色相的木色(通道差大)及近黑构件均保持原色不动。
  // 目标亮度（linear 空间）：略低于纯白的中性浅灰，兼顾通透与不刺眼
  const NEUTRAL_LEVEL = 0.25
  const NEUTRAL_EMISSIVE = 0.01
  function brightenNeutral(mat) {
    const color = mat.color
    const max = Math.max(color.r, color.g, color.b)
    const min = Math.min(color.r, color.g, color.b)
    if (max - min > 0.03) return // 通道差大 → 有色相（木色等），不是"白色"，不动
    if (max < 0.04) return // 比最亮的白墙(≈0.088)更暗 → 不属于"白色"，不动
    color.setScalar(NEUTRAL_LEVEL)
    if (mat.emissive) mat.emissive.setScalar(NEUTRAL_EMISSIVE)
  }

  function prepareMeshes() {
    let groupsBefore = 0
    let groupsAfter = 0
    building.traverse((child) => {
      if (!child.isMesh) return
      groupsBefore += child.geometry.groups?.length || 0
      compactGeometryByMaterial(child.geometry)
      groupsAfter += child.geometry.groups?.length || 0
      child.geometry.computeBoundsTree()
      // 克隆出每个 mesh 独占的材质：OBJLoader 让多个 mesh 共用同一材质实例，
      // 而高亮/透明/复原都是按 mesh 改材质，共用会串扰（如选中层被其它层的淡出连带变透明 → 看不到）
      if (Array.isArray(child.material)) child.material = child.material.map((m) => m.clone())
      else child.material = child.material.clone()
      eachMaterial(child, (mat) => {
        // 先把偏灰的"白色"构件提亮，其它颜色不动；
        // 再以提亮后的颜色作为复原色记录，使重置/高亮后仍保持提亮效果
        brightenNeutral(mat)
        // 保留模型原始楼栋颜色与贴图，仅记录原色用于高亮后复原；
        // DoubleSide：剖切掉天花板后能看到墙体内侧面，俯视进室内不至于穿透成空壳
        mat.userData.originalColor = mat.color.clone()
        mat.clippingPlanes = [clippingPlane]
        mat.side = THREE.DoubleSide
        mat.needsUpdate = true
      })
    })
    if (groupsBefore > groupsAfter) {
      console.info(`[useThreeScene] 几何分组合并：${groupsBefore} → ${groupsAfter} 个 draw 分组`)
    }
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

  // ---------- 楼层/房间识别（优先用模型自带的组名，失败回退空间启发式） ----------
  // 模型组名形如 "group1 f3_c M317"：f<N> 为楼层号，f<N>_c 内带 M<编号> 的为房间。
  // OBJLoader 会把 g 组名原样写到 mesh.name（three r0.160）。
  function parseFloorNumber(name) {
    const m = /\bf(\d+)/i.exec(name || '')
    return m ? parseInt(m[1], 10) : null
  }
  // 仅 f<N>_c 容器内、且带 M 编号的 mesh 才算房间；M340_1 归并到 M340；polySurface 不算房间
  function parseRoomId(name) {
    if (!name || !/f\d+_c/i.test(name)) return null
    const m = /\bM(\d+)/.exec(name)
    return m ? 'M' + m[1] : null
  }

  function detectFloors() {
    // 优先：按组名里的楼层号 f<N> 分层，排除 f0（地面/室外，不作为可点击楼层）
    const byFloor = new Map() // 楼层号 → meshes[]
    let named = 0
    building.traverse((o) => {
      if (!o.isMesh) return
      const fn = parseFloorNumber(o.name)
      if (fn == null) return
      named++
      if (fn === 0) {
        o.userData.isGround = true // f0 地面：保持可见但不归入任何楼层，点击不进入
        return
      }
      if (!byFloor.has(fn)) byFloor.set(fn, [])
      byFloor.get(fn).push(o)
    })

    if (named === 0 || byFloor.size === 0) {
      detectFloorsBySpace() // 兜底：模型无 f<N> 命名时退回原空间启发式
      return
    }

    ;[...byFloor.keys()]
      .sort((a, b) => a - b)
      .forEach((fn) => {
        const meshes = byFloor.get(fn)
        const box = new THREE.Box3()
        meshes.forEach((m) => box.expandByObject(m))
        floorGroups.push(meshes)
        floorBoxes.push(box)
        floorNumbers.push(fn)
        floorNumberToIndex.set(fn, floorGroups.length - 1)
      })
  }

  // 兜底：用 bbox 中心 Y 来分楼层，自适应阈值（OBJLoader 出来 mesh.position 通常都是 0）
  function detectFloorsBySpace() {
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

    floorGroups.forEach((meshes, i) => {
      const box = new THREE.Box3()
      meshes.forEach((m) => box.expandByObject(m))
      floorBoxes.push(box)
      floorNumbers.push(i + 1)
      floorNumberToIndex.set(i + 1, i)
    })
  }

  function detectRooms() {
    // 优先：按组名里的房间号 M<编号> 聚合（polySurface 等无编号构件不算房间，留在楼层结构里）
    const byRoom = new Map()
    building.traverse((m) => {
      if (!m.isMesh) return
      const rid = parseRoomId(m.name)
      if (!rid) return
      if (!byRoom.has(rid)) byRoom.set(rid, [])
      byRoom.get(rid).push(m)
    })

    if (byRoom.size === 0) {
      detectRoomsBySpace() // 兜底：模型无 M 命名时退回原空间聚类
      return
    }

    ;[...byRoom.keys()]
      .sort((a, b) => parseInt(a.slice(1), 10) - parseInt(b.slice(1), 10))
      .forEach((rid) => {
        roomMeshes[rid] = byRoom.get(rid)
      })
  }

  // 兜底：用 bbox 中心做空间聚类，阈值与模型大小成正比
  function detectRoomsBySpace() {
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

      // 优先用房间 mesh 名里的楼层号定位所属楼层；解析不到再退回按 bbox 中心 Y 就近匹配
      const fn = parseFloorNumber(meshes[0]?.name)
      let floorIndex = floorNumberToIndex.has(fn) ? floorNumberToIndex.get(fn) : -1
      if (floorIndex < 0) {
        const cy = (box.min.y + box.max.y) / 2
        let bestDist = Infinity
        floorBoxes.forEach((fb, i) => {
          const fy = (fb.min.y + fb.max.y) / 2
          const d = Math.abs(fy - cy)
          if (d < bestDist) {
            bestDist = d
            floorIndex = i
          }
        })
        if (floorIndex < 0) floorIndex = 0
      }
      roomMeta[name] = { floorIndex, box, meshCount: meshes.length }
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
        name: `F${floorNumbers[i] ?? i + 1}`,
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

  // 平滑移动剖切面到目标高度（关闭剖切传 noClipConstant）
  function animateClip(targetConstant) {
    if (!clippingPlane) return
    gsap.to(clippingPlane, { constant: targetConstant, duration: 0.8, ease: 'power2.out' })
  }

  // 视图切换后，依 store.transparentMode 重新套用透明状态，避免 UI 与模型不同步
  function reapplyTransparent() {
    if (store.transparentMode) toggleTransparent(true)
  }

  function showBuilding() {
    if (!building) return
    cancelTransitions()
    resetMeshAppearance()
    // 收起剖切面，整栋恢复完整
    animateClip(noClipConstant)
    // 用静止盒子平滑动画镜头；gsap 会覆盖前一个 focusFloor/focusRoom 未完成的 camera tween
    if (restBuildingBox) focusBox(restBuildingBox, buildingMargin())
    else fitCameraToObject(buildingMargin())
    reapplyTransparent()
  }

  // 剖切俯视：剖切面下切到所选层顶部之下（切掉天花板与其以上所有楼层），从上往下看进本层室内。
  // 楼层不再爆炸——爆炸会把高层推过剖切面导致整层消失（即此前“点 f4 只剩 f0”的根因）。
  function focusFloor(index) {
    if (!building || !floorGroups[index] || !floorBoxes[index]) return
    cancelTransitions()
    resetMeshAppearance()
    reapplyTransparent()

    // 切到本层顶部往下 CEILING_CUT 处：高于此的天花板与所有上层被剖掉，本层室内露出
    const fbox = floorBoxes[index]
    const fHeight = Math.max(fbox.max.y - fbox.min.y, 1e-3)
    const cutC = fbox.max.y - fHeight * CEILING_CUT
    animateClip(cutC)

    // 偏俯视聚焦本层，看进剖开的室内。margin=1.0：刚好把本层完整框进可视矩形（浮动条之上），不再被遮挡
    focusBox(fbox, 1.0, { topRatio: 1.3 })
  }

  function focusRoom(name) {
    if (!building || !roomMeshes[name]) return
    cancelTransitions()
    // 进入房间只显示该房间网格，无需剖切：收起剖切面避免房间被楼层剖切面误切
    animateClip(noClipConstant)
    const targetMeshes = new Set(roomMeshes[name])
    building.traverse((m) => {
      if (!m.isMesh) return
      const visible = targetMeshes.has(m)
      m.visible = visible
      if (visible) {
        eachMaterial(m, (mat) => {
          mat.transparent = false
          mat.opacity = 1
          // 房间内部网格原色近黑，改用可读浅色（离开房间层级时 resetMeshAppearance 复原）
          mat.color.set(ROOM_COLOR)
        })
      }
    })
    const box = new THREE.Box3()
    roomMeshes[name].forEach((m) => box.expandByObject(m))
    focusBox(box, 1.15)
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
    focusBox(box, 1.05)
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
      focusBox(box, 1.15)
    } else if (store.level === 'floor' && floorBoxes[store.selectedFloor]) {
      // 与 focusFloor 一致：偏俯视看进剖开的本层室内
      focusBox(floorBoxes[store.selectedFloor], 1.0, { topRatio: 1.3 })
    } else if (restBuildingBox) {
      focusBox(restBuildingBox, buildingMargin())
    } else {
      fitCameraToObject(buildingMargin())
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
    const dx = e.clientX - mouseDownPos.x
    const dy = e.clientY - mouseDownPos.y
    if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) isDragging = true

    // 仅在按住 shift 拖拽剖切面时才需要射线检测；平时鼠标移动不做无谓的全模型 raycast
    if (!draggingSection || !building || !clippingPlane) return
    pickerCoords(e)
    raycaster.setFromCamera(mouse, camera)
    const hit = raycaster.intersectObjects(building.children, true)
    if (hit.length) {
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
    // raycaster 不感知剖切面：被剖掉(y > 剖切面 constant)的几何仍会被射线命中。
    // 楼层视角下若不过滤，俯视点房间会先打到被切走的天花板/上层 → 取错网格。
    const cut = clippingPlane ? clippingPlane.constant : Infinity
    const hits = raycaster
      .intersectObjects(building.children, true)
      .filter((h) => h.object.visible && h.point.y <= cut + buildingSize * 1e-3)
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
      // 多数网格是墙体/结构(polySurface)，不属于任何房间，精确归属命中率极低。
      // 先按精确归属，命中不到则用命中点落在哪个房间盒子来判定（可点墙体/地面进房间）。
      let roomName = Object.keys(roomMeshes).find((n) => roomMeshes[n].includes(mesh))
      if (!roomName) roomName = findRoomByPoint(hits[0].point, store.selectedFloor)
      if (roomName) store.enterRoom(roomName)
    }
  }

  // 由命中点定位房间：优先落在盒子内、且属当前层的房间；否则取当前层内最近的房间盒子（带距离阈值）
  function findRoomByPoint(point, preferFloorIndex) {
    let contained = null
    let containedOnFloor = null
    Object.entries(roomMeta).forEach(([name, meta]) => {
      if (!meta.box.containsPoint(point)) return
      if (!contained) contained = name
      if (meta.floorIndex === preferFloorIndex && !containedOnFloor) containedOnFloor = name
    })
    if (containedOnFloor) return containedOnFloor
    if (contained) return contained

    // 兜底：当前层内最近的房间中心，限制在合理距离内，避免点空白处跳到远处房间
    const maxDist = buildingSize * 0.2
    let nearest = null
    let nd = Infinity
    Object.entries(roomMeta).forEach(([name, meta]) => {
      if (preferFloorIndex != null && meta.floorIndex !== preferFloorIndex) return
      const d = meta.box.getCenter(new THREE.Vector3()).distanceTo(point)
      if (d < nd) {
        nd = d
        nearest = name
      }
    })
    return nd <= maxDist ? nearest : null
  }

  function onKey(e) {
    if (e.key === 'Escape') store.goBack()
    if (e.key === 't') store.toggleTransparent()
    if (e.key === 'r') store.resetView()
    if (e.key === 'f') store.fitView()
    if (e.key === '\\') store.toggleSides()
  }

  function onResize() {
    if (!container || !renderer) return
    renderer.setSize(container.clientWidth, container.clientHeight)
    // 重新对齐可视矩形：applyViewport 会据新尺寸设置 aspect、view offset 并刷新投影
    applyViewport()
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
