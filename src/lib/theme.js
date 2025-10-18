export const getTheme = () => {
    return localStorage.getItem('theme') || 'system';
};

export const applyTheme = (theme) => {
    if (theme === 'system') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.toggle('dark', systemPrefersDark);
    } else {
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }
};

export const setTheme = (theme) => {
    localStorage.setItem('theme', theme);
    applyTheme(theme);
};

export const initTheme = () => {
    const savedTheme = getTheme();
    applyTheme(savedTheme);

    // Listen for system theme changes if 'system' is selected
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (getTheme() === 'system') {
            applyTheme('system');
        }
    });
};
