<template>
	<button class="icon-button" @click="$emit('click')">
	  <span class="icon-content">{{ icon }}</span>
	</button>
  </template>
  
  <script setup>
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
	background: rgba(255, 255, 255, 0.1);
	border: 1px solid rgba(255, 255, 255, 0.2);
	border-radius: 50%;
	width: 44px; /* Big enough for a finger tap */
	height: 44px;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.2s;
	box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  }
  
  .icon-button:hover {
	background: rgba(255, 255, 255, 0.2);
	transform: scale(1.05);
  }
  
  .icon-content {
	font-size: 20px;
  }
  </style>