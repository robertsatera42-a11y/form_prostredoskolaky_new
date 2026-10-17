<template>
  <div class="form-content" :class="{ 'first-step-view': hasModernShell, 'special-prize-view': isSpecialPrizeStep, 'activities-step-view': isActivitiesStep, 'finalise-step-view': isFinaliseStep, 'success-step-view': isSuccessStep }">
    <div v-if="showDraftBanner" class="draft-banner-wrap">
      <section class="draft-notice" aria-labelledby="draft-notice-title" :aria-busy="isRestoringDraft ? 'true' : 'false'">
        <div class="draft-notice-heading">
          <div>
            <h2 id="draft-notice-title">Rozpracovaná přihláška</h2>
            <p>Můžeš pokračovat v rozpracované verzi, nebo {{ hasSavedApplication ? 'se vrátit k uložené přihlášce.' : 'začít znovu.' }}</p>
          </div>
          <button type="button" class="draft-close" aria-label="Zavřít oznámení a ponechat rozpracovanou verzi" :disabled="isRestoringDraft" @click="dismissDraftBanner"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6"></path></svg></button>
        </div>
        <div v-if="!draftRestoreConfirming" class="draft-actions">
          <button type="button" class="draft-action draft-primary draft-keep" @click="keepDraft">Pokračovat v rozpracované</button>
          <button ref="draftRestoreTrigger" type="button" class="draft-action draft-restore" @click="requestDraftRestore">{{ hasSavedApplication ? 'Obnovit uloženou verzi' : 'Začít znovu' }}</button>
        </div>
        <div v-else class="draft-confirmation" role="group" aria-labelledby="draft-confirm-title">
          <h3 id="draft-confirm-title">{{ hasSavedApplication ? 'Obnovit uloženou verzi?' : 'Začít znovu?' }}</h3>
          <p>{{ hasSavedApplication ? 'Neuložené změny v tomto prohlížeči se nahradí uloženými údaji.' : 'Dosavadní rozpracované změny v tomto prohlížeči se zahodí.' }}</p>
          <p v-if="draftRestoreError" id="draft-restore-error" ref="draftRestoreError" class="draft-error" role="alert" tabindex="-1">{{ draftRestoreError }}</p>
          <p v-if="isRestoringDraft" class="draft-status" role="status">Načítám uložené údaje…</p>
          <div class="draft-actions">
            <button ref="draftRestoreCancel" type="button" class="draft-action draft-cancel-restore" :disabled="isRestoringDraft" @click="cancelDraftRestore">Zrušit</button>
            <button type="button" class="draft-action draft-primary draft-confirm-restore" :disabled="isRestoringDraft" :aria-describedby="draftRestoreError ? 'draft-restore-error' : null" @click="startOverFromDraft">{{ isRestoringDraft ? 'Obnovuji přihlášku…' : draftRestoreError ? 'Zkusit znovu' : hasSavedApplication ? 'Obnovit uloženou verzi' : 'Začít znovu' }}</button>
          </div>
        </div>
      </section>
    </div>
    <template v-if="hasModernShell">
      <div class="first-step-intro">
        <h1 v-if="!isFirstStep">Přihláška do soutěže Středoškolák <span class="competition-year">roku <span class="orange">{{ competitionYear }}</span></span></h1>
        <h1 v-else>Přihláška do soutěže<br>Středoškolák <span class="competition-year">roku <span class="orange">{{ competitionYear }}</span></span></h1>
        <details class="first-step-resources">
          <summary>Návody a pravidla soutěže<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="m5 8 5 5 5-5"></path></svg></summary>
          <nav aria-label="Pomoc s přihláškou">
          <a href="https://drive.google.com/file/d/1B75kIZD1Qd-JcP05LRTr4EkM70SoK6k0/view" target="_blank" rel="noopener noreferrer">Jak na přihlášku</a>
          <a href="https://drive.google.com/file/d/1qMiJBFtMX4yMg0aPSKYWCY5r2FBkMKQP/view" target="_blank" rel="noopener noreferrer">Jak probíhá hodnocení</a>
          <a href="https://drive.google.com/file/d/1shGxE2v13FcA03s1qSt9Wz6rTTNu4hRL/view" target="_blank" rel="noopener noreferrer">Pravidla soutěže</a>
          </nav>
        </details>
      </div>
      <nav v-if="!formFinished && !isSuccessStep" class="first-step-progress" aria-label="Průběh přihlášky">
        <ol class="progress-steps">
          <li v-for="(label, index) in firstStepLabels" :key="label" :class="{ 'is-complete': isProgressComplete(index + 1) }" :aria-current="index + 1 === currentStep.number ? 'step' : null">
            <span class="progress-number">
              <template v-if="isProgressComplete(index + 1)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m5 12 4 4L19 6"></path></svg>
                <span class="progress-completion">{{ index + 1 }}. krok dokončen</span>
              </template>
              <template v-else>{{ index + 1 }}</template>
            </span>
            <span class="progress-label">{{ label }}</span>
          </li>
        </ol>
        <div class="progress-mobile">
          <p>Krok {{ currentStep.number }} ze {{ totalSteps }} · {{ firstStepLabels[currentStep.number - 1] }}</p>
          <div class="progress-segments" aria-hidden="true"><span v-for="stepNumber in totalSteps" :key="stepNumber" :class="{ 'is-complete': isProgressComplete(stepNumber), 'is-current': stepNumber === currentStep.number }"></span></div>
        </div>
      </nav>
  </template>
    <template v-else>
      <div class="content">
        <div class="header_links">
          <button class="button"><a href="https://drive.google.com/file/d/1B75kIZD1Qd-JcP05LRTr4EkM70SoK6k0/view" target="_blank">Jak na přihlášku</a></button>
          <button class="button"><a href="https://drive.google.com/file/d/1qMiJBFtMX4yMg0aPSKYWCY5r2FBkMKQP/view" target="_blank">Jak probíhá hodnocení</a></button>
          <button class="button"><a href="https://drive.google.com/file/d/1shGxE2v13FcA03s1qSt9Wz6rTTNu4hRL/view" target="_blank">Pravidla soutěže</a></button>
          <!-- <a href="tel:+420-910-110-207" target="_blank" style="color: #1dbcb9">Nefunguje vám přihláška? Zavolejte na asistenci <strong>+420 910 110 207</strong></a> -->
      </div>
        <div class="header-text" id="headerText">
          <h1>Přihlášení do soutěže Středoškolák&nbsp;roku
            <span class="orange">{{ competitionYear }}</span>
          </h1>
          <h2 v-html="currentStep.description"></h2>
        </div>
      </div>
      <div v-if="!formFinished" class="content step">
        <h2>Krok <span class="orange">{{ currentStep.number }}.</span> ze <span class="orange"> {{ totalSteps }}</span></h2>
      </div>
      <div v-if="!formFinished" class="loader-block-row">
        <div class="loader-block-element"
                v-for="stepNumber in totalSteps" :key="stepNumber"
                :style="{width: (100/totalSteps) + '%'}">
          <h3 :class="{active: isStepActive(stepNumber)}">{{ loaderBlockNames[stepNumber-1] }}</h3>
          <div class="loader-block-parallelogram" :class="{activeP: isStepActive(stepNumber)}"></div>
        </div>
      </div>
    </template>
    <keep-alive v-if="isUserBootstrapReady">
      <component :is="currentStep" :inert="isRestoringDraft ? '' : null" @changeView="changeView" @review-validity="updateReviewValidity"/>
    </keep-alive>
    <div v-else class="content bootstrap-loading">
      <h2>Načítám přihlášku...</h2>
    </div>
  </div>
