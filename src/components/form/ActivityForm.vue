<template>
  <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">Přidat novou aktivitu</p>
    </header>
    <!--<form @submit.prevent="submit">-->
    <section class="modal-card-body">
      <b-field
          label="Název aktivity"
          :type="errorsName.type"
          :message="errorsName.message">
        <b-input
            class="form__input"
            v-model="activity.name"
            v-focus="focusedName"
            @focus="focusedName = true"
            @blur="focusedName = false"
            placeholder="např. Středoškolská odborná činnost"></b-input>
      </b-field>
      <b-field
          label="Webová stránka aktivity">
        <b-input
            v-model="activity.link"
            v-focus="focusedLink"
            @focus="focusedLink = true"
            @blur="focusedLink = false"
            placeholder="např. http://www.soc.cz">
        </b-input>
      </b-field>
      <b-field
        style="padding-top: 15px"
        label="Typ aktivity"
        :type="errorsType.type"
        :message="errorsType.message"
      >
        <b-select
          placeholder="Vyber typ aktivity"
          v-model="activity.type"
          v-focus="focusedType"
          @focus="focusedType = true"
          @blur="focusedType = false"
        >
          <option v-for="option in consts.types" :value="option" :key="option">{{ option }}</option>
        </b-select>
      </b-field>
      <b-field
          label="Krátký popis aktivity"
          :type="errorsResult.type"
          :message="errorsResult.message">
        <b-input
            maxlength="500"
            type="textarea"
            v-model="activity.result"
            v-focus="focusedResult"
            @focus="focusedResult = true"
            @blur="focusedResult = false"
            placeholder="Krátce aktivitu popiš, včetně výsledků, kterých jsi v ní dosáhl/a.">
        </b-input>
      </b-field>
      <b-field
        v-if="showField.includes(activity.type)"
        label="Oblast"
        :type="errorsField.type"
        :message="errorsField.message"
      >
        <b-select
          placeholder="Vyber, do jakého kola ses nejdál dostal/a."
          v-model="activity.field"
          v-focus="focusedField"
          @focus="focusedField = true"
          @blur="focusedField = false"
        >
          <option v-for="option in consts.fields" :value="option" :key="option">{{ option }}</option>
        </b-select>
      </b-field>
      <b-field
          label="Časový rozsah"
          :type="errorsStart.type"
          :message="errorsStart.message">
        <b-input
            maxlength="500"
            type="textarea"
            v-model="activity.start"
            v-focus="focusedStart"
            @focus="focusedStart = true"
            @blur="focusedStart = false"
            placeholder="Napiš, kolik času jsi aktivitě věnoval či věnuješ.">
        </b-input>
      </b-field>
      <b-field
        v-if="showInterest.includes(activity.type)"
        label="Obor"
        :type="errorsInterest.type"
        :message="errorsInterest.message"
      >
        <b-select
          placeholder="Vyber, do jakého oboru se aktivita nejlépe hodí."
          v-model="activity.interest"
          v-focus="focusedInterest"
          @focus="focusedInterest = true"
          @blur="focusedInterest = false"
        >
          <option v-for="option in consts.interests" :value="option" :key="option">{{ option }}</option>
        </b-select>
      </b-field>
      <b-field
        v-if="showIsIndividual.includes(activity.type)"
        label="Individuální/týmová"
        :type="errorsIsIndividual.type"
        :message="errorsIsIndividual.message"
      >
        <b-select
          placeholder="Vyber, zda je aktivita individuální nebo týmová."
          v-model="activity.isIndividual"
          v-focus="focusedIsIndividual"
          @focus="focusedIsIndividual = true"
          @blur="focusedIsIndividual = false"
        >
          <option v-for="option in consts.individualities" :value="option" :key="option">{{ option }}</option>
        </b-select>
      </b-field>
      <b-field
          label="Reference"
          style="padding-top: 15px;"
          >
        <b-input
            maxlength="500"
            type="textarea"
            v-model="activity.reference"
            v-focus="focusedReference"
            @focus="focusedReference = true"
            @blur="focusedReference = false"
            placeholder="Napiš kontakt na osobu, která Ti může případně aktivitu potvrdit">
        </b-input>
      </b-field>
    </section>
    <footer class="modal-card-foot">
      <button class="button" @click="$parent.close()">
        Zavřít
      </button>
      <button class="button is-primary" @click="submit">
        Uložit a zavřít
      </button>
    </footer>
    <!--</form>-->
    <!--<pre>$xv: {{ $v.activity }}</pre>-->
  </div>
</template>

<script>
import { mapFields } from 'vuex-map-fields'
import { required } from 'vuelidate/lib/validators'
import { mixin as focusMixin } from 'vue-focus'
import config from '../../config/default'
import { requiredIf } from "vuelidate/lib/validators";

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
      submitStatus: ''
    }
  },
  mounted () {
    if (this.index !== null) {
      this.activity = { ...this.act }
    }
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
    submit () {
      if (this.$v.activity.$invalid) {
        this.submitStatus = 'ERROR'
      } else {
        this.submitStatus = 'OK'
        if (this.index != null) {
          this.activities.splice(this.index, 1, this.activity)
        } else this.activities.push(this.activity)
        this.$parent.close()
      }
    },
    validate (input, focused) {
      if (!this.$v.activity[input].$invalid) {
        return { message: '', type: '' }
      }
      if (this[focused] === false && this.$v.activity[input].$invalid) {
        return { message: config.errors.required, type: config.errors.type }
      } else if (this.submitStatus === 'ERROR') {
        return { message: config.errors.required, type: config.errors.type }
      } else return { message: '', type: '' }
    }
  },
  validations: {
    activity: {
      name: {
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
.modal-card {
  width: 90%;
  margin: auto !important;
  max-width: 800px;
  border-radius: 0;
  font-size: 13px;
}
</style>
