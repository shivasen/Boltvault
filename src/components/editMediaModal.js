import { getCharacters, getMediaById, updateMedia } from '../lib/dataService.js';
import { showToast } from './toast.js';
import { X, UploadCloud, Link, Code } from 'lucide-static';

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
  const sourceType = formData.get('source_type');

  const mediaData = {
    character_id: formData.get('character_id'),
    name: formData.get('name'),
    tags: tags,
    source_type: sourceType, // Pass source type to dataService for cleanup logic
  };

  try {
    if (!mediaData.character_id) throw new Error('Please select a character.');

    if (sourceType === 'upload') {
        const fileInput = form.querySelector('#media_file');
        const file = fileInput.files[0];
        // File is optional on edit, only add if a new one is selected
        if (file) {
            mediaData.file = file;
        }
    } else if (sourceType === 'direct') {
        mediaData.url = formData.get('direct_url');
        mediaData.type = formData.get('type');
        mediaData.is_embed = false;
        if (!mediaData.url) throw new Error('Media URL is required.');
    } else if (sourceType === 'embed') {
        mediaData.url = formData.get('embed_code');
        mediaData.thumbnail_url = formData.get('thumbnail_url');
        mediaData.is_embed = true;
        mediaData.type = null;
        if (!mediaData.url) throw new Error('Embed Code is required.');
    }
    
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

const setupModalInteractivity = (media) => {
    // Source Type Control
    const sourceControl = document.getElementById('source-type-control');
    const sourceButtons = sourceControl.querySelectorAll('.source-btn');
    const hiddenInput = document.querySelector('input[name="source_type"]');
    
    const fieldsets = {
        upload: document.getElementById('upload-fields'),
        direct: document.getElementById('direct-link-fields'),
        embed: document.getElementById('embed-fields'),
    };

    sourceButtons.forEach(button => {
        button.addEventListener('click', () => {
            const sourceType = button.dataset.source;
            hiddenInput.value = sourceType;

            sourceButtons.forEach(btn => {
                const isActive = btn.dataset.source === sourceType;
                btn.classList.toggle('bg-primary', isActive);
                btn.classList.toggle('text-background', isActive);
                btn.classList.toggle('text-on-surface', !isActive);
            });

            Object.values(fieldsets).forEach(fs => fs.classList.add('hidden'));
            fieldsets[sourceType].classList.remove('hidden');
        });
    });

    // Set initial state based on media data
    let initialSource = 'direct';
    if (media.is_embed) {
        initialSource = 'embed';
    } else if (media.storage_path) {
        initialSource = 'upload';
    }
    document.querySelector(`.source-btn[data-source="${initialSource}"]`).click();

    // File Dropzone
    const dropzone = document.getElementById('file-dropzone');
    const fileInput = document.getElementById('media_file');
    const fileNameEl = document.getElementById('file-name');

    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('border-primary', 'bg-primary/10');
    });
    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('border-primary', 'bg-primary/10');
    });
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('border-primary', 'bg-primary/10');
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            fileNameEl.textContent = `New file: ${fileInput.files[0].name}`;
        }
    });
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length) {
            fileNameEl.textContent = `New file: ${fileInput.files[0].name}`;
        } else {
            fileNameEl.textContent = '';
        }
    });
};

