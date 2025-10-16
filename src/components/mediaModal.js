import { getCharacters, createMedia } from '../lib/dataService.js';
import { showToast } from './toast.js';
import { X } from 'lucide-static';

const closeModal = () => {
  document.getElementById('media-modal')?.remove();
};

export const handleMediaFormSubmit = async (e) => {
  e.preventDefault();
  const form = e.target;
  const submitButton = form.querySelector('button[type="submit"]');
  
  submitButton.disabled = true;
  submitButton.innerHTML = `<div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>`;

  const formData = new FormData(form);
  const tags = formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag);
  const isEmbed = formData.get('source_type') === 'embed';

  const mediaData = {
    character_id: formData.get('character_id'),
    name: formData.get('name'),
    tags: tags,
    is_embed: isEmbed,
    url: isEmbed ? formData.get('embed_code') : formData.get('direct_url'),
    type: isEmbed ? null : formData.get('type'),
    thumbnail_url: isEmbed ? formData.get('thumbnail_url') : null,
  };

  try {
    if (!mediaData.character_id) throw new Error('Please select a character.');
    if (!mediaData.url) throw new Error('URL or Embed Code is required.');
    
    await createMedia(mediaData);
    showToast('Media created successfully!', 'success');
    document.dispatchEvent(new CustomEvent('datachanged'));
    closeModal();

  } catch (error) {
    showToast(error.message, 'error');
    submitButton.disabled = false;
    submitButton.textContent = 'Create Post';
  }
};

const setupSourceToggle = () => {
    const toggle = document.getElementById('source-type-toggle');
    if (!toggle) return;

    const directLinkFields = document.getElementById('direct-link-fields');
    const embedFields = document.getElementById('embed-fields');

    const updateVisibility = () => {
        if (toggle.checked) { // Embed
            directLinkFields.classList.add('hidden');
            embedFields.classList.remove('hidden');
        } else { // Direct Link
            directLinkFields.classList.remove('hidden');
            embedFields.classList.add('hidden');
        }
    };

    toggle.addEventListener('change', updateVisibility);
    updateVisibility(); // Initial call
};

export async function renderMediaModal(container) {
  if (document.getElementById('media-modal')) return;

  container.innerHTML = `<div class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"><div class="text-white">Loading...</div></div>`;

  const characters = await getCharacters();

  if (characters.length === 0) {
      container.innerHTML = `
        <div id="media-modal" class="modal-container fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div class="bg-surface rounded-lg p-6 sm:p-8 w-full max-w-md text-center relative animate-fade-in-up">
                 <button data-action="close-modal" aria-label="Close create post modal" class="absolute top-4 right-4 text-on-surface hover:text-primary transition-colors">
                    <div class="w-6 h-6">${X}</div>
                </button>
                <h2 class="text-xl font-bold text-on-background mb-4">No Characters Found</h2>
                <p class="text-on-surface">You need to create a character before you can add media. Please create a character first.</p>
            </div>
        </div>
      `;
      return;
  }

  const modalHtml = `
    <div id="media-modal" class="modal-container fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div class="bg-surface rounded-lg p-6 sm:p-8 w-full max-w-md relative animate-fade-in-up">
        <button data-action="close-modal" aria-label="Close create post modal" class="absolute top-4 right-4 text-on-surface hover:text-primary transition-colors">
          <div class="w-6 h-6">${X}</div>
        </button>
        
        <h2 class="text-2xl font-bold text-center text-on-background mb-6">Create New Post</h2>
        <form data-form="create-media" class="space-y-4">
          <div>
            <label for="character_id" class="block text-sm font-medium text-on-surface mb-1">Assign to Character</label>
            <select name="character_id" required class="w-full bg-background border border-surface rounded-md p-2 text-on-background focus:ring-primary focus:border-primary">
              <option value="" disabled selected>Select a character...</option>
              ${characters.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
            </select>
          </div>
          <div>
            <label for="name" class="block text-sm font-medium text-on-surface mb-1">Post Title</label>
            <input type="text" name="name" required class="w-full bg-background border border-surface rounded-md p-2 text-on-background focus:ring-primary focus:border-primary">
          </div>

          <!-- Source Type Toggle -->
          <div class="flex items-center justify-center gap-4 pt-2">
            <span class="text-sm font-medium text-on-surface">Direct Link</span>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" id="source-type-toggle" name="source_type" value="embed" class="sr-only peer">
              <input type="hidden" name="source_type" value="direct"> <!-- Default value -->
              <div class="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
            <span class="text-sm font-medium text-on-surface">Embed Code</span>
          </div>

          <!-- Direct Link Fields -->
          <div id="direct-link-fields" class="space-y-4">
            <div>
              <label for="direct_url" class="block text-sm font-medium text-on-surface mb-1">Media URL</label>
              <input type="url" name="direct_url" placeholder="https://example.com/media.mp4" class="w-full bg-background border border-surface rounded-md p-2 text-on-background focus:ring-primary focus:border-primary">
            </div>
            <div>
              <label class="block text-sm font-medium text-on-surface mb-1">Media Type</label>
              <div class="flex gap-4">
                  <label class="flex items-center"><input type="radio" name="type" value="image" checked class="mr-2 bg-background border-surface text-primary focus:ring-primary"> Image</label>
                  <label class="flex items-center"><input type="radio" name="type" value="video" class="mr-2 bg-background border-surface text-primary focus:ring-primary"> Video</label>
              </div>
            </div>
          </div>

          <!-- Embed Fields -->
          <div id="embed-fields" class="hidden space-y-4">
            <div>
              <label for="embed_code" class="block text-sm font-medium text-on-surface mb-1">Embed Code</label>
              <textarea name="embed_code" rows="3" placeholder='<iframe src="..."></iframe>' class="w-full bg-background border border-surface rounded-md p-2 text-on-background focus:ring-primary focus:border-primary"></textarea>
            </div>
            <div>
              <label for="thumbnail_url" class="block text-sm font-medium text-on-surface mb-1">Thumbnail URL</label>
              <input type="url" name="thumbnail_url" placeholder="https://example.com/preview.jpg" class="w-full bg-background border border-surface rounded-md p-2 text-on-background focus:ring-primary focus:border-primary">
              <p class="text-xs text-on-surface/70 mt-1">Provide an image URL for the gallery preview.</p>
            </div>
          </div>

          <div>
            <label for="tags" class="block text-sm font-medium text-on-surface mb-1">Tags</label>
            <input type="text" name="tags" placeholder="e.g., portrait, event, outdoor" class="w-full bg-background border border-surface rounded-md p-2 text-on-background focus:ring-primary focus:border-primary">
            <p class="text-xs text-on-surface/70 mt-1">Separate tags with commas.</p>
          </div>
          <button type="submit" class="w-full bg-primary text-background font-bold py-2 rounded-md hover:bg-opacity-90 transition disabled:opacity-50 h-10 !mt-6">Create Post</button>
        </form>
      </div>
    </div>
  `;
  container.innerHTML = modalHtml;
  
  // Attach event listener for the toggle
  const toggle = document.getElementById('source-type-toggle');
  const hiddenInput = toggle.nextElementSibling;
  toggle.addEventListener('change', () => {
      hiddenInput.value = toggle.checked ? 'embed' : 'direct';
      document.getElementById('direct-link-fields').classList.toggle('hidden', toggle.checked);
      document.getElementById('embed-fields').classList.toggle('hidden', !toggle.checked);
  });
  
  // Set initial state
  document.getElementById('direct-link-fields').classList.remove('hidden');
  document.getElementById('embed-fields').classList.add('hidden');
}
