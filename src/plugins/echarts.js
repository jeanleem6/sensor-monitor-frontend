import * as echarts from 'echarts/core'
import {
  LineChart,
  BarChart,
  PieChart,
  ScatterChart,
  HeatmapChart
} from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  VisualMapComponent,
  MarkLineComponent,
  MarkAreaComponent,
  MarkPointComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { LabelLayout, UniversalTransition } from 'echarts/features'

echarts.use([
  LineChart,
  BarChart,
  PieChart,
  ScatterChart,
  HeatmapChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  VisualMapComponent,
  MarkLineComponent,
  MarkAreaComponent,
  MarkPointComponent,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer
])

export default echarts
