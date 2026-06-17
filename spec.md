# Especificación del proyecto — Gestión de Coches y Marcas

> **Prompt del proyecto:** Documento de referencia para construir, mantener o regenerar esta aplicación. Describe el qué, el cómo y las reglas técnicas que debe cumplir el código.

---

## 1. Resumen ejecutivo

Desarrollar una aplicación web frontend que gestione **marcas de vehículos** y **coches** asociados, usando **JavaScript modular (ES6)** y **Supabase** como base de datos y API REST. No se usan frameworks (React, Vue, etc.). La interfaz es HTML + CSS vanilla.

### Alcance

- CRUD completo para marcas
- CRUD completo para coches (con relación a marcas)
- Manejo de errores visible para el usuario
- Código organizado por módulos independientes

### Fuera de alcance

- Autenticación de usuarios
- Paginación o búsqueda avanzada
- Tests automatizados
- Backend propio (todo pasa por Supabase)

---

## 2. Prompt de generación (para IA o desarrollador)

```
Crea una aplicación web de gestión de coches y marcas con estas características:

STACK:
- HTML5, CSS3, JavaScript ES Modules (sin bundler ni framework)
- Supabase como backend (REST API con fetch)
- Servidor local HTTP obligatorio para módulos ES6

PÁGINAS:
1. index.html — Menú principal con enlaces a marcas y coches
2. marcas.html — Formulario + tabla CRUD de marcas
3. coches.html — Formulario + tabla CRUD de coches

ARQUITECTURA DE CARPETAS:
- js/config.js — URL, API key, headers y nombres de tablas
- js/modules/{entidad}/{entidad}API.js — fetch hacia Supabase
- js/modules/{entidad}/{entidad}UI.js — DOM, eventos, validaciones
- js/utils/errorHandler.js — mostrar/ocultar errores
- js/utils/formHelper.js — getFormData, fillForm, resetForm

BASE DE DATOS (Supabase/PostgreSQL):
- Tabla marcas: id (serial PK), nombre (varchar NOT NULL), pais (varchar nullable)
- Tabla coches: id (serial PK), marca_id (FK → marcas.id ON DELETE RESTRICT),
  modelo (varchar NOT NULL), anio (integer nullable), precio (numeric nullable)

REGLAS:
- Separar API y UI en archivos distintos por módulo
- Usar async/await con fetch
- Validar campos obligatorios antes de enviar
- Escapar HTML al renderizar datos en tablas (XSS)
- Mostrar errores en un div #errorContainer durante 5 segundos
- Confirmar antes de eliminar registros
- No eliminar marcas con coches asociados (FK RESTRICT)
```

---

## 3. Modelo de datos

### 3.1 Tabla `marcas`

| Columna  | Tipo         | Restricciones        | Descripción              |
|----------|--------------|----------------------|--------------------------|
| `id`     | `serial`     | PRIMARY KEY          | Identificador autoincremental |
| `nombre` | `varchar(50)`| NOT NULL             | Nombre de la marca       |
| `pais`   | `varchar(50)`| NULL                 | País de origen (opcional)|

### 3.2 Tabla `coches`

| Columna    | Tipo           | Restricciones                    | Descripción           |
|------------|----------------|----------------------------------|-----------------------|
| `id`       | `serial`       | PRIMARY KEY                      | Identificador         |
| `marca_id` | `integer`      | NOT NULL, FK → `marcas(id)`      | Marca del coche       |
| `modelo`   | `varchar(100)` | NOT NULL                         | Modelo del vehículo   |
| `anio`     | `integer`      | NULL                             | Año de fabricación    |
| `precio`   | `numeric(10,2)`| NULL                             | Precio en euros       |

### 3.3 SQL de creación

