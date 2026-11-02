import { createLocalVue, mount } from '@vue/test-utils'
import Vuex from 'vuex'
import Buefy from 'buefy'
import { getField, updateField } from 'vuex-map-fields'
import ActivitiesStep from '@/components/form/ActivitiesStep.vue'

jest.mock('@/components/form/FirstStep', () => ({ render: h => h('div') }))
jest.mock('@/components/form/SpecialPrizeStep', () => ({ render: h => h('div') }))
jest.mock('@/utils/tracking', () => ({ track: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(Buefy)

describe('activity removal confirmation', () => {
  let wrapper
  let store
  let background
  let modals

  const settle = async () => {
    await localVue.nextTick()
    await localVue.nextTick()
  }
  const dialog = () => modals.length ? modals[modals.length - 1].$el.querySelector('[role="alertdialog"]') : null
  const cancel = () => dialog().querySelector('.removal-cancel').click()
  const confirm = () => dialog().querySelector('.removal-confirm').click()

  beforeEach(() => {
    window.scrollTo = jest.fn()
    background = document.createElement('div')
    background.id = 'app'
    background.inert = false
    document.body.appendChild(background)
    store = new Vuex.Store({
      state: { user: { activities: [{ name: 'První projekt' }, { name: 'Druhý projekt' }] } },
      getters: { getField, user: state => state.user },
      mutations: { updateField }
    })
    const mountPoint = document.createElement('div')
    background.appendChild(mountPoint)
    wrapper = mount(ActivitiesStep, { localVue, store, attachTo: mountPoint })
    modals = []
    const open = wrapper.vm.$modal.open
    jest.spyOn(wrapper.vm.$modal, 'open').mockImplementation(params => {
      const modal = open(params)
      modals.push(modal)
      return modal
    })
  })

  afterEach(() => {
    modals.forEach(modal => {
      modal.$destroy()
      if (modal.$el.parentNode) modal.$el.parentNode.removeChild(modal.$el)
    })
    wrapper.destroy()
    background.remove()
    document.querySelectorAll('.activity-removal-host').forEach(element => element.remove())
    jest.restoreAllMocks()
  })

  async function requestRemoval (index = 0) {
    const trigger = wrapper.findAll('.delete-action').at(index).element
    trigger.focus()
    trigger.click()
    await settle()
    return trigger
  }

  it('asks before changing the list, names the activity, and initially focuses Cancel', async () => {
    await requestRemoval()
    expect(store.state.user.activities).toHaveLength(2)
    expect(dialog()).not.toBeNull()
    expect(dialog().textContent).toContain('První projekt')
    expect(document.activeElement.textContent).toBe('Zrušit')
    expect(background.inert).toBe(true)
  })

  for (const method of ['button', 'escape', 'backdrop']) {
    it(`keeps the activity and restores focus when cancelled by ${method}`, async () => {
      const trigger = await requestRemoval()
      expect(dialog()).not.toBeNull()
      if (method === 'button') cancel()
      if (method === 'escape') dialog().dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
      if (method === 'backdrop') modals[0].$el.querySelector('.modal-background').click()
      await settle()
      expect(store.state.user.activities).toHaveLength(2)
      expect(document.activeElement).toBe(trigger)
      expect(background.inert).toBe(false)
      expect(wrapper.vm.feedback).toBe('')
    })
  }

  it('restores the clicked delete button when a pointer click does not focus it', async () => {
    const trigger = wrapper.find('.delete-action').element
    if (document.activeElement) document.activeElement.blur()
    trigger.click()
    await settle()
    expect(dialog()).not.toBeNull()
    cancel()
    await settle()
    expect(document.activeElement).toBe(trigger)
  })

  it('removes only the captured activity even when its index changes, then focuses the remaining card', async () => {
    await requestRemoval(1)
    expect(dialog()).not.toBeNull()
    store.state.user.activities.unshift({ name: 'Nově vložený projekt' })
    await settle()
    confirm()
    await settle()
    expect(store.state.user.activities.map(a => a.name)).toEqual(['Nově vložený projekt', 'První projekt'])
    expect(document.activeElement).toBe(wrapper.findAll('.edit-action').at(1).element)
    expect(wrapper.vm.feedback).toContain('Druhý projekt')
  })

  it('does not remove a replacement if the selected activity disappears before confirmation', async () => {
    await requestRemoval()
    expect(dialog()).not.toBeNull()
    store.state.user.activities.splice(0, 1)
    confirm()
    await settle()
    expect(store.state.user.activities.map(a => a.name)).toEqual(['Druhý projekt'])
  })

  it('opens one dialog for repeated requests and focuses Add after removing the last activity', async () => {
    store.state.user.activities.splice(1, 1)
    await requestRemoval()
    wrapper.vm.deleteItem(0)
    expect(modals).toHaveLength(1)
    expect(dialog()).not.toBeNull()
    confirm()
    await settle()
    expect(store.state.user.activities).toEqual([])
    expect(document.activeElement).toBe(wrapper.find('.add-button').element)
  })

  it('renders the activity name as text and keeps keyboard focus inside the dialog', async () => {
    store.state.user.activities[0].name = '<img src=x onerror=alert(1)>'
    await requestRemoval()
    expect(dialog()).not.toBeNull()
    expect(dialog().querySelector('img')).toBeNull()
    expect(dialog().textContent).toContain('<img src=x onerror=alert(1)>')
    const first = dialog().querySelector('.removal-cancel')
    const last = dialog().querySelector('.removal-confirm')
    last.focus()
    last.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))
    expect(document.activeElement).toBe(first)
    first.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }))
    expect(document.activeElement).toBe(last)
  })
})
