jest.mock('@/firebase', () => ({ auth: { onAuthStateChanged: jest.fn() } }))
jest.mock('@/client/client', () => ({ getUser: jest.fn() }))
jest.mock('@/router', () => ({ push: jest.fn() }))
jest.mock('@/utils/tracking', () => ({ track: jest.fn() }))
const key = 'form-draft-2027-v1'
const loadStore = () => require('@/store').default

describe('Availability draft state', () => {
  beforeEach(() => { jest.resetModules(); localStorage.clear() })
  afterEach(() => { localStorage.clear() })

  for (const hasTime of [true, false]) it(`persists and reloads ${hasTime} independently of repeated participation`, async () => {
    const store = loadStore()
    store.commit('updateField', { path: 'user.hasTime', value: hasTime })
    store.commit('updateField', { path: 'user.isRepeting', value: !hasTime })
    await require('vue').nextTick()
    expect(JSON.parse(localStorage.getItem(key)).user.hasTime).toBe(hasTime)
    jest.resetModules()
    const restored = loadStore()
    expect(restored.state.user.hasTime).toBe(hasTime)
    expect(restored.state.user.isRepeting).toBe(!hasTime)
    await restored.dispatch('clearDraft')
    expect(restored.state.user.hasTime).toBe(false)
  })

  it('defaults an older draft to false without inferring from isRepeting or deleting other fields', () => {
    localStorage.setItem(key, JSON.stringify({ user: { isRepeting: true, summary: 'Keep this draft' } }))
    const store = loadStore()
    expect(store.state.user.hasTime).toBe(false)
    expect(store.state.user.isRepeting).toBe(true)
    expect(store.state.user.summary).toBe('Keep this draft')
  })

  it('hydrates availability from the API, preserves a local answer, and force-restores saved data', async () => {
    const store = loadStore()
    store.commit('setUser', { email: 'student@example.test', hasTime: true })
    expect(store.state.user.hasTime).toBe(true)
    store.state.user.hasTime = false
    store.state.user.summary = 'Local edits'
    store.commit('setUser', { email: 'student@example.test', hasTime: true })
    expect(store.state.user.hasTime).toBe(false)
    require('@/client/client').getUser.mockResolvedValueOnce({ email: 'student@example.test', hasTime: true })
    await store.dispatch('revertToSaved')
    expect(store.state.user.hasTime).toBe(true)
    expect(localStorage.getItem(key)).toBe(null)
  })

  it('treats availability alone as meaningful local draft data during API hydration', () => {
    const store = loadStore()
    store.state.user.hasTime = true
    store.commit('setUser', { email: 'student@example.test', hasTime: false })
    expect(store.state.user.hasTime).toBe(true)
  })

  it('warns about unsaved changes when the only saved answer changes from true to false', () => {
    const store = loadStore()
    const methods = require('@/views/FormPage').default.methods
    const context = { user: store.state.user, baselineDraftSignature: '' }
    context.getDraftSignature = () => methods.getDraftSignature.call(context)
    context.hasMeaningfulDraft = () => methods.hasMeaningfulDraft.call(context)
    context.user.hasTime = true
    methods.setBaselineDraftSignature.call(context)
    context.user.hasTime = false
    expect(methods.hasUnsavedChanges.call(context)).toBe(true)
  })
})
