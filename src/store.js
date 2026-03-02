import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import client from './client/client'
import { getField, updateField } from 'vuex-map-fields'
import {
  EVENTS,
  SET_EVENTS,
  FETCH_EVENTS,
  TOTAL_PAGES,
  SET_TOTAL_PAGES,
  TOTAL_EVENTS,
  SET_TOTAL_EVENTS,
  SET_ACTUAL_PAGE,
  ACTUAL_PAGE,
  IS_LOGGED_IN,
  EMPTY_USER,
  UPDATE_USER,
  FETCH_USER,
  SET_USER,
  SET_USER_PROFILE,
  DELETE_USER,
  USER
} from './types'
import tracking from './utils/tracking'
import transformerUtils from './utils/transformerUtils'
import fb from './firebase.js'

Vue.use(Vuex)

const SET_USER_BOOTSTRAP_READY = 'setUserBootstrapReady'

const createInitialUserState = () => ({
  occupation: null,
  firstName: '',
  lastName: '',
  email: '',
  grade: null,
  dob: undefined,
  region: null,
  school: '',
  linkedin: '',
  interests: [],
  activities: [],
  knowledge: null,
  lastSaved: '',
  role: '',
  createdAt: '',
  lastLogin: '',
  sendNewsletter: false,
  schoolContact: '',
  hasRegistration: false,
  summary: '',
  specialPrize1Interested: false,
  specialPrize1text: '',
  specialPrize2Interested: false,
  isRepeting: false,
  isAgree: false,
  readGuideConfirmed: false,
  phone: '',
  image: undefined
})

const FORM_DRAFT_FIELDS = [
  'firstName',
  'lastName',
  'grade',
  'dob',
  'region',
  'school',
  'linkedin',
  'interests',
  'activities',
  'knowledge',
  'summary',
  'specialPrize1Interested',
  'specialPrize1text',
  'specialPrize2Interested',
  'isRepeting',
  'isAgree',
  'readGuideConfirmed',
  'phone'
]

const FORM_DRAFT_PATHS = FORM_DRAFT_FIELDS.map((field) => `user.${field}`)

const DRAFT_MEANINGFUL_FIELDS = FORM_DRAFT_FIELDS.filter(
  (field) => !['firstName', 'lastName', 'dob'].includes(field)
)

const isMeaningfulDraftValue = (value) => {
  if (Array.isArray(value)) {
    return value.length > 0
  }
  if (typeof value === 'string') {
    return value.trim().length > 0
  }
  if (typeof value === 'boolean') {
    return value
  }
  return value !== null && value !== undefined
}

const hasMeaningfulDraftData = (userState = {}) =>
  DRAFT_MEANINGFUL_FIELDS.some((field) =>
    isMeaningfulDraftValue(userState[field])
  )

const getClearedDraftUserPayload = () => {
  const initialUserState = createInitialUserState()
  return FORM_DRAFT_FIELDS.reduce((payload, field) => {
    payload[field] = initialUserState[field]
    return payload
  }, {})
}

const createDraftPersistenceSubscriber = (store) => (handler) => {
  store.subscribe(handler)
  store.watch(
    (state) => state.user,
    () => {
      handler({ type: '__draft_watch__' }, store.state)
    },
    { deep: true }
  )
}

fb.auth.onAuthStateChanged(async (user) => {
  try {
    if (user) {
      const role = await fb.getRole()
      const hasRegistration = await client.hasRegistration()
      user.role = role
      user.hasRegistration = hasRegistration
      store.commit(SET_USER, user)
    } else {
      store.commit(EMPTY_USER)
    }
  } catch (err) {
    console.log(err)
    if (user) {
      store.commit(SET_USER, user)
    } else {
      store.commit(EMPTY_USER)
    }
  } finally {
    store.commit(SET_USER_BOOTSTRAP_READY, true)
  }
})

