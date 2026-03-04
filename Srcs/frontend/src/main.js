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

//PWA: progressive web app
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/worker.js')
      .then(registration => {
        console.log('DEBUG: ServiceWorker registered successfully with scope: ', registration.scope);
      })
      .catch(err => {
        console.log('DEBUG: ServiceWorker registration failed: ', err);
      });
  });
}
