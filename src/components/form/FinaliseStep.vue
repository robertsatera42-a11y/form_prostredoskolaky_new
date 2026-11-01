<template>
  <section id="finalise-step" class="finalise-step" aria-labelledby="finalise-heading">
    <header class="review-intro">
      <h2 id="finalise-heading">Kontrola a odeslání</h2>
      <p>Zkontroluj své údaje. Jednotlivé části můžeš rozbalit nebo se vrátit k jejich úpravě.</p>
    </header>

    <form novalidate :aria-busy="isLoading ? 'true' : 'false'" @submit.prevent="submit">
      <div v-if="error || (validationAttempted && correctionIssues.length)" ref="errorSummary" class="review-error-summary" role="alert" tabindex="-1">
        <p v-if="error">{{ error }}</p>
        <template v-else>
          <p>Před odesláním ještě zkontroluj následující údaje:</p>
          <ul>
            <li v-for="issue in correctionIssues" :key="issue.id">
              <span>{{ issue.message }}</span>
              <button type="button" class="correction-link" :data-correction="issue.id" @click="editSection(issue.id)">Upravit {{ issue.label }}</button>
            </li>
          </ul>
        </template>
      </div>

      <div class="review-cards">
        <article v-for="section in reviewSections" :id="'review-' + section.id" :key="section.id" class="review-card" :class="{ 'is-complete': section.complete, 'is-invalid': validationAttempted && !section.valid, 'confirmation-card': section.id === 'confirmation' }">
          <header class="review-card-header">
            <h3>
              <button :id="'review-' + section.id + '-toggle'" type="button" class="review-toggle" :aria-expanded="isOpen(section.id) ? 'true' : 'false'" :aria-controls="'review-' + section.id + '-panel'" @click="toggleSection(section.id)">
                <span class="review-state" :class="{ 'state-complete': section.complete, 'state-invalid': validationAttempted && !section.valid }">
                  <svg v-if="section.complete" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m5 12 4 4L19 6"></path></svg>
                  <svg v-else-if="validationAttempted && !section.valid" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 6v8m0 3v1"></path></svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M7 12h10"></path></svg>
                  <span class="sr-only">{{ section.status }}. </span>
                </span>
                <span class="review-heading-copy" :class="{ 'has-edit': section.id !== 'confirmation' }">
                  <span class="review-card-title">{{ section.title }}<span v-if="section.id === 'activities'" class="review-count"> · {{ activityList.length }}</span></span>
                  <span class="review-card-summary">{{ section.summary }}</span>
                </span>
                <svg class="review-chevron" :class="{ 'is-open': isOpen(section.id) }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>
              </button>
            </h3>
            <button v-if="section.id !== 'confirmation'" :id="'review-' + section.id + '-edit'" type="button" class="review-edit" :aria-label="'Upravit: ' + section.title" :disabled="isLoading" @click="editSection(section.id)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m15 5 4 4M4 20l5-1L20 8a2.8 2.8 0 0 0-4-4L5 15l-1 5Z"></path></svg>Upravit
            </button>
          </header>

          <transition name="review-reveal" @before-leave="hidePanel">
            <div v-show="isOpen(section.id)" :id="'review-' + section.id + '-panel'" class="review-body" role="region" :aria-labelledby="'review-' + section.id + '-toggle'" :aria-hidden="isOpen(section.id) ? 'false' : 'true'" :inert="isOpen(section.id) ? null : ''">
              <template v-if="section.id === 'basic'">
                <div class="review-value-groups">
                  <section class="review-value-group" aria-labelledby="review-personal-heading">
                    <h4 id="review-personal-heading">Osobní údaje</h4>
                    <dl class="review-values">
                      <div v-for="item in personalValues" :key="item.label"><dt>{{ item.label }}</dt><dd :class="{ 'value-missing': !item.value }">{{ item.value || 'Neuvedeno' }}</dd></div>
                    </dl>
                  </section>
                  <section class="review-value-group" aria-labelledby="review-school-heading">
                    <h4 id="review-school-heading">Škola</h4>
                    <dl class="review-values">
                      <div><dt>Název školy</dt><dd :class="{ 'value-missing': !user.school }">{{ user.school || 'Neuvedeno' }}</dd></div>
                      <div><dt>Ročník</dt><dd :class="{ 'value-missing': !formattedGrade }">{{ formattedGrade || 'Neuvedeno' }}</dd></div>
                      <div><dt>Kraj</dt><dd :class="{ 'value-missing': !user.region }">{{ user.region || 'Neuvedeno' }}</dd></div>
                    </dl>
                  </section>
                </div>
                <section class="review-about" aria-labelledby="review-about-heading">
                  <h4 id="review-about-heading">Více o tobě</h4>
                  <dl class="review-values">
                    <div><dt>LinkedIn</dt><dd :class="{ 'value-missing': !user.linkedin }"><a v-if="safeUrl(user.linkedin)" :href="safeUrl(user.linkedin)" target="_blank" rel="noopener noreferrer">{{ user.linkedin }}<span class="sr-only"> (otevře se v novém okně)</span></a><template v-else>{{ user.linkedin || 'Neuvedeno' }}</template></dd></div>
                    <div><dt>Obory zájmu</dt><dd :class="{ 'value-missing': !interestLabels.length }">{{ interestLabels.join(', ') || 'Neuvedeno' }}</dd></div>
                    <div class="review-prose-value"><dt>Medailonek ve 3. osobě</dt><dd :class="{ 'value-missing': !user.summary }">{{ user.summary || 'Neuvedeno' }}</dd></div>
                    <div><dt>Přečtení návodu</dt><dd>{{ user.readGuideConfirmed ? 'Potvrzeno' : 'Nepotvrzeno' }}</dd></div>
                    <div><dt>Opakovaná účast</dt><dd>{{ user.isRepeting ? 'Ano' : 'Ne' }}</dd></div>
                    <div><dt>Odkud znáš soutěž</dt><dd :class="{ 'value-missing': !user.knowledge }">{{ user.knowledge || 'Neuvedeno' }}</dd></div>
                  </dl>
                </section>
              </template>

              <template v-else-if="section.id === 'activities'">
                <ol v-if="activityList.length" class="review-activity-list">
                  <li v-for="(activity, index) in activityList" :key="index" class="review-activity">
                    <div class="review-activity-heading"><h4>{{ index + 1 }}. {{ activity.name || 'Aktivita bez názvu' }}</h4><span v-if="activity.type" class="activity-type">{{ activity.type }}</span></div>
                    <dl class="review-values activity-values">
                      <div class="review-prose-value"><dt>Krátký popis aktivity</dt><dd :class="{ 'value-missing': !activity.result }">{{ activity.result || 'Neuvedeno' }}</dd></div>
                      <div><dt>Časový rozsah</dt><dd :class="{ 'value-missing': !activity.start }">{{ activity.start || 'Neuvedeno' }}</dd></div>
                      <div><dt>Webová stránka</dt><dd :class="{ 'value-missing': !activity.link }"><a v-if="safeUrl(activity.link)" :href="safeUrl(activity.link)" target="_blank" rel="noopener noreferrer">{{ activity.link }}<span class="sr-only"> (otevře se v novém okně)</span></a><template v-else>{{ activity.link || 'Neuvedeno' }}</template></dd></div>
                      <div><dt>Oblast</dt><dd :class="{ 'value-missing': !activity.field }">{{ activity.field || 'Neuvedeno' }}</dd></div>
                      <div><dt>Obor</dt><dd :class="{ 'value-missing': !activity.interest }">{{ activity.interest || 'Neuvedeno' }}</dd></div>
                      <div><dt>Individuální/týmová</dt><dd :class="{ 'value-missing': !activity.isIndividual }">{{ individualLabel(activity.isIndividual) }}</dd></div>
                      <div class="review-prose-value"><dt>Reference (kontakt)</dt><dd :class="{ 'value-missing': !activity.reference }">{{ activity.reference || 'Neuvedeno' }}</dd></div>
                    </dl>
                  </li>
                </ol>
                <p v-else class="review-empty">Zatím nemáš přidanou žádnou aktivitu. V kroku Aktivity přidej alespoň jednu.</p>
              </template>

              <template v-else-if="section.id === 'prizes'">
                <SpecialPrizeNotice v-if="!publishedPrizeIds.length" />
                <div v-else-if="selectedPrizes.length" class="review-prize-list">
                  <section v-for="prize in selectedPrizes" :key="prize.id" class="review-prize" :aria-labelledby="'review-prize-' + prize.id">
                    <div><h4 :id="'review-prize-' + prize.id">{{ prize.title }}</h4><p class="review-prize-partner">{{ prize.partner }}</p></div>
                    <p v-if="prize.needsResponse" class="review-prize-answer" :class="{ 'value-missing': !prize.answer }">{{ prize.answer || 'Odpověď zatím není vyplněná.' }}</p>
                    <p v-else class="review-prize-answer">Mám zájem o účast ve výběru.</p>
                  </section>
                </div>
                <p v-else class="review-empty">Žádná speciální cena nebyla vybrána. Účast je dobrovolná a hodnocení v hlavní soutěži neovlivní.</p>
                <p v-if="selectedPrizes.length && selectedPrizes.length < publishedPrizeIds.length" class="review-optional-note">Další speciální ceny nebyly vybrány.</p>
              </template>

              <template v-else>
                <div class="review-consent">
                  <div class="consent-heading">Povinný souhlas <span class="required-marker" aria-hidden="true">*</span></div>
                  <div class="consent-row">
                    <input id="finalise-consent" ref="consent" v-model="user.isAgree" type="checkbox" :disabled="isLoading" aria-required="true" :aria-invalid="validationAttempted && !user.isAgree ? 'true' : 'false'" :aria-describedby="validationAttempted && !user.isAgree ? 'consent-error' : null">
                    <label for="finalise-consent" class="legal-wording">Souhlasím s <a href="https://drive.google.com/file/d/1shGxE2v13FcA03s1qSt9Wz6rTTNu4hRL/view?usp=sharing" target="_blank" rel="noopener noreferrer">pravidly soutěže</a> a uděluji <a href="https://drive.google.com/file/d/1vQtRmV_niHTE9Yy_0GPtL9521qm0XI0i/view" target="_blank" rel="noopener noreferrer">souhlas se zpracováním osobních údajů</a>.</label>
                  </div>
                  <p v-if="validationAttempted && !user.isAgree" id="consent-error" class="consent-error" role="alert">{{ requiredTerms }}</p>
                </div>
                <div class="review-marketing">
                  <div class="consent-heading">Novinky e-mailem <span class="optional-label">(nepovinné)</span></div>
                  <div class="consent-row">
                    <input id="finalise-newsletter" v-model="user.sendNewsletter" type="checkbox" :disabled="isLoading">
                    <label for="finalise-newsletter">Chci si nechat zasílat pravidelnou dávku mimoškolních aktivit a dalších informací do svého e-mailu.</label>
                  </div>
                </div>
                <p class="submission-explanation">Odesláním uložíš aktuální podobu přihlášky. Až do uzávěrky ji můžeš znovu otevřít a upravovat.</p>
                <p v-if="user.lastSaved" class="review-last-saved">Poslední uložení přihlášky: {{ transformDate(user.lastSaved) }}</p>
              </template>
            </div>
          </transition>

          <footer v-if="section.id === 'confirmation'" class="review-actions">
            <p class="submission-status" role="status" aria-live="polite">{{ isLoading ? 'Odesílám přihlášku… Chvíli prosím počkej.' : '' }}</p>
            <div class="review-action-buttons">
              <button type="button" class="review-button secondary-action" :disabled="isLoading" @click="goToSpecialPrizeStep"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m10 5-7 7 7 7M3 12h18"></path></svg><span>Zpět na speciální ceny</span></button>
              <button type="submit" class="review-button primary-action" :disabled="isLoading || submitted"><span>{{ isLoading ? 'Odesílám přihlášku…' : 'Odeslat přihlášku' }}</span><svg v-if="!isLoading" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m14 5 7 7-7 7M21 12H3"></path></svg></button>
            </div>
          </footer>
        </article>
      </div>
    </form>
    <p class="review-support">Potřebuješ s přihláškou pomoct? Napiš nám na <a href="mailto:info@prostredoskolaky.cz">info@prostredoskolaky.cz</a>.</p>
  </section>
