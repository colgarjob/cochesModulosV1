// formHelper.js - Utilidades para manejo de formularios

/**
 * Obtiene los datos de un formulario como objeto
 * @param {HTMLFormElement} form - Formulario HTML
 * @returns {Object} Objeto con los datos del formulario
 */
export function getFormData(form) {
  const formData = new FormData(form);
  const data = {};

  for (let [key, value] of formData.entries()) {
    // Convertir números donde corresponda
    if (value === "") {
      data[key] = null;
    } else if (key === "anio" || key === "precio") {
      data[key] = parseFloat(value);
    } else {
      data[key] = value;
    }
  }

  return data;
}

/**
 * Rellena un formulario con datos existentes (para edición)
 * @param {HTMLFormElement} form - Formulario HTML
 * @param {Object} data - Datos a rellenar
 * @param {string} idFieldId - ID del campo oculto para el ID
 */
export function fillForm(form, data, idFieldId) {
  const idField = form.querySelector(`#${idFieldId}`);
  if (idField) idField.value = data.id || "";

  for (let [key, value] of Object.entries(data)) {
    const field = form.querySelector(`#${key}`);
    if (field && key !== "id") {
      field.value = value !== null ? value : "";
    }
  }
}

/**
 * Resetea un formulario a su estado inicial
 * @param {HTMLFormElement} form - Formulario HTML
 * @param {string} idFieldId - ID del campo oculto para el ID
 */
export function resetForm(form, idFieldId) {
  form.reset();
  const idField = form.querySelector(`#${idFieldId}`);
  if (idField) idField.value = "";
}

/**
 * Deshabilita/habilita un formulario
 * @param {HTMLFormElement} form - Formulario HTML
 * @param {boolean} disabled - Estado de deshabilitación
 */
export function setFormDisabled(form, disabled) {
  const inputs = form.querySelectorAll('input, select, button[type="submit"]');
  inputs.forEach((input) => {
    if (input !== form.querySelector("#cancelBtn")) {
      input.disabled = disabled;
    }
  });
}
