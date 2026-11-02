<template>
  <section class="first-step">
    <div v-if="finished" class="registration-closed">
      <h2>Přihlašování bylo ukončeno! Další ročník ceny bude zahájen v <span class="orange">listopadu 2027</span></h2>
    </div>

    <div v-else class="first-step-panel">
      <section class="form-section" aria-labelledby="personal-heading">
        <header class="section-heading">
          <h2 id="personal-heading">Osobní údaje</h2>
          <p>Základní informace o tobě. Tyto údaje použijeme pro komunikaci v průběhu Ceny Středoškoláka roku.</p>
        </header>

        <div class="form-grid">
          <div class="form-field">
            <b-field label-for="first-step-first-name" :type="errorsFirstName.type">
              <template slot="label">Jméno <span class="required-marker" aria-hidden="true">*</span></template>
              <b-input
                id="first-step-first-name"
                v-model="user.firstName"
                v-focus="focusedFirstName"
                autocomplete="given-name"
                aria-required="true"
                :aria-invalid="!!errorsFirstName.message"
                :aria-describedby="errorsFirstName.message ? 'first-name-error' : null"
                placeholder="např. Josef"
                @focus="focusedFirstName = true"
                @blur="focusedFirstName = false"
              ></b-input>
            </b-field>
            <p v-if="errorsFirstName.message" id="first-name-error" class="field-error" role="alert">{{ errorsFirstName.message }}</p>
          </div>

          <div class="form-field">
            <b-field label-for="first-step-last-name" :type="errorsLastName.type">
              <template slot="label">Příjmení <span class="required-marker" aria-hidden="true">*</span></template>
              <b-input
                id="first-step-last-name"
                v-model="user.lastName"
                v-focus="focusedLastName"
                autocomplete="family-name"
                aria-required="true"
                :aria-invalid="!!errorsLastName.message"
                :aria-describedby="errorsLastName.message ? 'last-name-error' : null"
                placeholder="např. Novák"
                @focus="focusedLastName = true"
                @blur="focusedLastName = false"
              ></b-input>
            </b-field>
            <p v-if="errorsLastName.message" id="last-name-error" class="field-error" role="alert">{{ errorsLastName.message }}</p>
          </div>

          <div class="form-field">
            <b-field label-for="first-step-dob" :type="errorsDob.type">
              <template slot="label">Datum narození <span class="required-marker" aria-hidden="true">*</span></template>
              <div class="date-control">
                <b-datepicker
                  id="first-step-dob"
                  ref="dob"
                  readonly
                  v-model="user.dob"
                  v-focus="focusedDob"
                  aria-required="true"
                  :aria-invalid="!!errorsDob.message"
                  :aria-describedby="errorsDob.message ? 'dob-error' : null"
                  placeholder="dd. mm. rrrr"
                  editable
                  :mobile-native="true"
                  :day-names="consts.calendarDays"
                  :month-names="consts.calendarMonths"
                  :first-day-of-week="1"
                  :focused-date="calendarFocusedDate"
                  @focus="focusedDob = true"
                  @blur="focusedDob = false"
                ></b-datepicker>
                <svg class="field-icon calendar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="16" rx="2"></rect>
                  <path d="M16 3v4M8 3v4M3 11h18"></path>
                </svg>
              </div>
            </b-field>
            <p v-if="errorsDob.message" id="dob-error" class="field-error" role="alert">{{ errorsDob.message }}</p>
          </div>

          <div class="form-field">
            <b-field label-for="first-step-email" :type="errorsEmail.type">
              <template slot="label">E-mailová adresa <span class="required-marker" aria-hidden="true">*</span></template>
              <b-input
                id="first-step-email"
                :value="user.email"
                v-focus="focusedEmail"
                autocomplete="email"
                disabled
                aria-required="true"
                :aria-invalid="!!errorsEmail.message"
                :aria-describedby="errorsEmail.message ? 'email-hint email-error' : 'email-hint'"
                placeholder="např. josef.novak@seznam.cz"
                @focus="focusedEmail = true"
                @blur="focusedEmail = false"
              ></b-input>
            </b-field>
            <p id="email-hint" class="field-hint">Z tvého profilu</p>
            <p v-if="errorsEmail.message" id="email-error" class="field-error" role="alert">{{ errorsEmail.message }}</p>
          </div>

          <div class="form-field field-wide">
            <b-field label-for="first-step-phone" :type="errorsPhone.type">
              <template slot="label">Telefonní číslo <span class="required-marker" aria-hidden="true">*</span></template>
              <b-input
                id="first-step-phone"
                v-model="user.phone"
                type="tel"
                autocomplete="tel"
                aria-required="true"
                :aria-invalid="!!errorsPhone.message"
                :aria-describedby="errorsPhone.message ? 'phone-error' : null"
                placeholder="+420 725 575 575"
                @focus="focusedPhone = true"
                @blur="focusedPhone = false"
              ></b-input>
            </b-field>
            <p v-if="errorsPhone.message" id="phone-error" class="field-error" role="alert">{{ errorsPhone.message }}</p>
          </div>
        </div>
      </section>

      <section class="form-section" aria-labelledby="school-heading">
        <header class="section-heading">
          <h2 id="school-heading">Škola</h2>
          <p>Uveď, na jaké střední škole studuješ.</p>
        </header>

        <div class="form-grid">
          <div class="form-field field-wide school-field">
            <b-field label-for="first-step-school" :type="errorsSchool.type">
              <template slot="label">Název střední školy <span class="required-marker" aria-hidden="true">*</span></template>
              <div class="school-control">
                <svg class="field-icon search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">
                  <circle cx="10.5" cy="10.5" r="7.5"></circle>
                  <path d="m16 16 5 5"></path>
                </svg>
                <b-autocomplete
                  id="first-step-school"
                  v-model="user.school"
                  v-focus="focusedSchool"
                  ref="autocomplete"
                  :data="schools"
                  aria-required="true"
                  :aria-invalid="!!errorsSchool.message"
                  :aria-describedby="errorsSchool.message ? 'school-hint school-error' : 'school-hint'"
                  placeholder="Vyber školu ze seznamu"
                  @focus="focusedSchool = true"
                  @blur="focusedSchool = false"
                  @input="getSchools"
                  @select="option => selected = option"
                >
                  <template slot="empty">Žádný výsledek pro {{ user.school }}</template>
                </b-autocomplete>
              </div>
            </b-field>
            <div class="school-help">
              <p id="school-hint" class="field-hint">Začni psát název školy a vyber ze seznamu.</p>
              <button
                id="first-step-add-school"
                type="button"
                class="add-school-button"
                aria-haspopup="dialog"
                @keydown.enter.prevent
                @keyup.enter.prevent="showAddSchool"
                @click="showAddSchool"
              >Přidat školu ručně</button>
            </div>
            <p v-if="errorsSchool.message" id="school-error" class="field-error" role="alert">{{ errorsSchool.message }}</p>
          </div>

          <div class="form-field">
            <b-field label-for="first-step-grade" :type="errorsGrade.type">
              <template slot="label">Ročník střední školy <span class="required-marker" aria-hidden="true">*</span></template>
              <b-select
                id="first-step-grade"
                v-model="user.grade"
                v-focus="focusedGrade"
                expanded
                aria-required="true"
                :aria-invalid="!!errorsGrade.message"
                :aria-describedby="errorsGrade.message ? 'grade-error' : null"
                placeholder="Vyber ročník"
                @focus="focusedGrade = true"
                @blur="focusedGrade = false"
              >
                <optgroup label="Čtyřleté">
                  <option v-for="option in consts.grades.four" :key="option.value" :value="option.value">{{ option.name }}</option>
                </optgroup>
                <optgroup label="Šestileté">
                  <option v-for="option in consts.grades.six" :key="option.value" :value="option.value">{{ option.name }}</option>
                </optgroup>
                <optgroup label="Osmileté">
                  <option v-for="option in consts.grades.eight" :key="option.value" :value="option.value">{{ option.name }}</option>
                </optgroup>
              </b-select>
            </b-field>
            <p v-if="errorsGrade.message" id="grade-error" class="field-error" role="alert">{{ errorsGrade.message }}</p>
          </div>

          <div class="form-field">
            <b-field label-for="first-step-region" :type="errorsRegion.type">
              <template slot="label">Kraj <span class="required-marker" aria-hidden="true">*</span></template>
              <b-select
                id="first-step-region"
                v-model="user.region"
                v-focus="focusedRegion"
                expanded
                aria-required="true"
                :aria-invalid="!!errorsRegion.message"
                :aria-describedby="errorsRegion.message ? 'region-error' : null"
                placeholder="Vyber kraj"
                @focus="focusedRegion = true"
                @blur="focusedRegion = false"
              >
                <option v-for="option in consts.regions" :key="option" :value="option">{{ option }}</option>
              </b-select>
            </b-field>
            <p v-if="errorsRegion.message" id="region-error" class="field-error" role="alert">{{ errorsRegion.message }}</p>
          </div>
        </div>
      </section>

      <section class="form-section" aria-labelledby="about-heading">
        <header class="section-heading">
          <h2 id="about-heading">Více o tobě</h2>
          <p>Poděl se o své zájmy a představ se v krátkém medailonku.</p>
        </header>

        <div class="form-grid">
          <div class="form-field">
            <b-field label-for="first-step-linkedin">
              <template slot="label">LinkedIn účet <span class="optional-label">(nepovinné)</span></template>
              <b-input id="first-step-linkedin" v-model="user.linkedin" placeholder="např. www.linkedin.com/josefnovak"></b-input>
            </b-field>
          </div>

          <div class="form-field">
            <b-field label-for="first-step-interests">
              <template slot="label">Obory zájmu <span class="optional-label">(nepovinné)</span></template>
              <b-taginput
                id="first-step-interests"
                v-model="user.interests"
                :data="inters"
                autocomplete
                placeholder="např. filozofie, matematika či tanec"
                field="interest"
                :open-on-focus="true"
                @typing="getFilteredInterests"
              ></b-taginput>
            </b-field>
          </div>

          <div class="form-field field-wide summary-field">
            <b-field label-for="first-step-summary" :type="errorsSummary.type">
              <template slot="label">Medailonek ve 3. osobě <span class="required-marker" aria-hidden="true">*</span></template>
              <b-input
                id="first-step-summary"
                v-model="user.summary"
                v-focus="focusedSummary"
                maxlength="400"
                :has-counter="false"
                type="textarea"
                aria-required="true"
                :aria-invalid="!!errorsSummary.message"
                :aria-describedby="errorsSummary.message ? 'summary-hint summary-count summary-error' : 'summary-hint summary-count'"
                placeholder="Popiš se v několika větách ve třetí osobě."
                @focus="focusedSummary = true"
                @blur="focusedSummary = false"
              ></b-input>
            </b-field>
            <div class="summary-help">
              <p id="summary-hint" class="field-hint">Tvůj medailonek budeme číst na vyhlášení TOP100. Nevíš si rady? Přečti si dokument <a href="https://drive.google.com/file/d/1B75kIZD1Qd-JcP05LRTr4EkM70SoK6k0/view" target="_blank" rel="noopener noreferrer">Jak na přihlášku</a>.</p>
              <p id="summary-count" class="field-hint character-count">{{ (user.summary || '').length }} / 400 znaků</p>
            </div>
            <p v-if="errorsSummary.message" id="summary-error" class="field-error" role="alert">{{ errorsSummary.message }}</p>
          </div>
        </div>

        <!-- Image upload remains disabled. -->
        <div hidden>
          <b-field class="file is-primary" :class="{ 'has-name': !!user.image }">
            <b-upload v-model="user.image" class="file-label" accept="image/jpeg, image/png, image/jpg" validationMessage="Prosím vyberte soubor">
              <span class="file-cta"><span class="file-label">Nahraj svou profilovou fotografii</span></span>
              <span class="file-name" v-if="user.image">{{ user.image.name }}</span>
            </b-upload>
          </b-field>
          <p>Nahrání je volitelné. V případě tvého umístění bude fotografie použita během Slavnostního Galavečera. Podporovány jsou .png, .jpg a .jpeg formáty.</p>
        </div>
      </section>

      <section class="form-section" aria-labelledby="confirmation-heading">
        <header class="section-heading">
          <h2 id="confirmation-heading">Ještě před pokračováním</h2>
        </header>

        <div class="confirmation-field">
          <div class="confirmation-row">
            <input
              id="first-step-guide"
              v-model="user.readGuideConfirmed"
              type="checkbox"
              aria-required="true"
              :aria-invalid="!!errorsAgree.message"
              :aria-describedby="errorsAgree.message ? 'guide-error' : null"
            >
            <label for="first-step-guide">Potvrzuji, že jsem si přečetl/a dokumenty:
                <a href="https://drive.google.com/file/d/1UVUG5ivOKPc6szZJIS0r11C6sgF7-vsU/view?usp=sharing" target="_blank" rel="noopener noreferrer">Jak na přihlášku</a>,
                <a href="https://drive.google.com/file/d/1Rd2zE5s4MFZdA7C0X03zdu9oQFmFMjge/view?usp=sharing" target="_blank" rel="noopener noreferrer">Jak probíhá hodnocení</a>,
                <a href="https://drive.google.com/file/d/1Mk6u34cJalviooAW4f2XlpeLIld-f02j/view?usp=sharing" target="_blank" rel="noopener noreferrer">Pravidla Ceny Středoškoláka roku</a>.
                <span class="required-marker" aria-hidden="true">*</span></label>
          </div>
          <p v-if="errorsAgree.message" id="guide-error" class="field-error" role="alert">{{ errorsAgree.message }}</p>
        </div>

        <div class="confirmation-row">
          <input id="first-step-repeating" v-model="user.isRepeting" type="checkbox">
          <label for="first-step-repeating">Už jsem se Ceny Středoškolák roku účastnil/a.</label>
        </div>

        <div class="confirmation-row">
          <input id="first-step-has-time" v-model="user.hasTime" type="checkbox">
          <label for="first-step-has-time">Měl/a bych čas se zúčastnit Víkendu TOP25 4.–6. 6. 2027.</label>
        </div>

        <div class="form-field knowledge-field">
          <b-field label-for="first-step-knowledge">
            <template slot="label">Jak ses dozvěděl/a o Ceně Středoškolák roku? <span class="optional-label">(nepovinné)</span></template>
            <b-select id="first-step-knowledge" v-model="user.knowledge" expanded placeholder="Vyber z možností">
              <option v-for="option in consts.knowledge" :key="option" :value="option">{{ option }}</option>
            </b-select>
          </b-field>
        </div>
      </section>

      <footer class="step-footer">
        <p class="required-note"><span class="required-marker" aria-hidden="true">*</span> Povinné údaje</p>
        <div class="save-note">
          <p>Přihlášku uložíš až ve 4. kroku tlačítkem „Odeslat přihlášku“. Potom ji můžeš až do konce přihlašování upravovat.</p>
          <p v-if="user.lastSaved" class="last-saved">Poslední uložení přihlášky: {{ transformDate(user.lastSaved) }}</p>
        </div>
        <div class="step-actions">
          <button type="button" class="step-button primary-action" @click="goToSpecialPrize">
            <span>Pokračovat na aktivity</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 12h16m-7-7 7 7-7 7"></path></svg>
          </button>
          <a class="step-button secondary-action" href="https://prostredoskolaky.cz/">Zavřít</a>
        </div>
        <p class="support-note">Potřebuješ s přihláškou pomoct? Napiš nám na <a href="mailto:info@prostredoskolaky.cz">info@prostredoskolaky.cz</a>.</p>
      </footer>
    </div>
  </section>
