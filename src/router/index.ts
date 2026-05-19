import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Home.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/Register.vue'),
    },
    {
      path: '/forgot-password',
      name: 'forgotPassword',
      component: () => import('../views/ForgotPassword.vue'),
    },
    {
      path: '/news/:id',
      name: 'newsDetail',
      component: () => import('../views/NewsDetail.vue'),
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/Profile.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/profile/info',
      name: 'personalInfo',
      component: () => import('../views/PersonalInfo.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/collection',
      name: 'collection',
      component: () => import('../views/Collection.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/history',
      name: 'history',
      component: () => import('../views/History.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/search',
      name: 'searchResults',
      component: () => import('../views/SearchResults.vue'),
    },
    {
      path: '/ai',
      name: 'aiAssistant',
      component: () => import('../views/AIAssistant/index.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/editor',
      name: 'newsEditor',
      component: () => import('../views/NewsEditor.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/drafts',
      name: 'drafts',
      component: () => import('../views/Drafts.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/my-published',
      name: 'myPublished',
      component: () => import('../views/MyPublished.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

// 这是一个路由守卫。
// 受保护路由被打开之前需要完成鉴权操作（authStore保存着当前用户的授权信息）。
router.beforeEach((to) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return '/login'
  }
})

export default router
