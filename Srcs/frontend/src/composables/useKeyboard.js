/**
 * KEYBOARD INPUT COMPOSABLE
 * 
 * Handles keyboard input and direction mapping.
 * Each player has their own set of keys.
 * 
 * PATTERN:
 * 1. Register event listeners on keydown/keyup
 * 2. Check if pressed key belongs to our player
 * 3. Translate key → direction ('UP' or 'DOWN')
 * 4. Call callback with direction
 */

import { onUnmounted, ref, watch } from 'vue';
import { GAME_CONFIG } from '../config/gameConfig.js';

export function useKeyboard(playerSideRef, onInput) {
  // Track if listeners are attached
  const isActive = ref(false);
  
  // Map player side → key configuration based on paddle orientation
  // Vertical paddles (left, right): Arrow Up/Down
  // Horizontal paddles (top, bottom): Arrow Left/Right
  const keyMappings = {
    left: GAME_CONFIG.KEYS.VERTICAL,     // Up/Down arrows
    right: GAME_CONFIG.KEYS.VERTICAL,    // Up/Down arrows
    top: GAME_CONFIG.KEYS.HORIZONTAL,    // Left/Right arrows
    bottom: GAME_CONFIG.KEYS.HORIZONTAL, // Left/Right arrows
  };
  
  // Set of currently pressed keys (to prevent repeat)
  const pressedKeys = new Set();

  /**
   * Returns true when the event target is an editable field.
   * In that case game controls must not intercept typed keys.
   */
  function isEditableTarget(target) {
    if (!(target instanceof Element)) return false;

    const editable = target.closest('input, textarea, select, [contenteditable="true"]');
    return Boolean(editable) || target.isContentEditable;
  }
  
  /**
   * Handler keydown
   */
  function handleKeyDown(event) {
    const side = typeof playerSideRef === 'object' ? playerSideRef.value : playerSideRef;
    if (!side) return;

    if (isEditableTarget(event.target)) return;
    
    const code = event.code;
    
    // Prevent default only for game keys
    const allGameKeys = Object.values(keyMappings).flatMap(k => [...k.UP, ...k.DOWN]);
    if (allGameKeys.includes(code)) {
      event.preventDefault();
    }
    
    // Ignore if already pressed (repeat)
    if (pressedKeys.has(code)) return;
    pressedKeys.add(code);
    
    // Get mapping for our player
    const keys = keyMappings[side];
    if (!keys) return;
    
    // Translate code → direction (keys.UP and keys.DOWN are arrays)
    let direction = null;
    if (keys.UP.includes(code)) {
      direction = 'UP';
    } else if (keys.DOWN.includes(code)) {
      direction = 'DOWN';
    }
    
    // If valid key, call callback
    if (direction && onInput) {
      onInput(direction);
    }
  }
  
  /**
   * Handler keyup
   */
  function handleKeyUp(event) {
    const side = typeof playerSideRef === 'object' ? playerSideRef.value : playerSideRef;
    if (!side) return;
    
    const code = event.code;
    const wasPressed = pressedKeys.has(code);
    pressedKeys.delete(code);

    // If the keyup comes from a text field and we were not tracking it,
    // it was normal typing and should not affect gameplay input.
    if (isEditableTarget(event.target) && !wasPressed) return;
    
    // Get mapping for our player
    const keys = keyMappings[side];
    if (!keys) return;
    
    // If it was one of our keys, send null (stop movement)
    if (keys.UP.includes(code) || keys.DOWN.includes(code)) {
      if (!isEditableTarget(event.target)) {
        event.preventDefault();
      }
      if (onInput) {
        onInput(null);
      }
    }
  }
  
  /**
   * Attach listeners
   */
  function attach() {
    if (isActive.value) return;
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    isActive.value = true;
    console.log('⌨️ Keyboard listeners attached');
  }
  
  /**
   * Detach listeners
   */
  function detach() {
    if (!isActive.value) return;
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
    pressedKeys.clear();
    isActive.value = false;
    console.log('⌨️ Keyboard listeners detached');
  }
  
  // If playerSideRef is a ref, watch for changes
  if (typeof playerSideRef === 'object' && playerSideRef.value !== undefined) {
    watch(playerSideRef, (newSide) => {
      if (newSide) {
        attach();
      } else {
        detach();
      }
    }, { immediate: true });
  } else if (playerSideRef) {
    // If it's a direct string value, attach immediately
    attach();
  }
  
  // Cleanup when component unmounts
  onUnmounted(() => {
    detach();
  });
  
  // Return mapping for UI (show keys to player)
  return {
    getKeysForPlayer: (side) => keyMappings[side],
    attach,
    detach,
    isActive,
  };
}
