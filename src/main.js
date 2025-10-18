import { renderSidebar, renderBottomNav } from './components/sidebar.js';
import { renderGallery, renderBulkActionBar } from './components/gallery.js';
import { renderCharacterProfile } from './components/characterProfile.js';
import { renderLandingPage } from './components/landingPage.js';
import { supabase, supabaseInitializationError } from './lib/supabaseClient.js';
import { getCharacters, getMedia, deleteMedia, deleteCharacter, searchMedia, deleteUserAccount, deleteMultipleMedia } from './lib/dataService.js';
import { renderAuthModal, handleAuthFormSubmit, renderLoginForm, renderSignUpForm } from './components/authModal.js';
import { renderCreateMenuModal } from './components/createMenuModal.js';
import { renderCharacterModal, handleCharacterFormSubmit } from './components/characterModal.js';
import { renderMediaModal, handleMediaFormSubmit } from './components/mediaModal.js';
import { renderFilterModal, handleFilterFormSubmit, handleResetFilters } from './components/filterModal.js';
import { renderMediaViewerModal } from './components/mediaViewerModal.js';
import { renderEditCharacterModal, handleEditCharacterFormSubmit } from './components/editCharacterModal.js';
import { renderEditMediaModal, handleEditMediaFormSubmit } from './components/editMediaModal.js';
import { renderConfirmationModal } from './components/confirmationModal.js';
import { renderCharacterList } from './components/characterList.js';
import { renderSettingsPage, handleProfileFormSubmit } from './components/settingsPage.js';
import { renderChangePasswordModal, handleChangePasswordSubmit } from './components/changePasswordModal.js';
import { showToast } from './components/toast.js';
import { debounce } from './utils/debounce.js';
import { initBackToTopButton } from './components/backToTopButton.js';
import { initTheme } from './lib/theme.js';

// Early exit if Supabase isn't configured
if (supabaseInitializationError) {
    document.body.innerHTML = `
        <div class="flex items-center justify-center min-h-screen bg-background text-on-background p-4">
            <div class="max-w-2xl text-center">
                <h1 class="text-2xl font-bold text-red-400 mb-4">Application Configuration Error</h1>
                <p class="text-lg text-on-surface mb-2">${supabaseInitializationError}</p>
                <p class="text-on-surface/70">If you are the administrator, please add the <code class="bg-surface px-1 py-0.5 rounded-md">VITE_SUPABASE_URL</code> and <code class="bg-surface px-1 py-0.5 rounded-md">VITE_SUPABASE_ANON_KEY</code> environment variables in your hosting provider's settings (e.g., Cloudflare Pages, Netlify), then redeploy.</p>
            </div>
        </div>
    `;
    throw new Error(supabaseInitializationError);
}

const sidebarContainer = document.getElementById('sidebar-container');
const bottomNavContainer = document.getElementById('bottom-nav-container');
const mainContent = document.getElementById('main-content');
const modalContainer = document.getElementById('modal-container');
const backToTopContainer = document.getElementById('back-to-top-container');
const bulkActionBarContainer = document.getElementById('bulk-action-bar-container');

// --- State ---
let currentFilters = {};
let currentSearchTerm = '';
let currentPage = 0;
let isFetchingMore = false;
let hasMoreMedia = true;
let isSelectMode = false;
let selectedItems = new Set();
let galleryMedia = [];
let galleryCharacters = [];

const resetPagination = () => {
    currentPage = 0;
    isFetchingMore = false;
    hasMoreMedia = true;
    galleryMedia = [];
};

const resetSelectMode = () => {
    isSelectMode = false;
    selectedItems.clear();
    renderBulkActionBar(bulkActionBarContainer, 0);
};

const rerenderCurrentGalleryView = () => {
    renderGallery(mainContent, galleryMedia, galleryCharacters, currentFilters, currentSearchTerm, {
        isLoadMore: false,
        hasMore: hasMoreMedia,
        isSelectMode,
        selectedItems
    });
    renderBulkActionBar(bulkActionBarContainer, selectedItems.size);
}

const renderMainGallery = async (isLoadMore = false) => {
  if (!isLoadMore) {
    resetPagination();
    renderGallery(mainContent, null, null, {}, null, {});
  }

  if (isFetchingMore || !hasMoreMedia) return;
  isFetchingMore = true;
  
  const loadMoreBtn = document.getElementById('load-more-btn');
  if (loadMoreBtn) {
    loadMoreBtn.disabled = true;
    loadMoreBtn.innerHTML = `<div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>`;
  }

  try {
    let mediaResponse;
    const characters = await getCharacters();
    galleryCharacters = characters;
    
    if (currentSearchTerm) {
      const searchResults = await searchMedia(currentSearchTerm);
      mediaResponse = { data: searchResults, hasMore: false };
    } else {
      mediaResponse = await getMedia({ ...currentFilters, page: currentPage });
    }
    
    hasMoreMedia = mediaResponse.hasMore;
    galleryMedia = isLoadMore ? [...galleryMedia, ...mediaResponse.data] : mediaResponse.data;
    
    renderGallery(mainContent, mediaResponse.data, characters, currentFilters, currentSearchTerm, { 
        isLoadMore, 
        hasMore: hasMoreMedia,
        isSelectMode,
        selectedItems
    });
    currentPage++;

  } catch (error) {
    mainContent.innerHTML = `<div class="text-center p-10 text-red-400">Error fetching data: ${error.message}</div>`;
    showToast(`Error fetching data: ${error.message}`, 'error');
  } finally {
    isFetchingMore = false;
  }
};