</template>
<script>
import config from '../../config/default'
import ValidationUtils from '../../utils/validationUtils'
import transformerUtils from '../../utils/transformerUtils'
import client from '../../client/client'
import { mapFields } from 'vuex-map-fields'
import { required, email, sameAs } from 'vuelidate/lib/validators'
import { mixin as focusMixin } from 'vue-focus'
import { debounce } from 'debounce'
import tracking from '../../utils/tracking'
import { mapActions } from 'vuex'
import { FETCH_USER } from '../../types'
import ActivitiesStep from './ActivitiesStep.vue'

const REGISTRATION_FINISHED = false // true, for when it should be closed
const REGISTRATION_FINISHED_MESSAGE = 'Přihlašování bylo ukončeno! Další ročník ceny bude zahájen v <span class="orange">listopadu 2027</span>.'

export default {
  name: 'first-step',
  description: REGISTRATION_FINISHED
    ? REGISTRATION_FINISHED_MESSAGE
    : `Začni vyplněním svých základních údajů. <b>Přihlášku uložíš v posledním kroku. Po uložení se můžeš k přihlášce až do deadlinu kdykoliv vrátit a upravovat ji.</b>`,
  number: 1,
  loaderBlockName: 'první krok - základní údaje',
  isFinished: REGISTRATION_FINISHED,
  components: { ActivitiesStep },
  mixins: [focusMixin],
  data () {
    return {
      // Old dev passphrase (disabled): h4qVDW90T
      finished: REGISTRATION_FINISHED,
      selected: '',
      schools: [],
      calendarFocusedDate: new Date(new Date().getFullYear() - 10, 11, 31),
      consts: {
        grades: {
          four: config.consts.grades.four,
          six: config.consts.grades.six,
          eight: config.consts.grades.eight
        },
        regions: config.consts.regions,
        interests: config.consts.interests,
        knowledge: config.consts.knowledge,
        calendarDays: ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'],
        calendarMonths: ['leden', 'únor', 'březen', 'duben', 'květen', 'červen', 'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec']
      },
      message: '',
      focusedFirstName: '',
      focusedLastName: '',
      focusedSchool: '',
      focusedGrade: '',
      focusedEmail: '',
      focusedDob: '',
      focusedRegion: '',
      focusedSummary: '',
      focusedPhone: '',
      submitStatus: ''
    }
  },
  async mounted () {
    tracking.track('competition', 'entrance_page', 'form_entrance')
    await this.fetchUser('full')
    this.$nextTick(this.labelDatepickerControls)
  },
  computed: {
    ...mapFields({
      user: 'user'
    }),
    inters: function () {
      // TODO: should interests be from `database interests`? (but sport -> individual/team -> BAD)
      return this.consts.interests.map(i => i.name)
    },
    errorsFirstName: function () {
      this.focusedFirstName
      this.$v.user.firstName.$invalid
      this.submitStatus
      return ValidationUtils.validate(this, 'firstName', 'focusedFirstName')
    },
    errorsLastName: function () {
      this.focusedLastName
      this.$v.user.lastName.$invalid
      this.submitStatus
      return ValidationUtils.validate(this, 'lastName', 'focusedLastName')
    },
    errorsEmail: function () {
      this.focusedEmail
      this.$v.user.email.$invalid
      this.submitStatus
      return ValidationUtils.validate(this, 'email', 'focusedEmail')
    },
    errorsDob: function () {
      this.focusedDob
      this.$v.user.dob.$invalid
      this.submitStatus
      return ValidationUtils.validate(this, 'dob', 'focusedDob')
    },
    errorsRegion: function () {
      this.focusedRegion
      this.$v.user.region.$invalid
      this.submitStatus
      return ValidationUtils.validate(this, 'region', 'focusedRegion')
    },
    errorsPhone: function () {
      this.focusedPhone
      this.$v.user.phone.$invalid
      this.submitStatus
      return ValidationUtils.validate(this, 'phone', 'focusedPhone')
    },
    errorsSchool: function () {
      this.focusedSchool
      this.$v.user.school.$invalid
      this.submitStatus
      return ValidationUtils.validate(this, 'school', 'focusedSchool')
    },
    errorsGrade: function () {
      this.focusedGrade
      this.$v.user.grade.$invalid
      this.submitStatus
      return ValidationUtils.validate(this, 'grade', 'focusedGrade')
    },
    errorsSummary: function () {
      this.focusedSummary
      this.$v.user.summary.$invalid
      this.submitStatus
      return ValidationUtils.validate(this, 'summary', 'focusedSummary')
    },
    errorsAgree: function () {
      this.$v.user.readGuideConfirmed.$invalid
      this.submitStatus
      if (!this.$v.user.readGuideConfirmed.$invalid) {
        return { message: '', type: '' }
      }
      if (this.submitStatus === 'ERROR') {
        return { message: 'Potvrzení je povinné.', type: config.errors.type }
      }
      return { message: '', type: '' }
    }
  },
  methods: {
    ...mapActions({ fetchUser: FETCH_USER }),
    labelDatepickerControls () {
      // This Buefy version does not expose labels for its calendar header.
      if (!this.$refs.dob) return
      const picker = this.$refs.dob.$el
      const labels = {
        '.pagination-previous': 'Předchozí měsíc',
        '.pagination-next': 'Následující měsíc'
      }
      Object.keys(labels).forEach(selector => {
        const control = picker.querySelector(selector)
        if (control) control.setAttribute('aria-label', labels[selector])
      })
      picker.querySelectorAll('select').forEach((control, index) => {
        control.setAttribute('aria-label', index === 0 ? 'Měsíc narození' : 'Rok narození')
      })
    },
    goToSpecialPrize () {
      if (this.finished) {
        return
      }
      if (this.$v.user.$invalid || this.$v.user.readGuideConfirmed.$invalid) {
        this.submitStatus = 'ERROR'
        this.$nextTick(() => {
          const firstInvalid = this.$el.querySelector('[aria-invalid="true"]:not([disabled])')
          if (firstInvalid) {
            firstInvalid.focus()
          }
        })
      } else {
        this.submitStatus = 'OK'
        this.$emit('changeView', ActivitiesStep)
      }
    },
    getFilteredInterests (text) {
      this.consts.interests = config.consts.interests.filter(option => {
        return (
          option.name
            .toString()
            .toLowerCase()
            .indexOf(text.toLowerCase()) >= 0
        )
      })
    },
    showAddSchool () {
      this.$dialog.prompt({
        message: `Škola`,
        inputAttrs: {
          placeholder: 'např. střední škola života',
          maxlength: 100,
          value: this.user.school
        },
        confirmText: 'Přidat',
        cancelText: 'Zrušit',
        onConfirm: value => {
          this.user.school = value
          this.$refs.autocomplete.setSelected(value)
        }
      })
    },
    transformDate (dateString) {
      return transformerUtils.transformDate(dateString)
    },
    getSchools: debounce(async function () {
      try {
        this.schools = await client.getSchools(this.user.school)
      } catch (err) {
        console.log(err)
      }
    }, 500)
  },
  validations: {
    user: {
      firstName: {
        required
      },
      lastName: {
        required
      },
      email: {
        email
      },
      grade: {
        required
      },
      dob: {
        required
      },
      school: {
        required
      },
      region: {
        required
      },
      phone: {
        required
      },
      summary: {
        required
      },
      readGuideConfirmed: {
        mustBeTrue: sameAs(() => true)
      }
    }
  }
}
</script>

