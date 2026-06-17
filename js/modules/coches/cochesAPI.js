// cochesAPI.js - Comunicación con Supabase para el módulo Coches
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
 * Obtiene todos los coches con el nombre de su marca
 * @returns {Promise<Array>} Lista de coches con datos de marca
 */
export async function fetchCoches() {
    const url = `${API_BASE}/${TABLES.COCHES}?select=*,marcas(nombre)&order=id.desc`;
    
    const response = await fetch(url, {
        method: 'GET',
        headers: SUPABASE_HEADERS
    });
    
    if (!response.ok) {
        await handleApiError(response, 'Error al obtener coches');
    }
    
    const data = await response.json();
    return data.map(coche => ({
        ...coche,
        nombre_marca: coche.marcas?.nombre || 'Sin marca'
    }));
}

/**
 * Obtiene un coche por su ID
 * @param {number} id - ID del coche
 * @returns {Promise<Object|null>} Coche encontrado o null
 */
export async function fetchCocheById(id) {
    const url = `${API_BASE}/${TABLES.COCHES}?id=eq.${id}&select=*`;
    
    const response = await fetch(url, {
        method: 'GET',
        headers: SUPABASE_HEADERS
    });
    
    if (!response.ok) {
        await handleApiError(response, 'Error al obtener coche');
    }
    
    const data = await response.json();
    return data.length > 0 ? data[0] : null;
}

/**
 * Crea un nuevo coche
 * @param {Object} coche - Datos del coche (marca_id, modelo, anio, precio)
 * @returns {Promise<Object>} Coche creado
 */
export async function createCoche(coche) {
    const url = `${API_BASE}/${TABLES.COCHES}`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            ...SUPABASE_HEADERS,
            'Prefer': 'return=representation'
        },
        body: JSON.stringify(coche)
    });
    
    if (!response.ok) {
        await handleApiError(response, 'Error al crear coche');
    }
    
    const data = await response.json();
    return data[0];
}

/**
 * Actualiza un coche existente
 * @param {number} id - ID del coche
 * @param {Object} updates - Campos a actualizar
 * @returns {Promise<Object>} Coche actualizado
 */
export async function updateCoche(id, updates) {
    const url = `${API_BASE}/${TABLES.COCHES}?id=eq.${id}`;
    
    const response = await fetch(url, {
        method: 'PATCH',
        headers: {
            ...SUPABASE_HEADERS,
            'Prefer': 'return=representation'
        },
        body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
        await handleApiError(response, 'Error al actualizar coche');
    }
    
    const data = await response.json();
    return data[0];
}

/**
 * Elimina un coche
 * @param {number} id - ID del coche
 * @returns {Promise<boolean>} True si se eliminó correctamente
 */
export async function deleteCoche(id) {
    const url = `${API_BASE}/${TABLES.COCHES}?id=eq.${id}`;
    
    const response = await fetch(url, {
        method: 'DELETE',
        headers: SUPABASE_HEADERS
    });
    
    if (!response.ok) {
        await handleApiError(response, 'Error al eliminar coche');
    }
    
    return true;
}
