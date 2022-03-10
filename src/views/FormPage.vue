<template>
  <div>
    <keep-alive>
      <component :is="currentView" @changeView="changeView"/>
    </keep-alive>
  </div>
</template>

<script>
import FirstStep from '../components/form/FirstStep'
import ActivitiesStep from '../components/form/ActivitiesStep'
import FinaliseStep from '../components/form/FinaliseStep'
import { IS_LOGGED_IN } from '../types'
import { mapGetters } from 'vuex'
import router from '../router'

export default {
  components: { FirstStep, ActivitiesStep, FinaliseStep },
  data () {
    return {
      currentView: FirstStep.name
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
    changeView (currentView) {
      this.currentView = currentView
    }
  }
}
</script>
