<template>
  <div class="card-choice">
    <select :key="resetKey" v-model="selectedItem" @change="emitSelection">
      <option value="" disabled>{{ text }}</option>
      <option v-for="item in items" :key="item" :value="item">{{ item }}</option>
    </select>
  </div>
</template>

<script>
export default {
  data() {
    return {
      selectedItem: '',
      resetKey: 0
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
    }
  },
  methods: {
    emitSelection() {
      if (this.selectedItem) {
        this.$emit('onSelect', this.selectedItem)
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
