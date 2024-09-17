<template>
  <div id="homeForm" class="homeForm">
    <main>
      <CardHome />
      <h2>Formulaires :</h2>
      <ButtonsForm :onClickAction="goToMontantForm" text="🍻 Ajoutez une tournée Chef !" />
      <ButtonsForm :onClickAction="goToDetteForm" text="💳 Payez une dette !" />
      <h2>Tableau de bord :</h2>
      <ButtonsForm :onClickAction="goToDashboard" text="📈 Voir le tableau de bord !" />
      <h2>Paramètres :</h2>
      <ButtonsForm :onClickAction="goToParams" text="⚙️ Voir les paramètres !" />
    </main>
  </div>
</template>

<script>
import CardHome from '../components/CardHome.vue'
import ButtonsForm from '../components/ButtonsForm.vue'

export default {
  name: 'homeForm',
  methods: {
    goToDashboard() {
      this.$router.push('/dashboardVue')
    },
    goToParams() {
      this.$router.push('/paramsVue')
    },
    goToMontantForm() {
      this.$router.push('/montantVue')
    },
    goToDetteForm() {
      this.$router.push('/detteVue')
    }
  },
  components: {
    CardHome,
    ButtonsForm
  }
}
</script>

<style>
body {
  font-family: Arial, sans-serif;
  background-color: #f4f4f4;
  color: #333;
  margin: 0;
}
main {
  display: flex;
  flex-direction: column;
  align-items: center;
}
h2 {
  font-size: 1rem;
  font-weight: bold;
}
</style>
