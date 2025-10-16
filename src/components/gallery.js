import { Filter, Play, User, X } from 'lucide-static';
import { renderGallerySkeleton } from './skeleton.js';

const createMediaElement = (mediaItem) => {
  if (mediaItem.type === 'video') {
    return `<video src="${mediaItem.url}" class="w-full h-full object-cover" muted loop playsinline title="${mediaItem.name}"></video>`;
  }
  return `<img src="${mediaItem.url}" alt="${mediaItem.name}" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110">`;
};

const createMediaCard = (mediaItem, characters) => {
  const character = characters.find(c => c.id === mediaItem.character_id);
  
  return `
    <div data-action="view-media" data-id="${mediaItem.id}" class="media-card group relative aspect-square bg-surface rounded-lg overflow-hidden cursor-pointer">
      ${createMediaElement(mediaItem)}
      <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-opacity duration-300 flex items-center justify-center">
        <div class="text-white text-center p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          ${mediaItem.type === 'video' ? `<div class="w-8 h-8 mx-auto mb-2">${Play}</div>` : ''}
          <h3 class="font-bold text-lg truncate">${mediaItem.name}</h3>
          ${character ? `
            <a href="#/character/${character?.id}" class="relative z-10 flex items-center justify-center text-sm text-gray-300 mt-1 hover:underline">
              <div class="w-4 h-4 mr-1.5">${character.profile_picture_url ? `<img src="${character.profile_picture_url}" class="w-full h-full rounded-full object-cover">` : User }</div>
              <span>${character.name}</span>
            </a>
          ` : ''}
        </div>
      </div>
    </div>
  `;
};

const renderEmptyState = (isLoggedIn, hasFiltersOrSearch) => {
  if (hasFiltersOrSearch) {
    return `
      <div class="text-center col-span-full py-16">
        <h3 class="text-xl font-bold text-on-background">No Results Found</h3>
        <p class="text-on-surface mt-2">Try adjusting your search or filters.</p>
      </div>
    `;
  }
  if (isLoggedIn) {
    return `
      <div class="text-center col-span-full py-16">
        <h3 class="text-xl font-bold text-on-background">Your gallery is empty</h3>
        <p class="text-on-surface mt-2">Start by creating a character and adding media.</p>
        <button data-action="show-create-menu" class="mt-4 bg-primary text-background font-bold py-2 px-4 rounded-md hover:bg-opacity-90 transition">
          Create Post
        </button>
      </div>
    `;
  }
  return `
    <div class="text-center col-span-full py-16">
      <h3 class="text-xl font-bold text-on-background">Welcome to BOLT⚡VAULT</h3>
      <p class="text-on-surface mt-2">Please log in to view and manage your media.</p>
    </div>
  `;
}

const renderActiveFilters = (filters) => {
    const filterEntries = Object.entries(filters).filter(([, value]) => value);
    if (filterEntries.length === 0) return '';

    const filterPills = filterEntries.map(([key, value]) => {
        let text = '';
        if (key === 'sortBy') text = `Sort: ${value === 'name' ? 'Post Title' : 'Date'}`;
        if (key === 'filterByType') text = `Type: ${value}`;
        if (key === 'filterByCharacterName') text = `Character: ${value}`;
        if (key === 'filterByTag') text = `Tag: ${value}`;
        return text ? `<span class="bg-primary/20 text-primary text-xs font-medium px-2.5 py-1 rounded-full">${text}</span>` : '';
    }).join('');

    return `
        <div class="flex items-center flex-wrap gap-2 mb-4">
            <span class="text-sm font-medium text-on-surface">Active Filters:</span>
            ${filterPills}
            <button data-action="clear-all-filters" class="text-primary hover:underline text-sm font-semibold ml-2">Clear All</button>
        </div>
    `;
};

const renderSearchHeader = (term) => {
    if (!term) return '';
    return `
        <div class="flex items-center flex-wrap gap-2 mb-4 p-3 bg-surface rounded-lg">
            <span class="text-sm font-medium text-on-surface">Search results for:</span>
            <span class="bg-primary/20 text-primary text-lg font-semibold px-3 py-1 rounded-full">${term}</span>
            <button data-action="clear-search" class="text-on-surface hover:text-primary text-sm font-semibold ml-auto flex items-center gap-1">
                <div class="w-4 h-4">${X}</div>
                Clear
            </button>
        </div>
    `;
};

export function renderGallery(container, media, characters, filters, searchTerm) {
  // If media is null, it means we are loading, so render skeleton
  if (media === null) {
    renderGallerySkeleton(container);
    return;
  }

  const isLoggedIn = characters !== null;
  const hasFilters = Object.values(filters).some(v => v);

  const galleryHtml = `
    <header class="mb-6">
      <div class="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h2 class="text-3xl font-bold text-on-background mb-4 sm:mb-0">Media Feed</h2>
        ${isLoggedIn ? `
        <div class="flex items-center space-x-2">
          <button data-action="show-filter-modal" class="flex items-center bg-surface px-4 py-2 rounded-lg text-on-surface hover:bg-primary hover:text-background transition-colors">
            <div class="w-5 h-5 mr-2">${Filter}</div>
            Filter & Sort
          </button>
        </div>
        ` : ''}
      </div>
      ${renderSearchHeader(searchTerm)}
      ${searchTerm ? '' : renderActiveFilters(filters)}
    </header>
    <div id="media-grid" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4">
      ${media && media.length > 0 ? media.map(item => createMediaCard(item, characters)).join('') : renderEmptyState(isLoggedIn, hasFilters || !!searchTerm)}
    </div>
  `;
  container.innerHTML = galleryHtml;

  // Video hover-to-play listeners are not based on clicks, so they remain here.
  const mediaCards = container.querySelectorAll('.media-card');
  mediaCards.forEach(card => {
      const video = card.querySelector('video');
      if (video) {
          card.addEventListener('mouseenter', () => {
              video.play().catch(() => {});
          });
          card.addEventListener('mouseleave', () => {
              video.pause();
              video.currentTime = 0;
          });
      }
  });
}
