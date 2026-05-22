import DefaultLayout from '@/layouts/DefaultLayout.vue'
import ViewerView from '@/views/ViewerView.vue'
import GridView from '@/views/GridView.vue'

export default [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      {
        path: '',
        name: 'viewer',
        component: ViewerView,
        meta: { title: 'Dashboard' }
      },
      {
        path: 'grid',
        name: 'grid',
        component: GridView,
        meta: { title: 'Grid' }
      }
    ]
  }
]
