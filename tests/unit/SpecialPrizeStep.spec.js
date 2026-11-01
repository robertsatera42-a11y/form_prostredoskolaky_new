import { createLocalVue, mount } from '@vue/test-utils'
import Vuex from 'vuex'
import { getField, updateField } from 'vuex-map-fields'
import SpecialPrizeStep from '@/components/form/SpecialPrizeStep.vue'
import config from '@/config/default'

jest.mock('@/components/form/ActivitiesStep', () => ({ name: 'activities-step', render: h => h('div') }))
jest.mock('@/components/form/FinaliseStep', () => ({ name: 'finalise-step', render: h => h('div') }))

const localVue = createLocalVue()
localVue.use(Vuex)

describe('SpecialPrizeStep', () => {
  let wrapper
  let store

  beforeEach(() => {
    config.consts.publishedSpecialPrizeIds = ['startup', 'microsoft', 'mattoni']
    window.scrollTo = jest.fn()
    store = new Vuex.Store({
      state: {
        user: {
          specialPrize1Interested: false,
          specialPrize1text: '',
          specialPrize2Interested: false,
          specialPrize3Interested: false,
          specialPrize3text: ''
        }
      },
      getters: { getField },
      mutations: { updateField }
    })
    wrapper = mount(SpecialPrizeStep, { localVue, store, attachTo: document.body })
  })

  afterEach(() => {
    wrapper.destroy()
    config.consts.publishedSpecialPrizeIds = []
  })

  it('shows the announcement and keeps navigation with no published prizes or valid hidden answers', async () => {
    config.consts.publishedSpecialPrizeIds = []
    wrapper.destroy()
    store.state.user.specialPrize1Interested = true
    store.state.user.specialPrize1text = '  '
    store.state.user.specialPrize3Interested = true
    wrapper = mount(SpecialPrizeStep, { localVue, store })
    expect(wrapper.findAll('.prize-card')).toHaveLength(0)
    expect(wrapper.text()).toContain('Speciální ceny připravujeme')
    expect(wrapper.text()).toContain('do 1. března')
    expect(wrapper.text()).toContain('e-mailem a na sociálních sítích')
    expect(wrapper.text()).toContain('Přihlášku můžeš odeslat už teď')
    expect(wrapper.text()).toContain('kdykoliv během přihlašování')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted().changeView[0][0].name).toBe('finalise-step')
    await wrapper.find('.secondary-action').trigger('click')
    expect(wrapper.emitted().changeView[1][0].name).toBe('activities-step')
    expect(store.state.user.specialPrize1Interested).toBe(true)
    expect(store.state.user.specialPrize1text).toBe('  ')
  })

  it('publishes one prize at a time without treating no selection as an empty offer', () => {
    config.consts.publishedSpecialPrizeIds = ['microsoft']
    wrapper.destroy()
    wrapper = mount(SpecialPrizeStep, { localVue, store })
    expect(wrapper.findAll('.prize-card')).toHaveLength(1)
    expect(wrapper.find('#innovator-heading').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('Speciální ceny připravujeme')
    store.state.user.specialPrize1Interested = true
    wrapper.vm.goToFinalise()
    expect(wrapper.emitted().changeView[0][0].name).toBe('finalise-step')
  })

  it('allows continuing without selecting a prize', () => {
    wrapper.vm.goToFinalise()
    expect(wrapper.emitted().changeView[0][0].name).toBe('finalise-step')
  })

  it('reports both missing descriptions on the first attempt and focuses the first', async () => {
    store.state.user.specialPrize1Interested = true
    store.state.user.specialPrize3Interested = true
    store.state.user.specialPrize1text = '   '
    store.state.user.specialPrize3text = '\n '
    await localVue.nextTick()
    wrapper.vm.goToFinalise()
    await localVue.nextTick()

    expect(wrapper.emitted().changeView).toBeUndefined()
    expect(wrapper.vm.specialPrize1Error).toBeTruthy()
    expect(wrapper.vm.specialPrize3Error).toBeTruthy()
    expect(document.activeElement.id).toBe('startup-description')
  })

  it('allows Microsoft participation without introducing another required answer', () => {
    store.state.user.specialPrize2Interested = true
    wrapper.vm.goToFinalise()
    expect(wrapper.emitted().changeView[0][0].name).toBe('finalise-step')
  })

  it('allows all three prizes with both descriptions completed', () => {
    Object.assign(store.state.user, {
      specialPrize1Interested: true,
      specialPrize1text: 'Pracuji na prototypu.',
      specialPrize2Interested: true,
      specialPrize3Interested: true,
      specialPrize3text: 'Zavedli jsme nové řešení.'
    })
    wrapper.vm.goToFinalise()
    expect(wrapper.emitted().changeView[0][0].name).toBe('finalise-step')
  })

  it('clears errors when corrected or deselected without deleting a draft answer', async () => {
    store.state.user.specialPrize1Interested = true
    store.state.user.specialPrize3Interested = true
    wrapper.vm.validateSpecialPrize1()
    wrapper.vm.validateSpecialPrize3()
    store.state.user.specialPrize1text = 'Rozpracovaný startup.'
    await localVue.nextTick()
    expect(wrapper.vm.specialPrize1Error).toBe('')

    store.state.user.specialPrize1Interested = false
    store.state.user.specialPrize3Interested = false
    await localVue.nextTick()
    expect(wrapper.vm.specialPrize3Error).toBe('')
    expect(store.state.user.specialPrize1text).toBe('Rozpracovaný startup.')

    store.state.user.specialPrize1Interested = true
    await localVue.nextTick()
    expect(wrapper.find('#startup-description').element.value).toBe('Rozpracovaný startup.')
  })

  it('provides labelled textareas with the existing 2000 character limit', async () => {
    store.state.user.specialPrize1Interested = true
    store.state.user.specialPrize3Interested = true
    await localVue.nextTick()
    for (const id of ['startup-description', 'mattoni-description']) {
      expect(wrapper.find(`label[for="${id}"]`).exists()).toBe(true)
      expect(wrapper.find(`#${id}`).attributes('maxlength')).toBe('2000')
      expect(wrapper.find(`#${id}`).attributes('aria-required')).toBe('true')
    }
  })

  it('returns to activities without requiring an optional description', () => {
    store.state.user.specialPrize1Interested = true
    wrapper.vm.goToActivities()
    expect(wrapper.emitted().changeView[0][0].name).toBe('activities-step')
  })
})
