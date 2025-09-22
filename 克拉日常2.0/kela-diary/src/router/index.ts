import { createRouter, createWebHistory } from 'vue-router'

// 懒加载路由组件
const NotesView = () => import('../views/NotesView.vue')
const TodosView = () => import('../views/TodosView.vue')
const SearchView = () => import('../views/SearchView.vue')
const NoteEditor = () => import('../views/NoteEditor.vue')
const PomodoroView = () => import('../views/PomodoroView.vue')
const AIView = () => import('../views/AIView.vue')

// 项目管理相关页面
const LoginPage = () => import('../views/project/LoginPage.vue')
const RegisterPage = () => import('../views/project/RegisterPage.vue')
const DashboardPage = () => import('../views/project/DashboardPage.vue')
const BoardPage = () => import('../views/project/BoardPage.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'notes',
      component: NotesView,
    },
    {
      path: '/todos',
      name: 'todos',
      component: TodosView,
    },
    {
      path: '/note/new',
      name: 'note-new',
      component: NoteEditor,
      props: { isNew: true }
    },
    {
      path: '/note/:id',
      name: 'note-edit',
      component: NoteEditor,
      props: route => ({ id: route.params.id, isNew: false })
    },
    {
      path: '/search',
      name: 'search',
      component: SearchView
    },
    {
      path: '/pomodoro',
      name: 'pomodoro',
      component: PomodoroView
    },
    {
      path: '/ai',
      name: 'ai',
      component: AIView
    },
    // 项目管理路由
    {
      path: '/login',
      name: 'login',
      component: LoginPage
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterPage
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardPage
    },
    {
      path: '/board/:id',
      name: 'board',
      component: BoardPage,
      props: true
    }
  ],
})

export default router