export async function renderEditMediaModal(container, mediaId) {
  if (document.getElementById('edit-media-modal')) return;

  container.innerHTML = `<div class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"><div class="text-white">Loading...</div></div>`;

  try {
    const [media, characters] = await Promise.all([
        getMediaById(mediaId),
        getCharacters()
    ]);

    const isDirectLink = !media.is_embed && !media.storage_path;

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

            <!-- Source Type Control -->
            <div>
                <label class="block text-sm font-medium text-on-surface mb-2">Source Type</label>
                <div id="source-type-control" class="grid grid-cols-3 gap-1 rounded-lg bg-background p-1">
                    <button type="button" data-source="upload" class="source-btn flex items-center justify-center gap-2 p-2 rounded-md text-sm font-semibold transition"><div class="w-4 h-4">${UploadCloud}</div>Upload</button>
                    <button type="button" data-source="direct" class="source-btn flex items-center justify-center gap-2 p-2 rounded-md text-sm font-semibold transition"><div class="w-4 h-4">${Link}</div>Link</button>
                    <button type="button" data-source="embed" class="source-btn flex items-center justify-center gap-2 p-2 rounded-md text-sm font-semibold transition"><div class="w-4 h-4">${Code}</div>Embed</button>
                </div>
                <input type="hidden" name="source_type" value="upload">
            </div>

            <!-- Upload Fields -->
            <div id="upload-fields" class="hidden space-y-4">
                <div>
                    <label for="media_file" class="block text-sm font-medium text-on-surface mb-1 sr-only">Media File</label>
                    <div id="file-dropzone" class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-surface rounded-md transition-colors">
                        <div class="space-y-1 text-center">
                            <div class="w-12 h-12 mx-auto text-on-surface/30">${UploadCloud}</div>
                            <div class="flex text-sm text-on-surface/70">
                                <label for="media_file" class="relative cursor-pointer bg-surface rounded-md font-medium text-primary hover:text-opacity-80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary px-1">
                                    <span>Upload a new file</span>
                                    <input id="media_file" name="media_file" type="file" class="sr-only" accept="image/*,video/*">
                                </label>
                                <p class="pl-1">to replace the current one</p>
                            </div>
                            <p class="text-xs text-on-surface/50">Leave empty to keep the existing file.</p>
                            <p id="file-name" class="text-sm font-medium text-primary pt-2"></p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Direct Link Fields -->
            <div id="direct-link-fields" class="hidden space-y-4">
                <div>
                    <label for="direct_url" class="block text-sm font-medium text-on-surface mb-1">Media URL</label>
                    <input type="url" name="direct_url" value="${isDirectLink ? media.url : ''}" placeholder="https://example.com/media.mp4" class="w-full bg-background border border-surface rounded-md p-2 text-on-background focus:ring-primary focus:border-primary">
                </div>
                <div>
                    <label class="block text-sm font-medium text-on-surface mb-1">Media Type</label>
                    <div class="flex gap-4">
                        <label class="flex items-center"><input type="radio" name="type" value="image" ${media.type === 'image' ? 'checked' : ''} class="mr-2 bg-background border-surface text-primary focus:ring-primary"> Image</label>
                        <label class="flex items-center"><input type="radio" name="type" value="video" ${media.type === 'video' ? 'checked' : ''} class="mr-2 bg-background border-surface text-primary focus:ring-primary"> Video</label>
                    </div>
                </div>
            </div>

            <!-- Embed Fields -->
            <div id="embed-fields" class="hidden space-y-4">
                <div>
                    <label for="embed_code" class="block text-sm font-medium text-on-surface mb-1">Embed Code</label>
                    <textarea name="embed_code" rows="3" placeholder='<iframe src="..."></iframe>' class="w-full bg-background border border-surface rounded-md p-2 text-on-background focus:ring-primary focus:border-primary">${media.is_embed ? media.url : ''}</textarea>
                </div>
                <div>
                    <label for="thumbnail_url" class="block text-sm font-medium text-on-surface mb-1">Thumbnail URL</label>
                    <input type="url" name="thumbnail_url" value="${media.thumbnail_url || ''}" placeholder="https://example.com/preview.jpg" class="w-full bg-background border border-surface rounded-md p-2 text-on-background focus:ring-primary focus:border-primary">
                    <p class="text-xs text-on-surface/70 mt-1">Provide an image URL for the gallery preview.</p>
                </div>
            </div>

            <div>
              <label for="tags" class="block text-sm font-medium text-on-surface mb-1">Tags</label>
              <input type="text" name="tags" value="${(media.tags || []).join(', ')}" placeholder="e.g., portrait, event, outdoor" class="w-full bg-background border border-surface rounded-md p-2 text-on-background focus:ring-primary focus:border-primary">
              <p class="text-xs text-on-surface/70 mt-1">Separate tags with commas.</p>
            </div>
            <button type="submit" class="w-full bg-primary text-background font-bold py-2 rounded-md hover:bg-opacity-90 transition disabled:opacity-50 h-10 !mt-6">Save Changes</button>
          </form>
        </div>
      </div>
    `;
    container.innerHTML = modalHtml;

    setupModalInteractivity(media);

  } catch (error) {
    showToast(`Error loading data: ${error.message}`, 'error');
    container.innerHTML = '';
  }
}
