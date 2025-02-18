<template>
  <div class="form-content">
    <div class="content">
      <div class="header_links">
        <button class="button"><a href="https://storage.googleapis.com/ps-others/Jak_na_prihlasku.pdf" target="_blank">Jak na přihlášku</a></button>
        <button class="button"><a href="https://storage.googleapis.com/ps-others/Jak_probiha_hodnoceni.pdf" target="_blank">Jak probíhá hodnocení</a></button>
        <button class="button"><a href="https://storage.googleapis.com/ps-others/Pravidla_Stredoskolak_roku_2024.pdf" target="_blank">Pravidla soutěže</a></button>
    </div>
      <div class="header-text" id="headerText">
        <h1>Přihlášení do soutěže Středoškolák&nbsp;roku
          <span class="orange">{{ competitionYear }}</span>
        </h1>
        <h2 v-html="currentStep.description"></h2>
      </div>
    </div>
    <div class="content step">
      <h2>Krok <span class="orange">{{ currentStep.number }}.</span> ze <span class="orange">4</span></h2>
    </div>
    <div class="loader-block"></div>
    <keep-alive>
      <component :is="currentStep" @changeView="changeView"/>
    </keep-alive>
  </div>
</template>

<script>
import FirstStep from '../components/form/FirstStep'
import SpecialPrizeStep from '../components/form/SpecialPrizeStep'
import ActivitiesStep from '../components/form/ActivitiesStep'
import FinaliseStep from '../components/form/FinaliseStep'
import { IS_LOGGED_IN } from '../types'
import { mapGetters } from 'vuex'
import router from '../router'

export default {
  components: { FirstStep, SpecialPrizeStep, ActivitiesStep, FinaliseStep },
  data () {
    return {
      currentStep: FirstStep,

      competitionYear: "2025"
    }
  },
  computed: {
    ...mapGetters([IS_LOGGED_IN])
  },
  watch: {
    isLoggedIn() {
      if (!this.isLoggedIn) {
        router.push('/login')
      }
    }
  },
  methods: {
    changeView (step) {
      this.currentStep = step
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

  .loader-block {
    background: url(~@/assets/loader.svg) no-repeat;
    background-size: contain;
    max-width: 100%;
    height: 50px;
    margin-bottom: 30px;

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
    }
  }
}
</style>