const store = new Vuex.Store({
  state: {
    user: createInitialUserState(),
    events: [
      {
        eventName: '',
        description: '',
        eventUrl: '',
        categories: [],
        types: [],
        contact: '',
        deadlines: [],
        logo: '',
        ageGroup: [],
        isForeign: false,
        group: []
      }
    ],
    totalPages: null,
    totalEvents: null,
    actualPage: null,
    search: '',
    isUserBootstrapReady: false,
    checkedCategories: [],
    checkedTypes: []
  },
  plugins: [
    createPersistedState({
      key: 'form-draft',
      paths: FORM_DRAFT_PATHS,
      subscriber: createDraftPersistenceSubscriber,
      rehydrated: (store) => {
        if (store.state.user && store.state.user.dob) {
          store.state.user.dob = new Date(store.state.user.dob)
        }
      }
    })
  ],
  getters: {
    getField,
    [EVENTS]: (state) => state.events,
    [TOTAL_PAGES]: (state) => state.totalPages,
    [TOTAL_EVENTS]: (state) => state.totalEvents,
    [ACTUAL_PAGE]: (state) => state.actualPage,
    [USER]: (state) => state.user,
    [IS_LOGGED_IN]: (state) => state.user.email,
    isUserBootstrapReady: (state) => state.isUserBootstrapReady
  },
  mutations: {
    updateField,

    [SET_USER_BOOTSTRAP_READY] (state, isReady) {
      state.isUserBootstrapReady = isReady
    },

    // event
    [SET_EVENTS] (state, events) {
      state.events = [...events]
    },
    [SET_TOTAL_PAGES] (state, totalPages) {
      state.totalPages = totalPages
    },
    [SET_TOTAL_EVENTS] (state, totalEvents) {
      state.totalEvents = totalEvents
    },
    [SET_ACTUAL_PAGE] (state, page) {
      state.actualPage = page
    },

    // user
    [SET_USER_PROFILE] (state, user) {
      state.user.firstName = user.firstName
      state.user.lastName = user.lastName
      state.user.email = user.email
      state.user.occupation = user.occupation
      state.user.sendNewsletter = user.sendNewsletter
    },
    [SET_USER] (state, user) {
      const firstNameFromPayload =
        user && user.displayName
          ? user.displayName.split(' ')[0]
          : user.firstName
      const lastNameFromPayload =
        user && user.displayName
          ? user.displayName.split(' ')[1]
          : user.lastName
      const mappedUser = {
        occupation: user.occupation || null,
        firstName: firstNameFromPayload,
        lastName: lastNameFromPayload,
        email: user.email || '',
        grade: user.grade || null,
        dob: user.dob ? new Date(user.dob) : new Date('Jan 1 2000'),
        region: user.region || null,
        school: user.school || '',
        linkedin: user.linkedinUrl || '',
        interests: user.interests ? user.interests : [],
        activities: user.activities
          ? user.activities.map((a) => {
            return {
              ...a,
              isIndividual: a.isIndividual ? 'Individuální' : 'Týmové'
            }
          })
          : [],
        knowledge: user.knowledge || null,
        lastSaved: user.updatedAt ? new Date(user.updatedAt) : undefined,
        role: user.role || '',
        sendNewsletter: user.sendNewsletter || false,
        schoolContact: user.schoolContact || '',
        hasRegistration: user.hasRegistration || false,
        summary: user.summary || '',
        specialPrize1Interested: user.specialPrize1Interested || false,
        specialPrize1text: user.specialPrize1text || '',
        specialPrize2Interested: user.specialPrize2Interested || false,
        isRepeting: typeof user.isFirstTime === 'boolean' ? !user.isFirstTime : false,
        isAgree: user.isAgree || false,
        readGuideConfirmed: user.readGuideConfirmed || false,
        phone: user.phone || ''
      }
      const shouldPreserveLocalDraft =
        hasMeaningfulDraftData(state.user) && !user.__forceRemote

      if (shouldPreserveLocalDraft) {
        const preservedDraftFields = FORM_DRAFT_FIELDS.reduce((draft, field) => {
          draft[field] = state.user[field]
          return draft
        }, {})

        state.user = {
          ...mappedUser,
          ...preservedDraftFields
        }
      } else {
        state.user = mappedUser
      }
    },
    [UPDATE_USER] (state, user) {
      state.user = {
        ...user
      }
    },
    [EMPTY_USER] (state) {
      state.user = {
        firstName: '',
        lastName: '',
        email: ''
      }
    },
    clearDraft (state) {
      state.user = {
        ...state.user,
        ...getClearedDraftUserPayload()
      }
    }
  },
  actions: {
    // user
    [FETCH_USER]: async ({ commit }, payload) => {
      try {
        const options =
          typeof payload === 'string'
            ? { content: payload, forceRemote: false }
            : {
              content: payload && payload.content ? payload.content : 'full',
              forceRemote: Boolean(payload && payload.forceRemote)
            }
        const user = await client.getUser(options.content)
        const userPayload = options.forceRemote ? { ...user, __forceRemote: true } : user

        options.content === 'profile'
          ? commit(SET_USER_PROFILE, userPayload)
          : commit(SET_USER, userPayload)
      } catch (err) {
        console.log(err)
      }
    },

    [DELETE_USER]: async ({ commit, state }) => {
      try {
        await client.deleteUser()
        commit(EMPTY_USER)
      } catch (err) {
        console.log(err)
      }
    },
    clearDraft: ({ commit }) => {
      commit('clearDraft')
    },
    revertToSaved: async ({ dispatch }) => {
      await dispatch(FETCH_USER, { content: 'full', forceRemote: true })
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem('form-draft')
      }
    }
  }
})

export default store
