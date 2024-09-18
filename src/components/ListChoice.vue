<template>
  <div class="card-choice">
    <select :key="resetKey" v-model="selectedItem" @change="emitSelection">
      <option value="" disabled>{{ text }}</option>
      <option v-for="item in items" :key="item" :value="item">{{ item }}</option>
      <!-- Afficher "Autre" uniquement si la prop allowOther est à true -->
      <option v-if="allowOther" value="other">Autre</option>
    </select>
    <div class="addingNew" v-if="isAddingNew">
      <input type="text" v-model="newPersonName" placeholder="Ajouter une nouvelle personne" />
      <button class="btnAddNew" @click="addNewPerson">Ajouter</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      selectedItem: '',
      resetKey: 0,
      isAddingNew: false,
      newPersonName: ''
    }
  },
  props: {
    items: {
      type: Array,
      required: true
    },
    text: {
      type: String,
      required: true
    },
    allowOther: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    emitSelection() {
      if (this.selectedItem == 'other') {
        this.isAddingNew = true
      } else {
        this.$emit('onSelect', this.selectedItem)
      }
    },
    addNewPerson() {
      if (this.newPersonName) {
        this.$emit('onAddPerson', this.newPersonName)
        this.newPersonName = ''
        this.isAddingNew = false
      } else {
        alert('Veuillez entrer un nom !')
      }
    },
    resetSelect() {
      this.selectedItem = ''
      this.resetKey += 1
    }
  }
}
</script>

<style scoped>
.card-choice {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.addingNew {
  width: 80%;
  height: 5vh;
  margin-top: 1rem;
  display: flex;
  justify-content: space-around;
}
.addingNew input {
  width: 50%;
  height: 100%;
  border-radius: 5px;
}
.btnAddNew {
  width: 30%;
  background-color: #1ab798;
  height: 100%;
  border-radius: 5px;
  color: #fff;
  font-weight: bold;
}
select {
  width: 80%;
  height: 7vh;
  border: none;
  border-radius: 5px;
  color: #354052;
  font-weight: bold;
  text-align: center;
  font-size: clamp(1rem, 1.5vw, 2rem);
  margin-top: 1rem;
}
</style>
