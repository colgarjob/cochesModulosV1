// marcasAPI.js - Comunicación con Supabase para el módulo Marcas
// La estructura de la tabla está definida en docs/database.md

import { API_BASE, SUPABASE_HEADERS, TABLES } from '../../config.js';

async function handleApiError(response, accion) {
    let detalle = response.statusText || 'Error desconocido';
    try {
        const body = await response.json();
        detalle = body.message || body.hint || detalle;
    } catch (_) {
        // La respuesta no trae JSON
    }
    throw new Error(`${accion} (${response.status}): ${detalle}`);
}

/**
 * Obtiene todas las marcas
 * @returns {Promise<Array>} Lista de marcas ordenadas por nombre
 */
export async function fetchMarcas() {
    const url = `${API_BASE}/${TABLES.MARCAS}?select=*&order=nombre.asc`;
    
    const response = await fetch(url, {
        method: 'GET',
        headers: SUPABASE_HEADERS
    });
    
    if (!response.ok) {
        await handleApiError(response, 'Error al obtener marcas');
    }
    
    return await response.json();
}

/**
 * Obtiene una marca por su ID
 * @param {number} id - ID de la marca
 * @returns {Promise<Object|null>} Marca encontrada o null
 */
export async function fetchMarcaById(id) {
    const url = `${API_BASE}/${TABLES.MARCAS}?id=eq.${id}&select=*`;
    
    const response = await fetch(url, {
        method: 'GET',
        headers: SUPABASE_HEADERS
    });
    
    if (!response.ok) {
        throw new Error(`Error al obtener marca: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.length > 0 ? data[0] : null;
}

/**
 * Crea una nueva marca
 * @param {Object} marca - Datos de la marca (nombre, pais)
 * @returns {Promise<Object>} Marca creada
 */
export async function createMarca(marca) {
    const url = `${API_BASE}/${TABLES.MARCAS}`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            ...SUPABASE_HEADERS,
            'Prefer': 'return=representation'
        },
        body: JSON.stringify(marca)
    });
    
    if (!response.ok) {
        await handleApiError(response, 'Error al crear marca');
    }
    
    const data = await response.json();
    return data[0];
}

/**
 * Actualiza una marca existente
 * @param {number} id - ID de la marca
 * @param {Object} updates - Campos a actualizar
 * @returns {Promise<Object>} Marca actualizada
 */
export async function updateMarca(id, updates) {
    const url = `${API_BASE}/${TABLES.MARCAS}?id=eq.${id}`;
    
    const response = await fetch(url, {
        method: 'PATCH',
        headers: SUPABASE_HEADERS,
        body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
        throw new Error(`Error al actualizar marca: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data[0];
}

/**
 * Elimina una marca
 * @param {number} id - ID de la marca
 * @returns {Promise<boolean>} True si se eliminó correctamente
 */
export async function deleteMarca(id) {
    const url = `${API_BASE}/${TABLES.MARCAS}?id=eq.${id}`;
    
    const response = await fetch(url, {
        method: 'DELETE',
        headers: SUPABASE_HEADERS
    });
    
    if (!response.ok) {
        throw new Error(`Error al eliminar marca: ${response.statusText}`);
    }
    
    return true;
}