</template>

<script>
import FirstStep from '../components/form/FirstStep'
import SpecialPrizeStep from '../components/form/SpecialPrizeStep'
import ActivitiesStep from '../components/form/ActivitiesStep'
import FinaliseStep from '../components/form/FinaliseStep'
import SuccessStep from '../components/form/SuccessStep'
import { IS_LOGGED_IN, USER, SET_USER } from '../types'
import { mapGetters } from 'vuex'
import router from '../router'

export default {
  components: { FirstStep, SpecialPrizeStep, ActivitiesStep, FinaliseStep, SuccessStep },
  data () {
    return {
      //      unsaved: false,
      currentStep: FirstStep,
      formFinished: FirstStep.isFinished === true,
      competitionYear: '2026',
      totalSteps: 4,
      firstStepLabels: ['O tobě', 'Aktivity', 'Speciální ceny', 'Kontrola a odeslání'],
      reviewValidity: null,
      showDraftBanner: false,
      draftRestoreConfirming: false,
      isRestoringDraft: false,
      draftRestoreError: '',
      draftRestoreRequest: null,
      baselineDraftSignature: '',
      unsubscribeStore: null,
      loaderBlockNames: [ FirstStep.loaderBlockName, ActivitiesStep.loaderBlockName, SpecialPrizeStep.loaderBlockName, FinaliseStep.loaderBlockName ],
      loaderBlockComponents: [ FirstStep, ActivitiesStep, SpecialPrizeStep, FinaliseStep ]
    }
  },
  mounted () {
    if (this.hasMeaningfulDraft()) {
      this.showDraftBanner = true
    }
    this.setBaselineDraftSignature()
    this.unsubscribeStore = this.$store.subscribe((mutation) => {
      if (mutation.type === SET_USER || mutation.type === 'clearDraft') {
        this.setBaselineDraftSignature()
      }
    })
    window.addEventListener('beforeunload', this.handleBeforeUnload)
  },
  beforeDestroy () {
    if (this.draftRestoreRequest) this.draftRestoreRequest.cancelled = true
    window.removeEventListener('beforeunload', this.handleBeforeUnload)
    if (this.unsubscribeStore) {
      this.unsubscribeStore()
    }
  },
  beforeRouteLeave (to, from, next) {
    if (this.confirmLeaveWithoutSaving()) {
      next()
    } else {
      next(false)
    }
  },
  computed: {
    ...mapGetters([IS_LOGGED_IN, USER, 'isUserBootstrapReady']),
    hasSavedApplication () {
      return Boolean(this.user && (this.user.hasRegistration || this.user.lastSaved))
    },
    isFirstStep () {
      const step = this.currentStep.options || this.currentStep
      return step.name === FirstStep.name
    },
    isSpecialPrizeStep () {
      const step = this.currentStep.options || this.currentStep
      return step.name === SpecialPrizeStep.name
    },
    isActivitiesStep () {
      const step = this.currentStep.options || this.currentStep
      return step.name === ActivitiesStep.name
    },
    isFinaliseStep () {
      const step = this.currentStep.options || this.currentStep
      return step.name === FinaliseStep.name
    },
    isSuccessStep () {
      const step = this.currentStep.options || this.currentStep
      return step.name === SuccessStep.name
    },
    hasModernShell () {
      return this.isFirstStep || this.isSpecialPrizeStep || this.isActivitiesStep || this.isFinaliseStep || this.isSuccessStep
    }
  },
  watch: {
    isLoggedIn () {
      if (!this.isLoggedIn) {
        router.push('/login')
      }
    }
  },
  methods: {
    updateReviewValidity (validity) {
      this.reviewValidity = validity
    },
    isProgressComplete (stepNumber) {
      if (this.isFinaliseStep) {
        const validity = this.reviewValidity || {}
        return [validity.basic, validity.activities, validity.prizes && validity.prizesSelected, false][stepNumber - 1] === true
      }
      return stepNumber < this.currentStep.number
    },
    getDraftSignature () {
      return JSON.stringify({
        grade: this.user.grade,
        region: this.user.region,
        school: this.user.school,
        linkedin: this.user.linkedin,
        interests: this.user.interests,
        activities: this.user.activities,
        knowledge: this.user.knowledge,
        summary: this.user.summary,
        specialPrize1Interested: this.user.specialPrize1Interested,
        specialPrize1text: this.user.specialPrize1text,
        specialPrize2Interested: this.user.specialPrize2Interested,
        specialPrize3Interested: this.user.specialPrize3Interested,
        specialPrize3text: this.user.specialPrize3text,
        isRepeting: this.user.isRepeting,
        isAgree: this.user.isAgree,
        readGuideConfirmed: this.user.readGuideConfirmed,
        phone: this.user.phone
      })
    },
    setBaselineDraftSignature () {
      this.baselineDraftSignature = this.getDraftSignature()
    },
    hasUnsavedChanges () {
      return this.hasMeaningfulDraft() && this.getDraftSignature() !== this.baselineDraftSignature
    },
    confirmLeaveWithoutSaving () {
      if (!this.hasUnsavedChanges()) {
        return true
      }
      return confirm('Opravdu chcete opustit stránku bez uložení přihlášky?')
    },
    handleBeforeUnload (event) {
      if (!this.hasUnsavedChanges()) {
        return
      }
      event.preventDefault()
      event.returnValue = ''
    },
    keepDraft () {
      if (this.isRestoringDraft) return
      this.showDraftBanner = false
      this.draftRestoreConfirming = false
      this.draftRestoreError = ''
      this.focusFormHeading()
    },
    focusFormHeading () {
      this.$nextTick(() => {
        const heading = this.$el.querySelector('.first-step-intro h1')
        if (heading) {
          heading.setAttribute('tabindex', '-1')
          heading.focus({ preventScroll: true })
        }
      })
    },
    requestDraftRestore () {
      this.draftRestoreError = ''
      this.draftRestoreConfirming = true
      this.$nextTick(() => this.$refs.draftRestoreCancel.focus())
    },
    cancelDraftRestore () {
      if (this.isRestoringDraft) return
      this.draftRestoreConfirming = false
      this.draftRestoreError = ''
      this.$nextTick(() => this.$refs.draftRestoreTrigger.focus())
    },
    async startOverFromDraft () {
      if (this.isRestoringDraft || !this.draftRestoreConfirming) return
      this.isRestoringDraft = true
      this.draftRestoreError = ''
      const request = { cancelled: false }
      this.draftRestoreRequest = request
      try {
        await this.$store.dispatch('revertToSaved', request)
        if (request.cancelled) return
        this.currentStep = FirstStep
        this.setBaselineDraftSignature()
        this.showDraftBanner = false
        this.draftRestoreConfirming = false
        this.focusFormHeading()
      } catch (_) {
        if (request.cancelled) return
        this.draftRestoreError = 'Uložené údaje se nepodařilo načíst. Rozpracované změny zůstaly zachované. Zkus to znovu, nebo je ponech.'
        this.$nextTick(() => {
          if (this.$refs.draftRestoreError) this.$refs.draftRestoreError.focus()
        })
      } finally {
        this.isRestoringDraft = false
        this.draftRestoreRequest = null
      }
    },
    dismissDraftBanner () {
      this.keepDraft()
    },
    hasMeaningfulDraft () {
      const user = this.user
      if (!user) {
        return false
      }

      const hasNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0

      return Boolean(
        user.grade !== null ||
        user.region !== null ||
        hasNonEmptyString(user.school) ||
        hasNonEmptyString(user.linkedin) ||
        (Array.isArray(user.interests) && user.interests.length > 0) ||
        (Array.isArray(user.activities) && user.activities.length > 0) ||
        user.knowledge !== null ||
        hasNonEmptyString(user.summary) ||
        user.specialPrize1Interested ||
        hasNonEmptyString(user.specialPrize1text) ||
        user.specialPrize2Interested ||
        user.specialPrize3Interested ||
        hasNonEmptyString(user.specialPrize3text) ||
        user.isRepeting ||
        user.isAgree ||
        user.readGuideConfirmed ||
        hasNonEmptyString(user.phone)
      )
    },
    changeView (step) {
      if (this.formFinished) {
        this.currentStep = FirstStep
        return
      }
      const target = step.options || step
      if (target.name === SuccessStep.name && this.user.hasRegistration) {
        this.setBaselineDraftSignature()
        this.showDraftBanner = false
      }
      this.currentStep = step
    },
    isStepActive (stepNum) {
      return stepNum <= this.currentStep.number
      //    },
      //    updateUnsavedChanges(value) {
      //      this.hasUnsavedChanges = value;
    }
  }
}
</script>

