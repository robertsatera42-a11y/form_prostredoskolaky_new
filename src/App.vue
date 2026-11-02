<template>
  <div id="app">
    <header class="app-header" v-bind:class="{
      sticky: this.stickyHeader,
      'open-menu': this.mobileOpen,
      hidden: this.$route.path === '/abffd7'
    }">
      <div class="content">
        <button type="button" @click="goToHome" class="logo" aria-label="Středoškolák roku – úvod přihlášky">
          <img src="~@/assets/logo.svg" alt="Prostředoškoláky">
        </button>

        <!-- <span
          @click="toggleMenu"
          class="mobile-menu-opener"
        >MENU</span> -->

        <nav :class="mobileOpen && 'mobile-open'">
          <!-- <div class="menu-bottom-link">
            <router-link @click.native="closeMenu" to="/">Domů</router-link>
            <span class="link-underline"/>
          </div>
          <div class="menu-bottom-link">
            <router-link @click.native="closeMenu" to="/soutez">Středoškolák roku</router-link>
            <span class="link-underline"/>
          </div>
          <div class="menu-bottom-link">
            <router-link @click.native="closeMenu" to="/amigo">Amigo</router-link>
            <span class="link-underline"/>
          </div>
          <div class="menu-bottom-link">
            <router-link @click.native="closeMenu" to="/databaze">Databáze</router-link>
            <span class="link-underline"/>
          </div>
          <div class="menu-bottom-link">
            <router-link @click.native="closeMenu" to="/ivp">Vše o IVP</router-link>
            <span class="link-underline"/>
          </div>
          <div class="menu-bottom-link">
            <a @click="goToBlogAndTrack">Blog</a>
            <span class="link-underline"/>
          </div>
          <div class="menu-bottom-link">
            <router-link @click.native="closeMenu" to="/o-nas">O nás</router-link>
            <span class="link-underline"/>
          </div> -->
          <div v-if="isLoggedIn">
            <b-dropdown ref="accountMenu" hoverable position="is-bottom-left" aria-role="list" @keydown.esc.native.prevent.stop="closeAccountMenu" @mouseenter.native="$refs.accountMenu.isHoverable = true">
                <button ref="accountTrigger" type="button" class="button login-button" slot="trigger" :aria-label="'Účet: ' + user.firstName" :title="user.firstName">
                    <span>{{user.firstName}}</span>
                    <svg class="account-chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m4 6 4 4 4-4"></path></svg>
                </button>

                <b-dropdown-item @click="goToProfile" @keydown.enter.native.prevent="$event.target.click()" @keydown.space.native.prevent="$event.target.click()" aria-role="listitem">Profil</b-dropdown-item>
                <!-- <b-dropdown-item v-if="user.hasRegistration" @click="changeRegistration(); closeMenu()" aria-role="listitem">Upravit přihlášku</b-dropdown-item> -->
                <!-- <b-dropdown-item v-if="user.role==='admin' || user.role === 'manager'" @click="showUsers(); closeMenu()" aria-role="listitem">Zobrazit uživatele</b-dropdown-item>
                <b-dropdown-item v-if="user.role==='admin' || user.role === 'manager'" @click="showCompetition(); closeMenu()" aria-role="listitem">Zobrazit soutěžící</b-dropdown-item>
                <b-dropdown-item v-if="user.role==='admin' || user.role === 'manager'" @click="showDatabase(); closeMenu()" aria-role="listitem">Správa databáze</b-dropdown-item> -->
                <b-dropdown-item @click="logout(); closeMenu()" @keydown.enter.native.prevent="$event.target.click()" @keydown.space.native.prevent="$event.target.click()" aria-role="listitem">Odhlásit se</b-dropdown-item>
            </b-dropdown>
          </div>
          <div v-else>
            <a href="https://stredoskolakroku.cz/" class="button login-button"><span>Zpět na homepage</span></a>
          </div>
        </nav>
      </div>
    </header>

    <router-view/>
    <cookies/>
  </div>
</template>

<script>
import router from './router'
import tracking from './utils/tracking'
import { USER, IS_LOGGED_IN } from './types'
import { mapGetters } from 'vuex'
import fb from './firebase.js'
import Cookies from './components/common/Cookies'

