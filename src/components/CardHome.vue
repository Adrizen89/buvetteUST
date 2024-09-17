<template>
  <div class="card-home">
    <p>{{ totalCollected - totalDet }} € <span>de récolté sur </span> {{ totalCollected }} €</p>
    <p>{{ totalDet }} € <span>de dettes</span></p>
  </div>
</template>

<script>
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/firebase/index.js'

export default {
  data() {
    return {
      tournees: []
    }
  },
  methods: {
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
    },
    showTotal: {
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
.card-home {
  width: 95%;
  margin: auto;
  margin-bottom: 1rem;
  height: 25vh;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  background-color: #1ab798;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: self-start;
  padding: 0 0 0 1rem;
}

p {
  font-size: clamp(1.5rem, 1.5vw, 2rem);
  font-weight: bold;
  color: #fff;
  margin: auto;
}
p span {
  font-size: clamp(0.9rem, 1.5vw, 1.3rem);
  color: #fff;
}
</style>
