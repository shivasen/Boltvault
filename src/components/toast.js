import { CheckCircle, XCircle, Info } from 'lucide-static';

const getIcon = (type) => {
    switch (type) {
        case 'success':
            return CheckCircle;
        case 'error':
            return XCircle;
        default:
            return Info;
    }
};

const getColors = (type) => {
    switch (type) {
        case 'success':
            return 'bg-green-500';
        case 'error':
            return 'bg-red-500';
        default:
            return 'bg-blue-500';
    }
};

export function showToast(message, type = 'info', duration = 3000) {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'fixed top-5 right-5 z-[100] space-y-2';
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = `flex items-center p-4 rounded-lg shadow-lg text-white animate-slide-in-right ${getColors(type)}`;
    
    toast.innerHTML = `
        <div class="w-6 h-6 mr-3">${getIcon(type)}</div>
        <span>${message}</span>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove('animate-slide-in-right');
        toast.classList.add('animate-slide-out-right');
        toast.addEventListener('animationend', () => {
            toast.remove();
        });
    }, duration);
}
