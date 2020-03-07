import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login'
import Home from '../components/Home'
import Welcome from '../components/Welcome'

Vue.use(VueRouter)



const router = new VueRouter({
  routes:[
    { path: '/',redirect: '/login' },
    { path: '/login',component: Login },
    {
          path: '/home',
          component: Home,
          redirect: '/welcome',
          children: [{path: '/welcome',component: Welcome}]
        }
      ]
})
//挂载路由导航守卫

router.beforeEach((to,from,next)=>{
  //访问路径
  //来自路径
  //放行跳回 next() next("/login")
  if(to.path === '/login') return next();
  //获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if(!tokenStr) return next('/login')
  next()
})
export default router
