import { getCharacters, getMediaById, updateMedia } from '../lib/dataService.js';
import { showToast } from './toast.js';
import { X } from 'lucide-static';

const closeModal = () => {
  document.getElementById('edit-media-modal')?.remove();
};

export const handleEditMediaFormSubmit = async (e, mediaId) => {
  e.preventDefault();
  const form = e.target;
  const submitButton = form.querySelector('button[type="submit"]');
  
  submitButton.disabled = true;
  submitButton.innerHTML = `<div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>`;

  const formData = new FormData(form);
  const tags = formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag);

  const mediaData = {
    character_id: formData.get('character_id'),
    name: formData.get('name'),
    url: formData.get('url'),
    type: formData.get('type'),
    tags: tags,
  };

  try {
    if (!mediaData.character_id) throw new Error('Please select a character.');
    
    await updateMedia(mediaId, mediaData);
    showToast('Media updated successfully!', 'success');
    document.dispatchEvent(new CustomEvent('datachanged'));
    closeModal();
    document.querySelector('#media-viewer-modal')?.remove(); // Close viewer too

  } catch (error) {
    showToast(error.message, 'error');
    submitButton.disabled = false;
    submitButton.textContent = 'Save Changes';
  }
};

export async function renderEditMediaModal(container, mediaId) {
  if (document.getElementById('edit-media-modal')) return;

  container.innerHTML = `<div class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"><div class="text-white">Loading...</div></div>`;

  try {
    const [media, characters] = await Promise.all([
        getMediaById(mediaId),
        getCharacters()
    ]);

    const modalHtml = `
      <div id="edit-media-modal" class="modal-container fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div class="bg-surface rounded-lg p-6 sm:p-8 w-full max-w-md relative animate-fade-in-up">
          <button data-action="close-modal" aria-label="Close edit post modal" class="absolute top-4 right-4 text-on-surface hover:text-primary transition-colors">
            <div class="w-6 h-6">${X}</div>
          </button>
          
          <h2 class="text-2xl font-bold text-center text-on-background mb-6">Edit Post</h2>
          <form data-form="edit-media" data-id="${mediaId}" class="space-y-4">
            <div>
              <label for="character_id" class="block text-sm font-medium text-on-surface mb-1">Assign to Character</label>
              <select name="character_id" required class="w-full bg-background border border-surface rounded-md p-2 text-on-background focus:ring-primary focus:border-primary">
                ${characters.map(c => `<option value="${c.id}" ${media.character_id === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
              </select>
            </div>
            <div>
              <label for="name" class="block text-sm font-medium text-on-surface mb-1">Post Title</label>
              <input type="text" name="name" required value="${media.name}" class="w-full bg-background border border-surface rounded-md p-2 text-on-background focus:ring-primary focus:border-primary">
            </div>
            <div>
              <label for="url" class="block text-sm font-medium text-on-surface mb-1">Media URL</label>
              <input type="url" name="url" required value="${media.url}" placeholder="https://example.com/media.mp4" class="w-full bg-background border border-surface rounded-md p-2 text-on-background focus:ring-primary focus:border-primary">
            </div>
             <div>
              <label class="block text-sm font-medium text-on-surface mb-1">Media Type</label>
              <div class="flex gap-4">
                  <label class="flex items-center"><input type="radio" name="type" value="image" ${media.type === 'image' ? 'checked' : ''} class="mr-2 bg-background border-surface text-primary focus:ring-primary"> Image</label>
                  <label class="flex items-center"><input type="radio" name="type" value="video" ${media.type === 'video' ? 'checked' : ''} class="mr-2 bg-background border-surface text-primary focus:ring-primary"> Video</label>
              </div>
            </div>
            <div>
              <label for="tags" class="block text-sm font-medium text-on-surface mb-1">Tags</label>
              <input type="text" name="tags" value="${(media.tags || []).join(', ')}" placeholder="e.g., portrait, event, outdoor" class="w-full bg-background border border-surface rounded-md p-2 text-on-background focus:ring-primary focus:border-primary">
              <p class="text-xs text-on-surface/70 mt-1">Separate tags with commas.</p>
            </div>
            <button type="submit" class="w-full bg-primary text-background font-bold py-2 rounded-md hover:bg-opacity-90 transition disabled:opacity-50 h-10">Save Changes</button>
          </form>
        </div>
      </div>
    `;
    container.innerHTML = modalHtml;
  } catch (error) {
    showToast(`Error loading data: ${error.message}`, 'error');
    container.innerHTML = '';
  }
}