<style scoped lang="scss">
@font-face {
  font-family: 'AvenirNextForm';
  src: url('~@/assets/fonts/AvenirNextLTPro-Regular.otf') format('opentype');
  font-style: normal;
  font-weight: 400;
  font-display: swap;
}

@font-face {
  font-family: 'AvenirNextForm';
  src: url('~@/assets/fonts/AvenirNextLTPro-Bold.otf') format('opentype');
  font-style: normal;
  font-weight: 700;
  font-display: swap;
}

.first-step {
  --form-ink: #071b46;
  --form-muted: #556c94;
  --form-accent: #f26427;
  --form-border: #8192ad;
  --form-error: #b42318;
  width: calc(100% - 64px);
  max-width: 1024px;
  margin: 0 auto;
  color: var(--form-ink);
  font-family: 'AvenirNextForm', 'AvenirNext', sans-serif;
  font-size: 1rem;
  line-height: 1.5;

  ::selection {
    color: var(--form-ink);
    background: #ffe2d4;
  }

  a {
    color: var(--form-ink);
    text-decoration: underline;
    text-underline-offset: 3px;
    overflow-wrap: anywhere;

    &:hover {
      color: #ac3711;
    }
  }

  a:focus-visible,
  button:focus-visible,
  input[type="checkbox"]:focus-visible {
    outline: 2px solid var(--form-ink);
    outline-offset: 4px;
  }
}

