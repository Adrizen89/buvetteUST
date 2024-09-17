<template>
  <div class="card-montant">
    <label>💰 Choisissez un montant :</label>
    <div class="montant-options">
      <!-- Affichage des montants en tant que boutons -->
      <button
        v-for="montant in montants"
        :key="montant"
        @click="selectMontant(montant)"
        :class="{ selected: montant === selectedMontant }"
      >
        {{ montant }}€
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    montants: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      selectedMontant: null
    }
  },
  methods: {
    selectMontant(montant) {
      if (this.selectedMontant === montant) {
        // Si on reclique sur le montant sélectionné, le désélectionner
        this.selectedMontant = null
        this.$emit('montant-selected', '0') // Emettre null pour signaler la désélection
      } else {
        // Sinon, sélectionner le nouveau montant
        this.selectedMontant = montant
        this.$emit('montant-selected', montant) // Emettre l'événement pour la sélection du montant
      }
    },
    resetMontant() {
      this.selectedMontant = '0' // Réinitialiser la sélection du montant
    }
  }
}
</script>

<style scoped>
.card-montant {
  margin-top: 1rem;
}
.montant-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin: 2rem;
}

button {
  padding: 1rem;
  background-color: #ffffff;
  cursor: pointer;
  border: none;
  border-radius: 5px;
  width: 20%;
}

button.selected {
  background-color: #1ab798;
  color: white;
  font-weight: bold;
}
</style>
