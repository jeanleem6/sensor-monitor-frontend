# 左右面板折叠 / 展开 规划

> 目标：在 building / floor / room 三个层级下，提供"两侧面板一键折叠"的能力。
> 折叠后两侧整体收窄，仅保留必要的关键指标，把 3D 场景的可视区域最大化。

---

## 1. 目标 & 非目标

### 1.1 目标

- 三个层级（building / floor / room）都支持折叠 / 展开两侧面板。
- 折叠按钮浮动放置在 `LevelBreadcrumb` 旁边（顶部居中区域）。
- 折叠后左右两栏整体收窄，只展示每个层级最关键的概览数据（详见 §6）。
- 切换有过渡动画，状态在 session 内被记住（全局单一开关）。
- 折叠态保留可点击交互（如 Top3 / 房间项 → `enterRoom`）。

### 1.2 非目标（本期不做）

- **底栏宽度联动**：`BuildingAlarmStrip` / `LevelBottomPanel` 的 `left-108 right-108` 保持不变（已确认）。
- **左右分别独立折叠**：默认对称折叠。
- **持久化到 localStorage**：先做会话内记忆。
- **窗口宽度阈值自动折叠**：先手动控制。

---

## 2. 现状速览

| 元素 | 位置 / 类 | 说明 |
| --- | --- | --- |
| 左侧栏 | [LevelLeftPanel.vue](../src/components/panels/LevelLeftPanel.vue) — `.level-side left-3` | 通过 `level` 切换 Building/Floor/Room 三个 LeftPanel |
| 右侧栏 | [LevelRightPanel.vue](../src/components/panels/LevelRightPanel.vue) — `.level-side right-3` | 同上 |
| 面包屑 | [LevelBreadcrumb.vue](../src/components/layout/LevelBreadcrumb.vue) — `absolute left-1/2 top-20 z-20` | 顶部居中，包含"← 返回"按钮 + 层级链 |
| 公共类 | [style.css:79](../src/style.css#L79) — `.level-side` | `absolute top-20 bottom-5 z-10 w-100 ...` |
| 状态源 | [stores/viewer.js](../src/stores/viewer.js) | `level` / `breadcrumb` / `goBack` / `goTo` 等 |

侧栏宽度由 `.level-side` 的 `w-100` 决定（400px）。底栏 `left-108 right-108` 本期不联动，折叠态会出现明显非对称留白，已接受。

---

## 3. 状态设计

在 `useViewerStore` 增加全局共享的折叠状态（三层级共用一个开关）：

```js
const sidesCollapsed = ref(false)
const toggleSides = () => { sidesCollapsed.value = !sidesCollapsed.value }
```

**已确认**：使用单一全局状态，不按层级独立记忆。优点：实现简单、行为一致、用户不会被"层级切换后状态突变"反向打扰。

---

## 4. 触发器 UI（折叠按钮）

放在 `LevelBreadcrumb` 内部的最右侧（"← 返回"在最左、面包屑居中、折叠开关在最右），整体仍居中浮动。

```text
[← 返回]   [整栋楼 / 5F / 会议室B]   [⤡ 折叠 / ⤢ 展开]
```

- 图标：展开态用 `lucide:panel-left-close`（或 `lucide:minimize-2`）；折叠态用 `lucide:panel-left-open`（或 `lucide:maximize-2`）。
- 单按钮（同时控制左右），点击触发 `store.toggleSides()`。
- 样式沿用面包屑现有的 `px-3 py-1.5 border-primary/40 bg-primary/4 backdrop-blur` 风格保持视觉一致。
- 加 `title="折叠两侧面板 (\)"` 与 `aria-label`，提示键位（见 §7 快捷键）。

---

## 5. 尺寸策略

`.level-side` 加一个动态宽度 class，由 `sidesCollapsed` 控制：

```html
<div :class="['level-side left-3', sidesCollapsed ? 'w-44' : 'w-100']">
```

- **展开宽度**：`w-100`（400px，现状）
- **折叠宽度**：`w-44`（176px）—— 经评估，120px 太窄；"用电负荷 12.5 MW"这类 label+value 需要 ≥150px；`w-44` 给图标 + label + 数值 + 单位留下合理空间，最终值在视觉对齐时仍可微调（建议范围 160–192px / `w-40` ~ `w-48`）。
- **过渡**：`.level-side` 加 `transition-[width] duration-300 ease-out`。

---

## 6. 折叠态内容策略

通用原则：

- 折叠态隐藏每个 `BasePanel` 的标题装饰块（标题 SVG 占高度太多）。如保留小标题，使用 14px 简洁文字标签即可。
- 整体优先纯数据（label + 大数值 + 单位 + 状态色），不要图表 / 仪表盘。
- 项目数多的板块（如摄像头清单、CO₂/红外房间列表）使用**上下纵向轮播**节省高度。
- 可点击项保留点击 → `enterRoom` / 打开 modal，与展开态行为一致。

### 6.1 Building（楼栋总览）

| 侧 | 来源板块 | 折叠态展示 |
| --- | --- | --- |
| 左 | 全参数气象站（7） | 温度 24.6°C / 湿度 87% / 露点 15.8°C / 气压 1013 hPa / 风向 ENE 67° / 风速 3.2 m/s / 降水量 78.0 mm |
| 左 | 太阳辐射观测系统（3） | 直接辐射 786 W/m² / 散射辐射 142 W/m² / 光谱辐射 923 W/m² |
| 右 | 摄像头监控 | 总数 6 / 在线 4 / 离线 2 + 摄像头列表上下轮播（主入口 / 大堂 / 东侧通道 / 电梯厅 / 西侧通道 / 停车场） |
| 右 | 监测能耗·水·环境 | 用电：用电量 / 用电负荷 / 峰值负荷 / 面积能耗 / 碳排放量 / 用能费用；用水：日用水量 / 用水负荷 / 用水费用；环境：楼层总数 / 平均温度 / 平均湿度 / CO₂ 浓度 |

**密度评估**：左 10 项宽松；右约 22 项偏密，1080p 临界。摄像头列表使用轮播后可见行减半，1080p 可稳定承载。

### 6.2 Floor（楼层）

| 侧 | 来源板块 | 折叠态展示 |
| --- | --- | --- |
| 左 | 环境传感器（4） | 温度传感器 20/15 / 湿度传感器 3/32 / 二氧化碳传感器 27 / 红外线传感器 9/28 |
| 左 | 能耗监测设备（4） | 整体在线率 90% 18/20 / 水表 18/20 / 照明插座电表 18/20 / 空调电表 18/20 |
| 左 | 能耗监测总量（3） | 空调能耗 337.0 kWh / 照明插座 164.8 kWh / 用水量 4.60 m³ |
| 右 | 温湿度监测（2） | 平均温度 22.3°C / 平均湿度 50%（含舒适区提示 22-26°C · 40-60%） |
| 右 | 二氧化碳监测 | 房间 × ppm 上下轮播（办公室 A 1072 / B 1435 / C 924 / D 769），状态色继承 |
| 右 | 红外线监测 | 房间 × 有/无人上下轮播，使用图标（如 `mdi:account` / `mdi:account-off-outline`）替代文字 |

### 6.3 Room（房间）

| 侧 | 来源板块 | 折叠态展示 |
| --- | --- | --- |
| 左 | 空调能耗 | 119.1 kWh 今日 + 峰值时段 08:00 / 14.5 kWh/h |
| 左 | 灯光插座能耗 | 35.0 kWh 今日 + 月均最高 49.8 kWh/日 |
| 左 | 红外线传感器 | 图标 + 房间：有人 / 空闲 |
| 右 | 温度监测 | 圆环 22.3°C |
| 右 | 湿度监测 | 圆环 50% |
| 右 | 二氧化碳监测 | 圆环 888 ppm |

Room 右侧的圆环仪表本身就紧凑，可直接保留小尺寸版本（如 `GaugeRing :size="60"`）。

### 6.4 实现方式

每个子 panel（如 `BuildingRightPanel`）内部用 `v-if="sidesCollapsed"` 切换两套模板：

```vue
<template v-if="!sidesCollapsed">
  <!-- 当前完整内容 -->
</template>
<template v-else>
  <CollapsedSummary :metrics="..." />
</template>
```

抽公共组件 `components/panels/CollapsedSummary.vue`，支持两种渲染模式：

1. **静态列表**：直接渲染 `metrics: [{ icon, label, value, unit, status }]`。
2. **轮播列表**：传 `marquee: true` 时使用 `animate-[marquee-vertical_...s_linear_infinite]`（参考 `BuildingAlarmStrip` 的水平 marquee 改纵向），支持 hover 暂停。

---

## 7. 过渡 & 交互细节

- **宽度过渡**：`.level-side` 上的 `transition-[width] duration-300 ease-out`。
- **内容切换**：用 Vue `<Transition mode="out-in">` 做淡入淡出，避免 v-if 闪烁。
- **快捷键**：`\` 键 toggle（与现有 `Esc` 返回、`T` 透明、`F` 适配、`R` 重设保持单字符风格）。在 `ThreeViewer` 或全局快捷键挂载点（参考现有 `T/F/R` 注册处）补一行。
- **点击穿透**：折叠态的可点击项（如轮播中的房间名、Top3）仍调用 `store.enterRoom(name)`。

---

## 8. 实施步骤（建议 3 个 commit）

### 8.1 Commit 1 — 基建：状态 + 触发器 + 宽度动画

- `stores/viewer.js`：加 `sidesCollapsed` / `toggleSides`，导出。
- `LevelBreadcrumb.vue`：右侧加折叠按钮。
- `style.css` 或 `.level-side`：加 `transition-[width]`。
- `LevelLeftPanel.vue` / `LevelRightPanel.vue`：根据 `sidesCollapsed` 切换 `w-100` / `w-44`。
- 全局快捷键 `\` 绑定。
- 此时折叠态会"挤"出原内容（视觉乱），但已可演示宽度动画。

### 8.2 Commit 2 — 折叠态内容

- 新增 `components/panels/CollapsedSummary.vue`（公共展示组件，支持静态 + 纵向轮播两种模式）。
- 6 个子面板（3 层级 × 左右）各自补 `<template v-else>` 折叠态视图，按 §6 表格喂入数据。
- 折叠态隐藏 `BasePanel` 的标题装饰，使用紧凑小标题。
- 校准 `w-44` 的实际值，确保不同分辨率下视觉协调。

### 8.3 Commit 3 — 视觉打磨

- 圆环 / 状态色 / 图标在窄宽下的对齐微调。
- Building 右侧密度复核（必要时把"用能费用 / 用水费用"等非关键项移除）。
- 文档与 README 同步更新。

---

## 9. 风险 / 注意点

- **ECharts 容器**：折叠态用 `v-if` 把图表卸载是安全的；不要用 `v-show`，否则 echarts resize 计算会受 0 宽度影响导致警告。
- **min-h / flex-X 类**：现有 panel 大量使用 `flex-1 min-h-max / flex-5 min-h-46` 等，折叠态用独立模板，避免这些 class 在窄宽下产生溢出。
- **滚动条**：`.level-side` 当前是 `overflow-y-auto`，折叠态内容应控制在不出滚动条；超出请改用轮播。
- **底栏视觉不协调**：本期未做联动，折叠态下底栏的 `left-108 right-108` 会比侧栏宽很多。已接受。
- **可访问性**：折叠按钮加 `aria-label` 和 `title`，方便键盘用户。

---

## 10. 验收清单

- [ ] 三个层级下都能点击按钮折叠 / 展开
- [ ] `\` 快捷键工作正常，与 `Esc/T/F/R` 不冲突
- [ ] 折叠态宽度过渡平滑无闪烁
- [ ] 各层级折叠态展示内容符合 §6 的策略
- [ ] 折叠态隐藏面板标题装饰，整体视觉紧凑
- [ ] 数据量大的板块（摄像头 / CO₂ / 红外）使用纵向轮播
- [ ] 折叠态点击关键项仍能跳转（如 enterRoom）
- [ ] 1080p 与 1440p 下 Building 右侧无溢出
