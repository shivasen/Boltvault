import { getMediaById } from '../lib/dataService.js';
import { X, User, Tag, Trash2, Edit } from 'lucide-static';
import { showToast } from './toast.js';

const createMediaElement = (mediaItem) => {
    if (mediaItem.is_embed) {
      // For embeds, we create a responsive container that maintains aspect ratio.
      const wrapper = document.createElement('div');
      // Use aspect-video for 16:9, and constrain size to fit within the viewport, similar to other media types.
      wrapper.className = 'relative w-full max-w-full h-auto max-h-[80vh] aspect-video bg-black';

      // Inject the user-provided embed code. This is safe as users provide their own content.
      wrapper.innerHTML = mediaItem.url; 
      
      const iframe = wrapper.querySelector('iframe');
      if (iframe) {
        // Style the iframe to fill the responsive wrapper.
        iframe.style.position = 'absolute';
        iframe.style.top = '0';
        iframe.style.left = '0';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.setAttribute('allowfullscreen', '');
        // Add more permissions for better compatibility with providers like YouTube
        iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture; encrypted-media');
      }
      
      return wrapper.outerHTML;
    }

    if (mediaItem.type === 'video') {
        return `<video src="${mediaItem.url}" class="max-h-[80vh] w-auto h-auto object-contain" controls autoplay muted loop playsinline></video>`;
    }
    return `<img src="${mediaItem.url}" alt="${mediaItem.name}" class="max-h-[80vh] w-auto h-auto object-contain" loading="lazy">`;
};

export async function renderMediaViewerModal(container, mediaId) {
    container.innerHTML = `<div id="media-viewer-modal" class="modal-container fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"><div class="text-white">Loading media...</div></div>`;

    try {
        const mediaItem = await getMediaById(mediaId);
        if (!mediaItem) throw new Error('Media not found.');
        
        const character = mediaItem.character;

        const modalHtml = `
            <div id="media-viewer-modal" class="modal-container fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 animate-fade-in-up">
                <div class="flex flex-col lg:flex-row w-full h-full max-w-screen-xl max-h-screen">
                    <div class="flex-1 flex items-center justify-center bg-black relative p-4">
                        ${createMediaElement(mediaItem)}
                        <button data-action="close-modal" aria-label="Close media viewer" class="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/80 transition-colors z-10">
                            <div class="w-6 h-6">${X}</div>
                        </button>
                    </div>
                    <div class="w-full lg:w-80 bg-surface text-on-surface p-6 flex-shrink-0 overflow-y-auto">
                        <div class="flex items-center mb-4">
                            ${character.profile_picture_url 
                                ? `<img src="${character.profile_picture_url}" class="w-12 h-12 rounded-full object-cover mr-4" loading="lazy">`
                                : `<div class="w-12 h-12 rounded-full bg-background flex items-center justify-center mr-4">${User}</div>`
                            }
                            <div>
                                <h3 class="font-bold text-lg text-on-background">${mediaItem.name}</h3>
                                <a href="#/character/${character.id}" class="text-sm hover:underline text-primary">${character.name}</a>
                            </div>
                        </div>
                        
                        ${(mediaItem.tags && mediaItem.tags.length > 0) ? `
                        <div class="mb-6">
                            <h4 class="font-semibold text-on-background mb-2 flex items-center"><div class="w-4 h-4 mr-2">${Tag}</div>Tags</h4>
                            <div class="flex flex-wrap gap-2">
                                ${mediaItem.tags.map(tag => `<span class="bg-primary/20 text-primary text-xs font-medium px-2.5 py-1 rounded-full">${tag}</span>`).join('')}
                            </div>
                        </div>
                        ` : ''}

                        <div class="border-t border-gray-700 pt-4 space-y-2">
                             <button data-action="show-edit-media-modal" data-id="${mediaItem.id}" aria-label="Edit post" class="w-full flex items-center justify-center text-on-surface bg-surface hover:bg-primary hover:text-background font-semibold py-2 px-4 rounded-md transition-colors border border-on-surface/20">
                                <div class="w-5 h-5 mr-2">${Edit}</div>
                                Edit Post
                            </button>
                             <button data-action="delete-media" data-id="${mediaItem.id}" aria-label="Delete post" class="w-full flex items-center justify-center text-red-400 bg-red-500/10 hover:bg-red-500/20 font-semibold py-2 px-4 rounded-md transition-colors">
                                <div class="w-5 h-5 mr-2">${Trash2}</div>
                                Delete Post
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML = modalHtml;
    } catch (error) {
        container.innerHTML = ''; // Clear loading
        showToast(`Error loading media: ${error.message}`, 'error');
    }
}
