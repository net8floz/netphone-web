import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';

Vue.use(VueRouter);

export type RouteName =
  | 'home'
  | 'events'
  | 'showcase-feed'
  | 'user-profile'
  | 'canvas-room';

export type RouteData = {
  name: RouteName;
};

export function routeName(name: RouteName): string {
  return name;
}

// export function getCanvasRoomRoute(
//   roomId: string
// ): RouteData & { params: { id: string } } {
//   return {
//     name: 'canvas-room',
//     params: {
//       id: roomId,
//     },
//   };
// }

export function getProfileRoute(
  userId: string
): RouteData & { params: { id: string } } {
  return {
    name: 'canvas-room',
    params: {
      id: userId,
    },
  };
}

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: routeName('home'),
    component: () =>
      import(/* webpackChunkName: "main" */ '../views/Home/Home.vue'),
  },
  {
    path: '/profile/:userId',
    name: routeName('user-profile'),
    component: () =>
      import(
        /* webpackChunkName: "main" */ '../views/UserProfile/UserProfile.vue'
      ),
  },
  // {
  //   path: '/rooms/:roomId',
  //   name: routeName('canvas-room'),
  //   component: () =>
  //     import(
  //       /* webpackChunkName: "main" */ '../views/UserProfile/UserProfile.vue'
  //     ),
  // },
  {
    path: '/oauth/login/popup/callback',
    component: () =>
      import(
        /* webpackChunkName: "oauth" */ '../views/OAuthPopup/OAuthPopup.vue'
      ),
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
