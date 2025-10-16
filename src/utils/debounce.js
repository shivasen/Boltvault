/**
 * A utility function to delay the execution of a function.
 * This is useful for events that fire rapidly, like search input.
 * @param {Function} func The function to execute after the debounce time.
 * @param {number} wait The debounce time in milliseconds.
 * @returns {Function} The debounced function.
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
