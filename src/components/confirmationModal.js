import { X, AlertTriangle } from 'lucide-static';

const closeModal = () => {
  document.getElementById('confirmation-modal')?.remove();
};

/**
 * Renders a confirmation modal for sensitive actions.
 * @param {object} options - The options for the modal.
 * @param {string} options.title - The title of the modal.
 * @param {string} options.message - The confirmation message.
 * @param {string} [options.confirmText='Confirm'] - The text for the confirm button.
 * @param {Function} options.onConfirm - The async function to call when confirmed.
 */
export function renderConfirmationModal({ title, message, confirmText = 'Confirm', onConfirm }) {
  if (document.getElementById('confirmation-modal')) return;

  const modalHtml = `
    <div id="confirmation-modal" class="modal-container fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4">
      <div class="bg-surface rounded-lg p-6 sm:p-8 w-full max-w-sm relative animate-fade-in-up">
        <button data-action="close-modal" aria-label="Close confirmation" class="absolute top-4 right-4 text-on-surface hover:text-primary transition-colors">
          <div class="w-6 h-6">${X}</div>
        </button>
        
        <div class="text-center">
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-500/10 mb-4">
                <div class="w-6 h-6 text-red-400">${AlertTriangle}</div>
            </div>
            <h3 class="text-lg font-medium leading-6 text-on-background">${title}</h3>
            <div class="mt-2">
                <p class="text-sm text-on-surface">${message}</p>
            </div>
        </div>

        <div class="mt-6 flex justify-end gap-3">
            <button data-action="close-modal" type="button" class="bg-background text-on-surface font-bold py-2 px-4 rounded-md hover:bg-opacity-90 transition">
                Cancel
            </button>
            <button id="confirm-action-btn" type="button" class="bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700 transition disabled:opacity-50">
                ${confirmText}
            </button>
        </div>
      </div>
    </div>
  `;
  document.getElementById('modal-container').insertAdjacentHTML('beforeend', modalHtml);

  const confirmBtn = document.getElementById('confirm-action-btn');
  confirmBtn.addEventListener('click', async () => {
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = `
      <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
    `;
    try {
      await onConfirm();
    } finally {
      // The onConfirm function should handle closing the modal if it's part of a chain
    }
  });
}
