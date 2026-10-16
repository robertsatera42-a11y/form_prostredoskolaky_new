<template>
  <section class="activities-step" aria-labelledby="activities-heading">
    <div class="activities-panel">
      <header class="activities-header">
        <div class="activities-intro">
          <h2 id="activities-heading">Tvé aktivity</h2>
          <p>Ukaž, čemu se věnuješ a čeho se ti podařilo dosáhnout. Přidej alespoň jednu aktivitu, nejvýše {{ activityLimit }}.</p>
        </div>
        <div class="activities-toolbar">
          <p class="activities-count"><strong>{{ activityCount }}</strong> z {{ activityLimit }} aktivit</p>
          <button ref="addActivity" type="button" class="activity-button add-button" :disabled="activityCount >= activityLimit || showActivityForm" :aria-describedby="activityCount >= activityLimit ? 'activities-limit' : null" @click="addItem">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 5v14M5 12h14"></path></svg>
            Přidat aktivitu
          </button>
        </div>
      </header>

      <p v-if="activityCount >= activityLimit" id="activities-limit" class="limit-message">Máš přidaný maximální počet aktivit. Stávající můžeš dál upravovat nebo odstranit.</p>
      <p class="activity-feedback" role="status" aria-live="polite" aria-atomic="true">{{ feedback }}</p>

      <div v-if="activityCount" class="activities-grid">
        <article v-for="(activity, index) in activities" :key="index" class="activity-card" :class="{ 'is-condensed': needsDisclosure(activity) && !expandedActivities.includes(activity) }" :aria-labelledby="'activity-title-' + index">
          <span v-if="activity.type" class="activity-type">{{ activity.type }}</span>
          <h3 :id="'activity-title-' + index">{{ activity.name }}</h3>
          <p :id="'activity-result-' + index" class="activity-description">{{ activity.result }}</p>
          <p v-if="activity.start" :id="'activity-start-' + index" class="activity-time">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="4" y="5" width="16" height="16" rx="2"></rect><path d="M8 3v4m8-4v4M4 10h16"></path></svg>
            <span><span class="sr-only">Časový rozsah: </span>{{ activity.start }}</span>
          </p>
          <div v-if="activity.link" :id="'activity-link-' + index" class="activity-link">
            <span class="sr-only">Webová stránka aktivity: </span>
            <a v-if="safeActivityUrl(activity.link)" :href="safeActivityUrl(activity.link)" target="_blank" rel="noopener noreferrer">{{ activity.link }}<span class="sr-only"> (otevře se v novém okně)</span></a>
            <span v-else>{{ activity.link }}</span>
          </div>
          <button v-if="needsDisclosure(activity)" type="button" class="card-disclosure" :aria-expanded="expandedActivities.includes(activity) ? 'true' : 'false'" :aria-controls="'activity-title-' + index + ' activity-result-' + index + (activity.start ? ' activity-start-' + index : '') + (activity.link ? ' activity-link-' + index : '')" @click="toggleDetails(activity)">{{ expandedActivities.includes(activity) ? 'Zkrátit obsah' : 'Zobrazit celý obsah' }}</button>
          <div class="activity-actions">
            <button type="button" class="card-action edit-action" :aria-label="'Upravit aktivitu: ' + activity.name" @click="editItem(index)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m15 5 4 4M4 20l5-1L20 8a2.8 2.8 0 0 0-4-4L5 15l-1 5Z"></path></svg>Upravit
            </button>
            <button type="button" class="card-action delete-action" :aria-label="'Odstranit aktivitu: ' + activity.name" @click="deleteItem(index)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 10v7m4-7v7"></path></svg>Odstranit
            </button>
          </div>
        </article>
      </div>
      <div v-else class="activities-empty">
        <h3>Začni svou první aktivitou</h3>
        <p>Soutěž, vlastní projekt, dobrovolnictví nebo třeba samostudium. Vyber, co tě vystihuje, a popiš své zapojení.</p>
      </div>

      <footer class="activities-footer">
        <p v-if="error" id="activities-error" class="activities-error" role="alert">{{ error }}. Použij tlačítko „Přidat aktivitu“.</p>
        <div class="save-note">
          <p>Přihlášku uložíš až ve 4. kroku. Pokračováním přejdeš na speciální ceny.</p>
          <p v-if="user.lastSaved" class="last-saved">Poslední uložení přihlášky: {{ transformDate(user.lastSaved) }}</p>
        </div>
        <nav class="step-actions" aria-label="Navigace mezi kroky">
          <button type="button" class="activity-button back-button" @click="goToFirstStep"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m10 5-7 7 7 7M3 12h18"></path></svg>Zpět na údaje</button>
          <button type="button" class="activity-button next-button" :aria-describedby="error ? 'activities-error' : null" @click="goToSpecialPrizeStep"><span>Pokračovat na speciální ceny</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m14 5 7 7-7 7M21 12H3"></path></svg></button>
        </nav>
      </footer>
    </div>
    <p class="activities-help">Potíže s přihláškou? Napiš nám na <a href="mailto:info@prostredoskolaky.cz">info@prostredoskolaky.cz</a>.</p>
  </section>
