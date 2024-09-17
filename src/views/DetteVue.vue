<template>
  <div id="home">
    <header>
      <h1>💳 Payez une Dette !</h1>
      <button class="btnBack" @click="goBack"><font-awesome-icon icon="arrow-left" /></button>
    </header>
    <main>
      <div class="card">
        <!-- Liste des dettes par membre -->
        <div class="card-dette">
          <label for="personne">👤 Choississez une dette :</label>
          <select v-model="selectedPersonne" @change="updateMontantsDisponibles">
            <option v-for="personne in personnesAvecDette" :key="personne.name" :value="personne">
              {{ personne.name }} ({{ personne.montantDette }}€ de dette)
            </option>
          </select>
        </div>

        <montant-choice
          :montants="montantsDisponibles"
          @montant-selected="handleMontantSelection"
        ></montant-choice>

        <!-- Liste des moyens de paiement -->
        <ListChoice
          :items="moyensPaiement"
          text="💳 Choisissez un moyen de paiement :"
          @onSelect="handlePaiementSelect"
        />
      </div>

      <!-- Récapitulatif -->
      <div class="recap">
        <p>🍻 Récapitulatif :</p>
        <p v-if="montantTournée && nomPersonne && moyenPaiement">
          Une dette de <span>{{ montantTournée }}€</span> est remboursée par
          <span>{{ nomPersonne }}</span> avec <span>{{ moyenPaiement }}</span> !
        </p>
        <p v-else>
          Sélectionnez une personne, un montant et un moyen de paiement pour voir le récapitulatif.
        </p>
      </div>

      <!-- Bouton de validation -->
      <BtnValidate @validate="saveTournee" />
    </main>
  </div>
</template>

<script>
import MontantChoice from '../components/MontantChoice.vue'
import ListChoice from '../components/ListChoice.vue'
import BtnValidate from '../components/BtnValidate.vue'
import { collection, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase/index.js'

export default {
  components: {
    MontantChoice,
    ListChoice,
    BtnValidate
  },
  data() {
    return {
      tournees: [],
      selectedPersonne: null,
      montantsDisponibles: [],
      montantTournée: null,
      moyenPaiement: null,
      moyensPaiement: ['Lydia', 'Espèces', 'Paylib'],
      nomPersonne: null,
      selectedTourneeId: null // Stocker l'ID de la tournée sélectionnée
    }
  },
  computed: {
    // Filtrer les personnes ayant des dettes
    personnesAvecDette() {
      return this.tournees.filter((tournee) => tournee.dette)
    }
  },
  methods: {
    // Récupérer les tournées depuis Firestore
    async fetchTournees() {
      try {
        const tourneesCollection = collection(db, 'tournees')
        const tourneesSnapshot = await getDocs(tourneesCollection)
        this.tournees = tourneesSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id // Ajouter l'ID de chaque tournée pour référence
        }))
      } catch (error) {
        console.error('Erreur lors de la récupération des tournées :', error)
      }
    },
    updateMontantsDisponibles() {
      if (this.selectedPersonne) {
        // Liste des montants possibles
        const possibleMontants = [2, 5, 10, 20, 30, 40, 50, 60]

        // Utiliser montantDette si la dette est active
        const montantRestant = parseInt(
          this.selectedPersonne.montantDette || this.selectedPersonne.montant
        )

        // Filtrer les montants disponibles en fonction de la dette restante
        this.montantsDisponibles = possibleMontants.filter((montant) => montant <= montantRestant)

        // Mettre à jour l'ID de la tournée sélectionnée
        this.selectedTourneeId = this.selectedPersonne.id // Assigner l'ID de la tournée
        this.nomPersonne = this.selectedPersonne.name // Met à jour le nom de la personne pour le récapitulatif
      }
    },
    handleMontantSelection(montant) {
      this.montantTournée = montant
    },
    handlePaiementSelect(moyen) {
      this.moyenPaiement = moyen
    },
    // Méthode pour sauvegarder les modifications de la tournée dans Firestore
    async saveTournee() {
      // Vérifier que toutes les informations nécessaires sont présentes
      if (
        !this.selectedPersonne ||
        !this.montantTournée ||
        !this.moyenPaiement ||
        !this.selectedTourneeId
      ) {
        alert(
          'Veuillez sélectionner une personne, un montant, un moyen de paiement et une tournée valide.'
        )
        return
      }

      try {
        // Vérification supplémentaire pour s'assurer que selectedTourneeId est valide
        if (!this.selectedTourneeId) {
          console.error('ID de la tournée manquant.')
          return
        }

        // Récupérer la tournée sélectionnée depuis Firestore
        const tourneeRef = doc(db, 'tournees', this.selectedTourneeId)
        const tourneeDoc = await getDoc(tourneeRef)

        if (tourneeDoc.exists()) {
          const tourneeData = tourneeDoc.data()
          const montantDette = parseFloat(tourneeData.montantDette) // Montant de la dette restante
          const montantPayé = parseFloat(this.montantTournée) // Montant payé par l'utilisateur

          // Calcul de la différence
          const difference = montantDette - montantPayé

          if (difference <= 0) {
            await updateDoc(tourneeRef, {
              montantDette: 0, // La dette est entièrement payée
              moyen: this.moyenPaiement,
              paye: true, // Marquer comme payé
              dette: false, // La dette est effacée
              date: new Date().toLocaleDateString('fr-FR') // Ajouter la date actuelle
            })
            alert('Dette entièrement remboursée et mise à jour avec succès !')
          } else {
            await updateDoc(tourneeRef, {
              montantDette: difference.toFixed(2), // Mettre à jour la dette restante
              moyen: this.moyenPaiement,
              paye: false, // La dette n'est pas encore entièrement payée
              dette: true, // La dette reste active
              date: new Date().toLocaleDateString('fr-FR') // Ajouter la date actuelle
            })
            alert('Il reste ${difference.toFixed(2)}€ à payer sur la dette.')
          }

          // Réinitialiser le formulaire après la mise à jour
          this.resetForm()
        } else {
          console.error("La tournée sélectionnée n'existe pas.")
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la tournée :', error)
      }
    },
    goBack() {
      this.$router.back()
    }
  },
  mounted() {
    this.fetchTournees() // Récupérer les tournées dès que le composant est monté
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
  height: 60vh;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  margin: auto;
  display: flex;
  flex-direction: column;
}
.card-dette {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 2rem;
}
select {
  width: 80%;
  height: 7vh;
  border: none;
  border-radius: 5px;
  color: #354052;
  font-weight: bold;
  text-align: center;
  font-size: 1.1rem;
  margin: 1rem 0;
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
