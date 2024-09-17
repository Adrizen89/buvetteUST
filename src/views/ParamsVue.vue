<template>
  <header>
    <h1>⚙️ Paramètres</h1>
    <button class="btnHeader" @click="goBack"><font-awesome-icon icon="arrow-left" /></button>
  </header>

  <div class="responsables-section">
    <h3>Responsables de la Buvette</h3>
    <table>
      <thead>
        <tr>
          <th>✅</th>
          <!-- Colonne pour la checkbox -->
          <th>Responsable</th>
          <th>Moyen de Paiement</th>
        </tr>
      </thead>
      <tbody>
        <!-- Affichage des membres qui sont responsables (isResp = true) -->
        <tr v-for="responsable in responsables" :key="responsable.id">
          <td>
            <input
              type="checkbox"
              v-model="responsable.isResp"
              @change="toggleResponsable(responsable)"
            />
          </td>
          <td>{{ responsable.name }}</td>
          <td>
            <select
              class="selectMoyen"
              v-model="responsable.moyenGere"
              @change="updateResponsable(responsable)"
            >
              <option value="" disabled selected>Choisir un moyen de paiement</option>
              <option v-for="moyen in moyensPaiement" :key="moyen" :value="moyen">
                {{ moyen }}
              </option>
            </select>
          </td>
        </tr>

        <!-- Ligne pour ajouter un nouveau responsable -->
        <tr>
          <td></td>
          <!-- Colonne vide pour la case de la nouvelle ligne -->
          <td>
            <select v-model="newResponsable" @change="handleAddResponsable">
              <option value="" disabled selected>Choisir un membre</option>
              <option v-for="membre in membresNonResponsables" :key="membre.id" :value="membre">
                {{ membre.name }}
              </option>
            </select>
          </td>
          <td>
            <select v-if="newResponsable" v-model="newMoyenPaiement">
              <option value="" disabled selected>Choisir un moyen de paiement</option>
              <option v-for="moyen in moyensPaiement" :key="moyen" :value="moyen">
                {{ moyen }}
              </option>
            </select>
          </td>
          <td>
            <button
              class="btnAdd"
              v-if="newResponsable && newMoyenPaiement"
              @click="handleAddResponsable"
            >
              Ajouter
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore'
import { db } from '@/firebase/index'

export default {
  data() {
    return {
      membres: [], // Les membres seront chargés depuis Firestore
      moyensPaiement: ['Lydia', 'Paylib', 'Espèces'],
      newResponsable: null, // Stocker le membre à ajouter comme responsable
      newMoyenPaiement: null // Stocker le moyen de paiement du nouveau responsable
    }
  },
  computed: {
    responsables() {
      // Filtrer et n'afficher que les membres responsables (isResp = true)
      return this.membres.filter((membre) => membre.isResp === true)
    },
    membresNonResponsables() {
      // Filtrer les membres qui ne sont pas encore responsables
      return this.membres.filter((membre) => membre.isResp === false)
    }
  },
  methods: {
    async fetchMembres() {
      try {
        const membresSnapshot = await getDocs(collection(db, 'membres'))
        this.membres = membresSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }))
        this.calculerTotalGere() // Calculer les totaux pour les responsables après avoir chargé les membres
      } catch (error) {
        console.error('Erreur lors de la récupération des membres :', error)
      }
    },
    async toggleResponsable(membre) {
      try {
        const membreRef = doc(db, 'membres', membre.id)
        await updateDoc(membreRef, {
          isResp: membre.isResp // Mettre à jour Firestore avec la nouvelle valeur
        })
        this.calculerTotalGere() // Recalculer les totaux après modification
      } catch (error) {
        console.error('Erreur lors de la mise à jour du responsable :', error)
      }
    },
    async updateResponsable(membre) {
      if (membre.isResp) {
        const membreRef = doc(db, 'membres', membre.id)
        await updateDoc(membreRef, {
          moyenGere: membre.moyenGere || '' // Mettre à jour le moyen de paiement s'il existe
        })
      }
    },
    async handleAddResponsable() {
      if (this.newResponsable && this.newMoyenPaiement) {
        const membreRef = doc(db, 'membres', this.newResponsable.id)
        await updateDoc(membreRef, {
          isResp: true,
          moyenGere: this.newMoyenPaiement
        })

        this.newResponsable.isResp = true
        this.newResponsable.moyenGere = this.newMoyenPaiement

        this.newResponsable = null
        this.newMoyenPaiement = null

        this.calculerTotalGere() // Recalculer le total géré après l'ajout
      }
    },
    goBack() {
      this.$router.back()
    }
  },
  mounted() {
    this.fetchMembres() // Charger les membres depuis Firestore au montage du composant
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

.responsables-section {
  display: flex;
  flex-direction: column;
}
table {
  border-collapse: collapse;
  width: 80%;
  margin: auto;
}
th,
td {
  border-bottom: 1px solid #ddd;
  height: 5vh;
}

select {
  width: 80%;
  border: none;
  height: 4vh;
  border-radius: 10px;
}
.btnAdd {
  width: 80%;
  height: 4vh;
  background-color: #1ab798;
  border: none;
  border-radius: 5px;
  color: #fff;
  font-weight: bold;
}
</style>
