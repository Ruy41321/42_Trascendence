<template>
<div class="input-wrapper">
    <label v-if="label" class="input-label">{{ label }}</label>
    <input :type="type" :value="modelValue" :placeholder="placeholder" :class="['base-input', { 'has-error': error }]" @input="$emit('update:modelValue', $event.target.value)"/>
    <span v-if="error" class="error-message">{{ error }}</span>
  </div>
</template>
  
<script setup>
//BaseInput
defineProps({
  // 'modelValue' is a special Vue name that makes 'v-model' work automatically
  modelValue:
  {
    type: String,
    default: ''
  },
  label:
  {
    type: String,
    default: ''
  },
  type:
  {
    type: String,
    default: 'text'
  },
  placeholder:
  {
    type: String,
    default: ''
  },
  error:
  {
    type: String,
    default: ''
  }
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
/*TODO Custom CSS: need to doublecheck  */
.input-wrapper
{
  display: flex;
  flex-direction: column;
  margin-bottom: var(--spacing-md);
  width: 100%;
}

.input-label
{
  margin-bottom: 8px;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: rgba(255, 255, 255, 0.9);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.base-input
{
  width: 100%;
  padding: 12px 16px;
  font-size: var(--text-md);
  color: var(--text-main);
  background: var(--shadow-md, var(--shadow-md, rgba(0, 0, 0, 0.3)));
  border: 2px solid var(--bg-dark-elem-hover, var(--bg-dark-elem-hover, rgba(255, 255, 255, 0.2)));
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
  outline: none;
}

.base-input::placeholder
{
  color: rgba(255, 255, 255, 0.4);
}

/* Focus State (Neon Blue Glow) */
.base-input:focus
{
  border-color: var(--outline-canvas);
  box-shadow: 0 0 15px rgba(0, 212, 255, 0.3);
  background: var(--shadow-dark, var(--shadow-dark, rgba(0, 0, 0, 0.5)));
}

/* Error State (Neon Red Glow) */
.base-input.has-error
{
  border-color: #ff006e;
  box-shadow: 0 0 15px rgba(255, 0, 110, 0.3);
}

.error-message
{
  color: #ff006e;
  font-size: var(--text-xs);
  margin-top: 6px;
  font-weight: var(--font-weight-bold);
}
 </style>