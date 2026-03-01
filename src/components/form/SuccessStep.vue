<template>
  <section class="success-step" id="success-step">
    <div class="header-text">
        <h2>
            Děkujeme za tvou přihlášku! Dotazník byl uložen a na {{ user.email }} zaslán potvrzovací email. Přihlášku můžeš až do deadlinu kdykoliv otevřít a upravit ji.
        </h2>
    </div>
    <div class="submit-block">
      <div class="submit-actions content">
        <a class="button a-gray" href="https://stredoskolakroku.cz/">Zavřít</a>
        <a class="button a-orange-full" href="https://prihlaska.stredoskolakroku.cz/">Znovu otevřít přihlášku</a>
      </div>
    </div>
  </section>
</template>
<script>
import { mapFields } from 'vuex-map-fields'

export default {
  name: 'success-step',
  number: 0,
  computed: {
    ...mapFields({
      user: 'user'
    })

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

section.success-step {
  padding-top: 50px;
  position: relative;

  .header-text {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 40px 0;
    flex: 1;

    h2 {
      flex: .5;
      font-size: 18px;
      margin: 0 0 0 20px;
      line-height: 1.2;
      font-weight: normal;
    //   text-align:center;
    }
    }

  .submit-block {
    background-color: #f9f4f4;

    .submit-actions {
      padding-bottom: 40px;

      .a-orange {
        margin-right: 20px;
        margin-top: 0;
        border: 1px solid #f55c23;
        background: white;
        color: #f55c23;
        display: inline-flex;
      }

      .a-orange-full {
        margin-right: 20px;
        border: 1px solid #f55c23;
        background: #f55c23;
        color: #FFF;
      }

      small {
        font-size: 15px;
        line-height: 35px;
        text-align: center;
        white-space: nowrap;
      }

      @media (max-width: 450px) {
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
