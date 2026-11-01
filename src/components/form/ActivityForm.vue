<template>
  <div class="modal-card activity-editor" role="dialog" aria-modal="true" aria-labelledby="activity-editor-title" aria-describedby="activity-editor-description" @keydown.esc.stop.prevent="confirmClose" @keyup.esc.stop @keydown.tab="trapFocus">
    <header class="modal-card-head">
      <div>
        <h2 id="activity-editor-title">{{ index === null ? 'Přidat novou aktivitu' : 'Upravit aktivitu' }}</h2>
        <p id="activity-editor-description">Popiš aktivitu a své zapojení. Pole s <span class="required-marker">*</span> jsou povinná.</p>
      </div>
      <button type="button" class="editor-close" aria-label="Zavřít editor aktivity" @click="confirmClose"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6"></path></svg></button>
    </header>
    <form id="activity-editor-form" class="modal-card-body" novalidate @submit.prevent="submit">
      <div class="editor-grid">
        <div class="editor-field">
          <b-field label-for="activity-name" :type="errorsName.type">
            <template slot="label">Název aktivity <span class="required-marker" aria-hidden="true">*</span></template>
            <b-input id="activity-name" v-model="activity.name" maxlength="150" :has-counter="false" v-focus="focusedName" @focus="focusedName = true" @blur="focusedName = false" aria-required="true" :aria-invalid="!!errorsName.message" :aria-describedby="'activity-name-count' + (errorsName.message ? ' activity-name-error' : '')" placeholder="např. Středoškolská odborná činnost"></b-input>
          </b-field>
          <p id="activity-name-count" class="editor-counter">{{ (activity.name || '').length }} / 150 znaků</p>
          <p v-if="errorsName.message" id="activity-name-error" class="editor-error" role="alert">{{ errorsName.message }}</p>
        </div>
        <div class="editor-field">
          <b-field label-for="activity-type" :type="errorsType.type">
            <template slot="label">Typ aktivity <span class="required-marker" aria-hidden="true">*</span></template>
            <b-select id="activity-type" v-model="activity.type" v-focus="focusedType" @focus="focusedType = true" @blur="focusedType = false" aria-required="true" :aria-invalid="!!errorsType.message" :aria-describedby="errorsType.message ? 'activity-type-error' : null" placeholder="Vyber typ aktivity">
              <option disabled value="">Vyber typ aktivity</option>
              <option v-for="option in consts.types" :value="option" :key="option">{{ option }}</option>
            </b-select>
          </b-field>
          <p v-if="errorsType.message" id="activity-type-error" class="editor-error" role="alert">{{ errorsType.message }}</p>
        </div>
        <div v-if="showField.includes(activity.type) || showInterest.includes(activity.type) || showIsIndividual.includes(activity.type)" class="editor-classifications editor-wide" role="group" aria-label="Upřesnění aktivity">
          <div v-if="showField.includes(activity.type)" class="editor-field">
          <b-field label-for="activity-field" :type="errorsField.type">
            <template slot="label">Oblast <span class="required-marker" aria-hidden="true">*</span></template>
            <b-select id="activity-field" v-model="activity.field" v-focus="focusedField" @focus="focusedField = true" @blur="focusedField = false" aria-required="true" :aria-invalid="!!errorsField.message" :aria-describedby="'activity-field-hint' + (errorsField.message ? ' activity-field-error' : '')" placeholder="Vyber oblast">
              <option disabled value="">Vyber oblast</option>
              <option v-for="option in consts.fields" :value="option" :key="option">{{ option }}</option>
            </b-select>
          </b-field>
          <p id="activity-field-hint" class="editor-hint">Vyber, do jakého kola ses nejdál dostal/a.</p>
          <p v-if="errorsField.message" id="activity-field-error" class="editor-error" role="alert">{{ errorsField.message }}</p>
        </div>
          <div v-if="showInterest.includes(activity.type)" class="editor-field">
          <b-field label-for="activity-interest" :type="errorsInterest.type">
            <template slot="label">Obor <span class="required-marker" aria-hidden="true">*</span></template>
            <b-select id="activity-interest" v-model="activity.interest" v-focus="focusedInterest" @focus="focusedInterest = true" @blur="focusedInterest = false" aria-required="true" :aria-invalid="!!errorsInterest.message" :aria-describedby="errorsInterest.message ? 'activity-interest-error' : null" placeholder="Vyber obor aktivity">
              <option disabled value="">Vyber obor aktivity</option>
              <option v-for="option in consts.interests" :value="option" :key="option">{{ option }}</option>
            </b-select>
          </b-field>
          <p v-if="errorsInterest.message" id="activity-interest-error" class="editor-error" role="alert">{{ errorsInterest.message }}</p>
        </div>
          <div v-if="showIsIndividual.includes(activity.type)" class="editor-field">
          <b-field label-for="activity-individual" :type="errorsIsIndividual.type">
            <template slot="label">Individuální/týmová <span class="required-marker" aria-hidden="true">*</span></template>
            <b-select id="activity-individual" v-model="activity.isIndividual" v-focus="focusedIsIndividual" @focus="focusedIsIndividual = true" @blur="focusedIsIndividual = false" aria-required="true" :aria-invalid="!!errorsIsIndividual.message" :aria-describedby="errorsIsIndividual.message ? 'activity-individual-error' : null" placeholder="Vyber své zapojení">
              <option disabled value="">Vyber své zapojení</option>
              <option v-for="option in consts.individualities" :value="option" :key="option">{{ option }}</option>
            </b-select>
          </b-field>
          <p v-if="errorsIsIndividual.message" id="activity-individual-error" class="editor-error" role="alert">{{ errorsIsIndividual.message }}</p>
        </div>
        </div>
        <div class="editor-field editor-wide">
          <b-field label-for="activity-link" :type="errorsLink.type">
            <template slot="label">Webová stránka aktivity <span class="optional-label">(nepovinné)</span></template>
            <b-input id="activity-link" v-model="activity.link" maxlength="300" :has-counter="false" v-focus="focusedLink" @focus="focusedLink = true" @blur="focusedLink = false" :aria-invalid="!!errorsLink.message" :aria-describedby="'activity-link-hint activity-link-count' + (errorsLink.message ? ' activity-link-error' : '')" placeholder="https://www.soc.cz/dokumenty/vysledkove_listiny/2023-24.pdf"></b-input>
          </b-field>
          <div class="editor-field-meta"><p id="activity-link-hint" class="editor-hint">Ideálně odkaz přímo na aktivitu nebo výsledkovou listinu.</p><span id="activity-link-count" class="editor-counter">{{ (activity.link || '').length }} / 300 znaků</span></div>
          <p v-if="errorsLink.message" id="activity-link-error" class="editor-error" role="alert">{{ errorsLink.message }}</p>
        </div>
        <div class="editor-field editor-wide">
          <b-field label-for="activity-result" :type="errorsResult.type">
            <template slot="label">Krátký popis aktivity <span class="required-marker" aria-hidden="true">*</span></template>
            <b-input id="activity-result" type="textarea" rows="3" maxlength="500" :has-counter="false" v-model="activity.result" v-focus="focusedResult" @focus="focusedResult = true" @blur="focusedResult = false" aria-required="true" :aria-invalid="!!errorsResult.message" :aria-describedby="'activity-result-hint activity-result-count' + (errorsResult.message ? ' activity-result-error' : '')" placeholder="Co jsi dělal/a a čeho jsi dosáhl/a?"></b-input>
          </b-field>
          <div class="editor-field-meta"><p id="activity-result-hint" class="editor-hint">Uveď svou roli i výsledky, na které jsi hrdý/á.</p><span id="activity-result-count" class="editor-counter">{{ (activity.result || '').length }} / 500</span></div>
          <p v-if="errorsResult.message" id="activity-result-error" class="editor-error" role="alert">{{ errorsResult.message }}</p>
          <details class="editor-example">
            <summary><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m9 5 7 7-7 7"></path></svg>Příklad popisu</summary>
            <p>Krátce aktivitu popiš, včetně výsledků, kterých jsi v ní dosáhl/a (např. Tento rok jsem se zúčastnil fyzikální olympiády... Dosáhl jsem prvního místa v celostátním kole).</p>
          </details>
        </div>
        <div class="editor-field">
          <b-field label-for="activity-start" :type="errorsStart.type">
            <template slot="label">Časový rozsah <span class="required-marker" aria-hidden="true">*</span></template>
            <b-input id="activity-start" type="textarea" rows="2" maxlength="500" :has-counter="false" v-model="activity.start" v-focus="focusedStart" @focus="focusedStart = true" @blur="focusedStart = false" aria-required="true" :aria-invalid="!!errorsStart.message" :aria-describedby="'activity-start-hint activity-start-count' + (errorsStart.message ? ' activity-start-error' : '')" placeholder="např. 3 měsíce, 4 hodiny denně"></b-input>
          </b-field>
          <div class="editor-field-meta"><p id="activity-start-hint" class="editor-hint">Kolik času jsi aktivitě věnoval/a nebo stále věnuješ?</p><span id="activity-start-count" class="editor-counter">{{ (activity.start || '').length }} / 500</span></div>
          <p v-if="errorsStart.message" id="activity-start-error" class="editor-error" role="alert">{{ errorsStart.message }}</p>
        </div>
        <div class="editor-field">
          <b-field label-for="activity-reference" :type="errorsReference.type">
            <template slot="label">Reference (kontakt) <span class="required-marker" aria-hidden="true">*</span></template>
            <b-input id="activity-reference" type="textarea" rows="2" maxlength="500" :has-counter="false" v-model="activity.reference" v-focus="focusedReference" @focus="focusedReference = true" @blur="focusedReference = false" aria-required="true" :aria-invalid="!!errorsReference.message" :aria-describedby="'activity-reference-hint activity-reference-count' + (errorsReference.message ? ' activity-reference-error' : '')" placeholder="např. Josef Novák, e-mail: josef.novak@..."></b-input>
          </b-field>
          <div class="editor-field-meta"><p id="activity-reference-hint" class="editor-hint">Kontakt na osobu, která může tvou aktivitu potvrdit.</p><span id="activity-reference-count" class="editor-counter">{{ (activity.reference || '').length }} / 500</span></div>
          <p v-if="errorsReference.message" id="activity-reference-error" class="editor-error" role="alert">{{ errorsReference.message }}</p>
        </div>
      </div>
    </form>
    <footer class="modal-card-foot">
      <p>Celou přihlášku uložíš ve 4. kroku.</p>
      <div class="editor-actions">
        <button type="button" class="editor-button editor-cancel" @click="confirmClose">Zavřít</button>
        <button type="submit" form="activity-editor-form" class="editor-button editor-submit"><span>{{ index === null ? 'Přidat aktivitu' : 'Potvrdit úpravy' }}</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6"></path></svg></button>
      </div>
    </footer>
  </div>
