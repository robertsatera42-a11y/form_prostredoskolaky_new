import Vue from 'vue'
import Router from 'vue-router'
import { getAuth } from 'firebase/auth'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'form',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
        import(/* webpackChunkName: "about" */ './views/FormPage.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/login',
      name: 'login-page',
      component: () => import('./views/login/LoginPage.vue')
    },
    {
      path: '/renew-password',
      name: 'renew-password-page',
      component: () => import('./views/login/RenewPasswordPage.vue')
    },
    {
      path: '/change-password',
      name: 'change-password-page',
      component: () => import('./views/login/ChangePasswordPage.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/profil',
      name: 'profile-page',
      component: () => import('./views/login/ProfilePage.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/delete-account',
      name: 'delete-account-page',
      component: () => import('./views/login/DeleteAccountPage.vue'),
      meta: {
        requiresAuth: true
      }
    }
  ],
  scrollBehavior (to, from, savedPosition) {
    return { x: 0, y: 0 }
  }
})

router.beforeEach(async (to, from, next) => {
  try {
    const requiresAuth = to.matched.some((x) => x.meta.requiresAuth)
    const auth = getAuth()
    const currentUser = auth.currentUser
    if (requiresAuth && !currentUser) {
      if (to.name === 'form') {
        next('/login')
      }
    } else if (requiresAuth && currentUser) {
      next()
    } else if (!requiresAuth) {
      next()
    }
  } catch (err) {
    console.log(err)
  }
})

export default router
