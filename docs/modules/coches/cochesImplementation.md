# Implementación técnica — Módulo Coches

Describe **cómo está implementado** el módulo Coches en el código.

---

## Archivos

| Archivo | Ruta |
|---------|------|
| API     | `js/modules/coches/cochesAPI.js` |
| UI      | `js/modules/coches/cochesUI.js` |
| HTML    | `coches.html` |

---

## cochesAPI.js

### Importaciones

```javascript
import { API_BASE, SUPABASE_HEADERS, TABLES } from '../../config.js';
```

### Funciones exportadas

| Función           | HTTP   | Descripción                                    |
|-------------------|--------|------------------------------------------------|
| `fetchCoches`     | GET    | Lista coches con join a `marcas(nombre)`       |
| `fetchCocheById`  | GET    | Un coche por ID                                |
| `createCoche`     | POST   | Inserta nuevo coche                            |
| `updateCoche`     | PATCH  | Actualiza campos                               |
| `deleteCoche`     | DELETE | Elimina por ID                                 |

### Query con relación (join)

```
GET /rest/v1/coches?select=*,marcas(nombre)&order=id.desc
```

### Mapeo de respuesta

Supabase devuelve:

```json
{
  "id": 1,
  "marca_id": 1,
  "modelo": "Corolla",
  "marcas": { "nombre": "Toyota" }
}
```

El API lo transforma a:

```javascript
{
  ...coche,
  nombre_marca: coche.marcas?.nombre || 'Sin marca'
}
```

### Body al crear/actualizar

Solo se envían campos de la tabla `coches`:

```json
{
  "marca_id": 1,
  "modelo": "Corolla",
  "anio": 2022,
  "precio": 25000
}
```

`anio` y `precio` se omiten si el usuario no los rellena.

---

## cochesUI.js

### Importaciones

```javascript
import { fetchCoches, createCoche, updateCoche, deleteCoche } from './cochesAPI.js';
import { fetchMarcas } from '../marcas/marcasAPI.js';
import { showError, clearError } from '../../utils/errorHandler.js';
import { getFormData, fillForm, resetForm } from '../../utils/formHelper.js';
```

> **Nota:** Reutiliza `fetchMarcas` del módulo Marcas para el `<select>`.

### Estado interno

```javascript
let editingId = null;
let marcasList = [];
```

### Elementos DOM

| Variable           | Selector HTML         |
|--------------------|-----------------------|
| `cocheForm`        | `#cocheForm`          |
| `cochesTableBody`  | `#cochesTableBody`    |
| `formTitle`        | `#formTitle`          |
| `cancelBtn`        | `#cancelBtn`          |
| `marcaSelect`      | `#marca_id`           |

### Funciones principales

| Función              | Cuándo se ejecuta                         |
|----------------------|-------------------------------------------|
| `loadMarcasSelect`   | Al iniciar (antes de cargar coches)       |
| `loadCoches`         | Al iniciar y tras guardar/borrar          |
| `editCoche(id)`      | Click Editar                              |
| `deleteCocheHandler` | Click Eliminar                            |
| `saveCoche(event)`   | Submit del formulario                     |
| `resetFormHandler`   | Cancelar o tras guardar                   |

### Inicialización

```javascript
document.addEventListener('DOMContentLoaded', async () => {
    await loadMarcasSelect();
    await loadCoches();
});
```

Usa `async/await` porque hay dos peticiones secuenciales al arrancar.

### Validación y construcción del payload

```javascript
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
```

### Formato de precio en tabla

```javascript
coche.precio ? coche.precio.toFixed(2) + ' €' : '-'
```

`toFixed(2)` muestra siempre 2 decimales.

---

## coches.html — IDs requeridos

```html
<div id="errorContainer"></div>
<h2 id="formTitle"></h2>
<form id="cocheForm">
  <input type="hidden" id="cocheId" name="id">
  <select id="marca_id" name="marca_id"></select>
  <input id="modelo" name="modelo">
  <input id="anio" name="anio" type="number">
  <input id="precio" name="precio" type="number" step="0.01">
  <button type="submit">Guardar</button>
  <button type="button" id="cancelBtn">Cancelar</button>
</form>
<tbody id="cochesTableBody"></tbody>
```

---

## formHelper.js — conversión de tipos

Al leer el formulario:

- Campos vacíos → `null`
- `anio` y `precio` → `parseFloat(value)`

Esto permite distinguir "no rellenado" de "cero".

---

## Referencias

- Especificación funcional: [`cochesSpec.md`](cochesSpec.md)
- Base de datos tabla `coches`: [`../../database.md`](../../database.md)
- API Marcas (select): [`../marcas/marcasImplementation.md`](../marcas/marcasImplementation.md)