.first-step-panel {
  padding: 32px 36px 24px;
  border: 1px solid #ffd2c5;
  border-radius: 8px;
  background: #fff;
}

.form-section + .form-section {
  margin-top: 32px;
  padding-top: 28px;
  border-top: 1px solid #ffd2c5;
}

.section-heading {
  margin-bottom: 24px;

  h2 {
    margin: 0;
    color: var(--form-ink);
    font-size: 2rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.25;
  }

  p {
    margin: 8px 0 0;
    color: var(--form-muted);
  }
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px 32px;
}

.form-field {
  min-width: 0;

  > .field {
    margin-bottom: 0;
  }
}

.field-wide {
  grid-column: 1 / -1;
}

.required-marker {
  margin-left: 3px;
  color: var(--form-error);
}

.optional-label {
  color: var(--form-muted);
  font-weight: 400;
}

.field-hint,
.field-error {
  margin: 8px 0 0;
  font-size: 1rem;
  line-height: 1.5;
}

.field-hint {
  color: var(--form-muted);
}

.field-error {
  color: var(--form-error);
}

.first-step ::v-deep {
  .label {
    margin-bottom: 8px;
    color: var(--form-ink);
    font-size: 1rem;
    font-weight: 700;
    line-height: 1.5;
  }

  .input,
  .textarea,
  .select select,
  .taginput-container {
    width: 100%;
    min-height: 3.25rem;
    border: 1px solid var(--form-border);
    border-radius: 6px;
    background: #fff;
    color: var(--form-ink);
    box-shadow: none;
    font: inherit;
    font-size: 1.125rem;
    line-height: 1.4;
    caret-color: var(--form-ink);
    transition: border-color 140ms ease-out, background-color 140ms ease-out;

    &::placeholder {
      color: var(--form-muted);
      opacity: 1;
    }

    &:hover:not(:disabled) {
      border-color: var(--form-ink);
    }

    &:focus {
      border-color: var(--form-ink);
      outline: 2px solid var(--form-ink);
      outline-offset: 2px;
      box-shadow: none;
    }

    &[aria-invalid="true"],
    &.is-danger {
      border-color: var(--form-error);
    }

    &:disabled {
      border-color: #c8d0df;
      background: #f3f5f8;
      color: var(--form-muted);
      opacity: 1;
      -webkit-text-fill-color: var(--form-muted);
    }
  }

  .input,
  .textarea,
  .select select {
    padding: 12px 16px;
  }

  .input,
  .select select {
    height: 3.25rem;
  }

  .textarea {
    min-height: 148px;
    resize: vertical;
  }

  .select,
  .select select,
  .datepicker .dropdown,
  .datepicker .dropdown-trigger {
    width: 100%;
  }

  .select {
    height: auto;
  }

  .select select {
    padding-right: 44px;
    text-overflow: ellipsis;
  }

  .select:not(.is-multiple):not(.is-loading)::after {
    right: 20px;
    border-color: var(--form-ink);
  }

  .autocomplete .dropdown-menu {
    width: 100%;
    min-width: 0;
  }

  .datepicker {
    font-size: 1rem;

    .dropdown-menu {
      width: 22rem;
      min-width: 0;
    }

    .dropdown.is-mobile-modal .dropdown-menu {
      width: calc(100% - 32px);
      max-width: 22rem;
    }

    .dropdown-content {
      max-height: calc(100vh - 32px);
      padding: 16px;
      overflow-y: auto;
      border-radius: 8px;
    }

    .dropdown-item {
      padding: 0;
    }

    .datepicker-content {
      height: auto;
    }

    .datepicker-header .pagination {
      display: grid;
      grid-template-columns: 36px minmax(0, 1fr) 36px;
      grid-template-areas: 'previous choices next';
      gap: 8px;
      margin: 0;
    }

    .pagination-list {
      grid-area: choices;
      min-width: 0;
    }

    .pagination-list .field,
    .pagination-list .control {
      min-width: 0;
      margin-bottom: 0;
    }

    .pagination-list .control {
      flex: 1;
    }

    .pagination-list select {
      min-height: 44px;
      height: 44px;
      padding: 8px 32px 8px 10px;
      font-size: 1rem;
    }

    .pagination-previous,
    .pagination-next {
      width: 100%;
      height: 44px;
      margin: 0;
      border-color: var(--form-border);
      border-radius: 6px;
      text-decoration: none;

      .icon::after {
        display: block;
        width: 8px;
        height: 8px;
        border-top: 2px solid var(--form-ink);
        border-right: 2px solid var(--form-ink);
        content: '';
      }

      .icon i {
        display: none;
      }
    }

    .pagination-previous {
      grid-area: previous;

      .icon::after {
        transform: rotate(-135deg);
      }
    }

    .pagination-next {
      grid-area: next;

      .icon::after {
        transform: rotate(45deg);
      }
    }

    .datepicker-table {
      width: 100%;
      table-layout: fixed;

      .datepicker-cell {
        width: 14.2857%;
        height: 44px;
        padding: 8px 2px;
        text-decoration: none;
      }

      .datepicker-header .datepicker-cell {
        color: var(--form-muted);
      }

      .datepicker-body .is-selected {
        background: var(--form-ink);
        color: #fff;
      }
    }
  }

  .autocomplete .dropdown-content {
    max-height: 256px;
    padding: 6px;
    border: 1px solid var(--form-border);
    border-radius: 6px;
    box-shadow: 0 8px 20px rgba(7, 27, 70, 0.1);
  }

  .autocomplete .dropdown-item {
    padding: 10px;
    border-radius: 3px;
    color: var(--form-ink);
    font-size: 1rem;
    white-space: normal;
    overflow-wrap: anywhere;

    &.is-hovered,
    &:hover {
      background: #fff0e9;
      color: var(--form-ink);
    }
  }

  .taginput-container {
    height: auto;
    padding: 8px 12px;

    &:focus-within {
      border-color: var(--form-ink);
      outline: 2px solid var(--form-ink);
      outline-offset: 2px;
    }

    .input {
      height: 32px;
      min-height: 32px;
      padding: 4px 0;
      border: 0;
      outline: 0;
      background: transparent;
      font-size: 1rem;
    }

    .tag {
      max-width: 100%;
      height: auto;
      min-height: 28px;
      background: #eef2f8;
      color: var(--form-ink);
      font-size: 1rem;
      white-space: normal;
      overflow-wrap: anywhere;
    }
  }
}