</template>

<script>
import ActivitiesStep from './ActivitiesStep'
import ActivityForm from './ActivityForm'
import SuccessStep from './SuccessStep'
import FirstStep from './FirstStep'
import SpecialPrizeStep from './SpecialPrizeStep'
import SpecialPrizeNotice from './SpecialPrizeNotice'
import config from '../../config/default'
import client from '../../client/client'
import { mapFields } from 'vuex-map-fields'
import { required } from 'vuelidate/lib/validators'
import transformerUtils from '../../utils/transformerUtils'
import tracking from '../../utils/tracking'
import fb from '../../firebase'

export default {
  name: 'finalise-step',
  description: 'Zkontroluj své údaje a odešli přihlášku. Až do uzávěrky ji můžeš znovu otevřít a upravovat.',
  number: 4,
  loaderBlockName: 'čtvrtý krok - kontrola a odeslání',
  components: { SpecialPrizeNotice },
  data () {
    return {
      isLoading: false,
      submitted: false,
      error: '',
      registrationId: null,
      validationAttempted: false,
      expandedSections: ['confirmation'],
      lastEditedSection: null,
      requiredTerms: config.errors.requiredTerms
    }
  },
  mounted () {
    window.scrollTo(0, 0)
    tracking.track('competition', 'entrance_page', 'form_activities_check')
  },
  activated () {
    if (this.lastEditedSection) {
      const id = this.lastEditedSection
      this.lastEditedSection = null
      this.$nextTick(() => {
        const edit = this.$el.querySelector('#review-' + id + '-edit')
        if (edit) edit.focus()
      })
    }
  },
  computed: {
    ...mapFields({ user: 'user', activities: 'user.activities' }),
    activityList () {
      return Array.isArray(this.activities) ? this.activities : []
    },
    fullName () {
      return [this.user.firstName, this.user.lastName].filter(Boolean).join(' ')
    },
    formattedBirthDate () {
      if (!this.user.dob) return ''
      const date = new Date(this.user.dob)
      return Number.isNaN(date.getTime()) ? '' : `${date.getDate()}. ${date.getMonth() + 1}. ${date.getFullYear()}`
    },
    formattedGrade () {
      const grade = this.user.grade
      if (!grade) return ''
      const match = String(grade).match(/^(\d+)-(\d+)$/)
      return match ? `${match[1]}. ročník ${match[2]}letého studia` : String(grade)
    },
    gradeSummary () {
      return this.formattedGrade.replace(/ \d+letého studia$/, '')
    },
    personalValues () {
      return [
        { label: 'Jméno', value: this.user.firstName },
        { label: 'Příjmení', value: this.user.lastName },
        { label: 'Datum narození', value: this.formattedBirthDate },
        { label: 'E-mail', value: this.user.email },
        { label: 'Telefon', value: this.user.phone }
      ]
    },
    interestLabels () {
      return (Array.isArray(this.user.interests) ? this.user.interests : []).map(interest => {
        if (typeof interest === 'string') {
          const item = config.consts.interests.find(item => item.short === interest)
          return item ? item.name : interest
        }
        return interest && (interest.name || interest.full || interest.short)
      }).filter(Boolean)
    },
    publishedPrizeIds () {
      return config.consts.publishedSpecialPrizeIds
    },
    selectedPrizes () {
      return [
        { id: 'startup', title: 'Start up roku', partner: 'Start it @ČSOB', selected: this.user.specialPrize1Interested, answer: this.user.specialPrize1text, needsResponse: true },
        { id: 'microsoft', title: '„Inovátor nové generace“', partner: 'Microsoft', selected: this.user.specialPrize2Interested, needsResponse: false },
        { id: 'mattoni', title: 'Cena MATTONI TALENTS 2027', partner: 'Mattoni 1873', selected: this.user.specialPrize3Interested, answer: this.user.specialPrize3text, needsResponse: true }
      ].filter(prize => this.publishedPrizeIds.includes(prize.id) && prize.selected)
    },
    sectionValidity () {
      return {
        basic: !this.$v.user.$invalid,
        activities: this.activityList.length > 0 && !this.$v.activities.$invalid,
        prizes: this.selectedPrizes.every(prize => !prize.needsResponse || (typeof prize.answer === 'string' && prize.answer.trim().length > 0)),
        confirmation: this.user.isAgree === true
      }
    },
    reviewSections () {
      const valid = this.sectionValidity
      const names = this.activityList.slice(0, 3).map(activity => activity.name || 'Aktivita bez názvu').join(', ')
      const more = this.activityList.length > 3 ? ` a další ${this.activityList.length - 3}` : ''
      return [
        { id: 'basic', title: 'Základní údaje', valid: valid.basic, complete: valid.basic, status: valid.basic ? 'Povinné údaje vyplněny' : 'Údaje vyžadují kontrolu', summary: [this.fullName, this.user.school, this.gradeSummary].filter(Boolean).join(' · ') || 'Tvé osobní a školní informace.' },
        { id: 'activities', title: 'Aktivity', valid: valid.activities, complete: valid.activities, status: valid.activities ? 'Aktivity vyplněny' : 'Aktivity vyžadují kontrolu', summary: names ? names + more : 'Zatím žádná aktivita. Přidej alespoň jednu.' },
        { id: 'prizes', title: 'Speciální ceny', valid: valid.prizes, complete: valid.prizes && this.selectedPrizes.length > 0, status: !this.publishedPrizeIds.length ? 'Speciální ceny připravujeme' : (this.selectedPrizes.length ? (valid.prizes ? 'Výběr vyplněn' : 'Doplň odpověď k vybrané ceně') : 'Nepovinné, žádná cena nevybrána'), summary: !this.publishedPrizeIds.length ? 'Speciální ceny připravujeme. Přihlášku můžeš odeslat už teď.' : (this.selectedPrizes.map(prize => prize.title).join(' · ') || 'Žádná cena nebyla vybrána. Účast je nepovinná.') },
        { id: 'confirmation', title: 'Potvrzení a odeslání', valid: valid.confirmation, complete: valid.confirmation, status: valid.confirmation ? 'Souhlas potvrzen' : 'Čeká na povinný souhlas', summary: this.isLoading ? 'Odesílání probíhá. Počkej prosím na potvrzení.' : (valid.confirmation ? 'Souhlas je potvrzený. Přihlášku ještě odešli.' : 'Potvrď povinný souhlas a odešli přihlášku.') }
      ]
    },
    validationIssues () {
      const issues = []
      if (!this.sectionValidity.basic) {
        const fields = { firstName: 'jméno', lastName: 'příjmení', email: 'e-mail', grade: 'ročník', dob: 'datum narození', school: 'školu', region: 'kraj', phone: 'telefon', summary: 'medailonek', readGuideConfirmed: 'potvrzení přečtení návodu' }
        const missing = Object.keys(fields).filter(key => this.$v.user[key].$invalid).map(key => fields[key])
        issues.push({ id: 'basic', label: 'základní údaje', message: 'Doplň nebo oprav ' + missing.join(', ') + '.' })
      }
      if (!this.sectionValidity.activities) issues.push({ id: 'activities', label: 'aktivity', message: this.activityList.length ? 'U aktivit doplň povinné údaje a zkontroluj limity délky názvu a webového odkazu.' : 'Přidej alespoň jednu aktivitu.' })
      if (!this.sectionValidity.prizes) issues.push({ id: 'prizes', label: 'speciální ceny', message: 'Doplň odpověď k vybrané speciální ceně, nebo její výběr zruš.' })
      if (!this.sectionValidity.confirmation) issues.push({ id: 'confirmation', label: 'souhlas', message: this.requiredTerms })
      return issues
    },
    correctionIssues () {
      return this.validationIssues.filter(issue => issue.id !== 'confirmation')
    }
  },
  watch: {
    sectionValidity: {
      immediate: true,
      handler (validity) { this.$emit('review-validity', { ...validity, prizesSelected: this.selectedPrizes.length > 0 }) }
    }
  },
  validations () {
    // Resolve after module initialization: the existing step imports form a cycle.
    return {
      user: (FirstStep.options || FirstStep).validations.user,
      activities: { required, $each: (ActivityForm.options || ActivityForm).validations.activity }
    }
  },
  methods: {
    isOpen (id) { return this.expandedSections.includes(id) },
    toggleSection (id) {
      if (this.isOpen(id)) this.expandedSections = this.expandedSections.filter(section => section !== id)
      else this.expandedSections.push(id)
    },
    hidePanel (element) {
      element.inert = true
      element.setAttribute('aria-hidden', 'true')
    },
    focusConsent () {
      if (!this.isOpen('confirmation')) this.expandedSections.push('confirmation')
      this.$nextTick(() => {
        const input = this.$el.querySelector('#finalise-consent')
        if (input) input.focus()
      })
    },
    editSection (id) {
      if (this.isLoading) return
      this.error = ''
      this.lastEditedSection = id
      const step = { basic: FirstStep, activities: ActivitiesStep, prizes: SpecialPrizeStep }[id]
      if (step) this.$emit('changeView', step)
    },
    goToEditActivities () { this.editSection('activities') },
    goToSpecialPrizeStep () { this.editSection('prizes') },
    goToFirstStep () { this.editSection('basic') },
    individualLabel (value) {
      if (typeof value === 'boolean') return value ? 'Individuální' : 'Týmové'
      return value || 'Neuvedeno'
    },
    safeUrl (value) {
      if (typeof value !== 'string' || !/^https?:\/\//i.test(value.trim())) return null
      try { return new URL(value.trim()).href } catch (_) { return null }
    },
    transformDate (dateString) { return transformerUtils.transformDate(dateString) },
    async submit () {
      if (this.isLoading || this.submitted) return
      this.error = ''
      this.validationAttempted = true
      if (this.validationIssues.length) {
        this.validationIssues.forEach(issue => { if (!this.isOpen(issue.id)) this.expandedSections.push(issue.id) })
        if (!this.sectionValidity.confirmation) this.focusConsent()
        else {
          this.$nextTick(() => {
            const first = this.$el.querySelector('[data-correction]')
            if (first) first.focus()
          })
        }
        return
      }
      this.isLoading = true
      try {
        const image = this.user.image
        const imageType = image ? image.name.split('.').pop().toLowerCase() : undefined
        const preparedUser = {
          ...this.user,
          interests: Array.isArray(this.user.interests) ? this.user.interests.map(interest => typeof interest === 'object' && interest ? { ...interest } : interest) : [],
          image: undefined,
          imageType,
          isFirstTime: !this.user.isRepeting,
          isAgree: !!this.user.isAgree,
          readGuideConfirmed: !!this.user.readGuideConfirmed,
          activities: this.activityList.map(activity => ({ ...activity, isIndividual: activity.isIndividual !== 'Týmové' }))
        }
        const result = await client.createRegistration(preparedUser)
        const id = result && result.registrationId
        if (!((typeof id === 'string' && id.trim()) || (typeof id === 'number' && Number.isFinite(id)))) {
          this.error = 'Nepodařilo se ověřit výsledek odeslání. Vyplněné údaje zůstaly zachované. Zkontroluj stav přihlášky nebo nám napiš.'
          return
        }
        this.registrationId = result.registrationId
        this.submitted = true
        if (result.signedUrl && image) await this.uploadToGCP(image, result.signedUrl)
        try {
          await fb.updateProfileForCurrentUser(preparedUser)
        } catch (error) {
          // The registration is already confirmed; profile failure must not repeat it.
          // eslint-disable-next-line no-console
          console.error('Profile update after confirmed registration failed:', error)
        }
        this.user.hasRegistration = true
        try {
          tracking.track('competition', 'entrance_page', 'form_finished')
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Analytics after confirmed registration failed:', error)
        }
        this.$emit('changeView', SuccessStep)
      } catch (error) {
        const response = error && error.response
        this.error = response && response.data && typeof response.data.errorMessage === 'string'
          ? response.data.errorMessage
          : 'Přihlášku se nepodařilo odeslat. Zkus to prosím znovu. Vyplněné údaje zůstaly zachované.'
      } finally {
        this.isLoading = false
        if (this.error) this.$nextTick(() => { if (this.$refs.errorSummary) this.$refs.errorSummary.focus() })
      }
    },
    async uploadToGCP (file, signedUrl) {
      try {
        const response = await fetch(signedUrl, { method: 'PUT', body: file })
        // eslint-disable-next-line no-console
        if (!response.ok) console.error('Failed to upload image:', response.statusText)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error uploading image:', error)
      }
    }
  }
}
</script>

<style scoped lang="scss">
.finalise-step {
  --review-ink: #071b46;
  --review-muted: #556c94;
  --review-accent: #f26427;
  --review-error: #b42318;
  width: calc(100% - 64px);
  max-width: 1024px;
  margin: 0 auto;
  color: var(--review-ink);
  font: 1rem/1.5 'AvenirNextForm', 'AvenirNext', sans-serif;
  ::selection { color: var(--review-ink); background: #ffe2d4; }
  button, input { font-family: inherit; -webkit-tap-highlight-color: transparent; }
  button { cursor: pointer; }
  button:focus-visible, input:focus-visible, a:focus-visible { outline: 2px solid var(--review-ink); outline-offset: 4px; }
  a { color: var(--review-ink); text-decoration: underline; text-underline-offset: 3px; overflow-wrap: anywhere; }
  a:hover { color: #ac3711; }
  svg { flex: 0 0 auto; width: 1.25rem; height: 1.25rem; }
  button:disabled { cursor: default; }
}
.review-intro { margin-bottom: 24px; }
.review-intro h2 { margin: 0; font-size: 2rem; font-weight: 700; line-height: 1.25; letter-spacing: -.02em; }
.review-intro p { max-width: 72ch; margin: 8px 0 0; color: var(--review-muted); }
.review-cards { display: grid; gap: 16px; }
.review-card { min-width: 0; border: 1px solid #c5cfdf; border-radius: 8px; background: #fff; }
.confirmation-card { border-color: #ffc9b5; }
.review-card.is-invalid { border-color: var(--review-error); }
.review-card-header { position: relative; }
.review-card-header h3 { margin: 0; }
.review-toggle { display: grid; grid-template-columns: 32px minmax(0, 1fr) 20px; align-items: center; gap: 16px; width: 100%; min-height: 96px; padding: 20px 24px; border: 0; border-radius: 8px; background: transparent; color: var(--review-ink); text-align: left; transition: background-color 150ms ease-out; }
.review-toggle:hover { background: #f6f8fb; }
.review-toggle:active { background: #eef2f8; }
.review-state { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border: 1px solid #8192ad; border-radius: 50%; color: var(--review-muted); }
.state-complete { border-color: #22866a; background: #22866a; color: #fff; }
.state-invalid { border-color: var(--review-error); background: #fff0ed; color: var(--review-error); }
.review-heading-copy { min-width: 0; }
.review-heading-copy.has-edit { padding-right: 104px; }
.review-card-title { display: block; font-size: 1.375rem; font-weight: 700; line-height: 1.35; letter-spacing: -.01em; overflow-wrap: anywhere; }
.review-count { color: var(--review-muted); font-variant-numeric: tabular-nums; }
.review-card-summary { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; margin-top: 4px; color: var(--review-muted); font-size: 1rem; font-weight: 400; line-height: 1.5; overflow-wrap: anywhere; }
.review-chevron { transition: transform 150ms ease-out; }
.review-chevron.is-open { transform: rotate(180deg); }
.review-edit { position: absolute; top: 50%; right: 60px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 44px; padding: 8px 12px; transform: translateY(-50%); border: 1px solid transparent; border-radius: 5px; background: #fff; color: #ac3711; font-size: 1rem; line-height: 1.5; }
.review-edit:hover:not(:disabled) { border-color: #ffc9b5; background: #fff4ee; }
.review-edit:active:not(:disabled) { background: #ffe4d7; }
.review-edit:disabled { color: #657591; background: #f1f3f7; }
.review-body { margin: 0 24px 24px 72px; padding-top: 24px; border-top: 1px solid #e1e6ef; }
.review-body h4 { margin: 0 0 16px; font-size: 1.125rem; font-weight: 700; line-height: 1.4; }
.review-value-groups { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 32px; }
.review-value-group { min-width: 0; }
.review-values { margin: 0; }
.review-values > div { display: grid; grid-template-columns: minmax(6.5rem, .8fr) minmax(0, 1.5fr); gap: 12px; margin-top: 10px; }
.review-values dt { color: var(--review-muted); font-weight: 400; overflow-wrap: anywhere; }
.review-values dd { min-width: 0; margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; }
.value-missing { color: var(--review-muted); }
.review-about { margin-top: 28px; padding-top: 24px; border-top: 1px solid #e1e6ef; }
.review-about .review-values > div { grid-template-columns: 11rem minmax(0, 1fr); }
.review-values > .review-prose-value, .review-about .review-values > .review-prose-value { grid-template-columns: minmax(0, 1fr); gap: 6px; margin-top: 20px; }
.review-prose-value dd { max-width: 75ch; }
.review-activity-list { margin: 0; padding: 0; list-style: none; }
.review-activity + .review-activity { margin-top: 28px; padding-top: 24px; border-top: 1px solid #e1e6ef; }
.review-activity-heading { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 8px 16px; margin-bottom: 12px; }
.review-activity-heading h4 { min-width: 0; margin: 0; overflow-wrap: anywhere; }
.activity-type { max-width: 100%; padding: 4px 10px; border-radius: 5px; background: #fff0e9; color: #a4370d; font-size: .875rem; line-height: 1.5; overflow-wrap: anywhere; }
.activity-values > div { grid-template-columns: 11rem minmax(0, 1fr); }
.review-prize { display: grid; grid-template-columns: minmax(0, .9fr) minmax(0, 1.5fr); gap: 24px; }
.review-prize + .review-prize { margin-top: 24px; padding-top: 24px; border-top: 1px solid #e1e6ef; }
.review-prize h4 { margin-bottom: 4px; overflow-wrap: anywhere; }
.review-prize-partner { margin: 0; color: var(--review-muted); }
.review-prize-answer { min-width: 0; margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; }
.review-optional-note, .review-empty { margin: 0; color: var(--review-muted); }
.review-optional-note { margin-top: 20px; }
.consent-heading { margin-bottom: 10px; font-weight: 700; }
.required-marker { color: var(--review-error); }
.optional-label { color: var(--review-muted); font-weight: 400; }
.consent-row { display: flex; align-items: flex-start; gap: 14px; }
.consent-row input { flex: 0 0 auto; width: 24px; height: 24px; margin: 3px 0 0; accent-color: #c44716; cursor: pointer; }
.consent-row label { display: block; min-height: 44px; padding: 2px 0 8px; cursor: pointer; }
.consent-row input:disabled + label { cursor: default; color: #657591; }
.consent-error { margin: 8px 0 0 38px; color: var(--review-error); }
.review-marketing { margin-top: 24px; padding-top: 24px; border-top: 1px solid #e1e6ef; }
.submission-explanation { margin: 24px 0 0; padding-top: 20px; border-top: 1px solid #e1e6ef; color: var(--review-muted); }
.review-last-saved { margin: 8px 0 0; color: var(--review-muted); }
.review-actions { margin: 0 24px 24px; padding-top: 20px; border-top: 1px solid #ffd2c5; }
.submission-status { margin: 0; color: var(--review-muted); }
.submission-status:not(:empty) { margin-bottom: 16px; }
.review-action-buttons { display: flex; align-items: stretch; justify-content: space-between; gap: 16px; }
.review-button { display: inline-flex; align-items: center; justify-content: center; gap: 12px; min-height: 3.25rem; padding: 12px 20px; border: 1px solid #8192ad; border-radius: 6px; background: #fff; color: var(--review-ink); font-size: 1rem; font-weight: 700; line-height: 1.4; text-align: center; transition: background-color 150ms ease-out, border-color 150ms ease-out; }
.review-button span { text-wrap: balance; }
.review-button:hover:not(:disabled) { border-color: var(--review-ink); background: #f4f6fa; }
.review-button:active:not(:disabled) { background: #e6ebf3; }
.primary-action { margin-left: auto; border-color: var(--review-accent); background: var(--review-accent); color: #fff; font-size: 1.25rem; }
.primary-action:hover:not(:disabled) { border-color: #d94d14; background: #d94d14; }
.primary-action:active:not(:disabled) { border-color: #c44716; background: #c44716; }
.review-button:disabled { border-color: #d6dde8; background: #f1f3f7; color: #657591; }
.review-error-summary { margin-bottom: 24px; padding: 20px 24px; border: 1px solid var(--review-error); border-radius: 8px; background: #fff8f5; color: var(--review-error); }
.review-error-summary p { margin: 0; }
.review-error-summary ul { margin: 12px 0 0; padding-left: 20px; }
.review-error-summary li + li { margin-top: 8px; }
.correction-link { min-height: 44px; margin-left: 8px; padding: 8px 0; border: 0; background: transparent; color: var(--review-ink); font-size: 1rem; line-height: 1.5; text-decoration: underline; text-underline-offset: 3px; }
.correction-link:hover { color: #ac3711; }
.review-support { margin: 24px 0 0; color: var(--review-muted); text-align: center; }
.review-reveal-enter-active { transition: opacity 150ms ease-out; }
.review-reveal-enter { opacity: 0; }
.sr-only { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

@media (max-width: 767px) {
  .finalise-step { width: calc(100% - 32px); }
  .review-intro h2 { font-size: 1.75rem; }
  .review-toggle { grid-template-columns: 28px minmax(0, 1fr) 20px; gap: 12px; padding: 20px 16px 16px; }
  .review-state { width: 28px; height: 28px; }
  .review-card-title { font-size: 1.25rem; }
  .review-heading-copy.has-edit { padding-right: 0; }
  .review-card-summary { -webkit-line-clamp: 3; }
  .review-edit { position: static; margin: 0 16px 12px 48px; transform: none; }
  .review-body { margin: 0 16px 20px; padding-top: 20px; }
  .review-value-groups { grid-template-columns: minmax(0, 1fr); gap: 24px; }
  .review-value-group + .review-value-group { padding-top: 20px; border-top: 1px solid #e1e6ef; }
  .review-values > div, .review-about .review-values > div, .activity-values > div { grid-template-columns: minmax(0, 1fr); gap: 3px; margin-top: 14px; }
  .review-prize { grid-template-columns: minmax(0, 1fr); gap: 12px; }
  .review-actions { margin: 0 16px 20px; }
  .review-action-buttons { flex-direction: column; }
  .review-button { width: 100%; }
  .primary-action { order: -1; margin: 0; }
  .review-error-summary { padding: 16px; }
  .correction-link { margin-left: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .review-toggle, .review-chevron, .review-button, .review-reveal-enter-active { transition: none; }
}
</style>
