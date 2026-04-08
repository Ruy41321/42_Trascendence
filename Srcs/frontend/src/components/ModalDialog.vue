<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal-box">
        <h3 v-if="title" class="modal-title">{{ title }}</h3>
        
        <div class="modal-body">
          <slot></slot> </div>

        <div class="modal-footer">
          <slot name="footer">
            <button class="btn-cancel" @click="$emit('close')">Cancel</button>
            <button class="btn-confirm" @click="$emit('confirm')">Confirm</button>
          </slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  isOpen: { type: Boolean, default: false },
  title: { type: String, default: 'Confirm Action' }
});

defineEmits(['close', 'confirm']);
</script>


<!-- -->
  <style scoped>
  .modal-backdrop {
	position: fixed;
	top: 0; left: 0; width: 100vw; height: 100vh;
	background: rgba(0, 0, 0, 0.6);
	backdrop-filter: blur(4px);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 9999; /* Ensure it stays on top of everything */
  }
  
  .modal-box {
	background: rgba(20, 20, 30, 0.95);
	border: 1px solid var(--bg-dark-elem);
	border-radius: 16px;
	padding: 24px;
	width: 90%;
	max-width: 400px;
	box-shadow: 0 10px 40px var(--shadow-dark, var(--shadow-dark, rgba(0, 0, 0, 0.5)));
	text-align: center;
  }
  
  .modal-title {
	margin-top: 0;
	color: #ff006e; /* Danger color for titles */
  }
  
  .modal-body {
	margin: 16px 0 24px 0;
	color: rgba(255, 255, 255, 0.8);
  }
  
  .modal-footer {
	display: flex;
	gap: 12px;
	justify-content: center;
  }
  
  .btn-cancel, .btn-confirm {
	padding: 10px 20px;
	border-radius: var(--radius-md);
	border: none;
	font-weight: var(--font-weight-bold);
	cursor: pointer;
  }
  
  .btn-cancel {
	background: var(--bg-dark-elem);
	color: var(--text-main);
  }
  
  .btn-confirm {
	background: #ff006e;
	color: var(--text-main);
  }
  </style>
