// src/router.js
import { createRouter, createWebHistory } from 'vue-router'
import HomeVue from '../views/HomeForm.vue'
import DashboardVue from '../views/DashboardVue.vue'
import ParamsVue from '../views/ParamsVue.vue'
import MontantVue from '../views/MontantVue.vue'
import DetteVue from '../views/DetteVue.vue'

const routes = [
  {
    path: '/',
    name: 'homeForm',
    component: HomeVue
  },
  {
    path: '/dashboardVue',
    name: 'dashboard',
    component: DashboardVue
  },
  {
    path: '/paramsVue',
    name: 'params',
    component: ParamsVue
  },
  {
    path: '/montantVue',
    name: 'montant',
    component: MontantVue
  },
  {
    path: '/detteVue',
    name: 'dette',
    component: DetteVue
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
