# Implementación técnica — Módulo Marcas

Describe **cómo está implementado** el módulo Marcas en el código.

---

## Archivos

| Archivo | Ruta |
|---------|------|
| API     | `js/modules/marcas/marcasAPI.js` |
| UI      | `js/modules/marcas/marcasUI.js` |
| HTML    | `marcas.html` |

---

## marcasAPI.js

### Importaciones

```javascript
import { API_BASE, SUPABASE_HEADERS, TABLES } from '../../config.js';
```

### Funciones exportadas

| Función          | HTTP   | Descripción                          |
|------------------|--------|--------------------------------------|
| `fetchMarcas`    | GET    | Lista todas, orden `nombre.asc`      |
| `fetchMarcaById` | GET    | Una marca por ID                     |
| `createMarca`    | POST   | Inserta nueva marca                  |
| `updateMarca`    | PATCH  | Actualiza campos de una marca        |
| `deleteMarca`    | DELETE | Elimina una marca por ID             |

### Ejemplo de URL

```
GET https://TU-PROYECTO.supabase.co/rest/v1/marcas?select=*&order=nombre.asc
```

### Manejo de errores

Función interna `handleApiError(response, accion)`:

- Intenta leer `message` o `hint` del JSON de Supabase
- Lanza `Error` con código HTTP y detalle

### Crear marca — body enviado

```json
{
  "nombre": "Toyota",
  "pais": "Japón"
}
```

Header extra en POST: `Prefer: return=representation`

---

## marcasUI.js

### Importaciones

```javascript
import { fetchMarcas, createMarca, updateMarca, deleteMarca } from './marcasAPI.js';
import { showError, clearError } from '../../utils/errorHandler.js';
import { getFormData, fillForm, resetForm } from '../../utils/formHelper.js';
```

### Estado interno

```javascript
let editingId = null;  // null = crear, número = editar ese ID
```

### Elementos DOM (asignados en DOMContentLoaded)

| Variable          | Selector HTML        |
|-------------------|----------------------|
| `marcaForm`       | `#marcaForm`         |
| `marcasTableBody` | `#marcasTableBody`   |
| `formTitle`       | `#formTitle`         |
| `cancelBtn`       | `#cancelBtn`         |

### Funciones principales

| Función               | Cuándo se ejecuta                    |
|-----------------------|--------------------------------------|
| `loadMarcas`          | Al cargar página y tras guardar/borrar |
| `editMarca(id)`       | Click en botón Editar                |
| `deleteMarcaHandler`  | Click en botón Eliminar              |
| `saveMarca(event)`    | Submit del formulario                |
| `resetFormHandler`    | Click Cancelar o tras guardar        |
| `escapeHtml(str)`     | Al generar HTML de la tabla          |

### Event listeners

```javascript
marcaForm.addEventListener('submit', saveMarca);
cancelBtn.addEventListener('click', resetFormHandler);
// Botones Editar/Eliminar se asignan dinámicamente tras renderizar la tabla
```

### Validación antes de enviar

```javascript
if (!formData.nombre || formData.nombre.trim() === '') {
    throw new Error('El nombre de la marca es obligatorio');
}
```

---

## marcas.html — IDs requeridos

El JavaScript espera estos elementos:

```html
<div id="errorContainer"></div>
<h2 id="formTitle"></h2>
<form id="marcaForm">
  <input type="hidden" id="marcaId" name="id">
  <input id="nombre" name="nombre">
  <input id="pais" name="pais">
  <button type="submit">Guardar</button>
  <button type="button" id="cancelBtn">Cancelar</button>
</form>
<tbody id="marcasTableBody"></tbody>
```

---

## Flujo saveMarca (resumen)

```
submit → getFormData → validar nombre →
  editingId ? updateMarca(id, data) : createMarca(data) →
  resetFormHandler → loadMarcas
```

---

## Referencias

- Especificación funcional: [`marcasSpec.md`](marcasSpec.md)
- Base de datos tabla `marcas`: [`../../database.md`](../../database.md)
