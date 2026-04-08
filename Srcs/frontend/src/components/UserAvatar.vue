<template>
	<div class="user-avatar" :class="size">
	  <span class="initials">{{ initials }}</span>
	</div>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  
  const props = defineProps({
	name: {
	  type: String,
	  default: 'Player'
	},
	size: {
	  type: String,
	  default: 'md' // Can be 'sm', 'md', or 'lg'
	}
  });
  
  // Automatically extract the first 1 or 2 letters of the name
  const initials = computed(() => {
	if (!props.name) return '?';
	const parts = props.name.trim().split(' ');
	if (parts.length >= 2) {
	  return (parts[0][0] + parts[1][0]).toUpperCase();
	}
	return props.name.substring(0, 2).toUpperCase();
  });
  </script>
  
  <style scoped>
  .user-avatar {
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: var(--radius-full);
	background:  #0099cc;
	color: var(--text-main);
	font-weight: var(--font-weight-bold);
	box-shadow: 0 4px 10px rgba(0, 212, 255, 0.3);
	border: 2px solid var(--bg-dark-elem-hover, var(--bg-dark-elem-hover, rgba(255, 255, 255, 0.2)));
  }
  
  .user-avatar.sm { width: 32px; height: 32px; font-size: var(--text-xs); }
  .user-avatar.md { width: 48px; height: 48px; font-size: var(--text-lg); }
  .user-avatar.lg { width: 64px; height: 64px; font-size: var(--text-2xl); }
  </style>