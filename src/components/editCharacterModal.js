import { getCharacterById, updateCharacter } from '../lib/dataService.js';
import { showToast } from './toast.js';
import { X } from 'lucide-static';

const closeModal = () => {
  document.getElementById('edit-character-modal')?.remove();
};

export const handleEditCharacterFormSubmit = async (e, characterId) => {
  e.preventDefault();
  const form = e.target;
  const submitButton = form.querySelector('button[type="submit"]');
  
  submitButton.disabled = true;
  submitButton.innerHTML = `<div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>`;

  const formData = new FormData(form);
  const characterData = {
    name: formData.get('name'),
    profile_picture_url: formData.get('profile_picture_url'),
    bio: formData.get('bio'),
  };

  try {
    await updateCharacter(characterId, characterData);
    showToast('Character updated successfully!', 'success');
    document.dispatchEvent(new CustomEvent('datachanged'));
    closeModal();
  } catch (error) {
    showToast(error.message, 'error');
    submitButton.disabled = false;
    submitButton.textContent = 'Save Changes';
  }
};

export async function renderEditCharacterModal(container, characterId) {
  if (document.getElementById('edit-character-modal')) return;

  container.innerHTML = `<div class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"><div class="text-white">Loading character...</div></div>`;

  try {
    const character = await getCharacterById(characterId);

    const modalHtml = `
      <div id="edit-character-modal" class="modal-container fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div class="bg-surface rounded-lg p-6 sm:p-8 w-full max-w-md relative animate-fade-in-up">
          <button data-action="close-modal" aria-label="Close edit character modal" class="absolute top-4 right-4 text-on-surface hover:text-primary transition-colors">
            <div class="w-6 h-6">${X}</div>
          </button>
          
          <h2 class="text-2xl font-bold text-center text-on-background mb-6">Edit Character</h2>
          <form data-form="edit-character" data-id="${characterId}" class="space-y-4">
            <div>
              <label for="name" class="block text-sm font-medium text-on-surface mb-1">Character Name</label>
              <input type="text" name="name" required value="${character.name}" class="w-full bg-background border border-surface rounded-md p-2 text-on-background focus:ring-primary focus:border-primary">
            </div>
            <div>
              <label for="profile_picture_url" class="block text-sm font-medium text-on-surface mb-1">Profile Picture URL</label>
              <input type="url" name="profile_picture_url" value="${character.profile_picture_url || ''}" placeholder="https://example.com/image.png" class="w-full bg-background border border-surface rounded-md p-2 text-on-background focus:ring-primary focus:border-primary">
            </div>
            <div>
              <label for="bio" class="block text-sm font-medium text-on-surface mb-1">Bio</label>
              <textarea name="bio" rows="3" class="w-full bg-background border border-surface rounded-md p-2 text-on-background focus:ring-primary focus:border-primary">${character.bio || ''}</textarea>
            </div>
            <button type="submit" class="w-full bg-primary text-background font-bold py-2 rounded-md hover:bg-opacity-90 transition disabled:opacity-50 !mt-6 h-10">Save Changes</button>
          </form>
        </div>
      </div>
    `;
    container.innerHTML = modalHtml;
  } catch (error) {
    showToast(`Error loading character: ${error.message}`, 'error');
    container.innerHTML = '';
  }
}
