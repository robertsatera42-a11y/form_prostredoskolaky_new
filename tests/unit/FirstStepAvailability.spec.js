import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'
import Vuelidate from 'vuelidate'
import Buefy from 'buefy'
import { getField, updateField } from 'vuex-map-fields'
import FirstStep from '@/components/form/FirstStep.vue'
jest.mock('@/client/client', () => ({ getSchools: jest.fn() }))
jest.mock('@/utils/tracking', () => ({ track: jest.fn() }))
jest.mock('@/components/form/ActivitiesStep', () => ({ name: 'activities-step', render: h => h('div') }))
const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(Vuelidate)
localVue.use(Buefy)

it('keeps the two native checkbox answers and their labels independent', async () => {
  const store = new Vuex.Store({ state: { user: { firstName: '', lastName: '', email: '', grade: null, region: null, school: '', dob: null, phone: '', summary: '', interests: [], knowledge: null, isRepeting: false, readGuideConfirmed: false, hasTime: false } }, getters: { getField }, mutations: { updateField }, actions: { fetchUser: jest.fn() } })
  const wrapper = shallowMount(FirstStep, { localVue, store })
  try {
    await localVue.nextTick()
    expect(wrapper.find('#first-step-has-time').exists()).toBe(true)
    expect(wrapper.findAll('#first-step-repeating').length).toBe(1)
    expect(wrapper.find('label[for="first-step-has-time"]').text()).toBe('Měl/a bych čas se zúčastnit Víkendu TOP25 4.–6. 6. 2027.')
    await wrapper.find('#first-step-has-time').setChecked(true)
    expect(store.state.user.hasTime).toBe(true)
    expect(store.state.user.isRepeting).toBe(false)
    await wrapper.find('#first-step-repeating').setChecked(true)
    await wrapper.find('#first-step-has-time').setChecked(false)
    expect(store.state.user.hasTime).toBe(false)
    expect(store.state.user.isRepeting).toBe(true)
    expect(wrapper.vm.$v.user.hasTime).toBeUndefined()
  } finally { wrapper.destroy() }
})
