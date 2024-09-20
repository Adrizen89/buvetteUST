<template>
  <div id="home">
    <header>
      <h1>🍻 Ajoutez une tournée chef !</h1>
      <button @click="goBack"><font-awesome-icon icon="arrow-left" /></button>
    </header>
    <main>
      <div class="card">
        <!-- Liste des membres -->

        <div class="multi-select">
          <label class="typo__label">👤 Choisissez une personne :</label>
          <multiselect
            v-model="selectedMembre"
            :options="filteredMembres"
            :multiple="false"
            :close-on-select="true"
            :clear-on-select="false"
            :preserve-search="true"
            :allow-empty="false"
            deselect-label=""
            placeholder="Recherchez une personne"
            label="name"
            track-by="name"
            :preselect-first="true"
          >
            <template #selection="{ values, isOpen }">
              <span class="multiselect__single" v-if="values.length" v-show="!isOpen"
                >{{ values.length }} options selected</span
              >
            </template>
          </multiselect>
        </div>

        <!-- Sélection du montant -->
        <MontantChoice
          ref="montantSelect"
          :montants="montantsDisponibles"
          @montant-selected="handleMontantSelection"
        />

        <!-- Champ pour montant personnalisé si "Autre" est sélectionné -->
        <div class="modal-other" @click="closeModal" v-if="isCustomMontant">
          <div class="modal-content" @click.stop>
            <h3>Choississez un montant</h3>
            <input
              type="number"
              v-model="customMontant"
              placeholder="Entrez un montant"
              @input="updateCustomMontant"
            />
            <button class="btn-other" @click="validateCustomMontant">Valider</button>
          </div>
        </div>

        <!-- Checkbox pour la tournée payée ou non -->
        <div class="checkbox">
          <input type="checkbox" id="payé" v-model="tourneePayee" />
          <label for="payé">Tournée payée ?</label>
        </div>

        <!-- Liste des moyens de paiement (visible uniquement si payé) -->
        <ListChoice
          v-if="tourneePayee"
          :items="moyensPaiement"
          text="💳 Choisissez un moyen de paiement :"
          @onSelect="handlePaiementSelect"
          class="paiement"
        />
      </div>

      <!-- Récapitulatif -->
      <div class="recap">
        <p>🍻 Récapitulatif :</p>
        <p v-if="tourneePayee">
          Une tournée de <span>{{ montantTournée }}</span> € est payée par
          <span>{{ selectedMembre.name }}</span> avec <span>{{ selectedPaiement }}</span> !
        </p>
        <p v-else>
          Une dette de <span>{{ montantTournée }}</span> € est attribuée à
          <span>{{ selectedMembre.name }}</span> !
        </p>
      </div>

      <!-- Bouton de validation -->
      <BtnValidate @validate="saveTournee" />
    </main>
  </div>
</template>

<script>
import ListChoice from '../components/ListChoice.vue'
import MontantChoice from '../components/MontantChoice.vue'
import BtnValidate from '../components/BtnValidate.vue'
import Multiselect from 'vue-multiselect'
import { collection, getDocs, addDoc } from 'firebase/firestore'
import { db } from '@/firebase/index'
import 'vue-multiselect/dist/vue-multiselect.css'

