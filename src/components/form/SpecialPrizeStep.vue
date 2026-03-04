<template>
  <section class="special-prize-step">
    <div class="content form">
      <h3>Speciální ceny</h3>
      <label class="intro-text">
        Vyplnění následujících sekcí tě zařadí do soutěže o speciální ceny našich partnerů. Účast je
        <b>zcela dobrovolná a tvé hodnocení v hlavní soutěži nijak neovlivní</b>.
      </label>

      <div class="form-block">
        <h4 class="blue">Start up roku - <a href="https://startit.csob.cz/">Start it @ČSOB</a></h4>
        <b-checkbox v-model="user.specialPrize1Interested" class="startup-interest">
          <strong>Chci být zahrnut*a do výběru.</strong>
        </b-checkbox>
        <b-field
          label="V jakém startupu jsi zapojen, čím se zabývá, jak velký je tým, jakou v něm máš roli a v jaké fázi startup je (nápad, prototyp, MVP, investice)?"
          :type="specialPrize1Error ? 'is-danger' : null"
          :message="specialPrize1Error">
          <b-input
            maxlength="2000"
            type="textarea"
            v-model="user.specialPrize1text"
            :disabled="!user.specialPrize1Interested"
            :class="{ 'startup-text-disabled': !user.specialPrize1Interested }"
            placeholder="Popiš svůj start-up.">
          </b-input>
        </b-field>
      </div>

      <div class="prize-gallery">
        <img class="prize-image" :src="startUpPrizeImage" alt="Start up roku - Start it @ČSOB">
      </div>

      <div class="form-block">
        <h4 class="blue">„Inovátor nové generace" - <a href="https://www.microsoft.com/cs-cz">Microsoft</a></h4>
        <p class="prize-description">Pro studenta, který se nebojí přemýšlet jinak.</p>
        <p class="prize-description">
          Pro studenta, který přichází s odvážnými nápady a (ne výlučně) technologickými řešeními. Vyzdvihuje kreativitu, odvahu a schopnost měnit budoucnost pomocí inovací.
        </p>
        <b-checkbox v-model="user.specialPrize2Interested" class="microsoft-interest">
          <strong>Chci být zahrnut*a do výběru. </strong>
        </b-checkbox>
      </div>

      <div class="prize-gallery">
        <img class="prize-image" :src="innovatorPrizeImage" alt="Inovátor nové generace - Microsoft">
      </div>

      <div class="form-block">
        <h4 class="blue">Cena MATTONI TALENTS 2026 - <a href="https://www.mattoni1873.cz/">Mattoni 1873</a></h4>
        <p class="prize-description">Co můžeš vyhrát:</p>
        <ul class="prize-description prize-list">
          <li>1. místo: Jistá účast v prestižním výběrovém dvoutýdenním vzdělávacím programu Mattoni Eagles 2026 - v termínu 17. – 28. srpna (uložte do kalendáře).</li>
            <ul>
              <li>Výhoda na startu kariéry, intenzivní vzdělávací program a networking s vybranými 15 vysokoškoláky z celé ČR.</li>
              <li>Plně hrazeno Mattoni 1873. <a href="https://www.mattoni1873.cz/mattoni-eagles/" target="_blank" rel="noopener">https://www.mattoni1873.cz/mattoni-eagles/</a></li>
            </ul>
          <li>2. místo: Exkluzivní vstup na akci Mattoni Bridge v rámci KVIFF.</li>
        </ul>
        <b-checkbox v-model="user.specialPrize3Interested" class="mattoni-interest">
          <strong>Mám zájem o zařazení do výběru a čas 17. – 28. srpna 2026.</strong>
        </b-checkbox>
        <b-field
          label="Napište, jaká inovativní řešení konkrétních problémů jste přivedli do reality."
          :type="specialPrize3Error ? 'is-danger' : null"
          :message="specialPrize3Error">
          <b-input
            maxlength="2000"
            type="textarea"
            v-model="user.specialPrize3text"
            :disabled="!user.specialPrize3Interested"
            :class="{ 'startup-text-disabled': !user.specialPrize3Interested }"
            placeholder="Popište inovativní řešení, která jste přivedli do reality.">
          </b-input>
        </b-field>
      </div>

      <div class="prize-gallery">
        <img class="prize-image" :src="mattoniTalentsPrizeImage" alt="Cena MATTONI TALENTS 2026 - Mattoni 1873">
      </div>

      <div class="help-link">
        <p>
          POZOR! Přihláška se uloží až ve čtvrtém kroku po kliknutí na "Uložit přihlášku".<br>
          K úpravě přihlášky se v průběhu přihlašování můžeš kdykoliv vrátit.
        </p>
        <p>
          Pokud jsi zaznamenal/a potíže s přihláškou, dej nám prosím vědět na
          <span class="orange">info@prostredoskolaky.cz</span>.
        </p>
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
import transformerUtils from '../../utils/transformerUtils'
import { mapFields } from 'vuex-map-fields'
import startUpPrizeImage from '../../assets/start_up_roku.png'
import innovatorPrizeImage from '../../assets/inovátor_nové_generace.png'
import mattoniTalentsPrizeImage from '../../assets/mattoni_talents_cena.jpeg'

