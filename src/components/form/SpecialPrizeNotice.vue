<template>
  <section class="prize-notice">
    <h3>Speciální ceny připravujeme</h3>
    <p>Speciální ceny budeme postupně doplňovat do 1. března. O jejich zveřejnění tě budeme informovat e-mailem a na sociálních sítích. Přihlášku můžeš odeslat už teď a kdykoliv během přihlašování se k ní vrátit a doplnit svůj výběr speciálních cen.</p>
  </section>
</template>

<script>
export default { name: 'special-prize-notice' }
</script>

<style scoped>
.prize-notice { padding: 24px; border: 1px solid #d6deea; border-radius: 12px; background: #fff; color: #071b46; }
.prize-notice h3 { margin: 0; font-size: 1.25rem; font-weight: 700; line-height: 1.3; }
.prize-notice p { max-width: 72ch; margin: 12px 0 0; color: #556c94; line-height: 1.6; overflow-wrap: anywhere; }
@media (max-width: 767px) { .prize-notice { padding: 20px; } }
</style>
