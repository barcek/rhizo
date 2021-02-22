import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import FrameEntry from '../views/FrameEntry.vue';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: '/',
    component: FrameEntry
  },
  {
    path: '/:name',
    component: FrameEntry
  }
];

const router = new VueRouter({
  routes
});

export default router;
