<template>
  <div class="table-card">
    <table>
      <caption @click="openModal">
        <div class="caption-card">
          <h3>{{ tableTitle }}</h3>
          <font-awesome-icon icon="arrow-right" />
        </div>
      </caption>
      <thead>
        <tr>
          <th @click="sortBy('date')" v-if="!isMembersList">
            📅 Date <span v-if="currentSort === 'date'">{{ sortDirection }}</span>
          </th>
          <th @click="sortBy('name')">
            👤 Nom <span v-if="currentSort === 'name'">{{ sortDirection }} </span>
          </th>

          <th v-if="isMembersList" @click="sortBy('totalPaid')">
            Total Payé ✅ <span v-if="currentSort === 'totalPaid'">{{ sortDirection }}</span>
          </th>
          <th v-if="isMembersList" @click="sortBy('totalDebt')">
            Total Dette ❌ <span v-if="currentSort === 'totalDebt'">{{ sortDirection }}</span>
          </th>

          <th v-if="!isMembersList && !isDetteList" @click="sortBy('montant')">
            💰 Montant <span v-if="currentSort === 'montant'">{{ sortDirection }}</span>
          </th>
          <th v-if="!isMembersList" @click="sortBy('montantDette')">
            💰 Montant Dette <span v-if="currentSort === 'montantDette'">{{ sortDirection }}</span>
          </th>
          <th v-if="showDebt && !isMembersList" @click="sortBy('moyen')">
            💳 Moyen paiement <span v-if="currentSort === 'moyen'">{{ sortDirection }}</span>
          </th>
          <th v-if="showDebt && !isMembersList" @click="sortBy('dette')">
            ❌ Dette <span v-if="currentSort === 'dette'">{{ sortDirection }}</span>
          </th>
          <th v-if="!isMembersList">🗑 Supprimer</th>
        </tr>
      </thead>
      <tbody>
        <!-- Si c'est la liste des membres -->
        <tr v-for="(tournee, index) in sortedData" :key="index">
          <td v-if="!isMembersList">{{ tournee.date }}</td>
          <td>{{ tournee.name }}</td>
          <!-- Affichage du total payé et des dettes pour chaque membre -->
          <td v-if="isMembersList">{{ tournee.totalPaid }}€</td>
          <td v-if="isMembersList">{{ tournee.totalDebt }}€</td>
          <!-- Sinon, afficher les données transactionnelles -->

          <td v-if="!isMembersList && !isDetteList">{{ tournee.montant }}€</td>
          <td v-if="!isMembersList">{{ tournee.montantDette }}€</td>
          <td v-if="showDebt && !isMembersList">{{ tournee.moyen || 'N/A' }}</td>
          <td v-if="showDebt && !isMembersList">{{ tournee.dette ? '✔️' : '✖️' }}</td>
          <td v-if="!isMembersList">
            <button class="btn-delete" @click="deleteRow(index)">🗑</button>
          </td>
        </tr>
      </tbody>
    </table>
    <!-- Modale pour afficher le tableau complet -->
    <div v-if="isModalOpen" class="modal-backdrop" @click="closeModal">
      <div class="modal-content" @click.stop>
        <h3>{{ tableTitle }}</h3>
        <button @click="closeModal" class="close-button">Fermer</button>
        <div class="modal-table-content">
          <table>
            <thead>
              <tr>
                <th @click="sortBy('date')" v-if="!isMembersList">
                  📅 Date <span v-if="currentSort === 'date'">{{ sortDirection }}</span>
                </th>
                <th @click="sortBy('name')">
                  👤 Nom <span v-if="currentSort === 'name'">{{ sortDirection }} </span>
                </th>

                <th v-if="isMembersList" @click="sortBy('totalPaid')">
                  Total Payé ✅ <span v-if="currentSort === 'totalPaid'">{{ sortDirection }}</span>
                </th>
                <th v-if="isMembersList" @click="sortBy('totalDebt')">
                  Total Dette ❌ <span v-if="currentSort === 'totalDebt'">{{ sortDirection }}</span>
                </th>

                <th v-if="!isMembersList" @click="sortBy('montant')">
                  💰 Montant <span v-if="currentSort === 'montant'">{{ sortDirection }}</span>
                </th>
                <th v-if="showDebt && !isMembersList" @click="sortBy('moyen')">
                  💳 Moyen paiement <span v-if="currentSort === 'moyen'">{{ sortDirection }}</span>
                </th>
                <th v-if="showDebt && !isMembersList" @click="sortBy('dette')">
                  ❌ Dette <span v-if="currentSort === 'dette'">{{ sortDirection }}</span>
                </th>
                <th v-if="!isMembersList">🗑 Supprimer</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(tournee, index) in sortedData" :key="index">
                <td v-if="!isMembersList">{{ tournee.date }}</td>
                <td>{{ tournee.name }}</td>
                <td v-if="isMembersList">{{ tournee.totalPaid }}€</td>
                <td v-if="isMembersList">{{ tournee.totalDebt }}€</td>
                <td v-if="!isMembersList">{{ tournee.montant }}€</td>
                <td v-if="showDebt && !isMembersList">{{ tournee.moyen }}</td>
                <td v-if="showDebt && !isMembersList">{{ tournee.dette ? '✔️' : '✖️' }}</td>
                <td v-if="!isMembersList">
                  <button class="btn-delete" @click="deleteRow(tournee.id)">🗑</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '@/firebase/index'
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore'

