<template>
  <section class="special-prize-step" aria-labelledby="special-prize-heading">
    <header class="step-intro">
      <h2 id="special-prize-heading">Speciální ceny</h2>
      <p v-if="publishedPrizeIds.length">
        Vyplnění následujících sekcí tě zařadí do soutěže o speciální ceny našich partnerů.
        Účast je <strong>zcela dobrovolná</strong> a tvé hodnocení v hlavní soutěži nijak neovlivní.
      </p>
    </header>

    <form novalidate @submit.prevent="goToFinalise">
      <SpecialPrizeNotice v-if="!publishedPrizeIds.length" />
      <div v-else class="prize-list">
        <article v-if="publishedPrizeIds.includes('startup')" class="prize-card prize-with-response" :class="{ 'is-selected': user.specialPrize1Interested }" aria-labelledby="startup-heading">
          <div class="prize-brand">
            <img :src="startUpPrizeImage" width="786" height="624" alt="Start up roku - Start it @ČSOB">
          </div>
          <div class="prize-info">
            <h3 id="startup-heading">Start up roku</h3>
            <a class="prize-partner" href="https://startit.csob.cz/">Start it @ČSOB</a>
            <p id="startup-prompt" class="prize-description">
              V jakém startupu jsi zapojen, čím se zabývá, jak velký je tým, jakou v něm máš roli a v jaké fázi startup je (nápad, prototyp, MVP, investice)?
            </p>
            <label class="prize-choice">
              <input v-model="user.specialPrize1Interested" type="checkbox" name="specialPrize1Interested" :aria-controls="user.specialPrize1Interested ? 'startup-response' : null">
              <span>Chci být zahrnut*a do výběru.<span class="visually-hidden"> Start up roku</span></span>
            </label>
          </div>
          <transition name="prize-reveal">
            <div v-if="user.specialPrize1Interested" id="startup-response" class="prize-response">
              <label class="response-label" for="startup-description">Popiš svůj start-up.<span class="required-marker" aria-hidden="true"> *</span></label>
              <textarea
                id="startup-description"
                ref="startupDescription"
                v-model="user.specialPrize1text"
                maxlength="2000"
                rows="5"
                required
                aria-required="true"
                :aria-invalid="!!specialPrize1Error"
                :aria-describedby="'startup-prompt startup-count' + (specialPrize1Error ? ' startup-error' : '')"
                placeholder="Popiš svůj start-up."
                @blur="validateSpecialPrize1"
              ></textarea>
              <p id="startup-count" class="response-count"><span v-if="specialPrize1Length >= 2000">Dosažen limit.</span> {{ specialPrize1Length }} / 2 000 znaků</p>
              <p v-if="specialPrize1Error" id="startup-error" class="field-error" role="alert">{{ specialPrize1Error }}</p>
            </div>
          </transition>
        </article>

        <article v-if="publishedPrizeIds.includes('microsoft')" class="prize-card" :class="{ 'is-selected': user.specialPrize2Interested }" aria-labelledby="innovator-heading">
          <div class="prize-brand">
            <img :src="innovatorPrizeImage" width="1014" height="624" alt="Inovátor nové generace - Microsoft">
          </div>
          <div class="prize-info">
            <h3 id="innovator-heading">„Inovátor nové generace"</h3>
            <a class="prize-partner" href="https://www.microsoft.com/cs-cz">Microsoft</a>
            <p class="prize-description">Pro studenta, který se nebojí přemýšlet jinak.</p>
            <p class="prize-description">
              Pro studenta, který přichází s odvážnými nápady a (ne výlučně) technologickými řešeními. Vyzdvihuje kreativitu, odvahu a schopnost měnit budoucnost pomocí inovací.
            </p>
            <label class="prize-choice">
              <input v-model="user.specialPrize2Interested" type="checkbox" name="specialPrize2Interested">
              <span>Chci být zahrnut*a do výběru.<span class="visually-hidden"> Inovátor nové generace</span></span>
            </label>
          </div>
        </article>

        <article v-if="publishedPrizeIds.includes('mattoni')" class="prize-card prize-with-response" :class="{ 'is-selected': user.specialPrize3Interested }" aria-labelledby="mattoni-heading">
          <div class="prize-brand prize-brand-mattoni">
            <img :src="mattoniTalentsPrizeImage" width="2000" height="922" alt="Cena MATTONI TALENTS 2026 - Mattoni 1873">
          </div>
          <div class="prize-info">
            <h3 id="mattoni-heading">Cena MATTONI TALENTS 2026</h3>
            <a class="prize-partner" href="https://www.mattoni1873.cz/">Mattoni 1873</a>
            <details class="prize-details">
              <summary>
                Co můžeš vyhrát
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="m5 8 5 5 5-5"></path></svg>
              </summary>
              <ul>
                <li>
                  1. místo: Jistá účast v prestižním výběrovém dvoutýdenním vzdělávacím programu Mattoni Eagles 2026 - v termínu 17. – 28. srpna (uložte do kalendáře).
                  <ul>
                    <li>Výhoda na startu kariéry, intenzivní vzdělávací program a networking s vybranými 15 vysokoškoláky z celé ČR.</li>
                    <li>Plně hrazeno Mattoni 1873. <a href="https://www.mattoni1873.cz/mattoni-eagles/" target="_blank" rel="noopener">https://www.mattoni1873.cz/mattoni-eagles/</a></li>
                  </ul>
                </li>
                <li>2. místo: Exkluzivní vstup na akci Mattoni Bridge v rámci KVIFF.</li>
              </ul>
            </details>
            <label class="prize-choice">
              <input v-model="user.specialPrize3Interested" type="checkbox" name="specialPrize3Interested" :aria-controls="user.specialPrize3Interested ? 'mattoni-response' : null">
              <span>Mám zájem o zařazení do výběru a mám čas 17. – 28. srpna 2027.<span class="visually-hidden"> Cena MATTONI TALENTS</span></span>
            </label>
          </div>
          <transition name="prize-reveal">
            <div v-if="user.specialPrize3Interested" id="mattoni-response" class="prize-response">
              <label class="response-label" for="mattoni-description">Napište, jaká inovativní řešení konkrétních problémů jste přivedli do reality.<span class="required-marker" aria-hidden="true"> *</span></label>
              <textarea
                id="mattoni-description"
                ref="mattoniDescription"
                v-model="user.specialPrize3text"
                maxlength="2000"
                rows="5"
                required
                aria-required="true"
                :aria-invalid="!!specialPrize3Error"
                :aria-describedby="'mattoni-count' + (specialPrize3Error ? ' mattoni-error' : '')"
                placeholder="Popište inovativní řešení, která jste přivedli do reality."
                @blur="validateSpecialPrize3"
              ></textarea>
              <p id="mattoni-count" class="response-count"><span v-if="specialPrize3Length >= 2000">Dosažen limit.</span> {{ specialPrize3Length }} / 2 000 znaků</p>
              <p v-if="specialPrize3Error" id="mattoni-error" class="field-error" role="alert">{{ specialPrize3Error }}</p>
            </div>
          </transition>
        </article>
      </div>

      <footer class="step-footer">
        <div class="save-note">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 11v6M12 7v1"></path></svg>
          <div>
            <p>Přihláška se uloží až ve čtvrtém kroku po kliknutí na <strong>„Uložit přihlášku“</strong>.</p>
            <p>K úpravě přihlášky se v průběhu přihlašování můžeš kdykoliv vrátit.</p>
            <p v-if="user.lastSaved" class="last-saved">Naposledy uloženo: {{ transformDate(user.lastSaved) }}</p>
          </div>
        </div>
        <div class="step-actions">
          <button class="step-button primary-action" type="submit">
            Pokračovat ke kontrole
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6"></path></svg>
          </button>
          <button class="step-button secondary-action" type="button" @click="goToActivities">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M20 12H4m6-6-6 6 6 6"></path></svg>
            Zpět na aktivity
          </button>
        </div>
        <p class="support-note">Pokud jsi zaznamenal/a potíže s přihláškou, dej nám prosím vědět na <a href="mailto:info@prostredoskolaky.cz">info@prostredoskolaky.cz</a>.</p>
      </footer>
    </form>
  </section>