<style scoped lang="scss">
.draft-notice {
  --draft-ink: #071b46;
  --draft-muted: #556c94;
  --draft-action: #c44716;
  padding: 20px 24px;
  border: 1px solid #d6deea;
  border-radius: 12px;
  background: #f7f9fc;
  color: var(--draft-ink);
  font: 1rem/1.5 'AvenirNextForm', 'AvenirNext', sans-serif;
  button { font-family: inherit; cursor: pointer; touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
  button:focus-visible { outline: 2px solid var(--draft-ink); outline-offset: 3px; }
  button:disabled { cursor: wait; }
}
.draft-notice-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.draft-notice h2 { margin: 0; font-size: 1.25rem; font-weight: 700; line-height: 1.3; letter-spacing: -.01em; }
.draft-notice p { max-width: 72ch; margin: 8px 0 0; color: var(--draft-muted); font-size: .9375rem; overflow-wrap: anywhere; }
.draft-close {
  display: inline-flex; align-items: center; justify-content: center; flex: 0 0 44px; width: 44px; height: 44px;
  margin: -8px -12px 0 0; padding: 0; border: 0; border-radius: 50%; background: transparent; color: var(--draft-ink);
  transition: background-color 140ms ease-out;
  svg { width: 22px; height: 22px; }
  &:hover:not(:disabled) { background: #e5eaf2; }
  &:active:not(:disabled) { background: #d5deeb; transition: none; }
  &:disabled { color: #657591; }
}
.draft-actions { display: flex; align-items: stretch; flex-wrap: wrap; gap: 12px; margin-top: 16px; }
.draft-action {
  display: inline-flex; align-items: center; justify-content: center; min-height: 48px; padding: 11px 18px;
  border: 1px solid #8192ad; border-radius: 6px; background: #fff; color: var(--draft-ink);
  font-size: 1rem; font-weight: 700; line-height: 1.4; text-align: center;
  transition: background-color 140ms ease-out, border-color 140ms ease-out;
  &:hover:not(:disabled) { background: #f0f3f8; border-color: var(--draft-ink); }
  &:active:not(:disabled) { background: #e1e7f0; transition: none; }
  &:disabled { border-color: #d6dde8; background: #e9edf4; color: #657591; }
}
.draft-primary {
  background: var(--draft-action); border-color: var(--draft-action); color: #fff;
  &:hover:not(:disabled) { background: #a63810; border-color: #a63810; }
  &:active:not(:disabled) { background: #8e300e; border-color: #8e300e; }
}
.draft-confirmation { margin-top: 16px; padding-top: 16px; border-top: 1px solid #d6deea; }
.draft-confirmation h3 { margin: 0; font-size: 1rem; font-weight: 700; line-height: 1.5; }
.draft-confirmation .draft-error { color: #b42318; }
.draft-error:focus { outline: 2px solid var(--draft-ink); outline-offset: 4px; }
@media (max-width: 767px) {
  .draft-notice { padding: 20px; }
  .draft-close { margin-right: -8px; }
}
@media (max-width: 599px) {
  .draft-actions { flex-direction: column; }
  .draft-action { width: 100%; }
}
@media (prefers-reduced-motion: reduce) {
  .draft-notice * { transition: none !important; scroll-behavior: auto !important; }
}
@media (prefers-contrast: more) {
  .draft-notice { border-color: var(--draft-ink); background: #fff; }
}
.content {
  width: 80%;
  max-width: 1200px;
  margin: 20px auto;
  padding: 40px 40px 0;

  @media (max-width: 800px) {
    width: 90%;
    padding: 40px 20px 0;
  }
}

div.form-content {
  padding-top: 100px;
  position: relative;

  .draft-banner-wrap {
    width: calc(100% - 64px);
    max-width: 1024px;
    margin: 0 auto 24px;
  }

  .header-text {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 40px 0;
    flex: 1;

    h1 {
      flex: .5;
      font-size: 34px;
      margin: 0 20px 0 0;
      line-height: 1.2;
      font-weight: normal;
    }

    h2 {
      flex: .5;
      font-size: 18px;
      margin: 0 0 0 20px;
      line-height: 1.2;
      font-weight: normal;
    }

    @media (max-width: 700px) {
      flex-direction: column;
      h1, h2 {
        margin: 0 0 20px 0;
        flex: 1;
      }
    }
  }

  .loader-block-row {
    display: flex;
    gap: 30px;
    max-width: 100%;
    margin-left: -10px;
    margin-right: -10px;
    margin-bottom: 30px;

    .loader-block-element {
      h3 {
        text-align: center;
        color:  #f7c1c1;

      }
      .active {
        color: #ec6767;
      }
      .loader-block-parallelogram {

        transform: skew(20deg);
        height: 30px;
        background-color: #f7c1c1;

      }
      .activeP {
        background-color: #ec6767;
      }
    }

    @media (max-width: 900px) {
      display: none;
    }

  }

  .step {
    display: none;
    text-align: center;
    h2 {
      font-weight: normal;
    }

    @media (max-width: 900px) {
      display: block;
    }
  }

  .bootstrap-loading {
    text-align: center;
    padding-bottom: 40px;

    h2 {
      font-weight: normal;
    }
  }

  .form {
    padding-bottom: 60px;

    h3 {
      font-weight: normal;
    }

    .form-block {
      padding-top: 30px;

      .half-block {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        padding-top: 10px;

        .half-input {
          width: 45%;
        }

        .third-input {
          width: 25%;
        }

        .two-third-input {
          width: 65%;
        }
      }

      @media (max-width: 700px) {
        padding-top: 10px;
        .half-block {
          flex-direction: column;

          .half-input, .third-input, .two-third-input {
            width: 100%;
          }
        }
      }
    }
    @media (max-width: 700px) {
      h3 {
        text-align: center;
      }
    }

    .help-link {
      padding: 30px 0 30px 0;
      text-align: center;
    }
  }

  .submit-block {
    background-color: #f9f4f4;

    .submit-actions {
      padding-bottom: 40px;

      .a-orange {
        margin-right: 20px;
        border: 1px solid #f55c23;
        background: white;
        color: #f55c23;
      }

      .a-gray {
        margin-right: 20px;
        border: 1px solid #979797;
        background: white;
        color: #979797;
      }

      small {
        font-size: 15px;
        line-height: 35px;
        text-align: center;
        white-space: nowrap;
      }

      @media (max-width: 400px) {
        a {
          margin: 0 auto 10px;
        }
      }
    }
  }

  .header_links {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 12px;
    justify-content: flex-start;
    font-weight: 600;

    .button {
      margin-right: 0;
      border: 3px solid #f55c23;
      font-weight: bold;
    }

    a {
      display: inline-block;
      width: 100%;
      white-space: normal;
      line-height: 1.35;
    }

    @media (max-width: 800px) {
      flex-direction: column;
      align-items: stretch;

      .button {
        width: 100%;
      }
    }
  }
}

/* Shared by the redesigned form steps. */
div.form-content.first-step-view {
  padding-top: 120px;
  padding-bottom: 48px;
  background: #fff;
  color: #071b46;
  font-family: 'AvenirNextForm', 'AvenirNext', sans-serif;

  .draft-banner-wrap {
    margin-top: 0;
  }

  .first-step-intro,
  .first-step-progress {
    width: calc(100% - 64px);
    max-width: 1024px;
    margin-right: auto;
    margin-left: auto;
  }

  .first-step-intro h1 {
    margin: 0;
    font-size: 2.5rem;
    font-weight: 400;
    letter-spacing: -0.02em;
    line-height: 1.2;
    text-wrap: balance;
  }

  .competition-year {
    white-space: nowrap;
  }

  .first-step-resources {
    margin-top: 16px;

    summary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      min-height: 44px;
      color: #556c94;
      font-size: 1rem;
      list-style: none;
      cursor: pointer;

      &::-webkit-details-marker {
        display: none;
      }

      &:hover {
        color: #071b46;
      }

      &:focus-visible {
        outline: 2px solid #071b46;
        outline-offset: 3px;
      }
    }

    svg {
      width: 20px;
      height: 20px;
    }

    &[open] svg {
      transform: rotate(180deg);
    }

    nav {
      display: flex;
      flex-wrap: wrap;
      column-gap: 24px;
    }

    a {
      display: inline-flex;
      align-items: center;
      min-height: 44px;
      color: #556c94;
      font-size: 1rem;
      text-decoration: underline;
      text-underline-offset: 3px;

      &:hover {
        color: #071b46;
      }

      &:focus-visible {
        outline: 2px solid #071b46;
        outline-offset: 3px;
      }
    }
  }

  .first-step-progress {
    margin-top: 28px;
    margin-bottom: 32px;
  }

  .progress-steps {
    position: relative;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    margin: 0;
    padding: 0;
    list-style: none;

    &::before {
      position: absolute;
      top: 22px;
      right: 12.5%;
      left: 12.5%;
      height: 1px;
      background: #b9c5d7;
      content: '';
    }

    li {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 0 8px;
      color: #556c94;
      font-size: 1rem;
      text-align: center;

      &[aria-current='step'] {
        color: #071b46;
        font-weight: 700;

        .progress-number {
          border-color: #f26427;
          background: #f26427;
          color: #fff;
        }
      }
    }
  }

  .progress-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border: 1px solid #8192ad;
    border-radius: 50%;
    background: #fff;
    color: #071b46;
    font-size: 1.25rem;
    font-weight: 700;
  }

  .progress-mobile {
    display: none;
  }

  @media (max-width: 767px) {
    padding-top: 108px;
    padding-bottom: 24px;

    .first-step-intro,
    .first-step-progress,
    .draft-banner-wrap {
      width: calc(100% - 32px);
    }

    .first-step-intro h1 {
      font-size: 2rem;
    }

    .first-step-resources {
      margin-top: 12px;

      nav {
        column-gap: 16px;
      }
    }

    .first-step-progress {
      margin-top: 24px;
      margin-bottom: 28px;
    }

    .progress-steps {
      display: none;
    }

    .progress-mobile {
      display: block;

      p {
        margin: 0 0 12px;
        font-size: 1rem;
        font-weight: 700;
      }
    }

    .progress-segments {
      display: flex;
      gap: 8px;

      span {
        flex: 1;
        height: 8px;
        border-radius: 4px;
        background: #e1e6ef;

        &:first-child {
          background: #f26427;
        }
      }
    }
  }

  @media (max-width: 359px) {
    .first-step-intro h1 {
      font-size: 1.75rem;
    }
  }
}

.progress-completion {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

div.form-content.first-step-view.special-prize-view,
div.form-content.first-step-view.activities-step-view,
div.form-content.first-step-view.finalise-step-view,
div.form-content.first-step-view.success-step-view {
  .first-step-intro h1 { font-size: 2rem; }
  .progress-number { width: 2.75rem; height: 2.75rem; }
  .progress-number svg { width: 1.5rem; height: 1.5rem; }
  .progress-steps::before { top: 1.375rem; }
  .progress-steps li { gap: .5rem; }

  .progress-steps li.is-complete {
    color: #071b46;
    .progress-number { border-color: #22866a; background: #22866a; color: #fff; }
  }

  .progress-steps li[aria-current='step'] .progress-number {
    border-color: #c44716;
    background: #c44716;
  }

  .progress-segments span.is-complete { background: #22866a; }
  .progress-segments span.is-current { background: #f26427; }

  @media (max-width: 767px) {
    .first-step-intro h1 { font-size: 1.5rem; }
  }
}
</style>
