import { X, UserPlus, ImagePlus } from 'lucide-static';

export function renderCreateMenuModal(container) {
  if (document.getElementById('create-menu-modal')) return;

  const modalHtml = `
    <div id="create-menu-modal" class="modal-container fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div class="bg-surface rounded-lg p-6 sm:p-8 w-full max-w-xs relative animate-fade-in-up">
        <button data-action="close-modal" class="absolute top-4 right-4 text-on-surface hover:text-primary transition-colors">
          <div class="w-6 h-6">${X}</div>
        </button>
        
        <h2 class="text-2xl font-bold text-center text-on-background mb-6">Create New</h2>
        <div class="space-y-4">
            <button data-action="show-character-modal" class="w-full flex items-center justify-center bg-background p-4 rounded-lg hover:bg-primary hover:text-background transition-colors">
                <div class="w-6 h-6 mr-3">${UserPlus}</div>
                <span class="font-medium">Character</span>
            </button>
            <button data-action="show-media-modal" class="w-full flex items-center justify-center bg-background p-4 rounded-lg hover:bg-primary hover:text-background transition-colors">
                <div class="w-6 h-6 mr-3">${ImagePlus}</div>
                <span class="font-medium">Media Post</span>
            </button>
        </div>
      </div>
    </div>
  `;
  container.innerHTML = modalHtml;
}