export default {
  data() {
    return {
      isModalOpen: false,
      sortDirection: '▲',
      currentSort: 'name',
      transactions: []
    }
  },
  props: {
    filterType: {
      type: String,
      default: 'all',
      validator: function (value) {
        return ['all', 'members', 'debts'].includes(value)
      }
    },
    tableTitle: {
      type: String,
      default: 'Liste de Membres'
    },
    showDebt: {
      type: Boolean,
      default: true
    },
    rowLimit: {
      type: Number,
      default: 5
    }
  },
  computed: {
    // Calculer les membres uniques et leurs totaux (payé et dette)
    filteredData() {
      if (this.filterType === 'members') {
        const memberTotals = {}

        // Calculer les totaux pour chaque membre
        for (const tournee of this.transactions) {
          if (!memberTotals[tournee.name]) {
            memberTotals[tournee.name] = {
              name: tournee.name,
              totalPaid: 0,
              totalDebt: 0
            }
          }
          // Si payé, ajouter au total payé
          if (tournee.paye) {
            memberTotals[tournee.name].totalPaid += parseFloat(tournee.montant)
          }
          // Si dette, ajouter au total des dettes
          if (tournee.dette) {
            memberTotals[tournee.name].totalDebt += parseFloat(tournee.montantDette)
          }
        }

        // Retourner le tableau des membres uniques avec leurs totaux
        return Object.values(memberTotals)
      } else if (this.filterType === 'debts') {
        // Filtrer les dettes : où payé est faux et dette est vrai
        return this.transactions
          .filter((tournee) => tournee.dette === true && tournee.paye === false)
          .map((tournee) => {
            return {
              ...tournee,
              date: new Date().toLocaleDateString('fr-FR')
            }
          })
      }

      // Si filterType est 'all', retourner toutes les transactions
      return this.transactions
    },
    hasDettes() {
      return this.transactions.some((tournee) => tournee.dette)
    },
    hasPayes() {
      return this.transactions.some((tournee) => tournee.payé)
    },

    limitedData() {
      return this.filteredData.slice(0, this.rowLimit)
    },
    sortedData() {
      // Faire une copie des données avant de les trier
      return [...this.filteredData].sort((a, b) => {
        let modifier = this.sortDirection === '▲' ? 1 : -1
        if (a[this.currentSort] < b[this.currentSort]) return -1 * modifier
        if (a[this.currentSort] > b[this.currentSort]) return 1 * modifier
        return 0
      })
    },
    // Vérifier si la vue actuelle est la liste des membres
    isMembersList() {
      return this.filterType === 'members'
    },
    isDetteList() {
      return this.filterType === 'debts'
    }
  },
  methods: {
    // Méthode pour récupérer les données depuis Firebase Firestore
    async fetchTransac() {
      try {
        const tourneesCollection = collection(db, 'tournees')
        const tourneesSnapshot = await getDocs(tourneesCollection)
        this.transactions = tourneesSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id // Assigne l'ID du document à la transaction
        }))
      } catch (error) {
        console.error('Erreur lors de la récupération des transactions de tournées:', error)
      }
    },
    async deleteRow(index) {
      try {
        // Récupérer l'ID de la transaction à partir du tableau local des transactions
        const transaction = this.transactions[index]

        // Vérifier si la transaction existe et a un ID
        if (!transaction || !transaction.id) {
          throw new Error('Transaction introuvable ou ID manquant.')
        }

        // Supprimer la transaction de Firestore
        await deleteDoc(doc(db, 'tournees', transaction.id))

        // Supprimer l'élément du tableau local des transactions
        this.transactions.splice(index, 1)

        alert('Transaction supprimée avec succès.')
      } catch (error) {
        console.error('Erreur lors de la suppression de la transaction :', error)
        alert('Erreur lors de la suppression de la transaction.')
      }
    },
    openModal() {
      this.isModalOpen = true
    },
    closeModal() {
      this.isModalOpen = false
    },
    sortBy(column) {
      // Inverser la direction si on trie sur la même colonne
      if (this.currentSort === column) {
        this.sortDirection = this.sortDirection === '▲' ? '▼' : '▲'
      } else {
        this.sortDirection = '▲'
      }
      this.currentSort = column
    }
  },
  mounted() {
    // Appeler la fonction pour récupérer les données dès que le composant est monté
    this.fetchTransac()
  }
}
</script>

<style scoped>
caption {
  caption-side: top;
  font-size: 1.3rem;
  font-weight: bold;
  padding: 1rem;
  cursor: pointer;
}
.caption-card {
  display: flex;
  justify-content: space-between;
}
.table-card {
  background-color: #fff;
  width: 90%;
  margin: 2rem auto;
  border-radius: 10px;
  overflow-x: scroll;
}
table {
  border-collapse: collapse;

  width: 100%;
}
tbody tr td,
thead tr th {
  text-align: center;
}
tbody tr td:first-child,
thead tr th:first-child {
  text-align: left;
}
tbody tr td:last-child,
thead tr th:last-child {
  text-align: right;
}
th,
td {
  padding: 1rem;
}
th {
  font-style: italic;
  cursor: pointer;
}
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 80%;
  max-height: 80%;
  overflow: hidden;
}
.modal-table-content {
  max-height: 60vh; /* Limite la hauteur du tableau à 60% de la fenêtre */
  overflow-y: auto; /* Active le scroll vertical si le contenu dépasse */
}

.close-button {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 10px 15px;
  cursor: pointer;
  margin-bottom: 20px;
}

.btn-delete:hover {
  background-color: #d32f2f;
}
.btn-delete {
  background-color: transparent;
  height: 3vh;
  width: 50%;
  cursor: pointer;
}
</style>