</template>

<script>
import SpecialPrizeStep from './SpecialPrizeStep'
import FirstStep from './FirstStep'
import ActivityForm from './ActivityForm'
import config from '../../config/default'
import { mapFields } from 'vuex-map-fields'
import { mapGetters } from 'vuex'
import tracking from '../../utils/tracking'
import { USER } from '../../types'
import transformerUtils from '../../utils/transformerUtils'

const ACTIVITY_LIMIT = 9

export default {
  name: 'activities-step',
  description: `Uveď aktivity, kterých ses zúčastnil/a. Můžeš jich přidat maximálně devět.`,
  number: 2,
  loaderBlockName: 'druhý krok - aktivity',
  data () {
    return { showActivityForm: false, error: '', feedback: '', activityLimit: ACTIVITY_LIMIT, expandedActivities: [] }
  },
  mounted () {
    window.scrollTo(0, 0)
    tracking.track('competition', 'entrance_page', 'form_activities')
  },
  components: { SpecialPrizeStep, FirstStep, ActivityForm },
  computed: {
    ...mapFields({ activities: 'user.activities' }),
    ...mapGetters([USER]),
    activityCount () {
      return this.activities ? this.activities.length : 0
    }
  },
  watch: {
    activityCount (count) {
      if (count > 0) this.error = ''
    }
  },
  methods: {
    goToFirstStep () {
      this.$emit('changeView', FirstStep)
    },
    goToSpecialPrizeStep () {
      if (this.activities && this.activities.length > 0) {
        this.$emit('changeView', SpecialPrizeStep)
      } else {
        this.error = config.errors.requiredActivity
        this.$nextTick(() => this.$refs.addActivity.focus())
      }
    },
    addItem () {
      if (this.activityCount < this.activityLimit) this.openModal(null)
    },
    deleteItem (index) {
      this.expandedActivities = this.expandedActivities.filter(activity => activity !== this.activities[index])
      const name = this.activities[index].name
      this.activities.splice(index, 1)
      this.feedback = `Aktivita „${name}“ byla odstraněna z přihlášky.`
      this.$nextTick(() => {
        const editButtons = this.$el.querySelectorAll('.edit-action')
        const nextFocus = editButtons[Math.min(index, editButtons.length - 1)] || this.$refs.addActivity
        nextFocus.focus()
      })
    },
    editItem (index) {
      this.openModal(index)
    },
    openModal (index) {
      if (this.showActivityForm) return
      const trigger = document.activeElement
      const initialCount = this.activityCount
      const previousActivity = index !== null ? JSON.stringify(this.activities[index]) : null
      this.feedback = ''
      this.showActivityForm = true
      const modal = this.$modal.open({
        parent: this,
        component: ActivityForm,
        customClass: 'activity-editor-host',
        hasModalCard: true,
        canCancel: [],
        animation: '',
        props: {
          index: index !== null ? index : null,
          act: {
            name: index !== null ? this.activities && this.activities[index] && this.activities[index].name : '',
            link: index !== null ? this.activities && this.activities[index] && this.activities[index].link : '',
            result: index !== null ? this.activities && this.activities[index] && this.activities[index].result : '',
            start: index !== null ? this.activities && this.activities[index] && this.activities[index].start : '',
            type: index !== null ? this.activities && this.activities[index] && this.activities[index].type : '',
            field: index !== null ? this.activities && this.activities[index] && this.activities[index].field : '',
            reference: index !== null ? this.activities && this.activities[index] && this.activities[index].reference : '',
            isIndividual: index !== null ? this.activities && this.activities[index] && this.activities[index].isIndividual : '',
            interest: index !== null ? this.activities && this.activities[index] && this.activities[index].interest : ''
          }
        }
      })
      modal.$once('close', () => {
        this.showActivityForm = false
        if (this.activityCount > initialCount) this.feedback = 'Aktivita byla přidána do přihlášky.'
        else if (index !== null && JSON.stringify(this.activities[index]) !== previousActivity) this.feedback = 'Úpravy aktivity jsou v přihlášce.'
        this.$nextTick(() => {
          const canRestoreTrigger = trigger && trigger.isConnected && !trigger.disabled && trigger.matches('button, a[href], input, select, textarea, [tabindex]')
          const fallback = this.$el.querySelector('.activity-card:last-child .edit-action') || this.$refs.addActivity
          const nextFocus = canRestoreTrigger ? trigger : fallback
          if (nextFocus) nextFocus.focus()
        })
      })
    },
    safeActivityUrl (link) {
      if (typeof link !== 'string' || !/^https?:\/\//i.test(link.trim())) return null
      try {
        return new URL(link.trim()).href
      } catch (_) {
        return null
      }
    },
    needsDisclosure (activity) {
      return (activity.name || '').length > 80 || (activity.result || '').length > 220 || (activity.start || '').length > 120 || (activity.link || '').length > 100
    },
    toggleDetails (activity) {
      const index = this.expandedActivities.indexOf(activity)
      if (index === -1) this.expandedActivities.push(activity)
      else this.expandedActivities.splice(index, 1)
    },
    transformDate (dateString) {
      return transformerUtils.transformDate(dateString)
    }
  }
}
</script>

<style scoped lang="scss">
.activities-step {
  --activity-ink: #071b46;
  --activity-muted: #556c94;
  --activity-accent: #f26427;
  --activity-error: #b42318;
  width: calc(100% - 64px);
  max-width: 1024px;
  margin: 0 auto;
  color: var(--activity-ink);
  font: 1rem/1.5 'AvenirNextForm', 'AvenirNext', sans-serif;

  ::selection { color: var(--activity-ink); background: #ffe2d4; }
  button, a { -webkit-tap-highlight-color: transparent; }
  button { font-family: inherit; cursor: pointer; }
  button:focus-visible, a:focus-visible { outline: 2px solid var(--activity-ink); outline-offset: 4px; }
  svg { flex: 0 0 auto; width: 1.25rem; height: 1.25rem; }
  a { color: var(--activity-ink); text-decoration: underline; text-underline-offset: 3px; overflow-wrap: anywhere; }
  a:hover { color: #ac3711; }
}

.activities-panel { padding: 32px 36px 24px; border: 1px solid #ffd2c5; border-radius: 8px; background: #fff; }
.activities-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; }
.activities-intro { max-width: 39rem; }
.activities-intro h2 { margin: 0; font-size: 2rem; font-weight: 700; line-height: 1.25; letter-spacing: -.02em; }
.activities-intro p { margin: 8px 0 0; color: var(--activity-muted); }
.activities-toolbar { display: flex; flex-direction: column; align-items: flex-end; flex-shrink: 0; gap: 12px; }
.activities-count { margin: 0; color: var(--activity-muted); font-variant-numeric: tabular-nums; }
.activities-count strong { color: var(--activity-ink); }
.activity-button { display: inline-flex; align-items: center; justify-content: center; gap: 12px; min-height: 3.25rem; padding: 12px 20px; border: 1px solid #8192ad; border-radius: 6px; background: #fff; color: var(--activity-ink); font-size: 1rem; font-weight: 700; line-height: 1.4; text-align: center; transition: background-color 150ms ease-out, border-color 150ms ease-out, color 150ms ease-out; }
.activity-button:hover:not(:disabled) { border-color: var(--activity-ink); background: #f4f6fa; }
.activity-button:active:not(:disabled) { background: #e6ebf3; }
.activity-button:disabled { border-color: #d6dde8; background: #f1f3f7; color: #657591; cursor: default; }
.add-button, .next-button { border-color: var(--activity-accent); background: var(--activity-accent); color: #fff; font-size: 1.25rem; }
.add-button:hover:not(:disabled), .next-button:hover:not(:disabled) { border-color: #d94d14; background: #d94d14; }
.add-button:active:not(:disabled), .next-button:active:not(:disabled) { border-color: #c44716; background: #c44716; }
.activity-feedback { margin: 0; color: #196d55; overflow-wrap: anywhere; }
.activity-feedback:not(:empty) { margin-top: 16px; }
.limit-message { margin: 16px 0 0; color: var(--activity-muted); }
.activities-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; margin-top: 24px; }
.activity-card { display: flex; flex-direction: column; align-items: flex-start; min-width: 0; padding: 20px 20px 12px; border: 1px solid #c5cfdf; border-radius: 8px; overflow-wrap: anywhere; }
.activity-type { max-width: 100%; margin-bottom: 12px; padding: 4px 10px; border-radius: 5px; background: #fff0e9; color: #a4370d; font-size: .875rem; line-height: 1.5; }
.activity-card h3 { margin: 0 0 8px; color: var(--activity-ink); font-size: 1.25rem; font-weight: 700; line-height: 1.35; letter-spacing: -.01em; }
.activity-description { margin: 0 0 20px; white-space: pre-line; }
.activity-time { display: flex; align-items: flex-start; gap: 10px; margin: auto 0 0; color: var(--activity-muted); white-space: pre-line; }
.activity-time svg { margin-top: 2px; color: var(--activity-ink); }
.activity-link { max-width: 100%; margin-top: 12px; color: var(--activity-muted); }
.is-condensed h3, .is-condensed .activity-description, .is-condensed .activity-time > span, .is-condensed .activity-link { display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden; }
.is-condensed h3 { -webkit-line-clamp: 3; }
.is-condensed .activity-description { -webkit-line-clamp: 4; }
.is-condensed .activity-time > span { -webkit-line-clamp: 3; }
.is-condensed .activity-link { -webkit-line-clamp: 2; }
.card-disclosure { min-height: 44px; margin-top: 8px; padding: 8px 0; border: 0; background: transparent; color: var(--activity-ink); font-size: 1rem; line-height: 1.5; text-align: left; text-decoration: underline; text-underline-offset: 3px; }
.card-disclosure:hover { color: #ac3711; }
.card-disclosure:active { color: #84280a; }
.activity-actions { display: flex; justify-content: flex-end; flex-wrap: wrap; gap: 4px 12px; width: 100%; margin-top: 20px; padding-top: 8px; border-top: 1px solid #e1e6ef; }
.card-action { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 44px; padding: 8px; border: 0; border-radius: 4px; background: transparent; color: var(--activity-ink); font-size: 1rem; line-height: 1.4; transition: background-color 150ms ease-out; }
.card-action:hover { background: #eef2f8; }
.card-action:active { background: #e1e6ef; }
.delete-action { color: var(--activity-error); }
.delete-action:hover, .delete-action:active { background: #fff0ed; }
.activities-empty { margin-top: 24px; padding: 40px 24px; border: 1px dashed #8192ad; border-radius: 8px; background: #f8f9fc; text-align: center; }
.activities-empty h3 { margin: 0 0 12px; font-size: 1.5rem; font-weight: 700; line-height: 1.35; letter-spacing: -.01em; }
.activities-empty p { max-width: 37rem; margin: 0 auto; color: var(--activity-muted); }
.activities-footer { margin-top: 28px; padding-top: 24px; border-top: 1px solid #ffd2c5; }
.activities-error { margin: 0 0 20px; color: var(--activity-error); }
.save-note { color: var(--activity-muted); }
.save-note p { margin: 0; }
.save-note .last-saved { margin-top: 6px; }
.step-actions { display: flex; justify-content: space-between; align-items: stretch; gap: 16px; margin-top: 20px; }
.next-button { margin-left: auto; }
.next-button span { text-wrap: balance; }
.activities-help { margin: 24px auto 0; color: var(--activity-muted); text-align: center; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

@media (max-width: 767px) {
  .activities-step { width: calc(100% - 32px); }
  .activities-panel { padding: 24px 20px 20px; }
  .activities-header { flex-direction: column; gap: 20px; }
  .activities-intro h2 { font-size: 1.75rem; }
  .activities-toolbar { flex-direction: row; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; width: 100%; }
  .activities-grid { grid-template-columns: minmax(0, 1fr); gap: 16px; }
  .activity-card { padding: 20px 16px 12px; }
  .activities-empty { padding: 28px 16px; }
  .step-actions { flex-direction: column; }
  .step-actions .activity-button { width: 100%; }
  .next-button { order: -1; margin: 0; }
  .activities-help { margin-top: 20px; }
}

@media (max-width: 359px) {
  .activities-panel { padding: 24px 16px 20px; }
  .activities-toolbar .add-button { width: 100%; }
  .activity-actions { justify-content: space-between; gap: 4px; }
  .card-action { padding: 8px 4px; gap: 6px; }
}

@media (prefers-reduced-motion: reduce) {
  .activity-button, .card-action { transition: none; }
}
</style>