</template>

<script>
import ActivitiesStep from './ActivitiesStep'
import SpecialPrizeNotice from './SpecialPrizeNotice'
import config from '../../config/default'
import FinaliseStep from './FinaliseStep'
import transformerUtils from '../../utils/transformerUtils'
import { mapFields } from 'vuex-map-fields'
import startUpPrizeImage from '../../assets/start_up_roku.png'
import innovatorPrizeImage from '../../assets/inovátor_nové_generace.png'
import mattoniTalentsPrizeImage from '../../assets/mattoni_talents_cena.jpg'

export default {
  name: 'special-prize-step',
  description: 'Zvaž zapojení do soutěže o <b>speciální ceny</b>. Účast je dobrovolná a tvé hodnocení v hlavní soutěži nijak neovlivní.',
  number: 3,
  loaderBlockName: 'třetí krok - speciální ceny',
  components: { FinaliseStep, ActivitiesStep, SpecialPrizeNotice },
  data () {
    return {
      startUpPrizeImage,
      innovatorPrizeImage,
      mattoniTalentsPrizeImage,
      specialPrize1Error: '',
      specialPrize3Error: ''
    }
  },
  watch: {
    'user.specialPrize1Interested': function (isInterested) {
      if (!isInterested) this.specialPrize1Error = ''
    },
    'user.specialPrize1text': function () {
      if (this.specialPrize1Error) this.validateSpecialPrize1()
    },
    'user.specialPrize3Interested': function (isInterested) {
      if (!isInterested) this.specialPrize3Error = ''
    },
    'user.specialPrize3text': function () {
      if (this.specialPrize3Error) this.validateSpecialPrize3()
    }
  },
  mounted () {
    window.scrollTo(0, 0)
  },
  computed: {
    ...mapFields({ user: 'user' }),
    publishedPrizeIds () {
      return config.consts.publishedSpecialPrizeIds
    },
    specialPrize1Length () {
      return typeof this.user.specialPrize1text === 'string' ? this.user.specialPrize1text.length : 0
    },
    specialPrize3Length () {
      return typeof this.user.specialPrize3text === 'string' ? this.user.specialPrize3text.length : 0
    }
  },
  methods: {
    goToActivities () {
      this.$emit('changeView', ActivitiesStep)
    },
    goToFinalise () {
      const startupIsValid = this.validateSpecialPrize1()
      const mattoniIsValid = this.validateSpecialPrize3()
      if (!startupIsValid || !mattoniIsValid) {
        this.$nextTick(() => {
          const input = !startupIsValid ? this.$refs.startupDescription : this.$refs.mattoniDescription
          if (input) input.focus()
        })
        return
      }
      this.$emit('changeView', FinaliseStep)
    },
    validateSpecialPrize1 () {
      const text = typeof this.user.specialPrize1text === 'string' ? this.user.specialPrize1text.trim() : ''
      const isValid = !this.publishedPrizeIds.includes('startup') || !this.user.specialPrize1Interested || text.length > 0
      this.specialPrize1Error = isValid ? '' : 'Popiš svůj start-up, nebo zruš výběr této ceny.'
      return isValid
    },
    validateSpecialPrize3 () {
      const text = typeof this.user.specialPrize3text === 'string' ? this.user.specialPrize3text.trim() : ''
      const isValid = !this.publishedPrizeIds.includes('mattoni') || !this.user.specialPrize3Interested || text.length > 0
      this.specialPrize3Error = isValid ? '' : 'Popiš svá inovativní řešení, nebo zruš výběr této ceny.'
      return isValid
    },
    transformDate (dateString) {
      return transformerUtils.transformDate(dateString)
    }
  }
}
</script>

