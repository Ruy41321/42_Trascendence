<template>
	<BaseCard class="game-info-panel">
	  
	  <template #header>
		<h3 class="panel-title">Game Info</h3>
	  </template>
  
	  <div class="info-section">
		<h4>How to Play</h4>
		<ul>
		  <li>Each player controls a paddle</li>
		  <li>Bounce the ball to your opponents</li>
		  <li>Score points when opponents miss</li>
		  <li>First to 10 points wins!</li>
		</ul>
	  </div>
	  
	  <hr class="divider" />
  
	  <div class="info-section">
		<h4>Controls</h4>
		<div class="controls-info">
		  <div v-if="myPlayer" class="my-controls">
			<p v-if="['left', 'right'].includes(myPlayer.side)">
			  <strong>↑↓</strong> or <strong>W/S</strong> to move
			</p>
			<p v-else>
			  <strong>←→</strong> or <strong>A/D</strong> to move
			</p>
			<p class="touch-hint">Touch: Drag on canvas to move</p>
		  </div>
		  <div v-else class="all-controls">
			<p><strong>Left/Right paddles:</strong> ↑↓ or W/S</p>
			<p><strong>Top/Bottom paddles:</strong> ←→ or A/D</p>
			<p class="touch-hint">📱Mobile: Drag on canvas to move</p>
		  </div>
		</div>
	  </div>
	  
	  <hr class="divider" />
  
	  <div v-if="gameState" class="info-section">
		<h4>👥 Players</h4>
		<div class="players-list">
		  <div 
			v-for="player in activePlayers" 
			:key="player.id"
			:class="['player-item', { 'me': player.id === myPlayer?.id }]"
		  >
			<span 
			  class="player-indicator" 
			  :style="{ background: PADDLE_COLORS?.[player.side] || '#fff' }"
			></span>
			
			<span class="player-name">
			  {{ player.name || `Player ${player.id + 1}` }}
			  <span v-if="player.id === myPlayer?.id" class="you-tag">(YOU)</span>
			</span>
			<span :class="['player-status', player.connected ? 'online' : 'offline']">
			  {{ player.connected ? '✓' : '✗' }}
			</span>
		  </div>
		</div>
	  </div>
  
	</BaseCard>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  import BaseCard from './BaseCard.vue';
  import { PADDLE_COLORS } from '../config/gameConfig.js'; // Adjust path if needed
  
  // We receive these two objects from the parent game view
  const props = defineProps({
	myPlayer: {
	  type: Object,
	  default: null
	},
	gameState: {
	  type: Object,
	  default: null
	}
  });

  const activePlayers = computed(() => {
    if (!props.gameState?.players) return [];
    return props.gameState.players.filter(p => p.name !== 'Anonymous');
  });
  </script>
  
  <style scoped>
  .panel-title {
	margin: 0;
	color: var(--outline-canvas);
	font-size: var(--text-xl);
  }
  
  .info-section {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-sm);
  }
  
  .info-section h4 {
	margin: 0 0 8px 0;
	color: rgba(255, 255, 255, 0.9);
	font-size: var(--text-md);
	text-transform: uppercase;
	letter-spacing: 1px;
  }
  
  ul {
	margin: 0;
	padding-left: 20px;
	color: rgba(255, 255, 255, 0.7);
	font-size: var(--text-sm);
  }
  
  li { margin-bottom: 4px; }
  
  .divider {
	border: 0;
	height: 1px;
	background: var(--bg-dark-elem);
	margin: 16px 0;
  }
  
  .controls-info p {
	margin: 0 0 8px 0;
	font-size: var(--text-sm);
	color: rgba(255, 255, 255, 0.8);
  }
  
  .touch-hint {
	color: #ffbe0b !important;
	font-style: italic;
  }
  
  .players-list {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-sm);
  }
  
  .player-item {
	display: flex;
	align-items: center;
	padding: var(--spacing-sm) 12px;
	background: var(--shadow-md, var(--shadow-md, rgba(0, 0, 0, 0.3)));
	border-radius: var(--radius-md);
	border: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  .player-item.me {
	border-color: #00ff88;
	background: rgba(0, 255, 136, 0.1);
  }
  
  .player-indicator {
	width: 12px;
	height: 12px;
	border-radius: var(--radius-full);
	margin-right: 12px;
	box-shadow: 0 0 8px currentColor;
  }
  
  .player-name {
	flex-grow: 1;
	font-size: var(--text-sm);
	font-weight: var(--font-weight-bold);
  }
  
  .you-tag {
	color: #00ff88;
	font-size: var(--text-xs);
	margin-left: 4px;
  }
  
  .player-status { font-weight: var(--font-weight-bold); }
  .player-status.online { color: #00ff88; }
  .player-status.offline { color: #ff006e; }
  </style>