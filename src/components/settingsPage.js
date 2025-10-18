import { getProfile, updateProfile } from '../lib/dataService.js';
import { supabase } from '../lib/supabaseClient.js';
import { showToast } from './toast.js';
import { User, Save, KeyRound, ShieldAlert, Sun, Moon, Laptop } from 'lucide-static';
import { getTheme, setTheme } from '../lib/theme.js';

const renderSettingsSkeleton = (container) => {
    const skeletonHtml = `
        <header class="mb-8">
            <h2 class="text-3xl font-bold text-on-background">Settings</h2>
        </header>
        <div class="space-y-12">
            <!-- Profile Skeleton -->
            <section>
                <div class="h-7 w-48 bg-surface rounded-md mb-4 relative overflow-hidden"><div class="absolute inset-0 bg-gray-700/50 animate-shimmer"></div></div>
                <div class="space-y-4">
                    <div class="h-10 w-full bg-surface rounded-md relative overflow-hidden"><div class="absolute inset-0 bg-gray-700/50 animate-shimmer"></div></div>
                    <div class="h-10 w-full bg-surface rounded-md relative overflow-hidden"><div class="absolute inset-0 bg-gray-700/50 animate-shimmer"></div></div>
                    <div class="h-10 w-full bg-surface rounded-md relative overflow-hidden"><div class="absolute inset-0 bg-gray-700/50 animate-shimmer"></div></div>
                </div>
            </section>
            <!-- Account Management Skeleton -->
            <section>
                <div class="h-7 w-64 bg-surface rounded-md mb-4 relative overflow-hidden"><div class="absolute inset-0 bg-gray-700/50 animate-shimmer"></div></div>
                <div class="space-y-4">
                    <div class="h-12 w-full bg-surface rounded-md relative overflow-hidden"><div class="absolute inset-0 bg-gray-700/50 animate-shimmer"></div></div>
                    <div class="h-12 w-full bg-surface rounded-md relative overflow-hidden"><div class="absolute inset-0 bg-gray-700/50 animate-shimmer"></div></div>
                </div>
            </section>
        </div>
    `;
    container.innerHTML = skeletonHtml;
};

export const handleProfileFormSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');

    submitButton.disabled = true;
    submitButton.innerHTML = `<div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>`;

    const formData = new FormData(form);
    const profileData = {
        username: formData.get('username'),
        full_name: formData.get('full_name'),
        avatar_url: formData.get('avatar_url'),
    };

    try {
        await updateProfile(profileData);
        showToast('Profile updated successfully!', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = `<div class="w-5 h-5 mr-2">${Save}</div> Save Changes`;
    }
};

const handleThemeChange = (e) => {
    setTheme(e.target.value);
};

