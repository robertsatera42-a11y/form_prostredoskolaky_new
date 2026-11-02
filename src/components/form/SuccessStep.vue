<template>
  <section id="success-step" class="success-step" aria-labelledby="success-heading">
    <div class="success-confirmation">
      <span class="success-mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m5 12 4 4L19 6"></path></svg><span class="sr-only">Uložení potvrzeno.</span></span>
      <h2 id="success-heading" ref="heading" tabindex="-1">Přihláška je uložená</h2>
      <p class="success-lead">Děkujeme za tvou přihlášku do Ceny Středoškolák roku.</p>
      <p class="success-detail">Až do uzávěrky ji můžeš znovu otevřít a upravovat. Po každé úpravě ji nezapomeň znovu odeslat ve čtvrtém kroku.</p>
      <nav class="success-actions" aria-label="Co dál s přihláškou">
        <a class="success-button success-primary" href="https://prihlaska.stredoskolakroku.cz/">Znovu otevřít přihlášku<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m14 5 7 7-7 7M21 12H3"></path></svg></a>
        <a class="success-button success-secondary" href="https://stredoskolakroku.cz/">Zavřít</a>
      </nav>
    </div>
    <p class="success-support">Potřebuješ s přihláškou pomoct? Napiš nám na <a href="mailto:info@prostredoskolaky.cz">info@prostredoskolaky.cz</a>.</p>
  </section>
</template>

<script>
export default {
  name: 'success-step',
  number: 0,
  mounted () {
    window.scrollTo(0, 0)
    this.$nextTick(() => this.$refs.heading.focus({ preventScroll: true }))
  }
}
</script>

<style scoped lang="scss">
.success-step {
  width: calc(100% - 64px);
  max-width: 1024px;
  margin: 32px auto 0;
  color: #071b46;
  font: 1rem/1.5 'AvenirNextForm', 'AvenirNext', sans-serif;
  ::selection { background: #ffe2d4; color: #071b46; }
  a:focus-visible, h2:focus-visible { outline: 2px solid #071b46; outline-offset: 4px; }
  a { color: #071b46; text-decoration: underline; text-underline-offset: 3px; overflow-wrap: anywhere; }
  a:hover { color: #ac3711; }
}
.success-confirmation { padding: 40px 36px 36px; border: 1px solid #ffd2c5; border-radius: 8px; background: #fff; }
.success-mark { display: flex; align-items: center; justify-content: center; width: 52px; height: 52px; margin-bottom: 24px; border-radius: 50%; background: #22866a; color: #fff; }
.success-mark svg { width: 30px; height: 30px; }
.success-confirmation h2 { width: fit-content; max-width: 100%; margin: 0; font-size: 2rem; font-weight: 700; line-height: 1.25; letter-spacing: -.02em; }
.success-confirmation h2:focus:not(:focus-visible) { outline: none; }
.success-lead { margin: 12px 0 0; font-size: 1.125rem; }
.success-detail { max-width: 66ch; margin: 16px 0 0; color: #556c94; }
.success-actions { display: flex; align-items: stretch; flex-wrap: wrap; gap: 12px; margin-top: 32px; padding-top: 28px; border-top: 1px solid #e1e6ef; }
.success-button { display: inline-flex; align-items: center; justify-content: center; gap: 12px; min-height: 3.25rem; padding: 12px 20px; border: 1px solid #8192ad; border-radius: 6px; font-size: 1rem; font-weight: 700; line-height: 1.4; text-align: center; text-decoration: none !important; transition: background-color 150ms ease-out, border-color 150ms ease-out; }
.success-button svg { flex: 0 0 auto; width: 20px; height: 20px; }
.success-step .success-primary { border-color: #f26427; background: #f26427; color: #fff; font-size: 1.25rem; }
.success-step .success-primary:hover { border-color: #d94d14; background: #d94d14; color: #fff; }
.success-step .success-primary:active { border-color: #c44716; background: #c44716; }
.success-step .success-secondary:hover { border-color: #071b46; background: #f4f6fa; color: #071b46; }
.success-step .success-secondary:active { background: #e6ebf3; }
.success-support { margin: 24px 0 0; color: #556c94; text-align: center; }
.sr-only { position: absolute; width: 1px; height: 1px; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
@media (max-width: 767px) {
  .success-step { width: calc(100% - 32px); margin-top: 28px; }
  .success-confirmation { padding: 28px 20px 24px; }
  .success-confirmation h2 { font-size: 1.75rem; }
  .success-actions { flex-direction: column; gap: 12px; margin-top: 24px; padding-top: 24px; }
  .success-button { width: 100%; }
}
@media (prefers-reduced-motion: reduce) {
  .success-button { transition: none; }
}
</style>