export default {
  name: 'App',
  metaInfo: {
    title: 'ProStředoškoláky',
    titleTemplate: '%s | Podporujeme středoškoláky v mimoškolních aktivitách',
    meta: [
      { name: 'description', content: 'Jsme organizace propojující středoškoláky, kteří jsou aktivní mimo školu. Pořádáme cenu Středoškolák roku a poskytuje informace o možnostech mimoškolního vzdělávání.' }
    ]
  },
  data () {
    return {
      stickyHeader: false,
      mobileOpen: false
    }
  },
  methods: {
    handleScroll () {
      this.stickyHeader = window.scrollY > 140
    },
    toggleMenu () {
      this.mobileOpen = !this.mobileOpen
    },
    closeMenu () {
      this.mobileOpen = false
    },
    closeAccountMenu () {
      const menu = this.$refs.accountMenu
      if (menu) {
        menu.isActive = false
        menu.isHoverable = false
      }
      if (this.$refs.accountTrigger) this.$refs.accountTrigger.focus({ preventScroll: true })
    },
    goToHome () {
      router.push('/')
      window.scrollTo(0, 0)
    },
    goToLogin () {
      router.push('/login')
    },
    goToProfile () {
      router.push('/profil')
    },
    goToBlogAndTrack () {
      tracking.track('menu', 'link', 'blog')
      this.closeMenu()
      window.open('https://prostredoskolaky-cz.medium.com/', '_blank')
    },
    async logout () {
      await fb.logoutUser()
      router.push('/login')
    },
    showUsers () {
      router.push('/users')
    },
    showCompetition () {
      router.push('/competition')
    },
    showDatabase () {
      router.push('/events')
    },
    changeRegistration () {
      router.push('/form')
    }
  },
  computed: {
    ...mapGetters([USER, IS_LOGGED_IN])
  },
  created () {
    window.addEventListener('scroll', this.handleScroll)
  },
  destroyed () {
    window.removeEventListener('scroll', this.handleScroll)
  },
  components: { Cookies }
}
</script>

