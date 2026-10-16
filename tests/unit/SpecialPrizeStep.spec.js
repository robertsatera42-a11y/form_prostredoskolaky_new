import { createLocalVue, mount } from '@vue/test-utils'
import Vuex from 'vuex'
import { getField, updateField } from 'vuex-map-fields'
import SpecialPrizeStep from '@/components/form/SpecialPrizeStep.vue'

jest.mock('@/components/form/ActivitiesStep', () => ({ name: 'activities-step', render: h => h('div') }))
jest.mock('@/components/form/FinaliseStep', () => ({ name: 'finalise-step', render: h => h('div') }))

const localVue = createLocalVue()
localVue.use(Vuex)

describe('SpecialPrizeStep', () => {
  let wrapper
  let store

  beforeEach(() => {
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

  afterEach(() => wrapper.destroy())

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
