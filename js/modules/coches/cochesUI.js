// cochesUI.js - Interfaz de usuario para el módulo Coches
// Especificación funcional en docs/modules/coches/cochesSpec.md
// Implementación técnica en docs/modules/coches/cochesImplementation.md

import { fetchCoches, createCoche, updateCoche, deleteCoche } from './cochesAPI.js';
import { fetchMarcas } from '../marcas/marcasAPI.js';
import { showError, clearError } from '../../utils/errorHandler.js';
import { getFormData, fillForm, resetForm } from '../../utils/formHelper.js';

// Elementos del DOM
const cocheForm = document.getElementById('cocheForm');
const cochesTableBody = document.getElementById('cochesTableBody');
const formTitle = document.getElementById('formTitle');
const cancelBtn = document.getElementById('cancelBtn');
const marcaSelect = document.getElementById('marca_id');
const errorContainerId = 'errorContainer';

let editingId = null;
let marcasList = [];

/**
 * Carga las marcas en el selector
 */
async function loadMarcasSelect() {
    try {
        marcasList = await fetchMarcas();
        
        marcaSelect.innerHTML = '<option value="">Seleccione una marca</option>';
        
        marcasList.forEach(marca => {
            const option = document.createElement('option');
            option.value = marca.id;
            option.textContent = marca.nombre;
            marcaSelect.appendChild(option);
        });
        
    } catch (error) {
        showError(errorContainerId, 'Error al cargar las marcas', error);
    }
}

/**
 * Carga y muestra todos los coches en la tabla
 */
async function loadCoches() {
    try {
        clearError(errorContainerId);
        cochesTableBody.innerHTML = '<tr><td colspan="6">Cargando coches...</td></tr>';
        
        const coches = await fetchCoches();
        
        if (coches.length === 0) {
            cochesTableBody.innerHTML = '<tr><td colspan="6">No hay coches registrados</td></tr>';
            return;
        }
        
        cochesTableBody.innerHTML = coches.map(coche => `
            <tr>
                <td>${coche.id}</td>
                <td>${escapeHtml(coche.nombre_marca)}</td>
                <td>${escapeHtml(coche.modelo)}</td>
                <td>${coche.anio || '-'}</td>
                <td>${coche.precio ? coche.precio.toFixed(2) + ' €' : '-'}</td>
                <td>
                    <button class="btn-edit" data-id="${coche.id}" data-action="edit">✏️ Editar</button>
                    <button class="btn-delete" data-id="${coche.id}" data-action="delete">🗑️ Eliminar</button>
                </td>
            </tr>
        `).join('');
        
        // Asignar eventos a los botones
        document.querySelectorAll('[data-action="edit"]').forEach(btn => {
            btn.addEventListener('click', () => editCoche(parseInt(btn.dataset.id)));
        });
        
        document.querySelectorAll('[data-action="delete"]').forEach(btn => {
            btn.addEventListener('click', () => deleteCocheHandler(parseInt(btn.dataset.id)));
        });
        
    } catch (error) {
        showError(errorContainerId, 'Error al cargar los coches', error);
        cochesTableBody.innerHTML = '<tr><td colspan="6">Error al cargar coches</td></tr>';
    }
}

/**
 * Prepara el formulario para editar un coche
 */
async function editCoche(id) {
    try {
        clearError(errorContainerId);
        
        const coches = await fetchCoches();
        const coche = coches.find(c => c.id === id);
        
        if (!coche) {
            throw new Error('Coche no encontrado');
        }
        
        editingId = id;
        formTitle.textContent = '✏️ Editar Coche';
        fillForm(cocheForm, coche, 'cocheId');
        
        // Scroll al formulario
        document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        showError(errorContainerId, 'Error al cargar el coche para editar', error);
    }
}

/**
 * Maneja la eliminación de un coche (con confirmación)
 */
async function deleteCocheHandler(id) {
    const confirmDelete = confirm('¿Estás seguro de eliminar este coche?');
    
    if (!confirmDelete) return;
    
    try {
        clearError(errorContainerId);
        await deleteCoche(id);
        await loadCoches();
        
        if (editingId === id) {
            resetFormHandler();
        }
        
    } catch (error) {
        showError(errorContainerId, 'Error al eliminar el coche', error);
    }
}

/**
 * Guarda un coche (crea o actualiza)
 */
async function saveCoche(event) {
    event.preventDefault();
    
    try {
        clearError(errorContainerId);
        
        const formData = getFormData(cocheForm);
        
        // Validaciones
        if (!formData.marca_id) {
            throw new Error('Debe seleccionar una marca');
        }
        if (!formData.modelo || formData.modelo.trim() === '') {
            throw new Error('El modelo es obligatorio');
        }
        
        formData.modelo = formData.modelo.trim();
        
        // Solo enviamos los campos que Supabase necesita
        const cocheData = {
            marca_id: parseInt(formData.marca_id, 10),
            modelo: formData.modelo
        };
        
        if (formData.anio != null && !isNaN(formData.anio)) {
            cocheData.anio = parseInt(formData.anio, 10);
        }
        if (formData.precio != null && !isNaN(formData.precio)) {
            cocheData.precio = formData.precio;
        }
        
        if (editingId) {
            await updateCoche(editingId, cocheData);
        } else {
            await createCoche(cocheData);
        }
        
        resetFormHandler();
        await loadCoches();
        
    } catch (error) {
        showError(errorContainerId, error.message || 'Error al guardar el coche', error);
    }
}

/**
 * Resetea el formulario al modo creación
 */
function resetFormHandler() {
    editingId = null;
    formTitle.textContent = '➕ Nuevo Coche';
    resetForm(cocheForm, 'cocheId');
}

// Event listeners
cocheForm.addEventListener('submit', saveCoche);
cancelBtn.addEventListener('click', resetFormHandler);

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
    await loadMarcasSelect();
    await loadCoches();
});

// Utilidad para escape HTML
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}