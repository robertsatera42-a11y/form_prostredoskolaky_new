import { createLocalVue, mount } from '@vue/test-utils'
import Vuex from 'vuex'
import Buefy from 'buefy'
import Vuelidate from 'vuelidate'
import { getField, updateField } from 'vuex-map-fields'
import FinaliseStep from '@/components/form/FinaliseStep.vue'
import client from '@/client/client'
import fb from '@/firebase'
import tracking from '@/utils/tracking'
import config from '@/config/default'

jest.mock('@/client/client', () => ({ createRegistration: jest.fn() }))
jest.mock('@/firebase', () => ({ updateProfileForCurrentUser: jest.fn() }))
jest.mock('@/utils/tracking', () => ({ track: jest.fn() }))
jest.mock('@/components/form/ActivitiesStep', () => ({ name: 'activities-step', render: h => h('div') }))
jest.mock('@/components/form/SpecialPrizeStep', () => ({ name: 'special-prize-step', render: h => h('div') }))
jest.mock('@/components/form/SuccessStep', () => ({ name: 'success-step', render: h => h('div') }))

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(Buefy)
localVue.use(Vuelidate)
localVue.directive('line-clamp', () => {})

const activity = {
  name: 'Studentský projekt',
  type: 'Vlastní projekt',
  result: 'Navrhli jsme prototyp.\nPomáhá spolužákům.',
  start: 'Tři měsíce, čtyři hodiny týdně.',
  link: 'https://example.test/projekt',
  field: 'Celonárodní',
  interest: 'IT & robotika',
  isIndividual: 'Týmové',
  reference: 'Mentor, mentor@example.test'
}
const makeUser = () => ({
  firstName: 'Robert',
  lastName: 'Novák',
  email: 'robert@example.test',
  dob: new Date(2008, 7, 1),
  school: 'Gymnázium Brno',
  grade: '3-4',
  region: 'Jihomoravský',
  phone: '+420 777 123 456',
  linkedin: '',
  interests: ['Matematika', 'Hudba'],
  summary: 'Robert se věnuje vědě.\nPomáhá ostatním.',
  knowledge: null,
  readGuideConfirmed: true,
  isRepeting: false,
  isAgree: false,
  sendNewsletter: false,
  activities: [{ ...activity }],
  specialPrize1Interested: false,
  specialPrize1text: '',
  specialPrize2Interested: false,
  specialPrize3Interested: false,
  specialPrize3text: '',
  lastSaved: '',
  hasRegistration: false
})
const deferred = () => {
  let resolvePromise, rejectPromise
  const promise = new Promise((resolve, reject) => { resolvePromise = resolve; rejectPromise = reject })
  return { promise, resolve: resolvePromise, reject: rejectPromise }
}

