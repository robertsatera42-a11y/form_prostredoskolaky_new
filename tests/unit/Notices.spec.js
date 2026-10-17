import { createLocalVue, mount } from '@vue/test-utils'
import Vuex from 'vuex'
import Cookies from '@/components/common/Cookies.vue'
import FormPage from '@/views/FormPage.vue'

jest.mock('@/router', () => ({ push: jest.fn() }))
jest.mock('@/components/form/FirstStep', () => ({ name: 'first-step', number: 1, render: h => h('div', { class: 'test-step' }, [h('input', { attrs: { id: 'draft-test-input' } })]) }))
jest.mock('@/components/form/ActivitiesStep', () => ({ name: 'activities-step', number: 2, render: h => h('div', { class: 'test-step' }) }))
jest.mock('@/components/form/SpecialPrizeStep', () => ({ name: 'special-prize-step', number: 3, render: h => h('div') }))
jest.mock('@/components/form/FinaliseStep', () => ({ name: 'finalise-step', number: 4, render: h => h('div') }))
jest.mock('@/components/form/SuccessStep', () => ({ name: 'success-step', render: h => h('div') }))

const localVue = createLocalVue()
localVue.use(Vuex)
const next = () => localVue.nextTick()
const deferred = () => {
  let complete, fail
  const promise = new Promise((resolve, reject) => { complete = resolve; fail = reject })
  return { promise, resolve: complete, reject: fail }
}

describe('Cookie notice', () => {
  let wrapper
  beforeEach(() => { document.cookie = 'cookie=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/' })
  afterEach(() => { if (wrapper) wrapper.destroy(); jest.restoreAllMocks() })

  it('provides a named notice and native dismiss controls without claiming tracking choices', () => {
    wrapper = mount(Cookies, { attachTo: document.body })
    expect(wrapper.find('[aria-labelledby="cookie-notice-title"]').exists()).toBe(true)
    expect(wrapper.find('button.cookie-acknowledge').text()).toBe('Rozumím')
    expect(wrapper.find('button.cookie-close').attributes('aria-label')).toBeTruthy()
    expect(wrapper.find('a').attributes('rel')).toBe('noopener noreferrer')
  })

  it('acknowledges the notice using the existing cookie and thirty-day expiration', async () => {
    const writes = jest.spyOn(document, 'cookie', 'set')
    wrapper = mount(Cookies, { attachTo: document.body })
    await wrapper.find('.cookie-acknowledge').trigger('click')
    expect(document.cookie).toContain('cookie=true')
    const written = writes.mock.calls.find(([value]) => value.startsWith('cookie=true'))[0]
    const expiry = new Date(written.match(/expires=([^;]+)/i)[1]).getTime()
    expect(expiry - Date.now()).toBeGreaterThan(29.99 * 86400000)
    expect(expiry - Date.now()).toBeLessThanOrEqual(30 * 86400000)
    expect(written).toContain('path=/')
    expect(wrapper.find('.cookie-notice').exists()).toBe(false)
  })

  it('honors an existing dismissal and lets the close button dismiss in the same way', async () => {
    document.cookie = 'cookie=true;path=/'
    wrapper = mount(Cookies)
    expect(wrapper.find('.cookie-notice').exists()).toBe(false)
    wrapper.destroy()
    document.cookie = 'cookie=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/'
    wrapper = mount(Cookies)
    await wrapper.find('.cookie-close').trigger('click')
    expect(document.cookie).toContain('cookie=true')
  })
})

