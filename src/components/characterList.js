import { getCharacters } from '../lib/dataService.js';
import { User } from 'lucide-static';

const createCharacterCard = (character) => `
  <a href="#/character/${character.id}" data-action="navigate-character-profile" data-id="${character.id}" class="group block bg-surface rounded-lg p-4 text-center hover:bg-primary/20 transition-colors duration-300 animate-fade-in-up">
    <div class="w-24 h-24 rounded-full overflow-hidden bg-background mx-auto mb-4 border-2 border-surface group-hover:border-primary transition-colors">
      ${character.profile_picture_url 
        ? `<img src="${character.profile_picture_url}" alt="${character.name}" class="w-full h-full object-cover" loading="lazy">`
        : `<div class="w-full h-full flex items-center justify-center text-on-surface/50">${User}</div>`
      }
    </div>
    <h3 class="font-bold text-lg text-on-background truncate">${character.name}</h3>
  </a>
`;

const renderCharacterListSkeleton = (container) => {
    const skeletonCard = `
    <div class="bg-surface rounded-lg p-4 text-center">
        <div class="w-24 h-24 rounded-full bg-background mx-auto mb-4 relative overflow-hidden">
            <div class="absolute inset-0 bg-gray-700/50 animate-shimmer w-full h-full"></div>
        </div>
        <div class="h-6 w-3/4 bg-background rounded-md mx-auto relative overflow-hidden">
            <div class="absolute inset-0 bg-gray-700/50 animate-shimmer w-full h-full"></div>
        </div>
    </div>
    `;
    const skeletonHtml = `
        <header class="mb-6">
            <h2 class="text-3xl font-bold text-on-background">Characters</h2>
        </header>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            ${Array(6).fill(skeletonCard).join('')}
        </div>
    `;
    container.innerHTML = skeletonHtml;
};

export async function renderCharacterList(container) {
    renderCharacterListSkeleton(container);

    try {
        const characters = await getCharacters();

        const listHtml = `
            <header class="mb-6">
                <h2 class="text-3xl font-bold text-on-background">Characters</h2>
            </header>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                ${characters.length > 0 
                    ? characters.map(createCharacterCard).join('') 
                    : `<div class="col-span-full text-center py-10 text-on-surface">You haven't created any characters yet.</div>`
                }
            </div>
        `;
        container.innerHTML = listHtml;
    } catch (error) {
        container.innerHTML = `<div class="text-center p-10 text-red-400">Error loading characters: ${error.message}</div>`;
    }
}
