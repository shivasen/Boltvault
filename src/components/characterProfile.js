import { getCharacterById, getMediaByCharacterId } from '../lib/dataService.js';
import { User, Link, Play, ArrowLeft, Edit, Trash2 } from 'lucide-static';
import { renderProfileSkeleton } from './skeleton.js';

const createMediaElement = (mediaItem) => {
  if (mediaItem.type === 'video') {
    return `<video src="${mediaItem.url}" class="w-full h-full object-cover" muted loop playsinline title="${mediaItem.name}"></video>`;
  }
  return `<img src="${mediaItem.url}" alt="${mediaItem.name}" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" loading="lazy">`;
};

const createMediaCard = (mediaItem) => {
  return `
    <div data-action="view-media" data-id="${mediaItem.id}" class="media-card group relative aspect-square bg-surface rounded-lg overflow-hidden cursor-pointer">
      ${createMediaElement(mediaItem)}
      <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-opacity duration-300 flex items-center justify-center">
        <div class="text-white text-center p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          ${mediaItem.type === 'video' ? `<div class="w-8 h-8 mx-auto mb-2">${Play}</div>` : ''}
          <h3 class="font-bold text-lg truncate">${mediaItem.name}</h3>
        </div>
      </div>
    </div>
  `;
};

export async function renderCharacterProfile(container, characterId) {
    renderProfileSkeleton(container);

    try {
        const [character, media] = await Promise.all([
            getCharacterById(characterId),
            getMediaByCharacterId(characterId)
        ]);

        if (!character) {
            container.innerHTML = `<div class="text-center p-10 text-red-400">Character not found.</div>`;
            return;
        }

        const profileHtml = `
            <header class="mb-8 md:mb-12">
                <a href="#" data-action="navigate-home" class="inline-flex items-center text-on-surface hover:text-primary mb-6 transition-colors">
                    <div class="w-5 h-5 mr-2">${ArrowLeft}</div>
                    Back to Gallery
                </a>
                <div class="flex flex-col md:flex-row items-center">
                    <div class="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden bg-surface flex-shrink-0 mb-4 md:mb-0 md:mr-8">
                        ${character.profile_picture_url 
                            ? `<img src="${character.profile_picture_url}" alt="${character.name}" class="w-full h-full object-cover" loading="lazy">`
                            : `<div class="w-full h-full flex items-center justify-center text-on-surface/50">${User}</div>`
                        }
                    </div>
                    <div class="text-center md:text-left">
                        <div class="flex items-center justify-center md:justify-start gap-4">
                            <h2 class="text-3xl font-bold text-on-background">${character.name}</h2>
                            <button data-action="show-edit-character-modal" data-id="${character.id}" aria-label="Edit character" class="bg-surface text-on-surface hover:bg-primary hover:text-background p-2 rounded-lg transition-colors">
                                <div class="w-5 h-5">${Edit}</div>
                            </button>
                             <button data-action="delete-character" data-id="${character.id}" aria-label="Delete character" class="bg-red-500/10 text-red-400 hover:bg-red-500/20 p-2 rounded-lg transition-colors">
                                <div class="w-5 h-5">${Trash2}</div>
                            </button>
                        </div>
                        <div class="flex items-center justify-center md:justify-start space-x-6 my-3 text-on-surface">
                            <div><span class="font-bold">${media.length}</span> posts</div>
                        </div>
                        <p class="text-on-surface max-w-lg">${character.bio || ''}</p>
                    </div>
                </div>
            </header>
            <div id="media-grid" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4">
                ${media.length > 0 
                    ? media.map(createMediaCard).join('') 
                    : `<div class="col-span-full text-center py-10 text-on-surface">This character has no media posts yet.</div>`
                }
            </div>
        `;

        container.innerHTML = profileHtml;

        const mediaCards = container.querySelectorAll('.media-card');
        mediaCards.forEach(card => {
            const video = card.querySelector('video');
            if (video) {
                card.addEventListener('mouseenter', () => video.play().catch(() => {}));
                card.addEventListener('mouseleave', () => {
                    video.pause();
                    video.currentTime = 0;
                });
            }
        });

    } catch (error) {
        container.innerHTML = `<div class="text-center p-10 text-red-400">Error loading profile: ${error.message}</div>`;
    }
}
