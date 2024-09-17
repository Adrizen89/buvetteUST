import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons'

library.add(faArrowLeft, faArrowRight)

// Crée l'application Vue et configure VueFire
const app = createApp(App)

// Utilise le router Vue
app.use(router)
app.component('font-awesome-icon', FontAwesomeIcon)

// Monte l'application
app.mount('#app')