.date-control,
.school-control {
  position: relative;
}

.field-icon {
  position: absolute;
  z-index: 2;
  width: 22px;
  height: 22px;
  pointer-events: none;
}

.calendar-icon {
  top: 15px;
  right: 16px;
}

.search-icon {
  top: 15px;
  left: 16px;
  color: var(--form-muted);
}

.date-control ::v-deep .input {
  padding-right: 48px;
}

.school-control ::v-deep .input {
  padding-left: 48px;
}

.school-help {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  column-gap: 20px;
}

.add-school-button {
  min-height: 44px;
  padding: 8px 0;
  border: 0;
  background: transparent;
  color: var(--form-ink);
  font: inherit;
  text-decoration: underline;
  text-underline-offset: 3px;
  text-align: left;
  cursor: pointer;
}

.summary-help {
    display: flex;
     align-items: flex-start;
     justify-content: space-between;  /* pushes first to left, second to right */
     gap: 0;

  .field-hint:first-child {
    flex: 1;
    max-width: 65ch;
  }
}

.character-count {
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.confirmation-field {
  margin-bottom: 16px;
}

.confirmation-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-height: 44px;

  input {
    flex-shrink: 0;
    width: 22px;
    height: 22px;
    margin: 4px 0 0;
    accent-color: var(--form-ink);
    cursor: pointer;
  }

  label {
    min-width: 0;
    min-height: 44px;
    padding: 2px 0 10px;
    cursor: pointer;
  }
}