describe('FinaliseStep', () => {
  let wrapper, store, log
  const open = async (overrides = {}) => {
    store = new Vuex.Store({ state: { user: { ...makeUser(), ...overrides } }, getters: { getField }, mutations: { updateField } })
    wrapper = mount(FinaliseStep, { localVue, store, attachTo: document.body })
    await localVue.nextTick()
  }
  beforeEach(() => {
    config.consts.publishedSpecialPrizeIds = []
    window.scrollTo = jest.fn()
    log = jest.spyOn(console, 'log').mockImplementation(() => {})
    client.createRegistration.mockReset().mockResolvedValue({ registrationId: 'test-registration' })
    fb.updateProfileForCurrentUser.mockReset().mockResolvedValue(undefined)
  })
  afterEach(() => {
    if (wrapper) {
      const element = wrapper.element
      wrapper.destroy()
      if (element.parentNode) element.parentNode.removeChild(element)
    }
    wrapper = null
    log.mockRestore()
  })

  it('starts with three collapsed reviews and an open confirmation', async () => {
    await open()
    expect(wrapper.findAll('.review-card').length).toBe(4)
    for (const name of ['basic', 'activities', 'prizes']) expect(wrapper.find('#review-' + name + '-toggle').attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('#review-confirmation-toggle').attributes('aria-expanded')).toBe('true')
  })

  for (const hasTime of [true, false, undefined]) it(`reviews and submits optional availability ${hasTime}`, async () => {
    await open({ isAgree: true, hasTime })
    await wrapper.find('#review-basic-toggle').trigger('click')
    const row = wrapper.findAll('#review-basic-panel dl > div').wrappers.find(item => item.find('dt').text() === 'Víkend TOP25')
    expect(row).toBeDefined()
    expect(row.find('dd').text()).toBe(hasTime === true ? 'Ano' : 'Ne')
    await wrapper.vm.submit()
    expect(client.createRegistration).toHaveBeenCalledTimes(1)
    expect(client.createRegistration.mock.calls[0][0].hasTime).toBe(hasTime === true)
  })

  it('keeps independently opened panels visible and edit separate from toggle', async () => {
    await open()
    await wrapper.find('#review-basic-toggle').trigger('click')
    await wrapper.find('#review-activities-toggle').trigger('click')
    expect(wrapper.find('#review-basic-toggle').attributes('aria-expanded')).toBe('true')
    expect(wrapper.find('#review-activities-toggle').attributes('aria-expanded')).toBe('true')
    expect(wrapper.emitted().changeView).toBeUndefined()
    await wrapper.find('#review-basic-edit').trigger('click')
    expect(wrapper.emitted().changeView[0][0].name).toBe('first-step')
    expect(wrapper.find('#review-basic-toggle').attributes('aria-expanded')).toBe('true')
  })

  it('preserves complete activity details and multiline answers', async () => {
    await open()
    await wrapper.find('#review-activities-toggle').trigger('click')
    const panel = wrapper.find('#review-activities-panel').text()
    for (const value of Object.values(activity)) expect(panel).toContain(value)
    await wrapper.find('#review-basic-toggle').trigger('click')
    expect(wrapper.find('#review-basic-panel').text()).toContain('Robert se věnuje vědě.\nPomáhá ostatním.')
    expect(wrapper.find('#review-basic-panel').text()).toContain('+420 777 123 456')
  })

  it('recomputes corrected date and grade instead of using mounted snapshots', async () => {
    await open()
    store.state.user.dob = new Date(2007, 1, 3)
    store.state.user.grade = '2-6'
    await wrapper.find('#review-basic-toggle').trigger('click')
    const panel = wrapper.find('#review-basic-panel').text()
    expect(panel).toContain('3. 2. 2007')
    expect(panel).toContain('2. ročník 6letého studia')
  })

  it('renders incomplete dates and optional values without throwing', async () => {
    await open({ dob: undefined, grade: null, linkedin: '' })
    await wrapper.find('#review-basic-toggle').trigger('click')
    expect(wrapper.find('#review-basic-panel').text()).toContain('Neuvedeno')
    expect(wrapper.text()).not.toMatch(/NaN|undefined/)
  })

  it('keeps exact legal wording, links and optional marketing copy', async () => {
    await open()
    const wording = wrapper.find('.legal-wording')
    expect(wording.text().replace(/\s+/g, ' ').trim()).toBe('Souhlasím s pravidly soutěže a uděluji souhlas se zpracováním osobních údajů.')
    const links = wording.findAll('a').wrappers.map(a => a.attributes('href'))
    expect(links).toEqual(['https://drive.google.com/file/d/1shGxE2v13FcA03s1qSt9Wz6rTTNu4hRL/view?usp=sharing', 'https://drive.google.com/file/d/1vQtRmV_niHTE9Yy_0GPtL9521qm0XI0i/view'])
    expect(wrapper.text()).toContain('Chci si nechat zasílat pravidelnou dávku mimoškolních aktivit a dalších informací do svého e-mailu.')
  })

  it('never completes confirmation through marketing consent alone', async () => {
    await open({ sendNewsletter: true })
    expect(wrapper.find('#review-confirmation').classes()).not.toContain('is-complete')
    await wrapper.vm.submit()
    await localVue.nextTick()
    expect(client.createRegistration).not.toHaveBeenCalled()
    expect(document.activeElement.id).toBe('finalise-consent')
    expect(wrapper.find('#consent-error').exists()).toBe(true)
  })

  it('routes missing basic information back to the correct editor', async () => {
    await open({ summary: '', isAgree: true })
    await wrapper.vm.submit()
    await localVue.nextTick()
    expect(client.createRegistration).not.toHaveBeenCalled()
    await wrapper.find('[data-correction="basic"]').trigger('click')
    expect(wrapper.emitted().changeView[0][0].name).toBe('first-step')
  })

  it('blocks an incomplete conditional activity field', async () => {
    await open({ isAgree: true, activities: [{ ...activity, field: '' }] })
    await wrapper.vm.submit()
    expect(client.createRegistration).not.toHaveBeenCalled()
    expect(wrapper.find('[data-correction="activities"]').exists()).toBe(true)
  })

  it('accepts no awards but blocks a selected award with a blank response', async () => {
    config.consts.publishedSpecialPrizeIds = ['startup']
    await open({ isAgree: true, specialPrize1Interested: true, specialPrize1text: '  ' })
    await wrapper.vm.submit()
    expect(client.createRegistration).not.toHaveBeenCalled()
    store.state.user.specialPrize1Interested = false
    await wrapper.vm.submit()
    expect(wrapper.emitted().changeView[0][0].name).toBe('success-step')
  })

  for (const changes of [{ reference: '' }, { reference: ' \n ' }, { name: 'a'.repeat(151) }, { link: 'a'.repeat(301) }]) {
    it(`blocks final submission of an invalid saved activity: ${JSON.stringify(changes)}`, async () => {
      await open({ isAgree: true, activities: [{ ...activity, ...changes }] })
      await wrapper.vm.submit()
      expect(client.createRegistration).not.toHaveBeenCalled()
      expect(wrapper.find('[data-correction="activities"]').exists()).toBe(true)
    })
  }

  it('accepts activity length boundaries and an optional empty website', async () => {
    await open({ isAgree: true, activities: [{ ...activity, name: 'a'.repeat(150), link: 'a'.repeat(300) }, { ...activity, link: '' }] })
    await wrapper.vm.submit()
    expect(client.createRegistration).toHaveBeenCalledTimes(1)
  })

  it('hides and ignores unpublished selections without deleting them from the draft or payload', async () => {
    await open({ isAgree: true, specialPrize1Interested: true, specialPrize1text: '  ' })
    await wrapper.find('#review-prizes-toggle').trigger('click')
    expect(wrapper.find('#review-prizes-panel').text()).toContain('Speciální ceny připravujeme')
    expect(wrapper.find('#review-prize-startup').exists()).toBe(false)
    expect(wrapper.vm.reviewSections.find(section => section.id === 'prizes').summary).toContain('Speciální ceny připravujeme')
    await wrapper.vm.submit()
    expect(client.createRegistration).toHaveBeenCalledTimes(1)
    expect(client.createRegistration.mock.calls[0][0].specialPrize1Interested).toBe(true)
    expect(store.state.user.specialPrize1text).toBe('  ')
  })

  it('reviews only published selections and offers no additional prizes when all published prizes are selected', async () => {
    config.consts.publishedSpecialPrizeIds = ['microsoft']
    await open({ isAgree: true, specialPrize1Interested: true, specialPrize2Interested: true })
    await wrapper.find('#review-prizes-toggle').trigger('click')
    expect(wrapper.find('#review-prize-microsoft').exists()).toBe(true)
    expect(wrapper.find('#review-prize-startup').exists()).toBe(false)
    expect(wrapper.find('.review-optional-note').exists()).toBe(false)
    expect(wrapper.find('#review-prizes-panel').text()).not.toContain('Speciální ceny připravujeme')
    await wrapper.vm.submit()
    expect(client.createRegistration).toHaveBeenCalledTimes(1)
  })

  it('leaves the draft unchanged after a rejected registration and allows retry', async () => {
    await open({ isAgree: true })
    const before = JSON.stringify(store.state.user)
    client.createRegistration.mockRejectedValueOnce({ response: { status: 503 } })
    await wrapper.vm.submit()
    expect(JSON.stringify(store.state.user)).toBe(before)
    expect(wrapper.vm.isLoading).toBe(false)
    expect(wrapper.emitted().changeView).toBeUndefined()
    await wrapper.vm.submit()
    expect(wrapper.emitted().changeView[0][0].name).toBe('success-step')
  })

  it('keeps the existing wire conversions without mutating UI values', async () => {
    await open({ isAgree: true, isRepeting: true })
    await wrapper.vm.submit()
    const sent = client.createRegistration.mock.calls[0][0]
    expect(sent.activities[0].isIndividual).toBe(false)
    expect(sent.interests).toEqual(['Matematika', 'Hudba'])
    expect(sent.interests).not.toBe(store.state.user.interests)
    expect(sent.isFirstTime).toBe(false)
    expect(sent.readGuideConfirmed).toBe(true)
    expect(sent.image).toBeUndefined()
    expect(store.state.user.activities[0].isIndividual).toBe('Týmové')
    expect(store.state.user.interests).toEqual(['Matematika', 'Hudba'])
  })

  it('recovers from draft preparation failure without leaving submission locked', async () => {
    await open({ isAgree: true, image: {} })
    await wrapper.vm.submit()
    expect(client.createRegistration).not.toHaveBeenCalled()
    expect(wrapper.vm.isLoading).toBe(false)
    expect(wrapper.vm.error).toBeTruthy()
    expect(wrapper.emitted().changeView).toBeUndefined()
  })

  it('blocks repeated submits throughout registration and profile completion', async () => {
    await open({ isAgree: true })
    const registration = deferred()
    const profile = deferred()
    client.createRegistration.mockReturnValueOnce(registration.promise)
    fb.updateProfileForCurrentUser.mockReturnValueOnce(profile.promise)
    const first = wrapper.vm.submit()
    await wrapper.vm.submit()
    expect(client.createRegistration).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted().changeView).toBeUndefined()
    registration.resolve({ registrationId: 'confirmed-registration' })
    await Promise.resolve()
    await Promise.resolve()
    expect(wrapper.vm.isLoading).toBe(true)
    await wrapper.vm.submit()
    expect(client.createRegistration).toHaveBeenCalledTimes(1)
    profile.resolve()
    await first
    expect(wrapper.emitted().changeView[0][0].name).toBe('success-step')
  })

  it('does not show success for a response without registration confirmation', async () => {
    await open({ isAgree: true })
    client.createRegistration.mockResolvedValueOnce({})
    await wrapper.vm.submit()
    expect(wrapper.emitted().changeView).toBeUndefined()
    expect(store.state.user.hasRegistration).toBe(false)
    expect(wrapper.vm.error).toBeTruthy()
  })

  it('rejects blank or non-identifier registration confirmations', async () => {
    await open({ isAgree: true })
    for (const registrationId of ['   ', false]) {
      client.createRegistration.mockResolvedValueOnce({ registrationId })
      await wrapper.vm.submit()
      expect(wrapper.emitted().changeView).toBeUndefined()
      expect(store.state.user.hasRegistration).toBe(false)
    }
  })

  it('does not turn a confirmed registration into an error when analytics fails', async () => {
    await open({ isAgree: true })
    const loggedError = jest.spyOn(console, 'error').mockImplementation(() => {})
    tracking.track.mockImplementationOnce(() => { throw new Error('Analytics unavailable') })
    await wrapper.vm.submit()
    expect(wrapper.emitted().changeView[0][0].name).toBe('success-step')
    expect(wrapper.vm.error).toBe('')
    loggedError.mockRestore()
  })

  it('does not repeat the POST when auxiliary profile completion fails', async () => {
    await open({ isAgree: true })
    const loggedError = jest.spyOn(console, 'error').mockImplementation(() => {})
    fb.updateProfileForCurrentUser.mockRejectedValueOnce(new Error('Profile unavailable'))
    await wrapper.vm.submit()
    expect(wrapper.emitted().changeView[0][0].name).toBe('success-step')
    expect(store.state.user.hasRegistration).toBe(true)
    await wrapper.vm.submit()
    expect(client.createRegistration).toHaveBeenCalledTimes(1)
    loggedError.mockRestore()
  })
})