export default {
  name: 'MontantVue',
  data() {
    return {
      montantTournée: '0', // Valeur par défaut du montant
      selectedMembre: '', // Valeur par défaut pour le membre
      selectedPaiement: '', // Valeur par défaut pour le moyen de paiement
      tourneePayee: false,
      membres: [],
      filteredMembres: [],
      searchTerm: '',
      moyensPaiement: ['Lydia', 'Paylib', 'Espèces'],
      montantsDisponibles: [2, 5, 10, 20, 30, 40, 50, 'Autre'],
      value: []
    }
  },
  components: {
    ListChoice,
    MontantChoice,
    BtnValidate,
    Multiselect
  },
  methods: {
    async fetchMembres() {
      try {
        const membresCollection = collection(db, 'membres')
        const membresSnapshot = await getDocs(membresCollection)
        this.membres = membresSnapshot.docs.map((doc) => ({
          name: doc.data().name // Assurez-vous que "name" est bien une clé dans Firestore
        }))
        this.filteredMembres = this.membres
      } catch (error) {
        console.error('Erreur lors de la récupération des membres :', error)
      }
    },
    // Filtrer et rechercher un membre
    filterMembres() {
      const searchLowerCase = this.searchTerm.toLowerCase()

      // Filtre les membres dont le nom contient le terme de recherche
      this.filteredMembres = this.membres.filter((membre) =>
        membre.toLowerCase().includes(searchLowerCase)
      )
    },

    selectMembre(membre) {
      this.selectedMembre = membre
      this.filteredMembres = [] // Cache la liste après la sélection
      this.searchTerm = '' // Réinitialise le champ de recherche
    },
    // Met à jour le montant de la tournée
    updateMontant(montant) {
      this.montantTournée = montant
    },

    // Met à jour le membre sélectionné
    handleMembreSelect(selectedMembre) {
      this.selectedMembre = selectedMembre
      console.log('Membre sélectionné :', this.selectedMembre)
    },

    async addNewPersonne(nom) {
      try {
        if (!nom) {
          throw new Error('Le nom de la personne est manquant.')
        }

        // Ajouter la nouvelle personne dans Firestore
        const docRef = await addDoc(collection(db, 'membres'), {
          name: nom, // Assurez-vous que le nom est bien passé
          isResp: false
        })

        console.log('Nouveau membre ajouté avec ID:', docRef.id)

        // Ajouter le nouveau membre dans la liste des membres disponibles
        this.membres.push(nom)

        this.selectedMembre = nom

        // Réinitialiser la sélection dans le composant ListChoice
        this.$refs.personSelect.resetSelect()
        this.$refs.personSelect.selectedItem = nom

        alert(`${nom} a été ajouté avec succès !`)
      } catch (error) {
        console.error("Erreur lors de l'ajout d'un nouveau membre :", error)
      }
    },

    // Met à jour le moyen de paiement sélectionné
    handlePaiementSelect(paiement) {
      this.selectedPaiement = paiement
    },
    // Méthode pour enregistrer la tournée dans Firestore
    async saveTournee() {
      if (!this.selectedMembre || !this.montantTournée) {
        alert('Veuillez sélectionner un membre et un montant.')
        return
      }

      try {
        // Ajout de la nouvelle tournée dans Firestore
        const docRef = await addDoc(collection(db, 'tournees'), {
          name: this.selectedMembre.name,
          montant: this.montantTournée,
          paye: this.tourneePayee,
          dette: !this.tourneePayee,
          moyen: this.tourneePayee ? this.selectedPaiement : '',
          date: new Date().toLocaleDateString(),
          ...(this.tourneePayee === false ? { montantDette: this.montantTournée } : {})
        })

        console.log("Document ajouté avec l'ID : ", docRef.id)
        alert('Tournée enregistrée avec succès !')
        this.resetForm()
      } catch (error) {
        console.error("Erreur lors de l'enregistrement de la tournée :", error)
      }
    },
    handleMontantSelection(montant) {
      if (montant == 'Autre') {
        this.isCustomMontant = true
        this.montantTournée = 0
      } else {
        this.isCustomMontant = false
        this.montantTournée = montant
      }
    },
    validateCustomMontant() {
      if (this.customMontant && this.customMontant > 0) {
        this.montantTournée = this.customMontant // Appliquer le montant personnalisé
        this.isCustomMontant = false // Cacher le champ personnalisé après validation
      } else {
        alert('Veuillez entrer un montant valide.')
      }
    },
    // Réinitialiser le formulaire après l'enregistrement
    resetForm() {
      this.$refs.personSelect.resetSelect()
      this.$refs.montantSelect.resetMontant()
    },

    // Retour à la page précédente
    goBack() {
      this.$router.back()
    }
  },
  mounted() {
    this.fetchMembres()
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
main {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.card {
  background-color: #ebeef3;
  width: 95%;
  height: 65vh;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  margin: auto;
  display: flex;
  flex-direction: column;
}
.members {
  margin: 1rem 0;
  font-size: clamp(1rem, 1.5vw, 2rem);
}
.paiement {
  margin-bottom: 1rem;
}
.checkbox {
  margin: auto;
  font-weight: bold;
}
.recap {
  margin: 2rem 0;
}
.recap p:first-child {
  font-weight: bold;
  margin-bottom: 1rem;
}
p span {
  color: #1ab798;
  font-weight: bold;
}
.multi-select {
  width: 80%;
  margin: auto;
}
.modal-other {
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
  background-color: #fff;
  width: 80%;
  border-radius: 10px;
  height: 20%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
}
.modal-other .modal-content h3 {
  font-weight: bold;
  font-size: 1.3rem;
}

.modal-other .modal-content input {
  border: 1px solid black;
  border-radius: 5px;
  width: 80%;
  height: 5vh;
}

.btn-other {
  background-color: #1ab798;
  height: 5vh;
  border-radius: 5px;
  color: #fff;
  width: 80%;
  font-weight: bold;
}
</style>
