import { renderSidebar, renderBottomNav } from './components/sidebar.js';
import { renderGallery } from './components/gallery.js';
import { renderCharacterProfile } from './components/characterProfile.js';
import { renderLandingPage } from './components/landingPage.js';
import { supabase } from './lib/supabaseClient.js';
import { getCharacters, getMedia, deleteMedia, deleteCharacter, searchMedia } from './lib/dataService.js';
import { renderAuthModal, handleAuthFormSubmit, renderLoginForm, renderSignUpForm } from './components/authModal.js';
import { renderCreateMenuModal } from './components/createMenuModal.js';
import { renderCharacterModal, handleCharacterFormSubmit } from './components/characterModal.js';
import { renderMediaModal, handleMediaFormSubmit } from './components/mediaModal.js';
import { renderFilterModal, handleFilterFormSubmit, handleResetFilters } from './components/filterModal.js';
import { renderMediaViewerModal } from './components/mediaViewerModal.js';
import { renderEditCharacterModal, handleEditCharacterFormSubmit } from './components/editCharacterModal.js';
import { renderEditMediaModal, handleEditMediaFormSubmit } from './components/editMediaModal.js';
import { showToast } from './components/toast.js';

const sidebarContainer = document.getElementById('sidebar-container');
const bottomNavContainer = document.getElementById('bottom-nav-container');
const mainContent = document.getElementById('main-content');
const modalContainer = document.getElementById('modal-container');

let currentFilters = {};
let currentSearchTerm = '';

const renderMainGallery = async (user) => {
  renderGallery(mainContent, null, null, {}, null); // Render skeleton first
  try {
    let media;
    const characters = await getCharacters(); // Always need characters for cards
    if (currentSearchTerm) {
      media = await searchMedia(currentSearchTerm);
    } else {
      media = await getMedia(currentFilters);
    }
    renderGallery(mainContent, media, characters, currentFilters, currentSearchTerm);
  } catch (error) {
    mainContent.innerHTML = `<div class="text-center p-10 text-red-400">Error fetching data: ${error.message}</div>`;
    showToast(`Error fetching data: ${error.message}`, 'error');
  }
};

const router = async () => {
  const hash = window.location.hash;
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  if (!user) {
    // User is not logged in, show landing page
    renderLandingPage(mainContent);
    sidebarContainer.innerHTML = '';
    bottomNavContainer.innerHTML = '';
    mainContent.className = 'flex-1 w-full'; // Reset classes for full-width landing page
    return;
  }

  // User is logged in, show the main app
  mainContent.className = 'flex-1 md:ml-64 p-4 sm:p-6 lg:p-8';
  renderSidebar(sidebarContainer, user);
  renderBottomNav(bottomNavContainer);

  if (hash.startsWith('#/character/')) {
    const characterId = hash.split('/')[2];
    await renderCharacterProfile(mainContent, characterId);
  } else {
    await renderMainGallery(user);
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  await router();

  window.addEventListener('hashchange', async (e) => {
    if (e.newURL.endsWith('#') || e.newURL.endsWith('/')) {
        currentFilters = {};
        currentSearchTerm = '';
    }
    await router();
  });

  supabase.auth.onAuthStateChange(async (_event, session) => {
    currentFilters = {}; 
    currentSearchTerm = '';
    window.location.hash = ''; // Go to home on auth change
    await router();
    if (session?.user && document.querySelector('.modal-container')) {
        document.querySelector('.modal-container').remove();
    }
  });

  document.addEventListener('datachanged', async () => {
    await router();
  });

  document.addEventListener('filterschanged', async (e) => {
    currentFilters = e.detail;
    currentSearchTerm = '';
    await router();
  });

  // --- Central Event Delegation ---
  const app = document.getElementById('app');

  app.addEventListener('click', async (e) => {
    // Handle overlay click to close modal
    if (e.target.classList.contains('modal-container')) {
        e.target.remove();
        return;
    }

    const actionTarget = e.target.closest('[data-action]');
    if (!actionTarget) return;

    // Prevent default for all actions except navigation links that scroll
    if (!actionTarget.getAttribute('href')?.startsWith('#')) {
      e.preventDefault();
    }
    
    const action = actionTarget.dataset.action;
    const id = actionTarget.dataset.id;

    switch (action) {
        case 'show-login-modal':
            renderAuthModal(modalContainer);
            renderLoginForm();
            break;
        case 'show-signup-modal':
            renderAuthModal(modalContainer);
            renderSignUpForm();
            break;
        case 'logout':
            await supabase.auth.signOut();
            showToast('You have been logged out.');
            break;
        case 'show-create-menu':
            renderCreateMenuModal(modalContainer);
            break;
        case 'close-modal':
            actionTarget.closest('.modal-container')?.remove();
            break;
        case 'show-signup-form':
            renderSignUpForm();
            break;
        case 'show-login-form':
            renderLoginForm();
            break;
        case 'show-character-modal':
            actionTarget.closest('.modal-container')?.remove();
            renderCharacterModal(modalContainer);
            break;
        case 'show-media-modal':
            actionTarget.closest('.modal-container')?.remove();
            await renderMediaModal(modalContainer);
            break;
        case 'show-filter-modal':
            await renderFilterModal(modalContainer, currentFilters);
            break;
        case 'reset-filters':
            handleResetFilters();
            break;
        case 'clear-all-filters':
            document.dispatchEvent(new CustomEvent('filterschanged', { detail: {} }));
            break;
        case 'navigate-home':
            window.location.hash = '';
            break;
        case 'view-media':
            await renderMediaViewerModal(modalContainer, id);
            break;
        case 'delete-media':
            if (confirm('Are you sure you want to delete this media post? This action cannot be undone.')) {
                try {
                    await deleteMedia(id);
                    showToast('Media post deleted successfully.');
                    actionTarget.closest('.modal-container')?.remove();
                    document.dispatchEvent(new CustomEvent('datachanged'));
                } catch (error) {
                    showToast(`Error deleting post: ${error.message}`, 'error');
                }
            }
            break;
        case 'delete-character':
            if (confirm('Are you sure you want to delete this character? All their media posts will be unassigned. This action cannot be undone.')) {
                try {
                    await deleteCharacter(id);
                    showToast('Character deleted successfully.');
                    window.location.hash = ''; // Go back to home
                } catch (error) {
                    showToast(`Error deleting character: ${error.message}`, 'error');
                }
            }
            break;
        case 'clear-search':
            currentSearchTerm = '';
            const searchInput = document.querySelector('form[data-form="search"] input');
            if (searchInput) searchInput.value = '';
            await router();
            break;
        case 'show-edit-character-modal':
            await renderEditCharacterModal(modalContainer, id);
            break;
        case 'show-edit-media-modal':
            await renderEditMediaModal(modalContainer, id);
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
        case 'login':
            await handleAuthFormSubmit(e, false);
            break;
        case 'signup':
            await handleAuthFormSubmit(e, true);
            break;
        case 'create-character':
            await handleCharacterFormSubmit(e);
            break;
        case 'create-media':
            await handleMediaFormSubmit(e);
            break;
        case 'filter':
            handleFilterFormSubmit(e);
            break;
        case 'search':
            const searchTerm = new FormData(form).get('search').trim();
            currentSearchTerm = searchTerm;
            currentFilters = {};
            window.location.hash = '';
            if (window.location.hash === '') {
                await router();
            }
            break;
        case 'edit-character':
            await handleEditCharacterFormSubmit(e, id);
            break;
        case 'edit-media':
            await handleEditMediaFormSubmit(e, id);
            break;
    }
  });
});
