import { X } from 'lucide-static';
import { getCharacters, getUniqueTags } from '../lib/dataService.js';

const closeModal = () => {
    document.getElementById('filter-modal')?.remove();
};

export const handleFilterFormSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    const characterId = formData.get('filterByCharacter');
    const characterOption = form.querySelector(`option[value="${characterId}"]`);
    const characterName = characterOption ? characterOption.textContent : '';

    const filters = {
        sortBy: formData.get('sortBy'),
        sortDirection: formData.get('sortDirection'),
        filterByType: formData.get('filterByType'),
        filterByCharacter: characterId,
        filterByCharacterName: characterName,
        filterByTag: formData.get('filterByTag'),
    };
    
    const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([, value]) => value));

    document.dispatchEvent(new CustomEvent('filterschanged', { detail: cleanFilters }));
    closeModal();
};

export const handleResetFilters = () => {
    document.dispatchEvent(new CustomEvent('filterschanged', { detail: {} }));
    closeModal();
};

export async function renderFilterModal(container, currentFilters) {
    if (document.getElementById('filter-modal')) return;

    container.innerHTML = `<div class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"><div class="text-white">Loading filters...</div></div>`;

    try {
        const [characters, tags] = await Promise.all([getCharacters(), getUniqueTags()]);

        const modalHtml = `
            <div id="filter-modal" class="modal-container fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                <div class="bg-surface rounded-lg p-6 sm:p-8 w-full max-w-lg relative animate-fade-in-up">
                    <button data-action="close-modal" class="absolute top-4 right-4 text-on-surface hover:text-primary transition-colors">
                        <div class="w-6 h-6">${X}</div>
                    </button>
                    
                    <h2 class="text-2xl font-bold text-center text-on-background mb-6">Filter & Sort</h2>
                    <form data-form="filter" class="space-y-6">
                        <fieldset>
                            <legend class="text-lg font-medium text-on-background mb-3">Sort By</legend>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label for="sortBy" class="block text-sm font-medium text-on-surface mb-1">Field</label>
                                    <select name="sortBy" class="w-full bg-background border border-surface rounded-md p-2 text-on-background focus:ring-primary focus:border-primary">
                                        <option value="created_at" ${currentFilters.sortBy === 'created_at' || !currentFilters.sortBy ? 'selected' : ''}>Upload Date</option>
                                        <option value="name" ${currentFilters.sortBy === 'name' ? 'selected' : ''}>Post Title</option>
                                    </select>
                                </div>
                                <div>
                                    <label for="sortDirection" class="block text-sm font-medium text-on-surface mb-1">Direction</label>
                                    <select name="sortDirection" class="w-full bg-background border border-surface rounded-md p-2 text-on-background focus:ring-primary focus:border-primary">
                                        <option value="desc" ${currentFilters.sortDirection !== 'asc' ? 'selected' : ''}>Descending</option>
                                        <option value="asc" ${currentFilters.sortDirection === 'asc' ? 'selected' : ''}>Ascending</option>
                                    </select>
                                </div>
                            </div>
                        </fieldset>

                        <fieldset>
                            <legend class="text-lg font-medium text-on-background mb-3">Filter By</legend>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label for="filterByType" class="block text-sm font-medium text-on-surface mb-1">Media Type</label>
                                    <select name="filterByType" class="w-full bg-background border border-surface rounded-md p-2 text-on-background focus:ring-primary focus:border-primary">
                                        <option value="">All Types</option>
                                        <option value="image" ${currentFilters.filterByType === 'image' ? 'selected' : ''}>Image</option>
                                        <option value="video" ${currentFilters.filterByType === 'video' ? 'selected' : ''}>Video</option>
                                    </select>
                                </div>
                                <div>
                                    <label for="filterByCharacter" class="block text-sm font-medium text-on-surface mb-1">Character</label>
                                    <select name="filterByCharacter" class="w-full bg-background border border-surface rounded-md p-2 text-on-background focus:ring-primary focus:border-primary">
                                        <option value="">All Characters</option>
                                        ${characters.map(c => `<option value="${c.id}" ${currentFilters.filterByCharacter === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
                                    </select>
                                </div>
                                <div class="md:col-span-2">
                                    <label for="filterByTag" class="block text-sm font-medium text-on-surface mb-1">Tag</label>
                                    <select name="filterByTag" class="w-full bg-background border border-surface rounded-md p-2 text-on-background focus:ring-primary focus:border-primary">
                                        <option value="">All Tags</option>
                                        ${tags.map(t => `<option value="${t}" ${currentFilters.filterByTag === t ? 'selected' : ''}>${t}</option>`).join('')}
                                    </select>
                                </div>
                            </div>
                        </fieldset>

                        <div class="flex justify-end gap-3 pt-4 border-t border-surface">
                            <button type="button" data-action="reset-filters" class="bg-surface text-on-surface font-bold py-2 px-4 rounded-md hover:bg-opacity-90 transition">Reset</button>
                            <button type="submit" class="w-1/3 bg-primary text-background font-bold py-2 rounded-md hover:bg-opacity-90 transition">Apply</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        container.innerHTML = modalHtml;

    } catch (error) {
        container.innerHTML = `<div class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"><div class="bg-surface p-6 rounded-lg text-red-400">Error loading filters: ${error.message}</div></div>`;
    }
}
