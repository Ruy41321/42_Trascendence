<template>
<div class="base-card">
    <div v-if="$slots.header" class="card-header">
      <slot name="header"></slot>
    </div>
    <div class="card-body">
      <slot></slot>
    </div>
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>
  
<script setup>
//BaseCard
</script>

<style scoped>
/*TODO Custom CSS: need to double check */
.base-card {
  /* Glassmorphism Effect */
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px); /* Safari support */
  
  /* Borders & Shadows */
  border: 1px solid var(--bg-dark-elem);
  border-radius: 16px;
  box-shadow: 0 8px 32px var(--shadow-md, var(--shadow-md, rgba(0, 0, 0, 0.3)));
  
  /* Layout */
  width: 100%;
  max-width: 450px; /* Perfect width for a login form */
  margin: 0 auto;
  overflow: hidden; /* Ensures child elements don't spill over the rounded corners */
  display: flex;
  flex-direction: column;
}

/* Header Section */
.card-header {
  padding: var(--spacing-lg) 24px;
  border-bottom: 1px solid var(--bg-dark-elem);
  background: rgba(0, 0, 0, 0.2); /* Slightly darker to stand out */
  text-align: center;
}

/* Body Section */
.card-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md); /* Adds space between inputs automatically */
}

/* Footer Section */
.card-footer {
  padding: var(--spacing-md) 24px;
  border-top: 1px solid var(--bg-dark-elem);
  background: rgba(0, 0, 0, 0.2);
  text-align: center;
  font-size: var(--text-sm);
}
 </style>