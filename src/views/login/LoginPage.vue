<template>
  <div class="login-page">
    <div class="overlay"></div>

    <section class="main-container">
      <div v-if="redirectMessage" class="redirect-message">{{redirectMessage}}</div>
        <div class="content-header">
          header
        </div>
        <div class="content">
          <Login />
          <SignUp />
        </div>
        <div class="content-footer">
          footer
        </div>
    </section>
  </div>
</template>

<script>
import FooterBlock from '../../components/common/Footer'
import SignUp from '../../components/login/SignUp'
import Login from '../../components/login/Login'

export default {
  name: 'login-page',
  components: { FooterBlock, SignUp, Login },
  data () {
    return {
      redirectMessage: ''
    }
  },
  mounted () {
    this.showMessage()
  },
  updated () {
    this.showMessage()
  },
  methods: {
    showMessage () {
      const redirect = this.$route && this.$route.query && this.$route.query.redirect
      if (redirect === 'databaze') {
        this.redirectMessage = 'Pro přístup do databáze mimoškolních aktivit se nejdříve přihlaste.'
      } else if (redirect === 'soutez') {
        this.redirectMessage = 'Pro registraci do soutěže se nejdříve přihlaste.'
      }
    }
  }
}
</script>
<style scoped lang="scss">
.login-page {
  position: relative;
}
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  background: linear-gradient(160deg, rgba(240, 78, 35, 0.8) 25%, rgba(255, 106, 63, 0.8) 75%);
  opacity: .25;
}
.content {
  width: 80%;
  max-width: 1200px;
  margin: 40px auto;
  padding: 10px 40px 0;
}
.content-header {
  width: 80%;
  max-width: 1200px;
}

.content-footer {
  width: 80%;
  max-width: 1200px;
}

.main-container {
  padding: 100px 0 20px;
  margin-bottom: 10px;
  min-height: 100vh;
  position: relative;

  .redirect-message {
    padding-top: 40px;
    text-align: center;
    font-size: 20px;
    color: #f26427;
  }

  .db {
    padding-top: 12px;
    width: 25%;
    margin: 0 auto;

    @media (max-width: 600px) {
      width: 80%;
    }

    ul {
        margin-top: 0;
        list-style: none;
    }
    li::before {
      content: "\2022";
      color: #f26427;
      width: 20px;
      margin-left: -20px;
      display: inline-block;
    }
  }

  @media (max-width: 600px) {
    padding: 100px 0 50px;
  }

  .content {
    display: flex;
    flex-direction: row;
    justify-content: center;

    @media (max-width: 800px) {
      width: 90%;
      padding: 20px;
    }

    @media (max-width: 650px) {
      flex-direction: column;
    }
  }
}

</style>
