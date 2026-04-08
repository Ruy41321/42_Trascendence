<template>
  <div class="auth-container">
    <BaseCard>
      <template #header>
        <h2 class="auth-title">{{ isSignupMode ? 'Create Account' : 'Login' }}</h2>
        <p class="auth-subtitle">Use your account to enter the lobby</p>
      </template>

      <div class="mode-switch">
        <BaseButton
          variant="primary"
          :disabled="isSignupMode"
          @click="switchMode(true)">
          Signup
        </BaseButton>
        <BaseButton
          variant="secondary"
          :disabled="!isSignupMode"
          @click="switchMode(false)">
          Login
        </BaseButton>
      </div>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <BaseInput
          v-if="isSignupMode"
          v-model="signupForm.username"
          label="Username"
          placeholder="Your username"
          :error="formErrors.username" />

        <BaseInput
          v-model="emailModel"
          label="Email"
          type="email"
          placeholder="your@email.com"
          :error="formErrors.email" />

        <BaseInput
          v-model="passwordModel"
          label="Password"
          type="password"
          placeholder="At least 8 characters"
          :error="formErrors.password" />

        <BaseInput
          v-if="isSignupMode"
          v-model="signupForm.confirmPassword"
          label="Confirm Password"
          type="password"
          placeholder="Repeat your password"
          :error="formErrors.confirmPassword" />

        <GameBadge v-if="backendError" variant="warning" class="auth-error">
          {{ backendError }}
        </GameBadge>

        <BaseButton variant="primary" :disabled="loading" @click="handleSubmit">
          {{ loading ? 'Please wait...' : (isSignupMode ? 'Create Account' : 'Login') }}
        </BaseButton>
      </form>

      <template #footer>
        <p>{{ isSignupMode ? 'Already have an account?' : 'Need an account?' }}</p>
        <button class="footer-toggle" type="button" @click="isSignupMode = !isSignupMode">
          {{ isSignupMode ? 'Go to Login' : 'Go to Signup' }}
        </button>
        <button v-if="showBackButton" class="footer-toggle back" type="button" @click="emit('back')">
          Back to Lobby
        </button>
      </template>
    </BaseCard>
  </div>
</template>

<script setup>
import { reactive, ref, computed, watch } from 'vue';
import BaseCard from './BaseCard.vue';
import BaseInput from './BaseInput.vue';
import BaseButton from './BaseButton.vue';
import GameBadge from './GameBadge.vue';

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  backendError: {
    type: String,
    default: null,
  },
  showBackButton: {
    type: Boolean,
    default: false,
  },
  resetKey: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(['login', 'signup', 'back']);

const isSignupMode = ref(false);

const loginForm = reactive({
  email: '',
  password: '',
});

const signupForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
});

const formErrors = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
});

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const emailModel = computed({
  get() {
    return isSignupMode.value ? signupForm.email : loginForm.email;
  },
  set(value) {
    if (isSignupMode.value) {
      signupForm.email = value;
      return;
    }
    loginForm.email = value;
  },
});

const passwordModel = computed({
  get() {
    return isSignupMode.value ? signupForm.password : loginForm.password;
  },
  set(value) {
    if (isSignupMode.value) {
      signupForm.password = value;
      return;
    }
    loginForm.password = value;
  },
});

function resetErrors() {
  formErrors.username = '';
  formErrors.email = '';
  formErrors.password = '';
  formErrors.confirmPassword = '';
}

function switchMode(signup) {
  isSignupMode.value = signup;
  resetErrors();
}

watch(
  () => props.resetKey,
  () => {
    isSignupMode.value = false;
    resetErrors();
  }
);

function validate() {
  resetErrors();

  const email = String(emailModel.value || '').trim().toLowerCase();
  const password = String(passwordModel.value || '');

  if (!emailRegex.test(email)) {
    formErrors.email = 'Insert a valid email';
  }

  if (!password || password.length < 8) {
    formErrors.password = 'Password must be at least 8 characters';
  }

  if (isSignupMode.value) {
    const username = String(signupForm.username || '').trim();

    if (username.length < 3) {
      formErrors.username = 'Username must be at least 3 characters';
    }

    if (password !== signupForm.confirmPassword) {
      formErrors.confirmPassword = 'Passwords do not match';
    }
  }

  return Object.values(formErrors).every((entry) => !entry);
}

function handleSubmit() {
  if (!validate() || props.loading) return;

  if (isSignupMode.value) {
    emit('signup', {
      username: signupForm.username,
      email: signupForm.email,
      password: signupForm.password,
    });
    return;
  }

  emit('login', {
    email: loginForm.email,
    password: loginForm.password,
  });
}
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 460px;
  width: 100%;
  padding: var(--spacing-lg);
}

.auth-title {
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.auth-subtitle {
  opacity: 0.8;
  font-size: var(--text-sm);
}

.mode-switch {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.auth-error {
  width: 100%;
}

.footer-toggle {
  margin-top: 8px;
  border: none;
  background: transparent;
  color: var(--outline-canvas);
  cursor: pointer;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-bold);
}

.footer-toggle.back {
  color: rgba(255, 255, 255, 0.9);
}

@media (max-width: 768px) {
  .auth-container {
    padding: 10px;
    min-height: auto;
  }

  .mode-switch {
    grid-template-columns: 1fr;
  }
}
</style>
