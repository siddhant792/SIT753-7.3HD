import { defineAsyncComponent } from 'vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: defineAsyncComponent(() => import('../views/AppHome.vue')),
  },
  {
    path: '/login',
    name: 'login',
    component: defineAsyncComponent(() => import('../views/UserLogin.vue')),
  },
  {
    path: '/register',
    name: 'register',
    component: defineAsyncComponent(() => import('../views/UserRegister.vue')),
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: defineAsyncComponent(() => import('../views/AppDashboard.vue')),
    meta: { requiresAuth: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: defineAsyncComponent(() => import('../views/NotFound.vue')),
  },
];

export default routes; 