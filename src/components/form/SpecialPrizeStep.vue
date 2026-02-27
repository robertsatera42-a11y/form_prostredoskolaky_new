<template>
  <section class="special-prize-step">
    <div class="content form">
      <h3>Speciální ceny</h3>
      <label style="font-size: 1.2rem;">Vyplnění následujících sekcí tě zařadí do soutěže o speciální ceny našich partnerů. Účast je <b>zcela dobrovolná a tvé hodnocení v hlavní soutěži nijak neovlivní</b>.</label>
      <div class="form-block">
        <h4 class="blue">Start up roku – <a href="https://startit.csob.cz/">Start it @ČSOB</a></h4>
        <b-field
          label="V jakém startupu jsi zapojen, čím se zabývá, jak velký je tým, jakou v něm máš roli a v jaké fázi startup je (nápad, prototyp, MVP, investice)?">
          <b-input
              maxlength="2000"
              type="textarea"
              v-model="user.specialPrize1text"
              placeholder="Popiš svůj start-up.">
          </b-input>
        </b-field>
      </div>

       <!--
      <div class="form-block"> 
        <h4 class="blue">Inovátor nové generace – <a href="https://www.microsoft.com/cs-cz">Microsoft</a></h4>
        <b-checkbox style="padding-bottom: 22px;" v-model="user.bestinnovator"><b>Považuješ se za inovátora?</b></b-checkbox>
        <b-field
          label="V čem si pomohl této ?">
          <b-input
            :disabled="!user.bestinnovator" 
              maxlength="1000"
              type="textarea"
              v-model="user.specialPrize1text"
              placeholder="Popiš.">
          </b-input>
          </b-field>
      </div>
      -->

      <div class="form-block">
        <b-checkbox style="padding-bottom: 22px;" v-model="user.specialPrize2foreignStudy"><b>Zajímá tě studium v zahraničí?</b></b-checkbox>

        <b-field
        label="Proč tě zahraničí z hlediska univerzitního prostředí láká?">
        <b-input
              :disabled="!user.specialPrize2foreignStudy"
              maxlength="600"
              type="textarea"
              v-model="user.specialPrize2foreignReason"
              placeholder="Popiš proč tě láká studium v zahraničí.">
          </b-input>
        </b-field>
        <b-field
        label="Máš už vyhlídnutou konkrétní destinaci a univerzitu/univerzity? Pokud ano, jakou/é a proč? [dobrovolné]">
        <b-input
              :disabled="!user.specialPrize2foreignStudy"
              maxlength="900"
              type="textarea"
              v-model="user.specialPrize2foreignUniversity"
              placeholder="Specifikuj svou vysněnou univerzitu.">
          </b-input>
        </b-field>
        <b-field
        label="Co je na tobě unikátní v porovnání s vašimi vstevníky a jak se hodláte i nadále odlišovat?">
        <b-input
              :disabled="!user.specialPrize2foreignStudy"
              maxlength="300"
              type="textarea"
              v-model="user.specialPrize2foreignunique"
              placeholder="Popiš svou unikátnost.">
          </b-input>
        </b-field>
        <b-field
        label="Z čeho máš v rámci přijímacího procesu a univerzitního života v zahraničí největší strach a proč?">
        <b-input
              :disabled="!user.specialPrize2foreignStudy"
              maxlength="600"
              type="textarea"
              v-model="user.specialPrize2foreignScary"
              placeholder="Popiš své obavy.">
          </b-input>
        </b-field>
        <b-checkbox :disabled="!user.specialPrize2foreignStudy" style="padding-bottom: 15px;" v-model="user.specialPrize2englishB2"><b>Máš certifikovanou vyšší úroveň angličtiny než B2?</b></b-checkbox>
        <br>
        <b-checkbox :disabled="!user.specialPrize2foreignStudy" style="padding-bottom: 22px;" v-model="user.specialPrize2hasIB"><b>Skládáš IB maturitu?</b></b-checkbox>
        <br>
        <b-field
            class="half-input"
            :disabled="!user.specialPrize2foreignStudy"
            label="Skládal/a si zkoušky AP? pokud ano, jaké a jaké skóre si obdržel/a?"
          >
            <b-input
              :disabled="!user.specialPrize2foreignStudy"
              v-model="user.specialPrize2AP"
              v-focus="focusedFirstName"
              @focus="focusedFirstName = true"
              @blur="focusedFirstName = false"
              placeholder="Popiš své AP zkoušky."
            ></b-input>
          </b-field>
      </div>
      <div class="help-link">
        <p>POZOR! Přihláška se uloží až ve čtvrtém kroku po kliknutí na "Uložit přihlášku".<br> K úpravě přihlášky se v průběhu přihlašování můžeš kdykoliv vrátit.</p>
        <p>Pokud jsi zaznamenal/a potíže s přihláškou, dej nám prosím vědět na <span class="orange">info@prostredoskolaky.cz</span>.</p>
      </div>

    <div class="submit-block">
      <div class="submit-actions content">
        <a class="button a-orange" @click="goToActivities">Zpět na 2. krok</a>
        <a class="button a-orange" @click="goToFinalise">Přejít na 4. krok</a>
        <small v-if="user.lastSaved">Naposledy uloženo: {{ transformDate(user.lastSaved) }}</small>
      </div>
    </div>
   </div>
  </section>
</template>
<script>
import ActivitiesStep from './ActivitiesStep'
import FinaliseStep from './FinaliseStep'
import config from '../../config/default'
import ValidationUtils from '../../utils/validationUtils'
import transformerUtils from '../../utils/transformerUtils'
import client from '../../client/client'
import { mapFields } from 'vuex-map-fields'
import { required, email } from 'vuelidate/lib/validators'
import { mixin as focusMixin } from 'vue-focus'
import { debounce } from 'debounce'
import tracking from '../../utils/tracking'
import { mapActions } from 'vuex'
import { FETCH_USER } from '../../types'

export default {
  name: 'special-prize-step',
  description: `Zvaž zapojení do soutěže o <b>speciální ceny</b>. Účast je dobrovolná a tvé hodnocení v hlavní soutěži nijak neovlivní.`,
  number: 3,
  loaderBlockName: 'třetí krok - speciální ceny',
  components: { FinaliseStep, ActivitiesStep },
  mixins: [focusMixin],
  data () {
    return {
      devPassphrase: '',
      selected: '',
      specialPrize1: true,
      specialPrize2: true,
      schools: [],
      consts: {
        grades: {
          four: config.consts.grades.four,
          six: config.consts.grades.six,
          eight: config.consts.grades.eight
        },
        regions: config.consts.regions,
        interests: config.consts.interests,
        knowledge: config.consts.knowledge
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
    window.scrollTo(0, 0)
  },
  computed: {
    ...mapFields({
      user: 'user'
    })
  },
  methods: {
    ...mapActions({ fetchUser: FETCH_USER }),
    goToActivities () {
      this.$emit('changeView', ActivitiesStep)
    },
    goToFinalise () {
      this.$emit('changeView', FinaliseStep)
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
      summary: {
        required
      }
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

section.special-prize-step {
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
      padding-bottom: 12px;
    }

    .blue {
      color: #1dbcb9;
      font-weight: bold;

      a {
        color:#007ca7
      }
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
