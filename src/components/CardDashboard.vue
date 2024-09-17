<template>
  <div class="card">
    <p v-if="!showDette">
      {{ totalCollected }} €<br />
      <span>de tournées</span>
    </p>
    <p v-if="showDette">
      {{ totalDet }} €
      <span>
        de dettes<br />
        sur {{ totalCollected }} €</span
      >
    </p>
  </div>
</template>

<script>
import { db } from '@/firebase/index.js'
import { collection, getDocs } from 'firebase/firestore'

export default {
  data() {
    return {
      tournees: [] // Initialise avec un tableau vide
    }
  },
  methods: {
    // Récupérer les données depuis Firestore
    async fetchTotal() {
      try {
        const totalCollection = collection(db, 'tournees')
        const totauxSnapshot = await getDocs(totalCollection)
        this.tournees = totauxSnapshot.docs.map((doc) => doc.data()) // Stocker les tournées récupérées
      } catch (error) {
        console.error('Erreur lors de la récupération des tournées:', error)
      }
    }
  },
  computed: {
    // Calculer le montant total des tournées
    totalCollected() {
      if (!this.tournees || !this.tournees.length) return '0.00' // Si aucune tournée, retourner 0
      return this.tournees
        .reduce((sum, tournee) => {
          const montant = parseFloat(tournee.montant)
          return sum + (isNaN(montant) ? 0 : montant) // Ajouter seulement si le montant est valide
        }, 0)
        .toFixed(2)
    },
    // Calculer le montant total des dettes
    totalDet() {
      if (!this.tournees || !this.tournees.length) return '0.00' // Si aucune tournée, retourner 0
      return this.tournees
        .filter((tournee) => tournee.dette === true) // Filtrer les dettes
        .reduce((sum, tournee) => {
          const montant = parseFloat(tournee.montantDette)
          return sum + (isNaN(montant) ? 0 : montant) // Ajouter seulement si le montant est valide
        }, 0)
        .toFixed(2)
    }
  },
  props: {
    showDette: {
      type: Boolean,
      default: true
    }
  },
  mounted() {
    this.fetchTotal()
  }
}
</script>

<style scoped>
.card {
  width: 40%;
  height: 20vh;
  background-color: #3c5375;
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-radius: 10px;
  cursor: pointer;
}
.card p:first-child {
  font-size: 1.4rem;
  font-weight: bold;
}
span {
  font-size: 1rem;
}
</style>
