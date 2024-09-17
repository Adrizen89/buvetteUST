<template>
  <header>
    <h1>📈 Tableau de bord</h1>
    <button @click="goBack"><font-awesome-icon icon="arrow-left" /></button>
  </header>
  <div class="grid-card">
    <CardDashboard :showDette="false" />
    <CardDashboard :showDette="true" />
  </div>
  <TableDashboard
    :row-limit="5"
    :tableTitle="'Liste des Membres'"
    :filterType="'members'"
    :showDebt="false"
  />
  <TableDashboard
    :row-limit="5"
    :tableTitle="'Liste des Dettes'"
    :filterType="'debts'"
    :showDebt="false"
  />
  <TableDashboard
    :row-limit="5"
    :tableTitle="'Liste des Transactions'"
    :filterType="'all'"
    :showDebt="true"
  />
</template>

<script>
import CardDashboard from '@/components/CardDashboard.vue'
import TableDashboard from '@/components/TableDashboard.vue'

export default {
  name: 'dashboardVue',
  components: {
    CardDashboard,
    TableDashboard
  },
  methods: {
    goBack() {
      this.$router.back()
    }
  }
}
</script>

<style scoped>
header {
  display: flex;
  flex-direction: row-reverse;
  width: 100%;
  justify-content: center;
  align-items: center;
}
header button {
  border: none;
  height: 5vh;
  background-color: transparent;
  color: #354052;
  cursor: pointer;
}
h1 {
  width: 80%;
  font-size: 1.3rem;
  font-weight: bold;
}
.grid-card {
  display: flex;
  justify-content: space-around;
}
</style>
