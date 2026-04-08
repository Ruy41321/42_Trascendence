<template>
<button
	:class="['base-button', variant]" :disabled="disabled" @click="$emit('click')">
    <slot>

	</slot>
</button>
</template>
  
<script setup>
//BaseButton
// DEFINE PROPS: what data this component can receive from the outside.
defineProps({
  variant:
  {
    type: String,
    default: 'primary',
  },

  disabled:
  {
    type: Boolean,
    default: false,
  }
});

// defineEmits tells Vue what events this component can broadcast to the outside.
defineEmits(['click']);
</script>


<style scoped>
/* TODO Custom CSS: need to double check */
.base-button
{
  padding: 13px 26px;
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Primary Variant TODO:check colors */
.base-button.primary
{
  background: var(--color-primary);
  color: var(--color-primary-light);
  box-shadow: 0 4px 15px var(--color-primary-shadow);
}
.base-button.primary:hover:not(:disabled)
{
  transform: translateY(-4px);
  box-shadow: 0 6px 20px var(--color-primary-hover-shadow);
}

/* Secondary Variant TODO:check colors */
.base-button.secondary
{
  background: var(--color-secondary);
  color: var(--text-main);
  border: 5px solid var(--bg-dark-elem-active, rgba(255, 255, 255, 0.3));
}
.base-button.secondary:hover:not(:disabled)
{
  background: var(--color-secondary-hover);
  border-color: var(--color-secondary-border);
}

/* Disabled State */
.base-button:disabled
{
  opacity: 0.3;
  cursor: not-allowed;
  transform: none;
}
 </style>