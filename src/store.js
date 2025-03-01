import Vue from "vue";
import Vuex from "vuex";
import client from "./client/client";
import { getField, updateField } from "vuex-map-fields";
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
  USER,
} from "./types";
import tracking from "./utils/tracking";
import transformerUtils from "./utils/transformerUtils";
import fb from "./firebase.js";

Vue.use(Vuex);

fb.auth.onAuthStateChanged(async (user) => {
  if (user) {
    const role = await fb.getRole();
    const hasRegistration = await client.hasRegistration();
    user.role = role;
    user.hasRegistration = hasRegistration;
    store.commit(SET_USER, user);
  } else {
    store.commit(EMPTY_USER);
  }
});

const store = new Vuex.Store({
  state: {
    user: {
      occupation: null,
      firstName: "",
      lastName: "",
      email: "",
      grade: null,
      dob: undefined,
      region: null,
      school: "",
      linkedin: "",
      interests: [],
      activities: [],
      knowledge: null,
      lastSaved: "",
      role: "",
      createdAt: "",
      lastLogin: "",
      sendNewsletter: false,
      schoolContact: "",
      hasRegistration: false,
      summary: "",
      specialPrize1text: "",
      specialPrize2doesSport: false,
      specialPrize2sportAmbitions: "",
      specialPrize2sportSuccess: "",
      specialPrize2sportObstacle: "",
      specialPrize2foreignStudy: false,
      specialPrize2foreignReason: "",
      specialPrize2foreignUniversity: "",
      specialPrize2foreignunique: "",
      specialPrize2foreignScary: "",
      specialPrize2englishB2: false,
      specialPrize2hasIB: false,
      specialPrize2AP: "",
      isRepeting: false,
      phone: "",
      image: undefined,
    },
    events: [
      {
        eventName: "",
        description: "",
        eventUrl: "",
        categories: [],
        types: [],
        contact: "",
        deadlines: [],
        logo: "",
        ageGroup: [],
        isForeign: false,
        group: [],
      },
    ],
    totalPages: null,
    totalEvents: null,
    actualPage: null,
    search: "",
    checkedCategories: [],
    checkedTypes: [],
  },
  getters: {
    getField,
    [EVENTS]: (state) => state.events,
    [TOTAL_PAGES]: (state) => state.totalPages,
    [TOTAL_EVENTS]: (state) => state.totalEvents,
    [ACTUAL_PAGE]: (state) => state.actualPage,
    [USER]: (state) => state.user,
    [IS_LOGGED_IN]: (state) => state.user.email,
  },
  mutations: {
    updateField,

    // event
    [SET_EVENTS](state, events) {
      state.events = [...events];
    },
    [SET_TOTAL_PAGES](state, totalPages) {
      state.totalPages = totalPages;
    },
    [SET_TOTAL_EVENTS](state, totalEvents) {
      state.totalEvents = totalEvents;
    },
    [SET_ACTUAL_PAGE](state, page) {
      state.actualPage = page;
    },

    // user
    [SET_USER_PROFILE](state, user) {
      state.user.firstName = user.firstName;
      state.user.lastName = user.lastName;
      state.user.email = user.email;
      state.user.occupation = user.occupation;
      state.user.sendNewsletter = user.sendNewsletter;
    },
    [SET_USER](state, user) {
      state.user = {
        occupation: user.occupation || null,
        firstName:
          user && user.displayName
            ? user.displayName.split(" ")[0]
            : user.firstName,
        lastName:
          user && user.displayName
            ? user.displayName.split(" ")[1]
            : user.lastName,
        email: user.email || "",
        grade: user.grade || null,
        dob: user.dob ? new Date(user.dob) : new Date("Jan 1 2000"),
        region: user.region || null,
        school: user.school || "",
        linkedin: user.linkedinUrl || "",
        interests: user.interests ? user.interests : [],
        activities: user.activities
          ? user.activities.map((a) => {
              return {
                ...a,
                isIndividual: a.isIndividual ? "Individuální" : "Týmové",
              };
            })
          : [],
        knowledge: user.knowledge || null,
        lastSaved: user.updatedAt ? new Date(user.updatedAt) : undefined,
        role: user.role || "",
        schoolContact: user.schoolContact || "",
        hasRegistration: user.hasRegistration || false,
        summary: user.summary || "",
        specialPrize1text: user.specialPrize1text || "",
        specialPrize2doesSport: user.specialPrize2doesSport || false,
        specialPrize2sportAmbitions: user.specialPrize2sportAmbitions || "",
        specialPrize2sportSuccess: user.specialPrize2sportSuccess || "",
        specialPrize2sportObstacle: user.specialPrize2sportObstacle || "",
        specialPrize2foreignStudy: user.specialPrize2foreignStudy || false,
        specialPrize2foreignReason: user.specialPrize2foreignReason || "",
        specialPrize2foreignUniversity: user.specialPrize2foreignUniversity || "",
        specialPrize2foreignunique: user.specialPrize2foreignunique || "",
        specialPrize2foreignScary: user.specialPrize2foreignScary || "",
        specialPrize2englishB2: user.specialPrize2englishB2 || false,
        specialPrize2hasIB: user.specialPrize2hasIB || false,
        specialPrize2AP: user.specialPrize2AP || "",
        isRepeting: user.isFirstTime === true ? false : true,
        phone: user.phone || "",
      };
      if (user.sendNewsletter) {
        state.user = {
          ...state.user,
          sendNewsletter: user.sendNewsletter,
        };
      }
    },
    [UPDATE_USER](state, user) {
      state.user = {
        ...user,
      };
    },
    [EMPTY_USER](state) {
      state.user = {
        firstName: "",
        lastName: "",
        email: "",
      };
    },
  },
  actions: {
    // user
    [FETCH_USER]: async ({ commit }, content) => {
      try {
        const user = await client.getUser(content);
        content === "profile"
          ? commit(SET_USER_PROFILE, user)
          : commit(SET_USER, user);
      } catch (err) {
        console.log(err);
      }
    },

    [DELETE_USER]: async ({ commit, state }) => {
      try {
        await client.deleteUser();
        commit(EMPTY_USER);
      } catch (err) {
        console.log(err);
      }
    },
  },
});

export default store;