.knowledge-field {
  margin-top: 24px;
}

.step-footer {
  margin-top: 28px;
}

.required-note {
  margin: 0 0 12px;
  color: var(--form-muted);
}

.save-note {
  padding-top: 20px;
  border-top: 1px solid #ffd2c5;
  color: var(--form-muted);

  p {
    margin: 0;
  }

  .last-saved {
    margin-top: 8px;
    font-variant-numeric: tabular-nums;
  }
}

.step-actions {
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 20px;
}

.step-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  min-height: 3.5rem;
  padding: 12px 24px;
  border: 1px solid transparent;
  border-radius: 6px;
  font: inherit;
  font-weight: 700;
  line-height: 1.4;
  text-align: center;
  text-decoration: none !important;
  cursor: pointer;
  transition: background-color 140ms ease-out, border-color 140ms ease-out;

  svg {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
  }

  &:disabled {
    background: #e1e6ee;
    color: var(--form-muted);
    cursor: not-allowed;
  }
}

.primary-action {
  background: var(--form-accent);
  color: #fff;
  font-size: 1.25rem;

  &:hover:not(:disabled) {
    background: #d64b15;
  }

  &:active:not(:disabled) {
    background: #bc3e10;
  }
}

.first-step .secondary-action {
  min-width: 144px;
  border-color: var(--form-border);
  background: #fff;
  color: var(--form-ink);

  &:hover {
    border-color: var(--form-ink);
    background: #f3f5f8;
  }

  &:active {
    background: #e8edf5;
  }
}

.support-note {
  margin: 20px 0 0;
  color: var(--form-muted);
  overflow-wrap: anywhere;
}

.registration-closed {
  padding: 32px 0;

  h2 {
    font-size: 1.75rem;
    line-height: 1.4;
  }
}

@media (max-width: 767px) {
  .first-step {
    width: calc(100% - 32px);
  }

  .first-step-panel {
    padding: 24px 20px;
  }

  .section-heading h2 {
    font-size: 1.75rem;
  }

  .form-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .summary-help {
    flex-direction: column;
    gap: 0;
  }

  .step-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .step-button {
    width: 100%;
    gap: 12px;
    padding: 12px 16px;
  }

  .first-step ::v-deep .datepicker .datepicker-header .pagination {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-areas: 'choices choices' 'previous next';
  }
}

@media (max-width: 359px) {
  .first-step-panel {
    padding-right: 16px;
    padding-left: 16px;
  }

  .primary-action svg {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .first-step ::v-deep *,
  .step-button {
    transition: none !important;
    animation: none !important;
    scroll-behavior: auto !important;
  }
}
</style>
