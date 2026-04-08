<template>
	<div :class="['game-badge', variant]">
	  <slot></slot>
	</div>
  </template>
  
  <script setup>
  defineProps({
	variant: {
	  type: String,
	  default: 'info', // Can be 'success' (green), 'warning' (yellow), 'danger' (red)
	}
  });
  </script>
  
  <style scoped>
  .game-badge {
	display: inline-block;
	padding: var(--spacing-sm) 16px;
	border-radius: 20px;
	font-size: var(--text-sm);
	text-align: center;
  }
  
  /* Success Variant (Green - for "Ready") */
  .game-badge.success {
	background: rgba(0, 255, 136, 0.2);
	color: #00ff88;
	border: 1px solid #00ff88;
  }
  
  /* Warning Variant (Yellow - for "Spectator") */
  .game-badge.warning {
	background: rgba(255, 190, 11, 0.2);
	color: #ffbe0b;
	border: 1px solid #ffbe0b;
  }
  
  /* Info Variant (Blue - default) */
  .game-badge.info {
	background: rgba(0, 212, 255, 0.2);
	color: var(--outline-canvas);
	border: 1px solid var(--outline-canvas);
  }
  </style>