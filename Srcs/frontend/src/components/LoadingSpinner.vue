<template>
	<div class="spinner-container" :class="size">
	  <div class="spinner"></div>
	</div>
  </template>
  
  <script setup>
  defineProps({
	size: {
	  type: String,
	  default: 'md' // 'sm', 'md', or 'lg'
	}
  });
  </script>
  
  <style scoped>
  .spinner-container {
	display: flex;
	justify-content: center;
	align-items: center;
  }
  
  .spinner {
	border: 4px solid rgba(255, 255, 255, 0.1);
	border-left-color: #00d4ff; /* Neon blue */
	border-radius: 50%;
	animation: spin 1s linear infinite;
  }
  
  /* Sizes */
  .sm .spinner { width: 20px; height: 20px; border-width: 2px; }
  .md .spinner { width: 40px; height: 40px; border-width: 4px; }
  .lg .spinner { width: 60px; height: 60px; border-width: 6px; }
  
  @keyframes spin {
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
  }
  </style>