```sql
-- Tabla marcas
CREATE TABLE marcas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    pais VARCHAR(50)
);

-- Tabla coches
CREATE TABLE coches (
    id SERIAL PRIMARY KEY,
    marca_id INTEGER NOT NULL REFERENCES marcas(id) ON DELETE RESTRICT,
    modelo VARCHAR(100) NOT NULL,
    anio INTEGER,
    precio NUMERIC(10, 2)
);

-- Datos de ejemplo (opcional)
INSERT INTO marcas (nombre, pais) VALUES
    ('Toyota', 'Japón'),
    ('Volkswagen', 'Alemania');

INSERT INTO coches (marca_id, modelo, anio, precio) VALUES
    (1, 'Corolla', 2022, 25000.00),
    (2, 'Golf', 2021, 22000.00);
```

### 3.4 Políticas RLS (Row Level Security)

Para desarrollo educativo, habilitar acceso público de lectura/escritura con la clave `anon` o desactivar RLS en tablas de prueba. En producción, configurar políticas restrictivas.

---

## 4. Arquitectura de software

### 4.1 Capas

```
┌─────────────────────────────────────────┐
│  HTML (marcas.html / coches.html)       │
│  Estructura: formulario + tabla         │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│  UI Layer (*UI.js)                      │
│  - Event listeners                      │
│  - Validación de formularios            │
│  - Renderizado de tablas                │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│  API Layer (*API.js)                    │
│  - fetch GET/POST/PATCH/DELETE          │
│  - Mapeo de respuestas JSON             │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│  Supabase REST API (PostgREST)          │
└─────────────────────────────────────────┘
```

### 4.2 Módulo Marcas

**Archivos:** `marcasAPI.js`, `marcasUI.js`

**Funciones API:**

| Función          | Método HTTP | Endpoint Supabase                          |
|------------------|-------------|--------------------------------------------|
| `fetchMarcas`    | GET         | `/marcas?select=*&order=nombre.asc`        |
| `fetchMarcaById` | GET         | `/marcas?id=eq.{id}&select=*`              |
| `createMarca`    | POST        | `/marcas` (header `Prefer: return=representation`) |
| `updateMarca`    | PATCH       | `/marcas?id=eq.{id}`                       |
| `deleteMarca`    | DELETE      | `/marcas?id=eq.{id}`                       |

**Campos del formulario:**

- `nombre` (obligatorio, max 50 caracteres)
- `pais` (opcional, max 50 caracteres)

### 4.3 Módulo Coches

**Archivos:** `cochesAPI.js`, `cochesUI.js`

**Funciones API:**

| Función           | Método HTTP | Endpoint Supabase                                      |
|-------------------|-------------|--------------------------------------------------------|
| `fetchCoches`     | GET         | `/coches?select=*,marcas(nombre)&order=id.desc`        |
| `fetchCocheById`  | GET         | `/coches?id=eq.{id}&select=*`                          |
| `createCoche`     | POST        | `/coches`                                              |
| `updateCoche`     | PATCH       | `/coches?id=eq.{id}`                                   |
| `deleteCoche`     | DELETE      | `/coches?id=eq.{id}`                                   |

**Campos del formulario:**

- `marca_id` (obligatorio, select cargado desde `fetchMarcas`)
- `modelo` (obligatorio, max 100 caracteres)
- `anio` (opcional, número entre 1900 y año actual + 1)
- `precio` (opcional, decimal con 2 decimales)

**Nota:** Al listar coches, mapear `marcas.nombre` a `nombre_marca` para mostrar en la tabla.

---

## 5. Configuración (`js/config.js`)

Fuente única de verdad para:

```javascript
export { SUPABASE_URL, SUPABASE_KEY, SUPABASE_HEADERS, API_BASE, TABLES };
```

**Headers obligatorios en cada petición:**

```javascript
{
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json'
}
```

**Constante `TABLES`:**

```javascript
const TABLES = {
  COCHES: 'coches',
  MARCAS: 'marcas'
};
```

---

## 6. Utilidades compartidas

### 6.1 `errorHandler.js`

| Función      | Comportamiento                                              |
|--------------|-------------------------------------------------------------|
| `showError`  | Muestra mensaje en `#errorContainer`, log en consola, auto-oculta a los 5 s |
| `clearError` | Limpia y oculta el contenedor de errores                     |

