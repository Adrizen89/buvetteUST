<template>
  <button @click="$emit('validate')">Enregistrer</button>
</template>
<script>
export default {
  name: 'BtnValidate'
}
</script>

<style scoped>
button {
  border: none;
  height: 7vh;
  width: 95%;
  background-color: #1ab798;
  margin: auto;
  border-radius: 5px;
  color: #fff;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
}
</style>
