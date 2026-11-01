import { createLocalVue, mount } from '@vue/test-utils'
import Vuex from 'vuex'
import Buefy from 'buefy'
import Vuelidate from 'vuelidate'
import { getField, updateField } from 'vuex-map-fields'
import ActivityForm from '@/components/form/ActivityForm.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(Buefy)
localVue.use(Vuelidate)

const validActivity = {
  name: 'Studentský projekt',
  type: 'Vlastní projekt',
  field: 'Celonárodní',
  interest: 'IT & robotika',
  isIndividual: 'Týmové',
  result: 'Navrhli jsme funkční prototyp.',
  start: 'Tři měsíce, čtyři hodiny týdně.',
  link: '',
  reference: 'Mentor, mentor@example.test'
}

const classifications = [
  ['Soutěž', true, true],
  ['Kurz', true, false],
  ['Dlouhodobý program', true, false],
  ['Konference/Event', true, false],
  ['Stáž / brigáda / zaměstnání', true, false],
  ['Vlastní projekt', true, true],
  ['Spolek', true, false],
  ['Samostudium/samoaktivita', false, false],
  ['Jiné', true, true]
]

describe('ActivityForm', () => {
  let wrapper
  let store
  let close
  let background
  let originalConfirm
  let originalViewport

  function open (index = null, act = {}) {
    wrapper = mount(ActivityForm, {
      localVue,
      store,
      attachTo: document.body,
      propsData: { index, act },
      parentComponent: {
        methods: {
          close () {
            close()
            this.$emit('close')
          }
        }
      }
    })
    return localVue.nextTick()
  }

  beforeEach(() => {
    originalConfirm = window.confirm
    originalViewport = Object.getOwnPropertyDescriptor(window, 'visualViewport')
    window.confirm = jest.fn(() => false)
    close = jest.fn()
    background = document.createElement('div')
    background.id = 'app'
    background.inert = false
    document.body.appendChild(background)
    store = new Vuex.Store({
      state: { user: { activities: [] } },
      getters: { getField },
      mutations: { updateField }
    })
  })

  afterEach(() => {
    if (wrapper && !wrapper.vm._isDestroyed) wrapper.destroy()
    jest.restoreAllMocks()
    wrapper = null
    background.remove()
    window.confirm = originalConfirm
    if (originalViewport) Object.defineProperty(window, 'visualViewport', originalViewport)
    else delete window.visualViewport
  })

  it('follows the requested keyboard reading order in the empty form', async () => {
    await open()
    const order = wrapper.findAll('input, select, textarea').wrappers.map(control => control.attributes('id'))
    expect(order).toEqual(['activity-name', 'activity-type', 'activity-link', 'activity-result', 'activity-start', 'activity-reference'])
    expect(document.activeElement.id).toBe('activity-name')
  })

  it('groups conditional classifications before the website field', async () => {
    await open()
    wrapper.vm.activity.type = 'Soutěž'
    await localVue.nextTick()
    const order = wrapper.findAll('input, select, textarea').wrappers.map(control => control.attributes('id'))
    expect(order.slice(0, 6)).toEqual(['activity-name', 'activity-type', 'activity-field', 'activity-interest', 'activity-individual', 'activity-link'])
  })

  for (const [type, hasField, hasIndividual] of classifications) {
    it(`preserves visibility and required rules for ${type}`, async () => {
      await open()
      Object.assign(wrapper.vm.activity, { name: 'Aktivita', result: 'Výsledek', start: 'Dva měsíce', reference: validActivity.reference, type })
      await localVue.nextTick()
      expect(wrapper.find('#activity-field').exists()).toBe(hasField)
      expect(wrapper.find('#activity-interest').exists()).toBe(true)
      expect(wrapper.find('#activity-individual').exists()).toBe(hasIndividual)
      expect(wrapper.vm.$v.activity.field.$invalid).toBe(hasField)
      expect(wrapper.vm.$v.activity.interest.$invalid).toBe(true)
      expect(wrapper.vm.$v.activity.isIndividual.$invalid).toBe(hasIndividual)
      Object.assign(wrapper.vm.activity, { field: 'Celonárodní', interest: 'IT & robotika', isIndividual: 'Individuální' })
      await localVue.nextTick()
      expect(wrapper.vm.$v.activity.$invalid).toBe(false)
    })
  }

  it('keeps local edits out of Vuex until a valid activity is confirmed', async () => {
    await open()
    Object.assign(wrapper.vm.activity, validActivity)
    await localVue.nextTick()
    expect(store.state.user.activities).toEqual([])
    wrapper.vm.submit()
    expect(store.state.user.activities).toEqual([validActivity])
    expect(close).toHaveBeenCalledTimes(1)
  })

  it('edits index zero without mutating the original activity before confirmation', async () => {
    store.state.user.activities.push({ ...validActivity })
    await open(0, store.state.user.activities[0])
    wrapper.vm.activity.name = 'Upravený projekt'
    await localVue.nextTick()
    expect(store.state.user.activities[0].name).toBe(validActivity.name)
    wrapper.vm.submit()
    expect(store.state.user.activities).toHaveLength(1)
    expect(store.state.user.activities[0].name).toBe('Upravený projekt')
  })

  it('reports all missing required fields and focuses the first invalid control', async () => {
    await open()
    wrapper.vm.submit()
    await localVue.nextTick()
    expect(close).not.toHaveBeenCalled()
    expect(wrapper.findAll('[aria-invalid="true"]')).toHaveLength(5)
    expect(document.activeElement.id).toBe('activity-name')
    expect(store.state.user.activities).toEqual([])
  })

  it('allows an empty website while preserving the three 500-character limits', async () => {
    await open()
    Object.assign(wrapper.vm.activity, validActivity)
    await localVue.nextTick()
    expect(wrapper.vm.$v.activity.$invalid).toBe(false)
    for (const id of ['activity-result', 'activity-start', 'activity-reference']) {
      expect(wrapper.find(`#${id}`).attributes('maxlength')).toBe('500')
      expect(wrapper.find(`label[for="${id}"]`).exists()).toBe(true)
    }
  })

  for (const reference of ['', ' \n ']) {
    it(`requires a nonblank reference: ${JSON.stringify(reference)}`, async () => {
      await open()
      Object.assign(wrapper.vm.activity, validActivity, { reference })
      await localVue.nextTick()
      wrapper.vm.submit()
      await localVue.nextTick()
      expect(close).not.toHaveBeenCalled()
      expect(store.state.user.activities).toEqual([])
      expect(wrapper.find('#activity-reference').attributes('aria-required')).toBe('true')
      expect(wrapper.find('#activity-reference').attributes('aria-invalid')).toBe('true')
      expect(wrapper.find('#activity-reference-error').text()).toBeTruthy()
      expect(document.activeElement.id).toBe('activity-reference')
    })
  }

  for (const [field, limit, id] of [['name', 150, 'activity-name'], ['link', 300, 'activity-link']]) {
    it(`accepts ${limit} characters in ${field} and rejects an older longer value without truncation`, async () => {
      const longer = 'a'.repeat(limit + 1)
      store.state.user.activities.push({ ...validActivity, [field]: longer })
      await open(0, store.state.user.activities[0])
      expect(wrapper.find(`#${id}`).attributes('maxlength')).toBe(String(limit))
      expect(wrapper.find(`#${id}-count`).text()).toContain(`${limit + 1} / ${limit}`)
      expect(wrapper.find(`#${id}`).element.value).toBe(longer)
      wrapper.vm.submit()
      await localVue.nextTick()
      expect(close).not.toHaveBeenCalled()
      expect(wrapper.find(`#${id}-error`).text()).toContain(String(limit))
      expect(store.state.user.activities[0][field]).toBe(longer)
      await localVue.nextTick()
      await wrapper.find(`#${id}`).setValue('a'.repeat(limit))
      await localVue.nextTick()
      expect(wrapper.vm.activity[field]).toHaveLength(limit)
      wrapper.vm.submit()
      expect(close).toHaveBeenCalledTimes(1)
      expect(store.state.user.activities[0][field]).toHaveLength(limit)
    })
  }

  it('keeps the description example available while an applicant writes their own text', async () => {
    await open()
    await wrapper.find('#activity-result').setValue('Můj vlastní popis aktivity.')
    const example = wrapper.find('details.editor-example')
    expect(example.exists()).toBe(true)
    expect(example.find('summary').text()).toBe('Příklad popisu')
    expect(example.text()).toContain('Dosáhl jsem prvního místa v celostátním kole')
    expect(wrapper.find('#activity-result').element.value).toBe('Můj vlastní popis aktivity.')
    expect(store.state.user.activities).toEqual([])
  })

  it('retains classification values when their controls are temporarily hidden', async () => {
    await open()
    Object.assign(wrapper.vm.activity, validActivity)
    wrapper.vm.activity.type = 'Samostudium/samoaktivita'
    await localVue.nextTick()
    expect(wrapper.find('#activity-field').exists()).toBe(false)
    expect(wrapper.find('#activity-individual').exists()).toBe(false)
    wrapper.vm.activity.type = 'Soutěž'
    await localVue.nextTick()
    expect(wrapper.find('#activity-field').element.value).toBe(validActivity.field)
    expect(wrapper.find('#activity-individual').element.value).toBe(validActivity.isIndividual)
  })

  it('closes an untouched editor without asking to discard changes', async () => {
    await open()
    wrapper.vm.confirmClose()
    expect(window.confirm).not.toHaveBeenCalled()
    expect(close).toHaveBeenCalledTimes(1)
    expect(background.inert).toBe(false)
  })

  it('keeps modified data open when discard is declined, and discards when accepted', async () => {
    await open()
    wrapper.vm.activity.name = 'Rozpracovaná aktivita'
    await localVue.nextTick()
    wrapper.vm.confirmClose()
    expect(close).not.toHaveBeenCalled()
    expect(wrapper.vm.activity.name).toBe('Rozpracovaná aktivita')
    window.confirm.mockReturnValueOnce(true)
    wrapper.vm.confirmClose()
    expect(close).toHaveBeenCalledTimes(1)
    expect(store.state.user.activities).toEqual([])
  })

  it('tracks the visible viewport and releases its listeners when destroyed', async () => {
    const viewport = document.createElement('div')
    viewport.height = 580
    Object.defineProperty(viewport, 'offsetTop', { configurable: true, writable: true, value: 12 })
    const removeListener = jest.spyOn(viewport, 'removeEventListener')
    // JSDOM 11 drops CSS custom properties; real-browser checks cover geometry.
    const setProperty = jest.spyOn(window.CSSStyleDeclaration.prototype, 'setProperty')
    Object.defineProperty(window, 'visualViewport', { configurable: true, value: viewport })
    await open()
    expect(setProperty).toHaveBeenCalledWith('--editor-viewport-height', '580px')
    viewport.height = 350
    viewport.offsetTop = 20
    viewport.dispatchEvent(new window.Event('resize'))
    expect(setProperty).toHaveBeenCalledWith('--editor-viewport-height', '350px')
    expect(setProperty).toHaveBeenCalledWith('--editor-viewport-top', '20px')
    expect(background.inert).toBe(true)
    wrapper.destroy()
    expect(removeListener).toHaveBeenCalledWith('resize', expect.any(Function))
    expect(removeListener).toHaveBeenCalledWith('scroll', expect.any(Function))
    expect(background.inert).toBe(false)
  })
})