const router = async () => {
  resetSelectMode();
  const hash = window.location.hash;
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  if (!user) {
    renderLandingPage(mainContent);
    sidebarContainer.innerHTML = '';
    bottomNavContainer.innerHTML = '';
    mainContent.className = 'flex-1 w-full';
    return;
  }

  mainContent.className = 'flex-1 md:ml-64 p-4 sm:p-6 lg:p-8';
  renderSidebar(sidebarContainer, user);
  renderBottomNav(bottomNavContainer, user);

  if (hash.startsWith('#/character/')) {
    const characterId = hash.split('/')[2];
    await renderCharacterProfile(mainContent, characterId);
  } else if (hash === '#/characters') {
    await renderCharacterList(mainContent);
  } else if (hash === '#/settings') {
    await renderSettingsPage(mainContent);
  }
  else {
    await renderMainGallery();
  }
};

const debouncedSearch = debounce(async (searchTerm) => {
    currentSearchTerm = searchTerm.trim();
    currentFilters = {};
    if (window.location.hash !== '') {
        window.location.hash = '';
    } else {
        await renderMainGallery();
    }
}, 300);

document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  initBackToTopButton(backToTopContainer);
  await router();

  window.addEventListener('hashchange', router);

  supabase.auth.onAuthStateChange(async (_event, session) => {
    const user = session?.user;
    const wasLoggedIn = document.body.dataset.loggedIn === 'true';
    const isLoggedIn = !!user;

    if (wasLoggedIn !== isLoggedIn) {
        document.body.dataset.loggedIn = isLoggedIn;
        currentFilters = {}; 
        currentSearchTerm = '';
        resetPagination();
        resetSelectMode();
        
        if (_event === 'SIGNED_OUT') {
            window.location.href = '/';
            return;
        }

        if (window.location.hash !== '') {
            window.location.hash = '';
        } else {
            await router();
        }
    }
    
    if (session?.user && document.querySelector('.modal-container')) {
        document.querySelector('.modal-container').remove();
    }
  });

  document.addEventListener('datachanged', renderMainGallery);

  document.addEventListener('filterschanged', async (e) => {
    currentFilters = e.detail;
    currentSearchTerm = '';
    if (window.location.hash !== '') {
        window.location.hash = '';
    } else {
        await renderMainGallery();
    }
  });

  const app = document.getElementById('app');

  app.addEventListener('click', async (e) => {
    if (e.target.classList.contains('modal-container')) {
        e.target.remove();
        return;
    }

    const actionTarget = e.target.closest('[data-action]');
    if (!actionTarget) return;

    if (!actionTarget.getAttribute('href')?.startsWith('#features')) {
      e.preventDefault();
    }
    
    const action = actionTarget.dataset.action;
    const id = actionTarget.dataset.id;

    switch (action) {
        // --- Navigation & Modals ---
        case 'navigate-home': window.location.hash = ''; break;
        case 'navigate-characters': window.location.hash = '#/characters'; break;
        case 'navigate-settings': window.location.hash = '#/settings'; break;
        case 'navigate-character-profile': window.location.hash = `#/character/${id}`; break;
        case 'show-login-modal': renderAuthModal(modalContainer); renderLoginForm(); break;
        case 'show-signup-modal': renderAuthModal(modalContainer); renderSignUpForm(); break;
        case 'show-create-menu': renderCreateMenuModal(modalContainer); break;
        case 'close-modal': actionTarget.closest('.modal-container')?.remove(); break;
        case 'show-signup-form': renderSignUpForm(); break;
        case 'show-login-form': renderLoginForm(); break;
        case 'show-character-modal': actionTarget.closest('.modal-container')?.remove(); renderCharacterModal(modalContainer); break;
        case 'show-media-modal': actionTarget.closest('.modal-container')?.remove(); await renderMediaModal(modalContainer); break;
        case 'show-filter-modal': await renderFilterModal(modalContainer, currentFilters); break;
        case 'show-edit-character-modal': await renderEditCharacterModal(modalContainer, id); break;
        case 'show-edit-media-modal': await renderEditMediaModal(modalContainer, id); break;
        case 'show-change-password-modal': renderChangePasswordModal(modalContainer); break;
        
        // --- Auth ---
        case 'logout':
            showToast('You have been logged out.');
            await supabase.auth.signOut();
            window.location.href = '/';
            break;

        // --- Data Views & Filtering ---
        case 'view-media': await renderMediaViewerModal(modalContainer, id); break;
        case 'load-more-media': await renderMainGallery(true); break;
        case 'reset-filters': handleResetFilters(); break;
        case 'clear-all-filters': document.dispatchEvent(new CustomEvent('filterschanged', { detail: {} })); break;
        case 'clear-search':
            currentSearchTerm = '';
            const searchInput = document.querySelector('form[data-form="search"] input');
            if (searchInput) searchInput.value = '';
            await renderMainGallery();
            break;

        // --- Bulk Actions ---
        case 'toggle-select-mode':
            isSelectMode = !isSelectMode;
            if (!isSelectMode) {
                resetSelectMode();
            }
            rerenderCurrentGalleryView();
            break;
        case 'select-media-item':
            if (!isSelectMode) return;
            if (selectedItems.has(id)) {
                selectedItems.delete(id);
            } else {
                selectedItems.add(id);
            }
            rerenderCurrentGalleryView();
            break;
        case 'deselect-all-media':
            selectedItems.clear();
            rerenderCurrentGalleryView();
            break;
        case 'delete-selected-media':
            renderConfirmationModal({
                title: `Delete ${selectedItems.size} Posts`,
                message: `Are you sure you want to permanently delete these ${selectedItems.size} posts? This action cannot be undone.`,
                confirmText: 'Delete',
                onConfirm: async () => {
                    try {
                        await deleteMultipleMedia(Array.from(selectedItems));
                        showToast(`${selectedItems.size} posts deleted successfully.`);
                        resetSelectMode();
                        await renderMainGallery();
                    } catch (error) {
                        showToast(`Error deleting posts: ${error.message}`, 'error');
                    } finally {
                        actionTarget.closest('.modal-container')?.remove();
                    }
                }
            });
            break;

        // --- Single Item Deletes ---
        case 'delete-media':
            renderConfirmationModal({
                title: 'Delete Post',
                message: 'Are you sure you want to delete this post? This action cannot be undone.',
                confirmText: 'Delete',
                onConfirm: async () => {
                    try {
                        await deleteMedia(id);
                        showToast('Media post deleted successfully.');
                        actionTarget.closest('.modal-container')?.remove();
                        await renderMainGallery();
                    } catch (error) {
                        showToast(`Error deleting post: ${error.message}`, 'error');
                    }
                }
            });
            break;
        case 'delete-character':
            renderConfirmationModal({
                title: 'Delete Character',
                message: 'Are you sure you want to delete this character? All media will be unassigned. This cannot be undone.',
                confirmText: 'Delete',
                onConfirm: async () => {
                    try {
                        await deleteCharacter(id);
                        showToast('Character deleted successfully.');
                        window.location.hash = '';
                    } catch (error) {
                        showToast(`Error deleting character: ${error.message}`, 'error');
                    }
                }
            });
            break;
        case 'show-delete-account-modal':
            renderConfirmationModal({
                title: 'Delete Account',
                message: 'Are you absolutely sure? This will permanently delete your account and all of your data. This action cannot be undone.',
                confirmText: 'Yes, delete my account',
                onConfirm: async () => {
                    try {
                        await deleteUserAccount();
                        showToast('Account deleted successfully.');
                        await supabase.auth.signOut();
                    } catch (error) {
                        showToast(`Error deleting account: ${error.message}`, 'error');
                    }
                }
            });
            break;
    }
  });

  app.addEventListener('submit', async (e) => {
    const form = e.target;
    if (!form.dataset.form) return;

    e.preventDefault();
    const formType = form.dataset.form;
    const id = form.dataset.id;

    switch (formType) {
        case 'login': await handleAuthFormSubmit(e, false); break;
        case 'signup': await handleAuthFormSubmit(e, true); break;
        case 'create-character': await handleCharacterFormSubmit(e); break;
        case 'create-media': await handleMediaFormSubmit(e); break;
        case 'filter': handleFilterFormSubmit(e); break;
        case 'edit-character': await handleEditCharacterFormSubmit(e, id); break;
        case 'edit-media': await handleEditMediaFormSubmit(e, id); break;
        case 'edit-profile': await handleProfileFormSubmit(e); break;
        case 'change-password': await handleChangePasswordSubmit(e); break;
    }
  });

  app.addEventListener('input', (e) => {
    const form = e.target.closest('form[data-form="search"]');
    if (!form) return;

    const searchTerm = new FormData(form).get('search');
    debouncedSearch(searchTerm);
  });
});
