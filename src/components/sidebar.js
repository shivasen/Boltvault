import { Home, Search, PlusSquare, User, LogIn, LogOut, Filter as FilterIcon } from 'lucide-static';

const navItems = [
  { id: 'home-btn', icon: Home, text: 'Home', action: 'navigate-home' },
  { id: 'filter-btn', icon: FilterIcon, text: 'Filter', action: 'show-filter-modal' },
  { id: 'create-btn', icon: PlusSquare, text: 'Create', action: 'show-create-menu' },
  { id: 'profile-btn', icon: User, text: 'Profile', action: '#' }, // Assuming profile page is future work
];

const createNavItem = (item) => `
  <a href="#" data-action="${item.action}" id="${item.id}" class="flex items-center p-3 my-2 text-on-surface rounded-lg hover:bg-surface transition-colors duration-200">
    <div class="w-6 h-6 mr-4">${item.icon}</div>
    <span class="font-medium">${item.text}</span>
  </a>
`;

const createBottomNavItem = (item) => `
  <a href="#" data-action="${item.action}" id="${item.id}-mobile" class="flex flex-col items-center justify-center text-on-surface hover:text-primary transition-colors duration-200 flex-1 py-2">
    <div class="w-6 h-6">${item.icon}</div>
  </a>
`;

export function renderSidebar(container, user) {
  const authButton = user 
    ? `<a href="#" data-action="logout" class="flex items-center p-3 text-on-surface rounded-lg hover:bg-surface transition-colors duration-200">
        <div class="w-6 h-6 mr-4">${LogOut}</div>
        <span class="font-medium">Logout</span>
      </a>`
    : `<a href="#" data-action="show-login-modal" class="flex items-center p-3 text-on-surface rounded-lg hover:bg-surface transition-colors duration-200">
        <div class="w-6 h-6 mr-4">${LogIn}</div>
        <span class="font-medium">Login</span>
      </a>`;
  
  const createAction = user ? createNavItem(navItems.find(item => item.text === 'Create')) : '';

  const searchForm = user ? `
    <form data-form="search" class="relative mb-4">
        <input type="search" name="search" placeholder="Search posts..." class="w-full bg-surface border border-transparent rounded-md p-2 pl-10 text-on-background focus:ring-primary focus:border-primary transition">
        <div class="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface/50">
            ${Search}
        </div>
    </form>
  ` : '';

  const sidebarHtml = `
    <div class="w-64 h-full bg-background border-r border-surface p-4 flex flex-col">
      <h1 class="text-2xl font-bold text-on-background mb-8">BOLT⚡VAULT</h1>
      ${searchForm}
      <nav class="flex-1">
        ${createNavItem(navItems.find(item => item.text === 'Home'))}
        ${createNavItem(navItems.find(item => item.text === 'Filter'))}
        ${createAction}
      </nav>
      <div class="mt-auto">
        ${authButton}
      </div>
    </div>
  `;
  container.innerHTML = sidebarHtml;
}

export function renderBottomNav(container) {
    const bottomNavHtml = `
        <div class="bg-background border-t border-surface flex justify-around">
            ${navItems.map(createBottomNavItem).join('')}
        </div>
    `;
    container.innerHTML = bottomNavHtml;
}
