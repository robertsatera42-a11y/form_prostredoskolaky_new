<template>
  <div class="modal-card activity-removal" role="alertdialog" aria-modal="true" aria-labelledby="activity-removal-title" aria-describedby="activity-removal-description" @keydown.esc.stop.prevent="$emit('close')" @keyup.esc.stop @keydown.tab="trapFocus">
    <header class="modal-card-head">
      <h2 id="activity-removal-title">Odstranit aktivitu?</h2>
    </header>
    <section class="modal-card-body">
      <p id="activity-removal-description">Opravdu chceš odstranit aktivitu „{{ activityName }}“ z přihlášky?</p>
    </section>
    <footer class="modal-card-foot">
      <button ref="cancel" type="button" class="removal-cancel" @click="$emit('close')">Zrušit</button>
      <button ref="confirm" type="button" class="removal-confirm" @click="confirm">Odstranit aktivitu</button>
    </footer>
  </div>
</template>

<script>
export default {
  props: { activityName: { type: String, required: true } },
  mounted () {
    this.background = document.getElementById('app')
    if (this.background) {
      this.backgroundWasInert = this.background.inert
      this.background.inert = true
    }
    this.$parent.$once('close', this.restoreBackground)
    this.$nextTick(() => this.$refs.cancel.focus())
  },
  beforeDestroy () {
    this.restoreBackground()
  },
  methods: {
    confirm () {
      this.$emit('confirm')
      this.$emit('close')
    },
    restoreBackground () {
      if (this.background) {
        this.background.inert = this.backgroundWasInert
        this.background = null
      }
    },
    trapFocus (event) {
      const first = this.$refs.cancel
      const last = this.$refs.confirm
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
  }
}
</script>

<style scoped lang="scss">
.activity-removal {
  width: calc(100% - 32px);
  max-width: 480px;
  max-height: 90vh;
  max-height: 90dvh;
  margin: auto !important;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 24px 80px rgba(7, 27, 70, .24);
  color: #071b46;
  font: 1rem/1.5 'AvenirNextForm', 'AvenirNext', sans-serif;
  ::selection { color: #071b46; background: #ffe2d4; }
  .modal-card-head, .modal-card-body, .modal-card-foot { padding: 20px 24px; border: 0; border-radius: 0; background: #fff; }
  .modal-card-head { padding-bottom: 0; }
  h2 { margin: 0; font-size: 1.5rem; font-weight: 700; line-height: 1.25; letter-spacing: -.02em; }
  p { margin: 0; overflow-wrap: anywhere; }
  .modal-card-foot { display: flex; align-items: stretch; gap: 12px; padding-top: 0; }
  button {
    flex: 1 1 0;
    min-width: 0;
    min-height: 48px;
    margin: 0;
    padding: 12px;
    border: 1px solid #8192ad;
    border-radius: 6px;
    background: #fff;
    color: #071b46;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    &:hover { border-color: #071b46; background: #f4f6fa; }
    &:active { background: #e6ebf3; }
    &:focus-visible { outline: 2px solid #071b46; outline-offset: 3px; }
  }
  .removal-confirm {
    border-color: #b42318;
    background: #b42318;
    color: #fff;
    &:hover { border-color: #912018; background: #912018; }
    &:active { border-color: #761b14; background: #761b14; }
  }
}
</style>

<style lang="scss">
.activity-removal-host > .modal-background { background: rgba(7, 27, 70, .48); }
</style>
