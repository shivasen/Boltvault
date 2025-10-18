import { supabase } from '../lib/supabaseClient.js';
import { showToast } from './toast.js';
import { X } from 'lucide-static';

const closeModal = () => {
  document.getElementById('change-password-modal')?.remove();
};

export const handleChangePasswordSubmit = async (e) => {
  e.preventDefault();
  const form = e.target;
  const submitButton = form.querySelector('button[type="submit"]');
  const newPassword = form.new_password.value;
  const confirmPassword = form.confirm_password.value;
  
  if (newPassword !== confirmPassword) {
    showToast('Passwords do not match.', 'error');
    return;
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(newPassword)) {
      showToast('Password must be 8+ characters with uppercase, lowercase, number, and special character.', 'error');
      return;
  }

  submitButton.disabled = true;
  submitButton.innerHTML = `<div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>`;

  try {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    showToast('Password updated successfully!', 'success');
    closeModal();
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Change Password';
  }
};

export function renderChangePasswordModal(container) {
  if (document.getElementById('change-password-modal')) return;

  const modalHtml = `
    <div id="change-password-modal" class="modal-container fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div class="bg-surface rounded-lg p-6 sm:p-8 w-full max-w-md relative animate-fade-in-up">
        <button data-action="close-modal" aria-label="Close change password modal" class="absolute top-4 right-4 text-on-surface hover:text-primary transition-colors">
          <div class="w-6 h-6">${X}</div>
        </button>
        
        <h2 class="text-2xl font-bold text-center text-on-background mb-6">Change Password</h2>
        <form data-form="change-password" class="space-y-4">
          <div>
            <label for="new_password" class="block text-sm font-medium text-on-surface mb-1">New Password</label>
            <input type="password" name="new_password" required class="w-full bg-background border border-surface rounded-md p-2 text-on-background focus:ring-primary focus:border-primary">
            <p class="text-xs text-on-surface/70 mt-1">Min. 8 characters, with uppercase, lowercase, number & special character.</p>
          </div>
          <div>
            <label for="confirm_password" class="block text-sm font-medium text-on-surface mb-1">Confirm New Password</label>
            <input type="password" name="confirm_password" required class="w-full bg-background border border-surface rounded-md p-2 text-on-background focus:ring-primary focus:border-primary">
          </div>
          <button type="submit" class="w-full bg-primary text-background font-bold py-2 rounded-md hover:bg-opacity-90 transition disabled:opacity-50 !mt-6 h-10">Change Password</button>
        </form>
      </div>
    </div>
  `;
  container.innerHTML = modalHtml;
}
