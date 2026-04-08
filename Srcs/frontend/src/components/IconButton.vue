<template>
	<button class="icon-button" @click="$emit('click')">
	  <BaseIcon class="icon-content" :name="icon" />
	</button>
  </template>
  
  <script setup>
  import BaseIcon from './BaseIcon.vue';

  defineProps({
	icon: {
	  type: String,
	  required: true
	}
  });
  defineEmits(['click']);
  </script>
  
  <style scoped>
  .icon-button {
	background: var(--bg-dark-elem);
	border: 1px solid var(--bg-dark-elem-hover, var(--bg-dark-elem-hover, rgba(255, 255, 255, 0.2)));
	border-radius: var(--radius-full);
	width: 44px; /* Big enough for a finger tap */
	height: 44px;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.2s;
	box-shadow: 0 4px 10px var(--shadow-md, var(--shadow-md, rgba(0, 0, 0, 0.3)));
  }
  
  .icon-button:hover {
	background: var(--bg-dark-elem-hover, var(--bg-dark-elem-hover, rgba(255, 255, 255, 0.2)));
	transform: scale(1.05);
  }
  
  .icon-content {
	/* Size in css instead of font-size for icon width/height */
	width: var(--text-xl);
	height: var(--text-xl);
	display: flex;
  }
  </style>