describe('Draft recovery notice', () => {
  let wrapper, store, restore
  const open = async (saved = true) => {
    restore = jest.fn()
    store = new Vuex.Store({
      state: { user: { email: 'preview@example.test', grade: null, region: null, knowledge: null, summary: 'Rozpracované údaje', activities: [], interests: [], hasRegistration: saved, lastSaved: saved ? '2026-10-15T10:00:00Z' : '' } },
      getters: { user: state => state.user, isLoggedIn: state => state.user.email, isUserBootstrapReady: () => true },
      actions: { revertToSaved: (...args) => restore(...args) }
    })
    wrapper = mount(FormPage, { localVue, store, attachTo: document.body })
    await next()
  }
  beforeEach(() => { window.scrollTo = jest.fn() })
  afterEach(() => { if (wrapper) wrapper.destroy() })

  it('keeps the current draft when continuing or dismissing the notice', async () => {
    await open()
    await wrapper.find('.draft-keep').trigger('click')
    expect(wrapper.vm.showDraftBanner).toBe(false)
    expect(store.state.user.summary).toBe('Rozpracované údaje')
    expect(restore).not.toHaveBeenCalled()
    expect(document.activeElement.tagName).toBe('H1')
  })

  it('asks inline before replacing a draft and supports cancellation', async () => {
    await open()
    await wrapper.find('.draft-restore').trigger('click')
    expect(restore).not.toHaveBeenCalled()
    expect(wrapper.find('.draft-confirmation').exists()).toBe(true)
    expect(document.activeElement.classList.contains('draft-cancel-restore')).toBe(true)
    await wrapper.find('.draft-cancel-restore').trigger('click')
    expect(wrapper.find('.draft-confirmation').exists()).toBe(false)
    expect(document.activeElement.classList.contains('draft-restore')).toBe(true)
    expect(store.state.user.summary).toBe('Rozpracované údaje')
  })

  it('locks conflicting controls while restoring and completes once', async () => {
    await open()
    const request = deferred()
    restore.mockReturnValueOnce(request.promise)
    await wrapper.find('.draft-restore').trigger('click')
    await wrapper.find('.draft-confirm-restore').trigger('click')
    wrapper.vm.startOverFromDraft()
    await next()
    expect(restore).toHaveBeenCalledTimes(1)
    expect(wrapper.find('.draft-confirm-restore').element.disabled).toBe(true)
    expect(wrapper.find('.test-step').attributes('inert')).toBeDefined()
    request.resolve()
    await Promise.resolve()
    await Promise.resolve()
    await next()
    expect(wrapper.vm.showDraftBanner).toBe(false)
    expect(wrapper.find('.test-step').attributes('inert')).toBeUndefined()
  })

  it('keeps the notice and local data when restoration fails, with retry feedback', async () => {
    await open()
    restore.mockRejectedValueOnce(new Error('Offline'))
    await wrapper.find('.draft-restore').trigger('click')
    await wrapper.find('.draft-confirm-restore').trigger('click')
    await Promise.resolve()
    await Promise.resolve()
    await next()
    expect(wrapper.vm.showDraftBanner).toBe(true)
    expect(wrapper.vm.isRestoringDraft).toBe(false)
    expect(store.state.user.summary).toBe('Rozpracované údaje')
    expect(wrapper.find('.draft-error[role="alert"]').text()).toContain('zachované')
    expect(wrapper.find('.draft-confirm-restore').text()).toBe('Zkusit znovu')
  })

  it('cancels an unfinished restore when leaving the form', async () => {
    await open()
    const request = deferred()
    restore.mockReturnValueOnce(request.promise)
    await wrapper.find('.draft-restore').trigger('click')
    await wrapper.find('.draft-confirm-restore').trigger('click')
    const cancellation = restore.mock.calls[0][1]
    wrapper.destroy()
    const destroyedView = wrapper.vm
    wrapper = null
    expect(cancellation).toEqual({ cancelled: true })
    request.resolve()
    await Promise.resolve()
    await Promise.resolve()
    await next()
    expect(destroyedView.showDraftBanner).toBe(true)
  })

  it('names the reset accurately when no saved application exists', async () => {
    await open(false)
    expect(wrapper.find('.draft-restore').text()).toBe('Začít znovu')
    await wrapper.find('.draft-restore').trigger('click')
    expect(wrapper.find('.draft-confirmation').text()).toContain('Začít znovu')
  })
})