### 6.2 `formHelper.js`

| Función           | Comportamiento                                           |
|-------------------|----------------------------------------------------------|
| `getFormData`     | Convierte FormData a objeto; parsea `anio` y `precio`    |
| `fillForm`        | Rellena campos del formulario para modo edición          |
| `resetForm`       | Resetea formulario y limpia campo oculto de ID           |
| `setFormDisabled` | Deshabilita inputs (reservado para futuras mejoras)      |

---

## 7. Reglas de implementación

### 7.1 JavaScript

- Usar **ES Modules**: `import` / `export`
- Scripts en HTML: `<script type="module" src="...">`
- Preferir `async/await` sobre `.then()` encadenados
- Una responsabilidad por archivo

### 7.2 UI/UX

- Mensaje "Cargando..." mientras llegan datos de la API
- Mensaje cuando no hay registros
- Botón **Cancelar** resetea el formulario al modo "Nuevo"
- Al editar, cambiar título del formulario (➕ Nuevo / ✏️ Editar)
- Scroll suave al formulario al entrar en modo edición
- `confirm()` antes de eliminar

### 7.3 Seguridad

- Escapar HTML con función `escapeHtml()` al insertar datos en `innerHTML`
- No exponer la clave `service_role` en el frontend (solo `anon`)

### 7.4 Manejo de errores API

- Si `response.ok` es `false`, leer cuerpo JSON de Supabase para obtener `message` o `hint`
- Lanzar `Error` descriptivo con código HTTP
- Capturar en UI y mostrar con `showError()`

---

## 8. Interfaz (HTML)

### 8.1 Elementos comunes en marcas.html y coches.html

- `#errorContainer` — contenedor de errores (clase `hidden` por defecto)
- `#formTitle` — título dinámico del formulario
- Formulario con botones Guardar y Cancelar
- Tabla con `#...TableBody` para filas dinámicas
- Navegación secundaria: Inicio, enlace cruzado al otro módulo

### 8.2 index.html

- Tarjetas de navegación (`nav-card`) hacia `coches.html` y `marcas.html`
- Sin JavaScript (solo HTML + CSS)

---

## 9. Estilos (`css/styles.css`)

- Diseño con gradiente de fondo y contenedor blanco centrado
- Formularios con `.form-group`, `.form-actions`
- Botones: `.btn-primary`, `.btn-secondary`, `.btn-edit`, `.btn-delete`
- Tablas con cabecera destacada
- Contenedor de error: `.error-container` (visible al quitar `.hidden`)
- Responsive básico para pantallas pequeñas

---

## 10. Criterios de aceptación

El proyecto se considera completo cuando:

- [ ] Se pueden crear, listar, editar y eliminar marcas
- [ ] Se pueden crear, listar, editar y eliminar coches
- [ ] El selector de marcas en coches se carga dinámicamente
- [ ] Validaciones impiden guardar sin nombre/modelo o sin marca seleccionada
- [ ] Errores de Supabase se muestran al usuario de forma legible
- [ ] No se puede eliminar una marca con coches (error manejado en UI)
- [ ] El código está separado en módulos API/UI según la estructura definida
- [ ] La aplicación funciona servida por HTTP local (no `file://`)

---

## 11. Posibles extensiones (futuro)

- Paginación en tablas largas
- Búsqueda/filtro por nombre o modelo
- Autenticación con Supabase Auth
- Tests con Vitest o Playwright
- Carpeta `docs/` con documentación por módulo

---

## 12. Referencias

- [Supabase REST API](https://supabase.com/docs/guides/api)
- [MDN: JavaScript Modules](https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Modules)
- [MDN: fetch](https://developer.mozilla.org/es/docs/Web/API/fetch)
- [MDN: async/await](https://developer.mozilla.org/es/docs/Learn/JavaScript/Asynchronous/Async_await)
