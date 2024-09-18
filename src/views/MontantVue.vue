<template>
  <div id="home">
    <header>
      <h1>🍻 Ajoutez une tournée chef !</h1>
      <button @click="goBack"><font-awesome-icon icon="arrow-left" /></button>
    </header>
    <main>
      <div class="card">
        <!-- Liste des membres -->
        <ListChoice
          ref="personSelect"
          :items="membres"
          text="👤 Choisissez une personne :"
          :allowOther="true"
          @onAddPerson="addNewPersonne"
          @onSelect="handleMembreSelect"
          class="members"
        />

        <!-- Sélection du montant -->
        <MontantChoice
          ref="montantSelect"
          :montants="montantsDisponibles"
          @montant-selected="updateMontant"
        />

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
          <span>{{ selectedMembre }}</span> avec <span>{{ selectedPaiement }}</span> !
        </p>
        <p v-else>
          Une dette de <span>{{ montantTournée }}</span> € est attribuée à
          <span>{{ selectedMembre }}</span> !
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
import { collection, getDocs, addDoc } from 'firebase/firestore'
import { db } from '@/firebase/index'

export default {
  name: 'MontantVue',
  data() {
    return {
      montantTournée: '0', // Valeur par défaut du montant
      selectedMembre: '', // Valeur par défaut pour le membre
      selectedPaiement: '', // Valeur par défaut pour le moyen de paiement
      tourneePayee: false,
      membres: [],
      moyensPaiement: ['Lydia', 'Paylib', 'Espèces'],
      montantsDisponibles: [2, 5, 10, 20, 30, 40, 50, 60]
    }
  },
  components: {
    ListChoice,
    MontantChoice,
    BtnValidate
  },
  methods: {
    async fetchMembres() {
      try {
        const membresCollection = collection(db, 'membres')
        const membresSnapshot = await getDocs(membresCollection)
        this.membres = membresSnapshot.docs.map((doc) => doc.data().name) // Assurez-vous que "name" existe dans Firestore
      } catch (error) {
        console.error('Erreur lors de la récupération des membres :', error)
      }
    },
    // Met à jour le montant de la tournée
    updateMontant(montant) {
      this.montantTournée = montant
    },

    // Met à jour le membre sélectionné
    handleMembreSelect(membre) {
      this.selectedMembre = membre
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
          name: this.selectedMembre,
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
</style>
