<template>
  <div class="button" @click="handleClick">
    <p>{{ text }}</p>
    <p><font-awesome-icon icon="arrow-right" /></p>
  </div>
</template>

<script>
export default {
  props: {
    text: {
      type: String,
      default: '🍻 Ajoutez une tournée chef !'
    },
    onClickAction: {
      type: Function,
      required: true
    }
  },
  methods: {
    handleClick() {
      this.onClickAction()
    }
  }
}
</script>

<style scoped>
.button {
  width: 80%;
  height: 10vh;
  background-color: #ebeef3;
  border: none;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 0 1rem;
  margin: 1rem;
}
</style>
