/**
 * VUE APP ENTRY POINT
 * 
 * Questo è il punto di partenza dell'applicazione Vue.
 * Viene eseguito quando carichi index.html
 */

import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

// Crea e monta app Vue
createApp(App).mount('#app')
