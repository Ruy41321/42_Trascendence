/**
 * KEYBOARD INPUT COMPOSABLE
 * 
 * Gestisce input da tastiera e mappatura a direzioni.
 * Ogni player ha il suo set di tasti.
 * 
 * PATTERN:
 * 1. Registra event listener su keydown/keyup
 * 2. Controlla se tasto premuto appartiene al nostro player
 * 3. Traduce tasto → direzione ('UP' o 'DOWN')
 * 4. Chiama callback con direzione
 */

import { onMounted, onUnmounted } from 'vue';
import { GAME_CONFIG } from '../config/gameConfig.js';

export function useKeyboard(myPlayerSide, onInput) {
  // Mappa side player → configurazione tasti
  const keyMappings = {
    left: GAME_CONFIG.KEYS.PLAYER_1,
    top: GAME_CONFIG.KEYS.PLAYER_2,
    right: GAME_CONFIG.KEYS.PLAYER_3,
    bottom: GAME_CONFIG.KEYS.PLAYER_4,
  };
  
  // Set dei tasti attualmente premuti (per evitare repeat)
  const pressedKeys = new Set();
  
  /**
   * Handler keydown
   */
  function handleKeyDown(event) {
    if (!myPlayerSide) return;
    
    const code = event.code;
    
    // Previeni default solo per tasti di gioco
    const allGameKeys = Object.values(keyMappings).flatMap(k => [k.UP, k.DOWN]);
    if (allGameKeys.includes(code)) {
      event.preventDefault();
    }
    
    // Ignora se già premuto (repeat)
    if (pressedKeys.has(code)) return;
    pressedKeys.add(code);
    
    // Ottieni mapping per il nostro player
    const keys = keyMappings[myPlayerSide];
    if (!keys) return;
    
    // Traduci code → direction
    let direction = null;
    if (code === keys.UP) {
      direction = 'UP';
    } else if (code === keys.DOWN) {
      direction = 'DOWN';
    }
    
    // Se tasto valido, chiama callback
    if (direction) {
      onInput(direction);
    }
  }
  
  /**
   * Handler keyup
   */
  function handleKeyUp(event) {
    if (!myPlayerSide) return;
    
    const code = event.code;
    pressedKeys.delete(code);
    
    // Ottieni mapping per il nostro player
    const keys = keyMappings[myPlayerSide];
    if (!keys) return;
    
    // Se era uno dei nostri tasti, invia null (stop movimento)
    if (code === keys.UP || code === keys.DOWN) {
      event.preventDefault();
      onInput(null);
    }
  }
  
  // Attach listeners quando component monta
  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
  });
  
  // Cleanup quando unmonta
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
  });
  
  // Ritorna mapping per UI (mostra tasti al player)
  return {
    getKeysForPlayer: (side) => keyMappings[side],
  };
}
