// marcasUI.js - Interfaz de usuario para el módulo Marcas
// Especificación funcional en docs/modules/marcas/marcasSpec.md
// Implementación técnica en docs/modules/marcas/marcasImplementation.md

import { fetchMarcas, createMarca, updateMarca, deleteMarca } from './marcasAPI.js';
import { showError, clearError } from '../../utils/errorHandler.js';
import { getFormData, fillForm, resetForm } from '../../utils/formHelper.js';

// Elementos del DOM (se asignan al cargar la página)
let marcaForm;
let marcasTableBody;
let formTitle;
let cancelBtn;
const errorContainerId = 'errorContainer';

let editingId = null;

/**
 * Carga y muestra todas las marcas en la tabla
 */
async function loadMarcas() {
    try {
        clearError(errorContainerId);
        marcasTableBody.innerHTML = '<tr><td colspan="4">Cargando marcas...</td></tr>';
        
        const marcas = await fetchMarcas();
        
        if (marcas.length === 0) {
            marcasTableBody.innerHTML = '<tr><td colspan="4">No hay marcas registradas</td></tr>';
            return;
        }
        
        marcasTableBody.innerHTML = marcas.map(marca => `
            <tr>
                <td>${marca.id}</td>
                <td>${escapeHtml(marca.nombre)}</td>
                <td>${escapeHtml(marca.pais || '-')}</td>
                <td>
                    <button class="btn-edit" data-id="${marca.id}" data-action="edit">✏️ Editar</button>
                    <button class="btn-delete" data-id="${marca.id}" data-action="delete">🗑️ Eliminar</button>
                </td>
            </tr>
        `).join('');
        
        // Asignar eventos a los botones
        document.querySelectorAll('[data-action="edit"]').forEach(btn => {
            btn.addEventListener('click', () => editMarca(parseInt(btn.dataset.id)));
        });
        
        document.querySelectorAll('[data-action="delete"]').forEach(btn => {
            btn.addEventListener('click', () => deleteMarcaHandler(parseInt(btn.dataset.id)));
        });
        
    } catch (error) {
        showError(errorContainerId, 'Error al cargar las marcas', error);
        marcasTableBody.innerHTML = '<tr><td colspan="4">Error al cargar marcas</td></tr>';
    }
}

/**
 * Prepara el formulario para editar una marca
 */
async function editMarca(id) {
    try {
        clearError(errorContainerId);
        
        // Cargar datos actuales (simplificado: recargamos todas)
        const marcas = await fetchMarcas();
        const marca = marcas.find(m => m.id === id);
        
        if (!marca) {
            throw new Error('Marca no encontrada');
        }
        
        editingId = id;
        formTitle.textContent = '✏️ Editar Marca';
        fillForm(marcaForm, marca, 'marcaId');
        
        // Scroll al formulario
        document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        showError(errorContainerId, 'Error al cargar la marca para editar', error);
    }
}

/**
 * Maneja la eliminación de una marca (con confirmación)
 */
async function deleteMarcaHandler(id) {
    const confirmDelete = confirm('¿Estás seguro de eliminar esta marca? Si tiene coches asociados, la operación fallará.');
    
    if (!confirmDelete) return;
    
    try {
        clearError(errorContainerId);
        await deleteMarca(id);
        await loadMarcas();
        
        // Si estábamos editando esta marca, resetear formulario
        if (editingId === id) {
            resetFormHandler();
        }
        
    } catch (error) {
        showError(errorContainerId, 'Error al eliminar la marca. Verifica que no tenga coches asociados.', error);
    }
}

/**
 * Guarda una marca (crea o actualiza)
 */
async function saveMarca(event) {
    event.preventDefault();
    
    try {
        clearError(errorContainerId);
        
        const formData = getFormData(marcaForm);
        
        // Validaciones
        if (!formData.nombre || formData.nombre.trim() === '') {
            throw new Error('El nombre de la marca es obligatorio');
        }
        
        const marcaData = {
            nombre: formData.nombre.trim(),
            pais: formData.pais ? formData.pais.trim() : null
        };
        
        if (editingId) {
            await updateMarca(editingId, marcaData);
        } else {
            await createMarca(marcaData);
        }
        
        // Resetear formulario y recargar
        resetFormHandler();
        await loadMarcas();
        
    } catch (error) {
        showError(errorContainerId, error.message || 'Error al guardar la marca', error);
    }
}

/**
 * Resetea el formulario al modo creación
 */
function resetFormHandler() {
    editingId = null;
    formTitle.textContent = '➕ Nueva Marca';
    resetForm(marcaForm, 'marcaId');
}

// Event listeners e inicialización
document.addEventListener('DOMContentLoaded', () => {
    marcaForm = document.getElementById('marcaForm');
    marcasTableBody = document.getElementById('marcasTableBody');
    formTitle = document.getElementById('formTitle');
    cancelBtn = document.getElementById('cancelBtn');

    if (!marcaForm || !marcasTableBody) {
        showError(errorContainerId, 'Error: no se encontró el formulario en la página. Abre marcas.html, no index.html.');
        return;
    }

    marcaForm.addEventListener('submit', saveMarca);
    cancelBtn.addEventListener('click', resetFormHandler);
    loadMarcas();
});

// Utilidad para escape HTML (seguridad)
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}