export async function renderSettingsPage(container) {
    renderSettingsSkeleton(container);

    try {
        const { data: { user } } = await supabase.auth.getUser();
        const profile = await getProfile();
        const currentTheme = getTheme();

        const pageHtml = `
            <header class="mb-8">
                <h2 class="text-3xl font-bold text-on-background">Settings</h2>
            </header>

            <div class="max-w-4xl mx-auto space-y-12">
                <!-- Theme Section -->
                <section>
                    <h3 class="text-xl font-semibold text-on-background border-b border-surface pb-2 mb-6">Appearance</h3>
                    <div class="p-4 bg-background rounded-lg">
                        <label class="block text-sm font-medium text-on-surface mb-3">Theme</label>
                        <div id="theme-toggle-group" class="grid grid-cols-3 gap-2 rounded-lg bg-surface p-1">
                            <button value="light" class="theme-btn flex items-center justify-center gap-2 p-2 rounded-md text-sm font-semibold transition">
                                <div class="w-5 h-5">${Sun}</div> Light
                            </button>
                            <button value="dark" class="theme-btn flex items-center justify-center gap-2 p-2 rounded-md text-sm font-semibold transition">
                                <div class="w-5 h-5">${Moon}</div> Dark
                            </button>
                            <button value="system" class="theme-btn flex items-center justify-center gap-2 p-2 rounded-md text-sm font-semibold transition">
                                <div class="w-5 h-5">${Laptop}</div> System
                            </button>
                        </div>
                    </div>
                </section>

                <!-- User Profile Section -->
                <section>
                    <h3 class="text-xl font-semibold text-on-background border-b border-surface pb-2 mb-6">User Profile</h3>
                    <form data-form="edit-profile" class="space-y-6">
                        <div class="flex items-center gap-6">
                            <div class="w-24 h-24 rounded-full bg-surface flex-shrink-0 flex items-center justify-center">
                                <img id="avatar-preview" src="${profile?.avatar_url || ''}" alt="Avatar Preview" class="w-full h-full rounded-full object-cover ${!profile?.avatar_url ? 'hidden' : ''}" />
                                <div id="avatar-placeholder" class="w-12 h-12 text-on-surface/50 ${profile?.avatar_url ? 'hidden' : ''}">${User}</div>
                            </div>
                            <div class="flex-grow">
                                <label for="avatar_url" class="block text-sm font-medium text-on-surface mb-1">Avatar URL</label>
                                <input type="url" name="avatar_url" id="avatar_url" value="${profile?.avatar_url || ''}" placeholder="https://example.com/avatar.png" class="w-full bg-background border border-surface rounded-md p-2 text-on-background focus:ring-primary focus:border-primary">
                            </div>
                        </div>

                        <div>
                            <label for="email" class="block text-sm font-medium text-on-surface mb-1">Email</label>
                            <input type="email" name="email" value="${user.email}" disabled class="w-full bg-surface/50 border border-surface rounded-md p-2 text-on-surface/70 cursor-not-allowed">
                        </div>

                        <div>
                            <label for="username" class="block text-sm font-medium text-on-surface mb-1">Username</label>
                            <input type="text" name="username" value="${profile?.username || ''}" required class="w-full bg-background border border-surface rounded-md p-2 text-on-background focus:ring-primary focus:border-primary">
                        </div>

                        <div>
                            <label for="full_name" class="block text-sm font-medium text-on-surface mb-1">Full Name</label>
                            <input type="text" name="full_name" value="${profile?.full_name || ''}" class="w-full bg-background border border-surface rounded-md p-2 text-on-background focus:ring-primary focus:border-primary">
                        </div>

                        <div class="text-right">
                            <button type="submit" class="inline-flex items-center justify-center bg-primary text-background font-bold py-2 px-6 rounded-md hover:bg-opacity-90 transition disabled:opacity-50 h-10">
                                <div class="w-5 h-5 mr-2">${Save}</div>
                                <span>Save Changes</span>
                            </button>
                        </div>
                    </form>
                </section>

                <!-- Account Management Section -->
                <section>
                    <h3 class="text-xl font-semibold text-on-background border-b border-surface pb-2 mb-6">Account Management</h3>
                    <div class="space-y-4">
                        <button data-action="show-change-password-modal" class="w-full flex items-center justify-center text-on-surface bg-surface hover:bg-primary hover:text-background font-semibold py-3 px-4 rounded-md transition-colors border border-on-surface/20">
                            <div class="w-5 h-5 mr-3">${KeyRound}</div>
                            Change Password
                        </button>
                        <button data-action="show-delete-account-modal" class="w-full flex items-center justify-center text-red-400 bg-red-500/10 hover:bg-red-500/20 font-semibold py-3 px-4 rounded-md transition-colors">
                            <div class="w-5 h-5 mr-3">${ShieldAlert}</div>
                            Delete Account
                        </button>
                    </div>
                </section>
            </div>
        `;
        container.innerHTML = pageHtml;

        // --- Event Listeners ---

        // Avatar preview logic
        const avatarUrlInput = document.getElementById('avatar_url');
        const avatarPreview = document.getElementById('avatar-preview');
        const avatarPlaceholder = document.getElementById('avatar-placeholder');
        avatarUrlInput.addEventListener('input', () => {
            const url = avatarUrlInput.value;
            if (url) {
                avatarPreview.src = url;
                avatarPreview.classList.remove('hidden');
                avatarPlaceholder.classList.add('hidden');
            } else {
                avatarPreview.classList.add('hidden');
                avatarPlaceholder.classList.remove('hidden');
            }
        });

        // Theme toggle logic
        const themeButtons = document.querySelectorAll('.theme-btn');
        const updateThemeButtons = (theme) => {
            themeButtons.forEach(btn => {
                const isActive = btn.value === theme;
                btn.classList.toggle('bg-primary', isActive);
                btn.classList.toggle('text-background', isActive);
                btn.classList.toggle('text-on-surface', !isActive);
            });
        };
        
        themeButtons.forEach(button => {
            button.addEventListener('click', () => {
                setTheme(button.value);
                updateThemeButtons(button.value);
            });
        });

        updateThemeButtons(currentTheme);


    } catch (error) {
        container.innerHTML = `<div class="text-center p-10 text-red-400">Error loading settings: ${error.message}</div>`;
        showToast(`Error loading settings: ${error.message}`, 'error');
    }
}
