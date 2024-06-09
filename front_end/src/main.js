import { createApp } from 'vue';
import App from './App.vue';
import PrimeVue from 'primevue/config';
import Tooltip from 'primevue/tooltip';
import 'primevue/resources/themes/saga-blue/theme.css';  // tema de sua escolha
import 'primevue/resources/primevue.min.css';           // estilos principais do PrimeVue
import 'primeicons/primeicons.css';                     // ícones

const app = createApp(App);

app.use(PrimeVue);
app.directive('tooltip', Tooltip);

app.mount('#app');