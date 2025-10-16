import { supabase } from '../lib/supabaseClient.js';
import { X } from 'lucide-static';

const closeModal = () => {
  document.getElementById('auth-modal')?.remove();
};

export const handleAuthFormSubmit = async (e, isSignUp) => {
  e.preventDefault();
  const form = e.target;
  const email = form.email.value;
  const password = form.password.value;
  const messageEl = form.querySelector('.message');
  messageEl.textContent = '';
  messageEl.classList.remove('text-red-400', 'text-green-400', 'text-yellow-400');
  form.querySelector('button[type="submit"]').disabled = true;

  try {
    let response;
    if (isSignUp) {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            throw new Error('Password must be 8+ characters with uppercase, lowercase, number, and special character.');
        }
        response = await supabase.auth.signUp({ email, password });
        if (response.error) throw response.error;
        if (response.data.user && response.data.user.identities && response.data.user.identities.length === 0) {
            messageEl.textContent = 'A user with this email already exists. Please try logging in.';
            messageEl.classList.add('text-yellow-400');
        } else if (response.data.user) {
            messageEl.textContent = 'Success! Please check your email to confirm your account.';
            messageEl.classList.add('text-green-400');
            form.reset();
        }
    } else {
        response = await supabase.auth.signInWithPassword({ email, password });
        if (response.error) throw response.error;
        closeModal();
    }
  } catch (error) {
    messageEl.textContent = error.message;
    messageEl.classList.add('text-red-400');
  } finally {
    form.querySelector('button[type="submit"]').disabled = false;
  }
};

export const renderLoginForm = () => {
  const container = document.getElementById('auth-form-container');
  if (!container) return;
  container.innerHTML = `
    <h2 class="text-2xl font-bold text-center text-on-background mb-6">Log In</h2>
    <form data-form="login" class="space-y-4">
      <div>
        <label for="email" class="block text-sm font-medium text-on-surface mb-1">Email</label>
        <input type="email" name="email" required class="w-full bg-background border border-surface rounded-md p-2 text-on-background focus:ring-primary focus:border-primary">
      </div>
      <div>
        <label for="password" class="block text-sm font-medium text-on-surface mb-1">Password</label>
        <input type="password" name="password" required class="w-full bg-background border border-surface rounded-md p-2 text-on-background focus:ring-primary focus:border-primary">
      </div>
      <p class="message text-sm text-center h-4"></p>
      <button type="submit" class="w-full bg-primary text-background font-bold py-2 rounded-md hover:bg-opacity-90 transition disabled:opacity-50">Log In</button>
    </form>
    <div class="text-center mt-4">
      <p class="text-sm text-on-surface">
        Don't have an account? <a href="#" data-action="show-signup-form" class="font-medium text-primary hover:underline">Sign up</a>
      </p>
    </div>
  `;
};

export const renderSignUpForm = () => {
    const container = document.getElementById('auth-form-container');
    if (!container) return;
    container.innerHTML = `
      <h2 class="text-2xl font-bold text-center text-on-background mb-6">Sign Up</h2>
      <form data-form="signup" class="space-y-4">
        <div>
          <label for="email" class="block text-sm font-medium text-on-surface mb-1">Email</label>
          <input type="email" name="email" required class="w-full bg-background border border-surface rounded-md p-2 text-on-background focus:ring-primary focus:border-primary">
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-on-surface mb-1">Password</label>
          <input type="password" name="password" required class="w-full bg-background border border-surface rounded-md p-2 text-on-background focus:ring-primary focus:border-primary">
          <p class="text-xs text-on-surface/70 mt-1">Min. 8 characters, with uppercase, lowercase, number & special character.</p>
        </div>
        <p class="message text-sm text-center h-4"></p>
        <button type="submit" class="w-full bg-primary text-background font-bold py-2 rounded-md hover:bg-opacity-90 transition disabled:opacity-50">Sign Up</button>
      </form>
      <div class="text-center mt-4">
        <p class="text-sm text-on-surface">
          Already have an account? <a href="#" data-action="show-login-form" class="font-medium text-primary hover:underline">Log in</a>
        </p>
      </div>
    `;
};

export function renderAuthModal(container) {
  if (document.getElementById('auth-modal')) return;

  const modalHtml = `
    <div id="auth-modal" class="modal-container fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div class="bg-surface rounded-lg p-6 sm:p-8 w-full max-w-sm relative animate-fade-in-up">
        <button data-action="close-modal" aria-label="Close authentication modal" class="absolute top-4 right-4 text-on-surface hover:text-primary transition-colors">
          <div class="w-6 h-6">${X}</div>
        </button>
        
        <div id="auth-form-container">
          <!-- Login form will be injected here initially -->
        </div>
      </div>
    </div>
  `;
  container.innerHTML = modalHtml;

  renderLoginForm();
}