<style scoped lang="scss">
.special-prize-step {
  --form-ink: #071b46;
  --form-muted: #556c94;
  --form-accent: #f26427;
  --form-action: #c44716;
  --form-border: #8192ad;
  --form-error: #b42318;
  width: calc(100% - 64px);
  max-width: 1024px;
  margin: 0 auto;
  color: var(--form-ink);
  font-family: 'AvenirNextForm', 'AvenirNext', sans-serif;
  font-size: 1rem;
  line-height: 1.5;

  ::selection { background: #ffe2d4; color: var(--form-ink); }

  a {
    color: var(--form-ink);
    text-decoration: underline;
    text-underline-offset: 3px;
    overflow-wrap: anywhere;
    &:hover { color: var(--form-action); }
  }

  a:focus-visible,
  button:focus-visible,
  summary:focus-visible,
  input:focus-visible {
    outline: 2px solid var(--form-ink);
    outline-offset: 4px;
  }
}

.step-intro {
  margin-bottom: 24px;
  h2 {
    margin: 0;
    font-size: 2rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.25;
  }
  p { max-width: 76ch; margin: 8px 0 0; color: var(--form-muted); }
  strong { color: var(--form-ink); }
}

.prize-list { display: grid; gap: 16px; }

.prize-card {
  display: grid;
  grid-template-columns: 188px minmax(0, 1fr);
  align-items: start;
  gap: 16px 28px;
  padding: 24px;
  border: 1px solid #d6deea;
  border-radius: 12px;
  background: #fff;
  transition: border-color 160ms ease-out, background-color 160ms ease-out;
  &:hover { border-color: var(--form-border); }
  &.is-selected { border-color: var(--form-accent); background: #fffaf7; }
}

.prize-brand {
  align-self: start;
  width: 188px;
  max-width: 100%;
  img { display: block; width: 100%; height: auto; object-fit: contain; }
}
.prize-brand-mattoni { padding: 12px 0; }

.prize-info {
  min-width: 0;
  h3 {
    margin: 0;
    color: var(--form-ink);
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: -0.01em;
    line-height: 1.35;
    overflow-wrap: anywhere;
  }
}
.prize-partner {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  font-size: .9375rem;
}
.prize-description {
  max-width: 70ch;
  margin: 4px 0 0;
  color: var(--form-muted);
  overflow-wrap: anywhere;
  + .prize-description { margin-top: 6px; }
}

.prize-choice {
  display: flex;
  align-items: flex-start;
  gap: .75rem;
  min-height: 44px;
  margin-top: 12px;
  padding: 10px 0;
  color: var(--form-ink);
  font-size: .9375rem;
  font-weight: 700;
  line-height: 1.5;
  cursor: pointer;
  input {
    flex-shrink: 0;
    width: 1.375rem;
    height: 1.375rem;
    margin: 0;
    accent-color: var(--form-action);
    cursor: pointer;
  }
}

.prize-details {
  margin-top: 8px;
  color: var(--form-muted);
  summary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 44px;
    color: var(--form-action);
    list-style: none;
    cursor: pointer;
    &::-webkit-details-marker { display: none; }
    &:hover { text-decoration: underline; text-underline-offset: 3px; }
  }
  svg { flex-shrink: 0; width: 20px; height: 20px; transition: transform 160ms ease-out; }
  &[open] svg { transform: rotate(180deg); }
  ul { margin: 8px 0 0; padding-left: 20px; list-style: disc; }
  li { margin-top: 8px; overflow-wrap: anywhere; }
}

.prize-response {
  grid-column: 1 / -1;
  min-width: 0;
  margin-top: 0;
  padding-top: 20px;
  border-top: 1px solid #eaded5;
  textarea {
    display: block;
    width: 100%;
    min-height: 144px;
    margin-top: 10px;
    padding: 12px 14px;
    border: 1px solid var(--form-border);
    border-radius: 6px;
    background: #fff;
    color: var(--form-ink);
    font: inherit;
    line-height: 1.5;
    caret-color: var(--form-ink);
    resize: vertical;
    scroll-margin-top: 120px;
    transition: border-color 140ms ease-out;
    &::placeholder { color: var(--form-muted); opacity: 1; }
    &:hover { border-color: var(--form-ink); }
    &:focus { border-color: var(--form-ink); outline: 2px solid var(--form-ink); outline-offset: 2px; }
    &[aria-invalid='true'] { border-color: var(--form-error); }
    &:disabled { background: #f3f5f8; color: var(--form-muted); cursor: not-allowed; }
  }
}
.response-label { font-weight: 700; }
.required-marker, .field-error { color: var(--form-error); }
.field-error { margin: 8px 0 0; font-size: .9375rem; }
.response-count { margin: 8px 0 0; color: var(--form-muted); font-size: .875rem; font-variant-numeric: tabular-nums; text-align: right; }

.step-footer { margin-top: 24px; }
.save-note {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 20px 0;
  border-top: 1px solid #d6deea;
  color: var(--form-muted);
  font-size: .9375rem;
  svg { flex-shrink: 0; width: 22px; height: 22px; }
  p { margin: 0; }
  strong { color: var(--form-ink); font-weight: 700; }
  .last-saved { margin-top: 8px; font-variant-numeric: tabular-nums; }
}
.step-actions { display: flex; flex-direction: row-reverse; align-items: center; justify-content: space-between; gap: 16px; }
.step-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  min-height: 52px;
  padding: 12px 22px;
  border: 1px solid transparent;
  border-radius: 6px;
  font: inherit;
  font-size: 1.125rem;
  font-weight: 700;
  line-height: 1.4;
  text-align: center;
  cursor: pointer;
  touch-action: manipulation;
  transition: background-color 140ms ease-out, border-color 140ms ease-out;
  svg { flex-shrink: 0; width: 24px; height: 24px; }
  &:disabled { background: #e1e6ee; color: var(--form-muted); cursor: not-allowed; }
}
.primary-action {
  background: var(--form-action);
  color: #fff;
  &:hover:not(:disabled) { background: #a63810; }
  &:active:not(:disabled) { background: #8e300e; }
}
.secondary-action {
  border-color: var(--form-border);
  background: #fff;
  color: var(--form-ink);
  &:hover:not(:disabled) { border-color: var(--form-ink); background: #f3f5f8; }
  &:active:not(:disabled) { background: #e8edf5; }
}
.support-note { margin: 20px 0 0; color: var(--form-muted); font-size: .9375rem; overflow-wrap: anywhere; }
.visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.prize-reveal-enter-active, .prize-reveal-leave-active { transition: opacity 160ms ease-out; }
.prize-reveal-enter, .prize-reveal-leave-to { opacity: 0; }

@media (max-width: 767px) {
  .special-prize-step { width: calc(100% - 32px); }
  .step-intro h2 { font-size: 1.75rem; }
  .prize-card { grid-template-columns: minmax(0, 1fr); gap: 16px; padding: 20px; }
  .prize-brand { width: 200px; max-width: 100%; }
  .prize-brand-mattoni { padding: 0; }
  .prize-response { margin-top: 0; }
  .step-actions { flex-direction: column; align-items: stretch; }
  .step-button { width: 100%; padding: 12px 16px; gap: 12px; }
}
@media (prefers-reduced-motion: reduce) {
  .special-prize-step * { transition: none !important; animation: none !important; scroll-behavior: auto !important; }
}
@media (prefers-contrast: more) {
  .prize-card { border-color: var(--form-ink); }
  .prize-card.is-selected { border-color: var(--form-action); }
}
</style>