export default {
  name: 'special-prize-step',
  description: 'Zvaž zapojení do soutěže o <b>speciální ceny</b>. Účast je dobrovolná a tvé hodnocení v hlavní soutěži nijak neovlivní.',
  number: 3,
  loaderBlockName: 'třetí krok - speciální ceny',
  components: { FinaliseStep, ActivitiesStep },
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
      if (!isInterested) {
        this.specialPrize1Error = ''
      }
    },
    'user.specialPrize1text': function () {
      if (this.specialPrize1Error) {
        this.validateSpecialPrize1()
      }
    },
    'user.specialPrize3Interested': function (isInterested) {
      if (!isInterested) {
        this.specialPrize3Error = ''
      }
    },
    'user.specialPrize3text': function () {
      if (this.specialPrize3Error) {
        this.validateSpecialPrize3()
      }
    }
  },
  mounted () {
    window.scrollTo(0, 0)
  },
  computed: {
    ...mapFields({
      user: 'user'
    })
  },
  methods: {
    goToActivities () {
      this.$emit('changeView', ActivitiesStep)
    },
    goToFinalise () {
      if (!this.validateSpecialPrize1() || !this.validateSpecialPrize3()) {
        return
      }
      this.$emit('changeView', FinaliseStep)
    },
    validateSpecialPrize1 () {
      const specialPrize1text = typeof this.user.specialPrize1text === 'string' ? this.user.specialPrize1text.trim() : ''
      const isValid = !this.user.specialPrize1Interested || specialPrize1text.length > 0

      this.specialPrize1Error = isValid ? '' : 'Pole je povinné'
      return isValid
    },
    validateSpecialPrize3 () {
      const specialPrize3text = typeof this.user.specialPrize3text === 'string' ? this.user.specialPrize3text.trim() : ''
      const isValid = !this.user.specialPrize3Interested || specialPrize3text.length > 0

      this.specialPrize3Error = isValid ? '' : 'Pole je povinné'
      return isValid
    },
    transformDate (dateString) {
      return transformerUtils.transformDate(dateString)
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

  .form {
    padding-bottom: 60px;

    h3 {
      font-weight: normal;
      padding-bottom: 12px;
    }

    .intro-text {
      display: block;
      font-size: 1.2rem;
      line-height: 1.65;
      margin-bottom: 16px;
    }

    .blue {
      color: #1dbcb9;
      font-weight: bold;

      a {
        color: #007ca7;
      }
    }

    .form-block {
      padding-top: 26px;

      .prize-description {
        margin: 12px 0 0;
        max-width: 900px;
        line-height: 1.7;
      }

      .microsoft-interest {
        margin-top: 16px;
      }

      .mattoni-interest {
        margin-top: 16px;
      }

      .startup-interest {
        margin-top: 16px;
      }

      .prize-list {
        margin-left: 16px;

        li {
          margin-top: 8px;
        }
      }

      .startup-text-disabled {
        .textarea {
          background-color: #f0f0f0;
          color: #7a7a7a;
          cursor: not-allowed;
        }
      }

      @media (max-width: 700px) {
        padding-top: 16px;
      }
    }

    .prize-gallery {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 24px;
      align-items: start;
      margin-top: 28px;
      margin-bottom: 10px;

      .prize-image {
        display: block;
        width: 100%;
        max-width: 420px;
      }

      @media (max-width: 900px) {
        grid-template-columns: 1fr;
        gap: 16px;

        .prize-image {
          max-width: 100%;
        }
      }
    }

    @media (max-width: 700px) {
      h3 {
        text-align: center;
      }
    }

    .help-link {
      padding: 24px 0 30px;
      line-height: 1.65;
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
}
</style>
