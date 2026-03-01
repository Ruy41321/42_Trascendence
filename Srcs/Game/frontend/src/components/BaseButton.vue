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
/* Custom CSS: need to double check */
.base-button
{
  padding: 13px 26px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Primary Variant (Neon Blue) */
.base-button.primary
{
  background:  #0099cc;
  color: white;
  box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);
}
.base-button.primary:hover:not(:disabled)
{
  transform: translateY(-4px);
  box-shadow: 0 6px 20px rgba(0, 212, 255, 0.5);
}

/* Secondary Variant (Dark/Outlined) */
.base-button.secondary
{
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
}
.base-button.secondary:hover:not(:disabled)
{
  background: rgba(255, 255, 255, 0.2);
  border-color: #00d4ff;
}

/* Disabled State */
.base-button:disabled
{
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
 </style>