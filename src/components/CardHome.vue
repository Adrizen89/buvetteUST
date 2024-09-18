<template>
  <header>
    <div class="card-home">
      <p>
        {{ totalCollected - totalDet }} €
        <span
          >récolté <br />
          sur
        </span>
        {{ totalCollected }} €
      </p>
      <p>{{ totalDet }} € <span>de dettes</span></p>
    </div>
    <div class="card-consos" @click="openModal">
      <p>
        {{ nbreConsos || '0' }}<br />
        <span>consos restantes</span>
      </p>

      <div class="btns">
        <button @click.stop="decrementConsos" class="btn-action">-</button>
        <button @click.stop="incrementConsos" class="btn-action">+</button>
      </div>
    </div>
  </header>

  <!-- Modale pour entrer le nombre de consos -->
  <div v-if="isModalOpen" class="modal">
    <div class="modal-content">
      <span class="close" @click="closeModal">&times;</span>
      <h2>Modifier le nombre de consos restantes</h2>
      <input v-model="nombreConsos" type="number" placeholder="Entrez un nombre" />
      <button @click="saveConsos">Enregistrer</button>
    </div>
  </div>
</template>

<script>
import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore'
import { db } from '@/firebase/index.js'

export default {
  data() {
    return {
      tournees: [],
      nbreConsos: '',
      nombreConsos: '',
      isModalOpen: false
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
    },
    openModal() {
      this.isModalOpen = true
    },
    closeModal() {
      this.isModalOpen = false
    },
    async fetchConsos() {
      try {
        const consommationsCol = collection(db, 'consommations')
        const consommationsSnap = await getDocs(consommationsCol)

        if (!consommationsSnap.empty) {
          // Si tu veux prendre le premier enregistrement et afficher son nombre
          const consommation = consommationsSnap.docs[0].data().nombre
          this.nbreConsos = consommation

          // Si tu veux additionner toutes les consommations
          // this.nbreConsos = consommationsSnap.docs.reduce((sum, doc) => sum + doc.data().nombre, 0)
        } else {
          this.nbreConsos = 0 // Si aucune consommation trouvée
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des consommations :', error)
      }
    },
    async incrementConsos() {
      this.nbreConsos++
      await this.updateConsos(this.nbreConsos)
    },
    async decrementConsos() {
      if (this.nbreConsos > 0) {
        this.nbreConsos--
        await this.updateConsos(this.nbreConsos)
      }
    },
    async updateConsos(newValue) {
      try {
        const consommationsCollection = collection(db, 'consommations')
        const consommationsSnapshot = await getDocs(consommationsCollection)

        if (!consommationsSnapshot.empty) {
          const consommationDoc = consommationsSnapshot.docs[0]
          const consommationRef = doc(db, 'consommations', consommationDoc.id)
          await updateDoc(consommationRef, {
            nombre: newValue
          })
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour des consos:', error)
      }
    },
    async saveConsos() {
      if (!this.nombreConsos || this.nombreConsos <= 0) {
        alert('Veuillez entrer un nombre valide.')
        return
      }

      try {
        // Rechercher la première entrée dans la collection "consommations"
        const consommationsCollection = collection(db, 'consommations')
        const consommationsSnapshot = await getDocs(consommationsCollection)

        if (!consommationsSnapshot.empty) {
          // Si un enregistrement existe, le mettre à jour
          const consommationDoc = consommationsSnapshot.docs[0] // Prendre le premier enregistrement trouvé
          const consommationRef = doc(db, 'consommations', consommationDoc.id)
          await updateDoc(consommationRef, {
            nombre: this.nombreConsos // Mise à jour du nombre
          })
          alert('Nombre de consos mis à jour avec succès !')
        } else {
          // Si aucun enregistrement trouvé, en créer un nouveau
          const docRef = await addDoc(collection(db, 'consommations'), {
            nombre: this.nombreConsos,
            date: new Date().toLocaleDateString('fr-FR')
          })
          console.log("Nouvelle consommation enregistrée avec l'ID:", docRef.id)
          alert('Nouvelle consommation enregistrée avec succès !')
        }

        // Mettre à jour la valeur affichée dans la card-consos
        this.nbreConsos = this.nombreConsos

        // Réinitialiser les champs et fermer la modale
        this.nombreConsos = ''
        this.closeModal()
      } catch (error) {
        console.error("Erreur lors de l'enregistrement des consos :", error)
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
    this.fetchConsos()
  }
}
</script>

<style scoped>
header {
  display: flex;
  justify-content: space-between;
  align-items: end;
  height: 20vh;
  width: 80%;
}
.card-home {
  width: 55%;
  margin-bottom: 1rem;
  height: 100%;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  background-color: #1ab798;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.card-consos {
  width: 40%;
  height: 100%;
  border-radius: 10px;
  background-color: #1ab798;
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.btns {
  display: flex;
  justify-content: space-around;
  margin-bottom: 1rem;
}

.btn-action {
  color: #354052;
  background-color: #fff;
  width: 25%;
  height: 3vh;
  border-radius: 10px;
  font-weight: bold;
  font-size: 1.2rem;
}

.modal {
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
  height: 30%;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
}
.modal .modal-content input {
  width: 80%;
  height: 5vh;
  border: 1px solid #3c5375;
  border-radius: 10px;
}
.modal .modal-content button {
  background-color: #1ab798;
  width: 80%;
  height: 5vh;
  border-radius: 10px;
  color: #fff;
  font-weight: bold;
}
.modal .modal-content span {
  align-self: flex-end;
  margin-right: 1rem;
  font-size: 2rem;
}

h2 {
  color: #354052;
}

p {
  font-size: 1.5rem;
  font-weight: bold;
  color: #fff;
  margin: auto;
}
p span {
  font-size: clamp(0.9rem, 1.5vw, 1.3rem);
  color: #fff;
}
</style>
