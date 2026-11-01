jest.mock('@/firebase', () => ({ auth: { onAuthStateChanged: jest.fn() } }))
jest.mock('@/client/client', () => ({ getUser: jest.fn() }))

const currentKey = 'form-draft-2027-v1'

function loadStore () {
  return require('@/store').default
}

describe('Competition draft persistence', () => {
  beforeEach(() => {
    jest.resetModules()
    localStorage.clear()
  })

  afterEach(() => {
    jest.restoreAllMocks()
    localStorage.clear()
  })

  it('discards the legacy draft before loading without clearing unrelated storage', () => {
    localStorage.setItem('form-draft', JSON.stringify({ user: { school: 'Old school', activities: [{ name: 'Last year' }], isAgree: true } }))
    localStorage.setItem('login-sentinel', 'keep-session')
    localStorage.setItem('form-draft-2026-v1', JSON.stringify({ user: { summary: 'Previous competition' } }))

    const store = loadStore()

    expect(store.state.user.activities).toEqual([])
    expect(store.state.user.school).toBe('')
    expect(store.state.user.isAgree).toBe(false)
    expect(localStorage.getItem('form-draft')).toBe(null)
    expect(localStorage.getItem('login-sentinel')).toBe('keep-session')
  })

  it('persists the current form fields across reloads and restores the birth date', async () => {
    const user = {
      firstName: 'Anna',
      lastName: 'Nová',
      grade: '3',
      dob: new Date('2008-05-12T00:00:00.000Z'),
      region: 'Praha',
      school: 'Gymnázium',
      linkedin: 'https://example.test/profile',
      interests: ['Věda'],
      activities: [{ name: 'Current project', reference: 'mentor@example.test' }],
      knowledge: 'Od školy',
      summary: 'Current application',
      phone: '+420123456789',
      specialPrize1Interested: true,
      specialPrize1text: 'Project answer',
      specialPrize2Interested: true,
      specialPrize3Interested: true,
      specialPrize3text: 'Talent answer',
      isRepeting: true,
      isAgree: true,
      hasTime: false,
      readGuideConfirmed: true
    }
    const store = loadStore()
    store.commit('updateField', { path: 'user', value: { ...store.state.user, ...user, email: 'private@example.test', role: 'student' } })
    await require('vue').nextTick()

    const persisted = JSON.parse(localStorage.getItem(currentKey))
    expect(persisted.user).toEqual({ ...user, dob: '2008-05-12T00:00:00.000Z' })
    expect(localStorage.getItem('form-draft')).toBe(null)

    jest.resetModules()
    const reloaded = loadStore()
    expect(reloaded.state.user).toMatchObject(user)
    expect(reloaded.state.user.dob).toBeInstanceOf(Date)
    expect(reloaded.state.user.email).toBe('')
  })

  it('saves direct nested edits and clears only the current form fields', async () => {
    const store = loadStore()
    store.commit('updateField', { path: 'user.email', value: 'student@example.test' })
    store.state.user.activities.push({ name: 'Added directly' })
    store.state.user.phone = '123456789'
    await require('vue').nextTick()
    expect(JSON.parse(localStorage.getItem(currentKey)).user.activities).toEqual([{ name: 'Added directly' }])

    await store.dispatch('clearDraft')
    await require('vue').nextTick()
    const persisted = JSON.parse(localStorage.getItem(currentKey))
    expect(persisted.user.activities).toEqual([])
    expect(persisted.user.phone).toBe('')
    expect(store.state.user.email).toBe('student@example.test')
  })

  it('preserves a current draft when a legacy entry also exists', () => {
    localStorage.setItem('form-draft', JSON.stringify({ user: { summary: 'Last year' } }))
    localStorage.setItem(currentKey, JSON.stringify({ user: { summary: 'This year', activities: [{ name: 'New activity' }] } }))
    const store = loadStore()
    expect(store.state.user.summary).toBe('This year')
    expect(store.state.user.activities).toEqual([{ name: 'New activity' }])
    expect(localStorage.getItem('form-draft')).toBe(null)
  })

  it('starts with defaults when the current draft is malformed', () => {
    localStorage.setItem(currentKey, 'not-json')
    expect(loadStore().state.user.activities).toEqual([])
  })

  it('keeps the form usable when browser storage is unavailable', async () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('Storage blocked') })
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Storage blocked') })
    jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => { throw new Error('Storage blocked') })

    const store = loadStore()
    expect(store.state.user.activities).toEqual([])
    store.commit('updateField', { path: 'user.summary', value: 'In-memory progress' })
    await require('vue').nextTick()
    expect(store.state.user.summary).toBe('In-memory progress')
  })
})
