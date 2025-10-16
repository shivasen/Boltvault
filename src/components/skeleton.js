const skeletonCard = `
<div class="aspect-square bg-surface rounded-lg overflow-hidden relative">
    <div class="absolute inset-0 bg-gray-700/50 animate-shimmer w-full h-full"></div>
</div>
`;

const skeletonHeader = `
<header class="mb-6">
    <div class="h-8 w-1/3 bg-surface rounded-md mb-4 relative overflow-hidden"><div class="absolute inset-0 bg-gray-700/50 animate-shimmer w-full h-full"></div></div>
    <div class="h-6 w-full bg-surface rounded-md relative overflow-hidden"><div class="absolute inset-0 bg-gray-700/50 animate-shimmer w-full h-full"></div></div>
</header>
`;

const profileSkeletonHeader = `
<header class="mb-8 md:mb-12">
    <div class="h-6 w-32 bg-surface rounded-md mb-6 relative overflow-hidden"><div class="absolute inset-0 bg-gray-700/50 animate-shimmer w-full h-full"></div></div>
    <div class="flex flex-col md:flex-row items-center">
        <div class="w-32 h-32 md:w-40 md:h-40 rounded-full bg-surface flex-shrink-0 mb-4 md:mb-0 md:mr-8 relative overflow-hidden"><div class="absolute inset-0 bg-gray-700/50 animate-shimmer w-full h-full"></div></div>
        <div class="flex-1 w-full text-center md:text-left">
            <div class="h-9 w-1/2 mx-auto md:mx-0 bg-surface rounded-md mb-3 relative overflow-hidden"><div class="absolute inset-0 bg-gray-700/50 animate-shimmer w-full h-full"></div></div>
            <div class="h-6 w-1/3 mx-auto md:mx-0 bg-surface rounded-md mb-3 relative overflow-hidden"><div class="absolute inset-0 bg-gray-700/50 animate-shimmer w-full h-full"></div></div>
            <div class="h-5 w-full bg-surface rounded-md mb-2 relative overflow-hidden"><div class="absolute inset-0 bg-gray-700/50 animate-shimmer w-full h-full"></div></div>
            <div class="h-5 w-3/4 bg-surface rounded-md relative overflow-hidden"><div class="absolute inset-0 bg-gray-700/50 animate-shimmer w-full h-full"></div></div>
        </div>
    </div>
</header>
`;

export function renderGallerySkeleton(container) {
    const skeletonHtml = `
        ${skeletonHeader}
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4">
            ${Array(10).fill(skeletonCard).join('')}
        </div>
    `;
    container.innerHTML = skeletonHtml;
}

export function renderProfileSkeleton(container) {
    const skeletonHtml = `
        ${profileSkeletonHeader}
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4">
            ${Array(5).fill(skeletonCard).join('')}
        </div>
    `;
    container.innerHTML = skeletonHtml;
}
