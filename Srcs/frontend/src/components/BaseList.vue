<template>
	<div :class="['base-list-section', { 'is-boxed': boxed }]">
	  <h3 v-if="title" class="list-title">{{ title }}</h3>
	  
	  <div :class="['list-container', layout]">
		<slot></slot>
	  </div>
	</div>
  </template>
  
  <script setup>
  defineProps({
	title: {
	  type: String,
	  default: ''
	},
	layout: {
	  type: String,
	  default: 'grid' // Accepts 'grid' (for players) or 'flex' (for spectators)
	},
	boxed: {
	  type: Boolean,
	  default: false // Adds a subtle background box (used for the spectator list)
	}
  });
  </script>
  
  <style scoped>
  .base-list-section {
	margin-bottom: 24px;
  }
  
  .base-list-section.is-boxed {
	padding: 12px;
	background: rgba(0, 0, 0, 0.2);
	border-radius: var(--radius-md);
  }
  
  .list-title {
	margin-bottom: 12px;
	font-size: var(--text-md);
	color: rgba(255, 255, 255, 0.8);
  }
  
  /* Flex Layout (For Spectator Tags) */
  .list-container.flex {
	display: flex;
	flex-wrap: wrap;
	gap: var(--spacing-sm);
  }
  
  /* Grid Layout - iPhone 5S Responsive Magic! */
  .list-container.grid {
	display: grid;
	gap: var(--spacing-sm);
	/* DEFAULT: 1 Column for tiny screens (iPhone 5S, SE) */
	grid-template-columns: 1fr; 
  }
  
  /* 380px is slightly wider than an iPhone 5S. 
	 On anything larger, it snaps back to 2 columns! */
  @media (min-width: 380px) {
	.list-container.grid {
	  grid-template-columns: repeat(2, 1fr);
	}
  }
  </style>