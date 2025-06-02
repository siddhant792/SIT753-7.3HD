import { defineAsyncComponent } from 'vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: defineAsyncComponent(() => import('../views/Home.vue')),
  },
  {
    path: '/login',
    name: 'login',
    component: defineAsyncComponent(() => import('../views/Login.vue')),
  },
  {
    path: '/register',
    name: 'register',
    component: defineAsyncComponent(() => import('../views/Register.vue')),
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: defineAsyncComponent(() => import('../views/Dashboard.vue')),
    meta: { requiresAuth: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: defineAsyncComponent(() => import('../views/NotFound.vue')),
  },
];

export default routes; 