<style lang="scss">
  @import '~bulma/sass/utilities/all';

  $primary: #f26427;
  $dark: #4A4A4A;

  $primary-invert: findColorInvert($primary);
  $dark-invert: findColorInvert($dark);
  $success: #16a085;
  $success-invert: findColorInvert($success);

  // e.g is-white
  $colors: (
    'white': ($white, $black),
    'black': ($black, $white),
    'light': ($light, $light-invert),
    'dark': ($dark, $dark-invert),
    'primary': ($primary, $primary-invert),
    'info': ($info, $info-invert),
    'success': ($success, $success-invert),
    'warning': ($warning, $warning-invert),
    'danger': ($danger, $danger-invert)
  );

  $link: $primary;
  $link-invert: $primary-invert;
  $link-focus-border: $primary;

  $dimensions: (48);

  @import '~bulma';
  @import '~buefy/src/scss/buefy';

  @font-face {
    font-family: 'EuclidCircularB';
    src: local('EuclidCircularB'),
    url('~@/assets/fonts/EuclidCircularB-Medium.otf') format('opentype');
  }
  @font-face {
    font-family: 'NunitoLight';
    src: local('NunitoLight'),
    url('~@/assets/fonts/NunitoLight.ttf') format('truetype');
  }
  @font-face {
    font-family: 'NunitoExtraLight';
    src: local('NunitoExtraLight'),
    url('~@/assets/fonts/NunitoExtraLight.ttf') format('truetype');
  }
  @font-face {
    font-family: 'AvenirNext';
    src: local('AvenirNext'),
    url('~@/assets/fonts/AvenirNextLTPro-Regular.otf') format('opentype');
  }

  * {
    box-sizing: border-box;
  }

  #app {
    font-family: 'AvenirNext', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: $dark;

    font-variant-ligatures: none;
    font-feature-settings: "liga" 0, "clig" 0;
  }

  #app {
    font-family: "EuclidCircularB", sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: $dark;

    font-variant-ligatures: none;
    font-feature-settings: "liga" 0, "clig" 0;
  }


  .orange {
    color: $primary;
  }

  .login-button {
    border-color: #4A4A4A;
    background: none;
    font-family: 'AvenirNext', sans-serif;

    &:hover {
      border-color: #f26427;
    }

    .icon {
      display: none;
    }
  }

  .database-page {
    label.b-checkbox {
      margin-left: 15px !important;

      &:first-child {
        margin-left: 0 !important;
      }
    }

    /* color of checkbox label */
    .control-label {
      font-family: 'AvenirNext', sans-serif;
      font-weight: normal;
      font-size: 14px;
    }

    /* border of checkbox */
    input[type=checkbox]:not(:checked) + .check {
      border-color: #FFF !important;
    }
    .check {
      transition: .2s !important;
    }
  }

  .app-header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    background: #fff;
    border-bottom: 1px solid #e1e6ef;
    transition: .3s;
    z-index: 9; /* due to modal box */

    &.white {
      background: #FFF;
    }
    &.sticky {
      background: #FFF;

      .content {
        padding: 10px 20px;
      }

      @media (max-width: 1050px) {
        &.open-menu {

          nav.mobile-open {
            height: calc(100vh - 53px) !important;
            top: 53px !important;
          }
        }
      }
    }

    // hidden for amos page
    &.hidden {
      .content {
        .logo {
          pointer-events: none;
        }
        nav {
          display: none;
        }
      }
    }
    @media (max-width: 900px) {
      &.open-menu {
        background: #FFF;
      }
    }

    .content {
      transition: .3s;
      width: 100%;
      max-width: 1200px;
      margin: auto;
      overflow: visible;
      padding: 20px 40px;
      display: flex;
      flex: 1;
      align-items: center;
      gap: 16px;
      justify-content: space-between;

      .logo {
        flex: 0 1 170px;
        min-width: 100px;
        min-height: 44px;
        align-items: center;
        display: flex;
        padding: 0;
        border: 0;
        background: transparent;
        cursor: pointer;

        img {
          width: 100%;
          max-width: 170px;
          height: auto;
          vertical-align: middle;
          border-style: none;
        }
      }

      .mobile-menu-opener {
        align-items: center;
        display: none;
        cursor: pointer;

        @media (max-width: 1050px) {
          display: flex;
        }
      }

      nav {
        align-items: center;
        display: flex;
        min-width: 0;

        .menu-bottom-link {
          position: relative;
          display: flex;
          justify-content: center;
          margin-right: 15px;

          .link-underline {
            width: 80%;
            height: 2px;
            position: absolute;
            background: $primary;
            bottom: 0;
            visibility: hidden;
          }

          a {
            padding: 20px;
            transition: .3s;
            color: $dark;
            font-family: 'AvenirNext', sans-serif;

            /*&.router-link-exact-active {
              color: green
            }*/
            &.router-link-exact-active ~ .link-underline {
              visibility: visible;
            }
          }
        }

        .dropdown-menu {
          right: 0;
          left: auto;
          min-width: 200px;
          max-width: calc(100vw - 32px);
        }
        .dropdown-content {
          position: static;
          border-radius: 8px;
          box-shadow: 0 12px 32px rgba(7, 27, 70, .16);
        }
        .dropdown-item { min-height: 44px; color: #071b46; }
        .login-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          max-width: min(40vw, 180px);
          min-height: 44px;
          height: auto;
          padding: 10px 14px;
          border-color: #8192ad;
          border-radius: 6px;
          color: #071b46;
          font-size: 1rem;
          line-height: 1.4;
          span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          .account-chevron { flex: 0 0 16px; width: 16px; height: 16px; }
          &:hover { border-color: #071b46; background: #f4f6fa; }
          &:active { background: #e6ebf3; }
        }
      }
    }
    button:focus-visible, a:focus-visible { outline: 2px solid #071b46; outline-offset: 3px; }
    @media (max-width: 600px) {
      .content, &.sticky .content { padding: 12px 16px; gap: 12px; }
      .content .logo { flex-basis: 140px; }
      .content nav .login-button { padding: 10px; }
    }
    @media (prefers-reduced-motion: reduce) {
      &, * { transition: none !important; }
    }
  }

  .input, select, .button, .login-button, .textarea, .select select, .signup-wrapper, .cookie-bar p, .modal-card, .modal-card-head, .modal-card-foot {
    border-radius: 0;
  }
  .animation-content {
    width: 100%;
  }
  .input:focus {
    box-shadow: none;
  }
  </style>
