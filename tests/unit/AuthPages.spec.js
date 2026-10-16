import { createLocalVue, mount } from '@vue/test-utils'
import Vuex from 'vuex'
import Buefy from 'buefy'
import Vuelidate from 'vuelidate'
import Login from '@/components/login/Login.vue'
import SignUp from '@/components/login/SignUp.vue'
import LoginPage from '@/views/login/LoginPage.vue'
import fb from '@/firebase'
import router from '@/router'

jest.mock('@/firebase', () => ({ loginUser: jest.fn(), createUser: jest.fn() }))
jest.mock('@/router', () => ({
  push: jest.fn(() => Promise.resolve()),
  resolve: jest.fn(path => ({ route: { matched: ['/', '/profil'].includes(path) ? [{}] : [] } }))
}))

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(Buefy)
localVue.use(Vuelidate)
const flush = async () => {
  await Promise.resolve()
  await Promise.resolve()
  await localVue.nextTick()
}
const deferred = () => {
  let complete, fail
  const promise = new Promise((resolve, reject) => { complete = resolve; fail = reject })
  return { promise, resolve: complete, reject: fail }
}

describe('Supplied auth page integration', () => {
  let wrapper, store, route, updateUser
  const open = async (component, query = {}) => {
    route = localVue.observable({ query })
    updateUser = jest.fn((state, user) => { state.user = { ...user } })
    store = new Vuex.Store({
      state: { user: { email: '' } },
      getters: { isLoggedIn: state => state.user.email },
      mutations: { updateUser }
    })
    wrapper = mount(component, {
      localVue,
      store,
      attachTo: document.body,
      mocks: { $route: route },
      stubs: { 'router-link': { props: ['to'], template: '<a :href="to"><slot /></a>' } }
    })
    await localVue.nextTick()
  }
  const validSignup = async () => {
    Object.assign(wrapper.vm.user, { occupation: 'student', firstName: 'Jan', lastName: 'Novák', email: 'jan@example.test' })
    Object.assign(wrapper.vm, { passwd: 'Test-password-123', passwdRetype: 'Test-password-123', giveConsent: true })
    await localVue.nextTick()
  }

  beforeEach(() => {
    fb.loginUser.mockReset().mockResolvedValue('OK')
    fb.createUser.mockReset().mockResolvedValue('OK')
    router.push.mockClear()
  })
  afterEach(() => { if (wrapper) wrapper.destroy() })

  it('uses the supplied login form labels, autofill and password visibility control', async () => {
    await open(Login)
    expect(wrapper.find('#auth-login-form').exists()).toBe(true)
    expect(wrapper.find('label[for="auth-login-email"]').text()).toBe('Email')
    expect(wrapper.find('#auth-login-email').attributes('autocomplete')).toBe('username')
    await wrapper.find('#auth-login-password').setValue('Keep-this-value')
    await wrapper.find('.auth-password button').trigger('click')
    expect(wrapper.find('#auth-login-password').attributes('type')).toBe('text')
    expect(wrapper.find('#auth-login-password').element.value).toBe('Keep-this-value')
    expect(wrapper.find('.auth-password button').attributes('aria-pressed')).toBe('true')
  })

  it('submits through the form and focuses the first missing login field', async () => {
    await open(Login)
    await wrapper.find('#auth-login-form').trigger('submit')
    await localVue.nextTick()
    expect(fb.loginUser).not.toHaveBeenCalled()
    expect(document.activeElement.id).toBe('auth-login-email')
    expect(wrapper.find('#auth-login-email').attributes('aria-invalid')).toBe('true')
    expect(wrapper.find('[role="alert"]').text()).toBeTruthy()
  })

  it('sends unchanged credentials once and disables controls while login is pending', async () => {
    await open(Login)
    const request = deferred()
    fb.loginUser.mockReturnValueOnce(request.promise)
    Object.assign(wrapper.vm, { email: 'jan@example.test', password: 'Test-password-123' })
    const first = wrapper.vm.login()
    const duplicate = wrapper.vm.login()
    await localVue.nextTick()
    expect(fb.loginUser).toHaveBeenCalledTimes(1)
    expect(fb.loginUser).toHaveBeenCalledWith('jan@example.test', 'Test-password-123')
    expect(wrapper.find('#auth-login-email').element.disabled).toBe(true)
    expect(wrapper.find('button[type="submit"]').text()).toBe('Přihlašuji…')
    expect(wrapper.emitted()['busy-change']).toEqual([[true]])
    request.resolve('Nesprávné heslo.')
    await Promise.all([first, duplicate])
    await localVue.nextTick()
    expect(wrapper.vm.pending).toBe(false)
    expect(wrapper.vm.email).toBe('jan@example.test')
    expect(wrapper.find('[role="alert"]').text()).toBe('Nesprávné heslo.')
    expect(wrapper.emitted()['busy-change']).toEqual([[true], [false]])
  })

  it('recovers from a rejected login request and keeps the form available for retry', async () => {
    await open(Login)
    fb.loginUser.mockRejectedValueOnce(new Error('Offline'))
    Object.assign(wrapper.vm, { email: 'jan@example.test', password: 'Test-password-123' })
    await wrapper.vm.login()
    await localVue.nextTick()
    expect(wrapper.vm.pending).toBe(false)
    expect(wrapper.find('[role="alert"]').text()).toContain('Zkuste to prosím znovu')
    expect(router.push).not.toHaveBeenCalled()
  })

  it('returns a successful login to the application and clears credentials', async () => {
    await open(Login)
    Object.assign(wrapper.vm, { email: 'jan@example.test', password: 'Test-password-123' })
    await wrapper.vm.login()
    expect(router.push).toHaveBeenCalledWith('/')
    expect(wrapper.vm.email).toBe('')
    expect(wrapper.vm.password).toBe('')
  })

  it('honors an existing local redirect only after login succeeds', async () => {
    await open(Login, { redirect: 'profil' })
    Object.assign(wrapper.vm, { email: 'jan@example.test', password: 'Test-password-123' })
    await wrapper.vm.login()
    expect(router.push).toHaveBeenCalledWith('/profil')
  })

  it('returns legacy destinations absent from this form app to its application route', async () => {
    await open(Login, { redirect: 'soutez' })
    Object.assign(wrapper.vm, { email: 'jan@example.test', password: 'Test-password-123' })
    await wrapper.vm.login()
    expect(router.push).toHaveBeenCalledWith('/')
  })

  it('does not navigate when an unrelated user update occurs in the registration panel', async () => {
    await open(Login, { redirect: 'profil' })
    store.commit('updateUser', { email: 'jan@example.test' })
    await localVue.nextTick()
    expect(router.push).not.toHaveBeenCalled()
  })

  it('keeps signup required fields, email format and matching passwords', async () => {
    await open(SignUp)
    await wrapper.vm.signUp()
    await localVue.nextTick()
    expect(fb.createUser).not.toHaveBeenCalled()
    expect(document.activeElement.id).toBe('auth-signup-first-name')
    await validSignup()
    wrapper.vm.user.email = 'invalid-email'
    await wrapper.vm.signUp()
    await localVue.nextTick()
    expect(document.activeElement.id).toBe('auth-signup-email')
    wrapper.vm.user.email = 'jan@example.test'
    wrapper.vm.passwdRetype = 'Different-password'
    await wrapper.vm.signUp()
    await localVue.nextTick()
    expect(document.activeElement.id).toBe('auth-signup-password-repeat')
    expect(fb.createUser).not.toHaveBeenCalled()
  })

  it('requires privacy consent and focuses the checkbox when it is missing', async () => {
    await open(SignUp)
    await validSignup()
    wrapper.vm.giveConsent = false
    await wrapper.vm.signUp()
    await localVue.nextTick()
    expect(fb.createUser).not.toHaveBeenCalled()
    expect(document.activeElement.id).toBe('auth-signup-consent')
    expect(wrapper.find('#auth-signup-consent').attributes('aria-invalid')).toBe('true')
  })

  it('preserves the backend signup payload and newsletter preference in Vuex', async () => {
    await open(SignUp)
    await validSignup()
    wrapper.vm.sendNewsletter = false
    await wrapper.vm.signUp()
    await localVue.nextTick()
    expect(fb.createUser).toHaveBeenCalledWith({ occupation: 'student', firstName: 'Jan', lastName: 'Novák', email: 'jan@example.test', sendNewsletter: false }, 'Test-password-123')
    expect(updateUser).toHaveBeenCalledWith(expect.anything(), { firstName: 'Jan', lastName: 'Novák', email: 'jan@example.test', sendNewsletter: false })
    expect(wrapper.vm.showSuccess).toBe(true)
    expect(document.activeElement.id).toBe('auth-signup-success')
    expect(wrapper.vm.passwd).toBe('')
  })

  it('prevents repeated signup and keeps entered values after a server error', async () => {
    await open(SignUp)
    await validSignup()
    const request = deferred()
    fb.createUser.mockReturnValueOnce(request.promise)
    const first = wrapper.vm.signUp()
    const duplicate = wrapper.vm.signUp()
    await localVue.nextTick()
    expect(fb.createUser).toHaveBeenCalledTimes(1)
    expect(wrapper.find('#auth-signup-consent').element.disabled).toBe(true)
    request.resolve('E-mail je již zaregistrován.')
    await Promise.all([first, duplicate])
    await localVue.nextTick()
    expect(wrapper.vm.user.email).toBe('jan@example.test')
    expect(wrapper.find('[role="alert"]').text()).toBe('E-mail je již zaregistrován.')
    expect(updateUser).not.toHaveBeenCalled()
  })

  it('restores signup controls after an unexpected request failure', async () => {
    await open(SignUp)
    await validSignup()
    fb.createUser.mockRejectedValueOnce(new Error('Offline'))
    await wrapper.vm.signUp()
    await localVue.nextTick()
    expect(wrapper.vm.pending).toBe(false)
    expect(wrapper.find('[role="alert"]').text()).toContain('Zkuste to prosím znovu')
    expect(wrapper.vm.showSuccess).toBe(false)
  })

  it('returns to login from the supplied registration success state', async () => {
    await open(SignUp)
    await validSignup()
    await wrapper.vm.signUp()
    await localVue.nextTick()
    await wrapper.find('.auth-success button').trigger('click')
    expect(wrapper.emitted()['show-login']).toHaveLength(1)
  })

  it('switches auth tabs with the keyboard without losing entered values', async () => {
    await open(LoginPage)
    await wrapper.find('#auth-login-email').setValue('draft@example.test')
    await wrapper.find('#auth-tab-login').trigger('keydown', { key: 'ArrowRight' })
    await localVue.nextTick()
    expect(wrapper.find('#auth-tab-signup').attributes('aria-selected')).toBe('true')
    expect(document.activeElement.id).toBe('auth-tab-signup')
    await wrapper.find('#auth-tab-signup').trigger('keydown', { key: 'Home' })
    expect(wrapper.find('#auth-login-email').element.value).toBe('draft@example.test')
    expect(wrapper.find('#auth-tab-login').attributes('aria-selected')).toBe('true')
  })

  it('locks panel navigation during a request and unlocks after its failure', async () => {
    await open(LoginPage)
    const login = wrapper.findComponent(Login)
    const request = deferred()
    fb.loginUser.mockReturnValueOnce(request.promise)
    Object.assign(login.vm, { email: 'jan@example.test', password: 'Test-password-123' })
    const task = login.vm.login()
    await localVue.nextTick()
    expect(wrapper.find('#auth-tab-signup').element.disabled).toBe(true)
    request.resolve('Zkuste to znovu.')
    await task
    await flush()
    expect(wrapper.find('#auth-tab-signup').element.disabled).toBe(false)
  })

  it('reacts to redirect context without leaving an outdated message on the page', async () => {
    await open(LoginPage, { redirect: 'soutez' })
    expect(wrapper.find('.auth-redirect').text()).toContain('Pro registraci do soutěže')
    route.query = {}
    await localVue.nextTick()
    expect(wrapper.find('.auth-redirect').exists()).toBe(false)
  })
})
