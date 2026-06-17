// errorHandler.js - Manejo global de errores
// Reglas definidas en spec.md sección 3.3

/**
 * Muestra un error en el contenedor de errores
 * @param {string} errorContainerId - ID del contenedor de errores
 * @param {string} message - Mensaje de error para el usuario
 * @param {Error} error - Objeto error opcional para console.error
 */
export function showError(errorContainerId, message, error = null) {
  const errorContainer = document.getElementById(errorContainerId);
  if (!errorContainer) return;
  
  if (error) {
      console.error('[ERROR]', error);
      console.error('[ERROR DETAIL]', error.message || error);
  }
  
  errorContainer.textContent = message;
  errorContainer.classList.remove('hidden');
  
  // Ocultar automáticamente después de 5 segundos
  setTimeout(() => {
      if (errorContainer) {
          errorContainer.classList.add('hidden');
      }
  }, 5000);
}

/**
* Limpia el contenedor de errores
* @param {string} errorContainerId - ID del contenedor de errores
*/
export function clearError(errorContainerId) {
  const errorContainer = document.getElementById(errorContainerId);
  if (errorContainer) {
      errorContainer.classList.add('hidden');
      errorContainer.textContent = '';
  }
}
