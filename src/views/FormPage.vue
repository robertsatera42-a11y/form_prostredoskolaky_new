<template>
  <div class="form-content">
    <div v-if="showDraftBanner" class="draft-banner-wrap">
      <div class="content draft-banner">
        <span class="draft-banner-message">Byla zachráněna neuložená verze:</span>
        <div class="draft-banner-actions">
          <button class="button a-orange" @click="keepDraft">Zachránit a pokračovat s touto verzí (doporučeno)</button>
          <button class="button a-gray" @click="startOverFromDraft">Zahodit a vrátit se k naposledy oficiálně uložené verzi</button>
        </div>
        <button class="delete" aria-label="close" @click="dismissDraftBanner"></button>
      </div>
    </div>
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
    <div class="content step">
      <h2>Krok <span class="orange">{{ currentStep.number }}.</span> ze <span class="orange"> {{ totalSteps }}</span></h2>
    </div>
    <div class="loader-block-row">
      <div class="loader-block-element"
              v-for="stepNumber in totalSteps" :key="stepNumber"
              :style="{width: (100/totalSteps) + '%'}">
        <h3 :class="{active: isStepActive(stepNumber)}">{{ loaderBlockNames[stepNumber-1] }}</h3>
        <div class="loader-block-parallelogram" :class="{activeP: isStepActive(stepNumber)}"></div>
      </div>
    </div>
    <keep-alive v-if="isUserBootstrapReady">
      <component :is="currentStep" @changeView="changeView"/>
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
import { IS_LOGGED_IN, USER, SET_USER } from '../types'
import { mapGetters } from 'vuex'
import router from '../router'

export default {
  components: { FirstStep, SpecialPrizeStep, ActivitiesStep, FinaliseStep },
  data () {
    return {
      //      unsaved: false,
      currentStep: FirstStep,
      competitionYear: '2026',
      totalSteps: 4,
      showDraftBanner: false,
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
    ...mapGetters([IS_LOGGED_IN, USER, 'isUserBootstrapReady'])
  },
  watch: {
    isLoggedIn () {
      if (!this.isLoggedIn) {
        router.push('/login')
      }
    }
  },
  methods: {
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
        specialPrize1text: this.user.specialPrize1text,
        specialPrize2Interested: this.user.specialPrize2Interested,
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
      this.showDraftBanner = false
    },
    async startOverFromDraft () {
      await this.$store.dispatch('revertToSaved')
      this.currentStep = FirstStep
      this.showDraftBanner = false
    },
    dismissDraftBanner () {
      this.showDraftBanner = false
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
        hasNonEmptyString(user.specialPrize1text) ||
        user.specialPrize2Interested ||
        user.isRepeting ||
        user.isAgree ||
        user.readGuideConfirmed ||
        hasNonEmptyString(user.phone)
      )
    },
    changeView (step) {
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
    margin-top: -40px;
    margin-bottom: 20px;
  }

  .draft-banner {
    background: #fff3e7;
    border: 1px solid #f55c23;
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 14px 16px;
    position: relative;

    .draft-banner-message {
      flex: 1;
      font-size: 14px;
      line-height: 1.4;
    }

    .draft-banner-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;

      .button {
        margin: 0;
      }
    }

    .delete {
      margin-left: auto;
      flex-shrink: 0;
    }

    @media (max-width: 800px) {
      flex-direction: column;
      align-items: flex-start;
      padding-right: 40px;

      .delete {
        position: absolute;
        top: 14px;
        right: 14px;
      }
    }
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
    justify-content: flex-start;
    font-weight: 600;

    .button {
      margin-right: 15px;
      border: 3px solid #f55c23;
      font-weight: bold;
    }
  }
}
</style>