</template>

<script>
import { mapFields } from 'vuex-map-fields'
import { required, requiredIf, maxLength } from 'vuelidate/lib/validators'
import { mixin as focusMixin } from 'vue-focus'
import config from '../../config/default'

export default {
  name: 'activity-form',
  mixins: [ focusMixin ],
  props: {
    index: {
      type: Number
    },
    act: {
      type: Object
    }
  },
  data () {
    return {
      showField: config.consts.showField,
      showInterest: config.consts.showInterest,
      showIsIndividual: config.consts.showIsIndividual,
      consts: {
        types: config.consts.activityTypes,
        fields: config.consts.fields,
        interests: config.consts.activityInterests,
        individualities: config.consts.individualities
      },
      activity: {
        name: '',
        link: '',
        result: '',
        start: '',
        type: '',
        field: '',
        interest: '',
        isIndividual: '',
        reference: ''
      },
      focusedName: undefined,
      focusedLink: undefined,
      focusedResult: undefined,
      focusedStart: undefined,
      focusedType: undefined,
      focusedField: undefined,
      focusedInterest: undefined,
      focusedIsIndividual: undefined,
      focusedReference: undefined,
      submitStatus: '',
      isModified: false
    }
  },
  mounted () {
    if (this.index !== null) {
      this.activity = { ...this.act }
    }
    this.$watch('activity', this.trackChanges, { deep: true })
    this.background = document.getElementById('app')
    if (this.background) {
      this.backgroundWasInert = this.background.inert
      this.background.inert = true
    }
    this.$parent.$once('close', this.restoreBackground)
    this.visibleViewport = window.visualViewport
    this.syncViewport()
    window.addEventListener('resize', this.syncViewport)
    if (this.visibleViewport) {
      this.visibleViewport.addEventListener('resize', this.syncViewport)
      this.visibleViewport.addEventListener('scroll', this.syncViewport)
    }
    this.$nextTick(() => this.$el.querySelector('#activity-name').focus())
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.syncViewport)
    if (this.visibleViewport) {
      this.visibleViewport.removeEventListener('resize', this.syncViewport)
      this.visibleViewport.removeEventListener('scroll', this.syncViewport)
    }
    this.restoreBackground()
  },
  computed: {
    ...mapFields({
      activities: 'user.activities'
    }),
    errorsName: function () {
      this.focusedName
      this.$v.activity.name.$invalid
      this.submitStatus
      return this.validate('name', 'focusedName')
    },
    errorsLink () {
      return this.validate('link', 'focusedLink')
    },
    errorsReference () {
      return this.validate('reference', 'focusedReference')
    },
    errorsResult: function () {
      this.focusedResult
      this.$v.activity.result.$invalid
      this.submitStatus
      return this.validate('result', 'focusedResult')
    },
    errorsStart: function () {
      this.focusedStart
      this.$v.activity.start.$invalid
      this.submitStatus
      return this.validate('start', 'focusedStart')
    },
    errorsType: function () {
      this.focusedType
      this.$v.activity.type.$invalid
      this.submitStatus
      return this.validate('type', 'focusedType')
    },
    errorsField: function () {
      this.focusedField
      this.$v.activity.field.$invalid
      this.submitStatus
      return this.validate('field', 'focusedField')
    },
    errorsInterest: function () {
      this.focusedInterest
      this.$v.activity.interest.$invalid
      this.submitStatus
      return this.validate('interest', 'focusedInterest')
    },
    errorsIsIndividual: function () {
      this.focusedIsIndividual
      this.$v.activity.isIndividual.$invalid
      this.submitStatus
      return this.validate('isIndividual', 'focusedIsIndividual')
    }
  },
  methods: {
    syncViewport () {
      const viewport = this.visibleViewport
      this.$el.style.setProperty('--editor-viewport-height', `${viewport ? viewport.height : window.innerHeight}px`)
      this.$el.style.setProperty('--editor-viewport-top', `${viewport ? viewport.offsetTop : 0}px`)
    },
    submit () {
      if (this.$v.activity.$invalid) {
        this.submitStatus = 'ERROR'
        this.$nextTick(() => {
          const invalid = this.$el.querySelector('input[aria-invalid="true"], select[aria-invalid="true"], textarea[aria-invalid="true"]')
          if (invalid) invalid.focus()
        })
      } else {
        this.submitStatus = 'OK'
        if (this.index != null) {
          this.activities.splice(this.index, 1, this.activity)
        } else {
          if (!Array.isArray(this.activities)) this.activities = []
          this.activities.push(this.activity)
        }
        this.$parent.close()
      }
    },
    validate (input, focused) {
      if (!this.$v.activity[input].$invalid) {
        return { message: '', type: '' }
      }
      if (this[focused] === false || this.submitStatus === 'ERROR') {
        let message = config.errors.required
        if (this.$v.activity[input].maxLength === false) {
          const limit = this.$v.activity[input].$params.maxLength.max
          message = `Zkrať ${input === 'name' ? 'název aktivity' : 'odkaz'} na nejvýše ${limit} znaků.`
        } else if (input === 'reference') {
          message = 'Doplň kontakt na osobu, která může tvou aktivitu potvrdit.'
        }
        return { message, type: config.errors.type }
      } else return { message: '', type: '' }
    },
    confirmClose () {
      if (this.isModified && confirm('Opravdu chcete zavřít upravování aktivity bez uložení?')) {
        this.$parent.close()
      } else if (!this.isModified) {
        this.$parent.close()
      }
    },
    trackChanges () {
      this.isModified = true
    },
    restoreBackground () {
      if (this.background) {
        this.background.inert = this.backgroundWasInert
        this.background = null
      }
    },
    trapFocus (event) {
      const controls = Array.from(this.$el.querySelectorAll('button, input, select, textarea, summary')).filter(el => !el.disabled && el.getClientRects().length)
      const first = controls[0]
      const last = controls[controls.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
  },
  validations: {
    activity: {
      name: {
        required,
        maxLength: maxLength(150)
      },
      link: {
        maxLength: maxLength(300)
      },
      reference: {
        required
      },
      result: {
        required
      },
      start: {
        required
      },
      type: {
        required
      },
      field: {
        required: requiredIf((form) => {
          return config.consts.showField.includes(form.type)
        })
      },
      interest: {
        required: requiredIf((form) => {
          return config.consts.showInterest.includes(form.type)
        })
      },
      isIndividual: {
        required: requiredIf((form) => {
          return config.consts.showIsIndividual.includes(form.type)
        })
      }
    }
  }
}
</script>

<style scoped lang="scss">
.activity-editor {
  --editor-ink: #071b46;
  --editor-muted: #556c94;
  --editor-action: #c44716;
  --editor-border: #8192ad;
  --editor-error: #b42318;
  width: calc(100% - 48px);
  max-width: 900px;
  max-height: calc(100vh - 48px);
  max-height: calc(var(--editor-viewport-height, 100dvh) - 48px);
  margin: auto !important;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 24px 80px rgba(7, 27, 70, .24);
  color: var(--editor-ink);
  font: 1rem/1.5 'AvenirNextForm', 'AvenirNext', sans-serif;

  ::selection { color: var(--editor-ink); background: #ffe2d4; }
  button { font-family: inherit; cursor: pointer; -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
  button:focus-visible { outline: 2px solid var(--editor-ink); outline-offset: 3px; }
  svg { flex-shrink: 0; width: 1.5rem; height: 1.5rem; }
}

.activity-editor .modal-card-head {
  align-items: flex-start;
  gap: 16px;
  padding: 24px 28px 20px;
  border: 0;
  border-bottom: 1px solid #e1e6ef;
  border-radius: 0;
  background: #fff;
}
.activity-editor h2 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -.02em;
}
.activity-editor .modal-card-head p { margin: 8px 0 0; color: var(--editor-muted); font-size: .9375rem; }
.editor-close {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 2.75rem;
  height: 2.75rem;
  min-width: 44px;
  min-height: 44px;
  margin: -4px -6px 0 auto;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: #f1f3f8;
  color: var(--editor-ink);
  transition: background-color 140ms ease-out;
  &:hover { background: #e5eaf2; }
  &:active { background: #d5deeb; }
}
.activity-editor .modal-card-body {
  min-height: 0;
  padding: 24px 28px;
  background: #fff;
  overscroll-behavior: contain;
  scrollbar-color: #8192ad #f1f3f8;
}
.editor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
  gap: 20px 24px;
}
.editor-classifications {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));
  align-items: start;
  gap: 20px 24px;
}
.editor-field { min-width: 0; }
.editor-wide { grid-column: 1 / -1; }
.editor-field > .field { margin-bottom: 0; }
.required-marker { color: var(--editor-error); }
.optional-label { color: var(--editor-muted); font-weight: 400; }
.editor-hint, .editor-error { margin: 8px 0 0; font-size: .875rem; line-height: 1.5; overflow-wrap: anywhere; }
.editor-hint, .editor-counter { color: var(--editor-muted); }
.editor-error { color: var(--editor-error); }
.editor-field-meta { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 4px 12px; }
.editor-field-meta .editor-hint { flex: 1 1 14rem; }
.editor-counter { margin-top: 8px; font-size: .875rem; white-space: nowrap; font-variant-numeric: tabular-nums; }
.editor-example { margin-top: 4px; font-size: .875rem; color: var(--editor-muted); }
.editor-example summary {
  display: flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  min-height: 44px;
  padding: 8px 0;
  cursor: pointer;
  list-style: none;
  text-decoration: underline;
  text-underline-offset: 3px;
  touch-action: manipulation;
  &:hover { color: var(--editor-ink); }
  &:active { color: var(--editor-action); }
  &:focus-visible { outline: 2px solid var(--editor-ink); outline-offset: 3px; }
  &::marker { content: ''; }
  &::-webkit-details-marker { display: none; }
}
.editor-example svg { width: 1rem; height: 1rem; transition: transform 140ms ease-out; }
.editor-example[open] svg { transform: rotate(90deg); }
.editor-example p { max-width: 70ch; margin: 0 0 8px; overflow-wrap: anywhere; }

.activity-editor .modal-card-foot {
  display: block;
  padding: 16px 28px 20px;
  border: 0;
  border-top: 1px solid #e1e6ef;
  border-radius: 0;
  background: #fff;
}
.activity-editor .modal-card-foot p { margin: 0 0 12px; color: var(--editor-muted); font-size: .875rem; }
.editor-actions { display: flex; align-items: stretch; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
.editor-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  min-height: 3.25rem;
  margin: 0;
  padding: 12px 20px;
  border: 1px solid var(--editor-border);
  border-radius: 6px;
  background: #fff;
  color: var(--editor-ink);
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.4;
  text-align: center;
  white-space: normal;
  transition: background-color 140ms ease-out, border-color 140ms ease-out;
  &:hover:not(:disabled) { border-color: var(--editor-ink); background: #f4f6fa; }
  &:active:not(:disabled) { background: #e6ebf3; }
  &:disabled { border-color: #d6dde8; background: #f1f3f7; color: #657591; cursor: not-allowed; }
}
.editor-cancel { min-width: 112px; }
.editor-submit {
  border-color: var(--editor-action);
  background: var(--editor-action);
  color: #fff;
  &:hover:not(:disabled) { border-color: #a63810; background: #a63810; }
  &:active:not(:disabled) { border-color: #8e300e; background: #8e300e; }
}

.activity-editor ::v-deep {
  .label { margin-bottom: 8px; color: var(--editor-ink); font-size: 1rem; font-weight: 700; line-height: 1.5; }
  .input, .textarea, .select select {
    width: 100%;
    max-width: 100%;
    min-height: 3rem;
    padding: 11px 13px;
    border: 1px solid var(--editor-border);
    border-radius: 6px;
    background: #fff;
    color: var(--editor-ink);
    font: 1rem/1.5 'AvenirNextForm', 'AvenirNext', sans-serif;
    box-shadow: none;
    caret-color: var(--editor-ink);
    scroll-margin-block: 20px;
    transition: border-color 140ms ease-out, background-color 140ms ease-out;
  }
  .input, .select select { height: 3rem; }
  .textarea { min-height: 5.5rem; resize: vertical; }
  .input::placeholder, .textarea::placeholder { color: var(--editor-muted); opacity: 1; }
  .input:hover, .textarea:hover, .select select:hover { border-color: var(--editor-ink); }
  .input:focus, .textarea:focus, .select select:focus { outline: 2px solid var(--editor-ink); outline-offset: 2px; border-color: var(--editor-ink); box-shadow: none; }
  .input[aria-invalid='true'], .textarea[aria-invalid='true'], .select select[aria-invalid='true'] { border-color: var(--editor-error); }
  .input:disabled, .textarea:disabled, .select select:disabled { background: #f1f3f7; color: #657591; cursor: not-allowed; }
  .control, .select { width: 100%; min-width: 0; }
  .select { height: auto; }
  .select select { padding-right: 40px; text-overflow: ellipsis; }
  .select:not(.is-multiple):not(.is-loading)::after { right: 18px; width: 9px; height: 9px; border-color: var(--editor-ink); border-width: 2px; }
  .icon.is-right { display: none; }
  .control.has-icons-right .input, .control.has-icons-right .textarea { padding-right: 13px; }
}

@media (max-width: 767px) {
  .activity-editor {
    position: fixed;
    top: var(--editor-viewport-top, 0px);
    right: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    height: var(--editor-viewport-height, 100dvh);
    max-height: 100vh;
    max-height: var(--editor-viewport-height, 100dvh);
    margin: 0 !important;
    border-radius: 0;
    box-shadow: none;
  }
  .activity-editor .modal-card-head { padding: max(20px, env(safe-area-inset-top)) 20px 16px; }
  .activity-editor h2 { font-size: 1.5rem; }
  .activity-editor .modal-card-body { padding: 20px; }
  .editor-grid, .editor-classifications { grid-template-columns: minmax(0, 1fr); }
  .activity-editor .modal-card-foot { padding: 12px 20px max(16px, env(safe-area-inset-bottom)); }
  .editor-actions { gap: 10px; }
  .editor-button { flex: 1 1 8rem; min-width: 0; gap: 10px; padding: 12px; }
}
@media (max-height: 600px) {
  .activity-editor .modal-card-head { padding-top: max(12px, env(safe-area-inset-top)); padding-bottom: 12px; }
  .activity-editor .modal-card-head p { margin-top: 4px; }
  .activity-editor .modal-card-foot { padding-top: 10px; padding-bottom: max(12px, env(safe-area-inset-bottom)); }
  .activity-editor .modal-card-foot p { margin-bottom: 8px; }
}
@media (prefers-reduced-motion: reduce) {
  .activity-editor *, .activity-editor ::v-deep * { transition: none !important; animation: none !important; scroll-behavior: auto !important; }
}
@media (prefers-contrast: more) {
  .activity-editor { outline: 1px solid var(--editor-ink); }
  .activity-editor .modal-card-head, .activity-editor .modal-card-foot { border-color: var(--editor-ink); }
}
</style>

<style lang="scss">
/* Buefy places the modal beside #app, so the host hook is intentionally global. */
.activity-editor-host > .modal-background { background: rgba(7, 27, 70, .48); }
@media (max-width: 767px) {
  .activity-editor-host > .animation-content { height: 100%; }
}
</style>
