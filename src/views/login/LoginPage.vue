<template>
  <div class="platform-page auth-page login-page">
    <main id="home-main" class="home-container auth-main" tabindex="-1">
      <p v-if="redirectMessage" class="auth-redirect" role="status">{{ redirectMessage }}</p>
      <div class="auth-card">
        <h1>{{ activePanel === 'login' ? 'Přihlášení' : 'Registrace' }}</h1>
        <div class="auth-tabs" role="tablist" aria-label="Vstup do účtu">
          <button v-for="tab in tabs" :key="tab.id" :id="'auth-tab-' + tab.id" :ref="'tab-' + tab.id" role="tab" type="button" :aria-selected="activePanel === tab.id ? 'true' : 'false'" :aria-controls="'auth-panel-' + tab.id" :tabindex="activePanel === tab.id ? 0 : -1" :disabled="busy" @click="selectPanel(tab.id)" @keydown="onTabKeydown($event, tab.id)">{{ tab.label }}</button>
        </div>
        <section id="auth-panel-login" role="tabpanel" aria-labelledby="auth-tab-login" v-show="activePanel === 'login'">
          <login @busy-change="busy = $event" />
        </section>
        <section id="auth-panel-signup" role="tabpanel" aria-labelledby="auth-tab-signup" v-show="activePanel === 'signup'">
          <sign-up @busy-change="busy = $event" @show-login="selectPanel('login', true)" />
        </section>
      </div>
      <section class="auth-benefits" aria-labelledby="auth-benefits-title">
        <h2 id="auth-benefits-title">Proč je potřeba se registrovat</h2>
        <p>Vytvořením účtu získáš řadu výhod</p>
        <ul>
          <li>Možnost se k přihlášce kdykoli vrátit a upravovat ji</li>
          <li>Pravidelnou dávku aktivit do tvého emailu</li>
          <li>Přístup k databázi mimoškolních aktivit na webu <a href="https://www.prostredoskolaky.cz/">prostredoskolaky.cz</a></li>
        </ul>
      </section>
    </main>
    <footer class="auth-footer">
      <div class="home-container auth-footer-inner">
        <p>© ProStředoškoláky {{ competitionYear }}</p>
        <nav class="home-footer-social" aria-label="Sociální sítě">
          <a href="https://www.facebook.com/prostredoskolaky">Facebook</a>
          <a href="https://www.instagram.com/prostredoskolaky/">Instagram</a>
          <a href="https://www.youtube.com/channel/UCzE5_oYsLRIYB5ej35unTBw">YouTube</a>
          <a href="https://www.linkedin.com/company/prost%C5%99edo%C5%A1kol%C3%A1ky-z-s-/">LinkedIn</a>
        </nav>
      </div>
    </footer>
  </div>
</template>

<script>
import SignUp from '../../components/login/SignUp'
import Login from '../../components/login/Login'

export default {
  name: 'login-page',
  components: { SignUp, Login },
  metaInfo: { title: 'Přihlášení a registrace' },
  data () {
    return { activePanel: 'login', busy: false, competitionYear: new Date().getFullYear(), tabs: [{ id: 'login', label: 'Přihlášení' }, { id: 'signup', label: 'Registrace' }] }
  },
  computed: {
    redirectMessage () {
      const redirect = this.$route.query.redirect
      if (redirect === 'databaze') return 'Pro přístup do databáze mimoškolních aktivit se nejdříve přihlaste.'
      if (redirect === 'soutez') return 'Pro registraci do soutěže se nejdříve přihlaste.'
      return ''
    }
  },
  methods: {
    selectPanel (id, focus = false) {
      if (this.busy) return
      this.activePanel = id
      if (focus) this.$nextTick(() => this.$refs['tab-' + id][0].focus())
    },
    onTabKeydown (event, id) {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
      event.preventDefault()
      const destination = event.key === 'Home' ? 'login' : event.key === 'End' ? 'signup' : id === 'login' ? 'signup' : 'login'
      this.selectPanel(destination, true)
    }
  }
}
</script>

<style lang="scss">
@import '../../components/login/auth-shell';
@import '../../components/login/auth';
</style>
