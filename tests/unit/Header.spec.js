import { createLocalVue, mount } from '@vue/test-utils'
import Vuex from 'vuex'
import Buefy from 'buefy'
import App from '@/App.vue'
import router from '@/router'

jest.mock('@/router', () => ({ push: jest.fn(() => Promise.resolve()) }))
jest.mock('@/firebase', () => ({ logoutUser: jest.fn() }))
jest.mock('@/utils/tracking', () => ({ track: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(Buefy)

describe('Shared header', () => {
  let wrapper
  beforeEach(() => {
    router.push.mockClear()
    window.scrollTo = jest.fn()
    const store = new Vuex.Store({
      state: { user: { firstName: 'Robert', email: 'preview@example.test' } },
      getters: { user: state => state.user, isLoggedIn: state => state.user.email }
    })
    wrapper = mount(App, { localVue, store, attachTo: document.body, mocks: { $route: { path: '/' } }, stubs: ['router-view', 'cookies'] })
  })
  afterEach(() => wrapper.destroy())

  it('makes the unchanged logo a named native navigation button', async () => {
    const logo = wrapper.find('.app-header .logo')
    expect(logo.element.tagName).toBe('BUTTON')
    expect(logo.attributes('aria-label')).toBeTruthy()
    await logo.trigger('click')
    expect(router.push).toHaveBeenCalledWith('/')
  })

  it('activates the existing account action from the keyboard', async () => {
    await wrapper.find('.dropdown-item').trigger('keydown', { key: 'Enter', keyCode: 13 })
    expect(router.push).toHaveBeenCalledWith('/profil')
  })

  it('closes the account menu on Escape and returns focus to its trigger', async () => {
    const menu = wrapper.find('.dropdown').vm
    menu.isActive = true
    await localVue.nextTick()
    await wrapper.find('.dropdown-item').trigger('keydown', { key: 'Escape', keyCode: 27 })
    expect(menu.isActive).toBe(false)
    expect(menu.isHoverable).toBe(false)
    expect(document.activeElement).toBe(wrapper.find('.login-button').element)
    await wrapper.find('.dropdown').trigger('mouseenter')
    expect(menu.isHoverable).toBe(true)
  })
})
