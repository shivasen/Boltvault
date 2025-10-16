import { ArrowUp } from 'lucide-static';

const handleScroll = () => {
    const backToTopButton = document.getElementById('back-to-top-btn');
    if (backToTopButton) {
        if (window.scrollY > 400) {
            backToTopButton.classList.remove('opacity-0', 'invisible');
            backToTopButton.classList.add('opacity-100', 'visible');
        } else {
            backToTopButton.classList.remove('opacity-100', 'visible');
            backToTopButton.classList.add('opacity-0', 'invisible');
        }
    }
};

const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth',
    });
};

export function initBackToTopButton(container) {
    const buttonHtml = `
        <button id="back-to-top-btn" aria-label="Back to top" class="fixed bottom-6 right-6 md:bottom-8 md:right-8 bg-primary text-background p-3 rounded-full shadow-lg opacity-0 invisible transition-all duration-300 ease-in-out hover:bg-opacity-80 z-40">
            <div class="w-6 h-6">${ArrowUp}</div>
        </button>
    `;
    container.innerHTML = buttonHtml;

    const backToTopButton = document.getElementById('back-to-top-btn');
    
    window.addEventListener('scroll', handleScroll);
    backToTopButton.addEventListener('click', scrollToTop);
}
