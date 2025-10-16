import { UsersRound, Filter, ShieldCheck } from 'lucide-static';

export function renderLandingPage(container) {
  const landingPageHtml = `
    <div class="w-full bg-background animate-fade-in-up">
      <!-- Header -->
      <header class="absolute top-0 left-0 right-0 z-10">
        <div class="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 class="text-2xl font-bold text-on-background">BOLT⚡VAULT</h1>
          <button data-action="show-login-modal" class="bg-primary text-background font-bold py-2 px-6 rounded-md hover:bg-opacity-90 transition">
            Login
          </button>
        </div>
      </header>

      <!-- Hero Section -->
      <section class="relative min-h-screen flex items-center">
        <div class="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
        <div class="container mx-auto px-6 text-center relative z-10">
          <h2 class="text-4xl md:text-6xl font-extrabold text-on-background leading-tight mb-4">
            Organize, Stream, and Showcase Your Media Like Never Before.
          </h2>
          <p class="text-lg md:text-xl text-on-surface max-w-3xl mx-auto mb-8">
            BOLT⚡VAULT is your personal, secure, and beautifully designed gallery for all your images and videos. Manage characters, tag your content, and enjoy a seamless streaming experience.
          </p>
          <div class="flex justify-center gap-4">
            <button data-action="show-signup-modal" class="bg-primary text-background font-bold py-3 px-8 rounded-md hover:bg-opacity-90 transition text-lg">
              Get Started for Free
            </button>
            <a href="#features" class="border border-primary text-primary font-bold py-3 px-8 rounded-md hover:bg-primary/10 transition text-lg">
              Learn More
            </a>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section id="features" class="py-20 bg-surface">
        <div class="container mx-auto px-6">
          <div class="text-center mb-12">
            <h3 class="text-3xl md:text-4xl font-bold text-on-background">All-in-One Media Management</h3>
            <p class="text-on-surface mt-2 max-w-2xl mx-auto">Everything you need to curate and enjoy your personal media collection.</p>
          </div>
          <div class="grid md:grid-cols-3 gap-8 text-center">
            <div class="bg-background p-8 rounded-lg">
              <div class="inline-block bg-primary/10 text-primary p-4 rounded-full mb-4">
                <div class="w-8 h-8">${UsersRound}</div>
              </div>
              <h4 class="text-xl font-bold text-on-background mb-2">Character Profiles</h4>
              <p class="text-on-surface">Create rich profiles for people, link media, and tell their stories.</p>
            </div>
            <div class="bg-background p-8 rounded-lg">
              <div class="inline-block bg-primary/10 text-primary p-4 rounded-full mb-4">
                <div class="w-8 h-8">${Filter}</div>
              </div>
              <h4 class="text-xl font-bold text-on-background mb-2">Powerful Filtering</h4>
              <p class="text-on-surface">Instantly find any post with advanced sorting and filtering by tags, characters, and media type.</p>
            </div>
            <div class="bg-background p-8 rounded-lg">
              <div class="inline-block bg-primary/10 text-primary p-4 rounded-full mb-4">
                <div class="w-8 h-8">${ShieldCheck}</div>
              </div>
              <h4 class="text-xl font-bold text-on-background mb-2">Secure & Private</h4>
              <p class="text-on-surface">Your vault is yours alone. Built with robust security and user authentication.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="bg-background py-6">
        <div class="container mx-auto px-6 text-center text-on-surface/50">
          <p>&copy; ${new Date().getFullYear()} BOLT⚡VAULT. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  `;
  container.innerHTML = landingPageHtml;
}
