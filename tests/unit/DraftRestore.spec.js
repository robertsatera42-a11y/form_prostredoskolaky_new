import store from '@/store'
import client from '@/client/client'
import { EMPTY_USER } from '@/types'

jest.mock('@/firebase', () => ({ auth: { onAuthStateChanged: jest.fn() } }))
jest.mock('@/client/client', () => ({ getUser: jest.fn() }))
jest.mock('@/utils/tracking', () => ({ track: jest.fn() }))
jest.mock('vuex-persistedstate', () => () => () => {})

describe('Restoring the saved application', () => {
  beforeEach(() => {
    client.getUser.mockReset()
    store.replaceState({ user: { email: 'preview@example.test', summary: 'Local draft', activities: [], interests: [] } })
    localStorage.setItem('form-draft', 'original-local-draft')
  })
  afterEach(() => { localStorage.removeItem('form-draft') })

  it('preserves the in-memory and persisted draft if the remote request fails', async () => {
    client.getUser.mockRejectedValueOnce(new Error('Offline'))
    await expect(store.dispatch('revertToSaved')).rejects.toThrow('Offline')
    expect(store.state.user.summary).toBe('Local draft')
    expect(localStorage.getItem('form-draft')).toBe('original-local-draft')
  })

  it('rejects an unusable response without replacing or deleting the draft', async () => {
    client.getUser.mockResolvedValueOnce(undefined)
    await expect(store.dispatch('revertToSaved')).rejects.toThrow()
    expect(store.state.user.summary).toBe('Local draft')
    expect(localStorage.getItem('form-draft')).toBe('original-local-draft')
  })

  it('does not restore a response that arrives after logout', async () => {
    let resolveRequest
    client.getUser.mockReturnValueOnce(new Promise(resolve => { resolveRequest = resolve }))
    const restore = store.dispatch('revertToSaved')
    store.commit(EMPTY_USER)
    resolveRequest({ email: 'preview@example.test', summary: 'Saved application' })
    await expect(restore).rejects.toThrow()
    expect(store.state.user.email).toBe('')
    expect(localStorage.getItem('form-draft')).toBe('original-local-draft')
  })

  it('does not replace another account or its draft with a delayed response', async () => {
    let resolveRequest
    client.getUser.mockReturnValueOnce(new Promise(resolve => { resolveRequest = resolve }))
    const restore = store.dispatch('revertToSaved')
    store.replaceState({ user: { email: 'another@example.test', summary: 'Another local draft' } })
    localStorage.setItem('form-draft', 'another-local-draft')
    resolveRequest({ email: 'preview@example.test', summary: 'Saved application' })
    await expect(restore).rejects.toThrow()
    expect(store.state.user.email).toBe('another@example.test')
    expect(store.state.user.summary).toBe('Another local draft')
    expect(localStorage.getItem('form-draft')).toBe('another-local-draft')
  })

  it('rejects a saved response belonging to a different account', async () => {
    client.getUser.mockResolvedValueOnce({ email: 'another@example.test', summary: 'Another application' })
    await expect(store.dispatch('revertToSaved')).rejects.toThrow()
    expect(store.state.user.summary).toBe('Local draft')
    expect(localStorage.getItem('form-draft')).toBe('original-local-draft')
  })

  it('preserves newer same-account edits when the original view cancels its restore', async () => {
    let resolveRequest
    client.getUser.mockReturnValueOnce(new Promise(resolve => { resolveRequest = resolve }))
    const request = { cancelled: false }
    const restore = store.dispatch('revertToSaved', request)
    request.cancelled = true
    store.state.user.summary = 'Newer edits after returning to the form'
    localStorage.setItem('form-draft', 'newer-local-draft')
    resolveRequest({ email: 'preview@example.test', summary: 'Saved application' })
    await expect(restore).rejects.toThrow()
    expect(store.state.user.summary).toBe('Newer edits after returning to the form')
    expect(localStorage.getItem('form-draft')).toBe('newer-local-draft')
  })

  it('replaces local edits with the saved data only after the fetch succeeds', async () => {
    client.getUser.mockResolvedValueOnce({ email: 'preview@example.test', firstName: 'Robert', lastName: 'Náhled', summary: 'Saved application', activities: [], interests: [] })
    await store.dispatch('revertToSaved')
    expect(client.getUser).toHaveBeenCalledWith('full')
    expect(store.state.user.summary).toBe('Saved application')
    expect(localStorage.getItem('form-draft')).toBe(null)
  })
})
