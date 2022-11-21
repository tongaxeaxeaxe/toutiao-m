import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

// 路由表
const routes = [
  {
    path: '/login',
    name: 'login',
    // 路由懒加载，用哪个加载哪个，好处：提高页面的加载性能
    component: () => import('@/views/login/index-login.vue')
  },
  {
    path: '/',
    redirect: '/home',
    // name: 'layout', // 如果父路由有默认子路由，那他的name就没有意义，可以省略
    component: () => import('@/views/layout/index-layout.vue'),
    children: [
      {
        path: '/home', // 为空是默认子路由, 只能有一个
        name: 'home',
        component: () => import('@/views/home/index-home.vue')
      },
      {
        path: '/qa',
        name: 'qa',
        component: () => import('@/views/qa/index-qa.vue')
      },
      {
        path: '/video',
        name: 'video',
        component: () => import('@/views/video/index-video.vue')
      },
      {
        path: '/my',
        name: 'my',
        component: () => import('@/views/my/index-my.vue')
      }
    ]
  },
  {
    path: '/search',
    name: 'search',
    component: () => import('@/views/search/index-search.vue')
  },
  {
    path: '/article/:articleId',
    name: 'article',
    component: () => import('@/views/article/index-article.vue'),
    // 开启Props传参，就是把路由参数映射到组件的 props 数据中
    props: true
  },
  {
    path: '/user/profile',
    name: 'user-profile',
    component: () => import('@/views/user-profile')
  }
]

const router = new VueRouter({
  routes
})

export default router
