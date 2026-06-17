# Especificación funcional — Módulo Coches

Define **qué debe hacer** la pantalla de gestión de coches desde el punto de vista del usuario.

---

## Objetivo

Permitir al usuario **crear, ver, editar y eliminar** coches, cada uno asociado a una marca existente.

---

## Pantalla: `coches.html`

### Secciones

1. **Cabecera** — Título, enlaces a Inicio y Gestión de Marcas
2. **Formulario** — Alta y edición de coches
3. **Tabla** — Listado de coches con nombre de marca visible

---

## Campos del formulario

| Campo  | Tipo     | Obligatorio | Validación                              |
|--------|----------|-------------|-----------------------------------------|
| Marca  | select   | Sí          | Debe elegir una opción del desplegable  |
| Modelo | texto    | Sí          | No vacío, máximo 100 caracteres         |
| Año    | número   | No          | Entre 1900 y año actual + 1             |
| Precio | número   | No          | Decimal positivo (euros)                |

---

## Comportamientos esperados

### Al cargar la página

1. Cargar marcas en el `<select>` (desde Supabase)
2. Si no hay marcas: solo opción "Seleccione una marca" + enlace a crear marcas
3. Cargar coches en la tabla (más recientes primero)
4. Mostrar nombre de marca en cada fila (no solo el ID)

### Crear coche

1. Usuario selecciona marca, escribe modelo (y opcionalmente año/precio)
2. Pulsa **Guardar**
3. Validaciones:
   - Sin marca → "Debe seleccionar una marca"
   - Sin modelo → "El modelo es obligatorio"
4. Si OK → coche creado, formulario reseteado, tabla actualizada

### Editar coche

1. Usuario pulsa **Editar** en una fila
2. Formulario rellenado (incluida la marca en el select)
3. Título: "✏️ Editar Coche"
4. Scroll suave al formulario
5. Guardar → actualiza y vuelve a modo "Nuevo Coche"

### Cancelar

- Limpia formulario y vuelve a "➕ Nuevo Coche"

### Eliminar coche

1. Confirmación: "¿Estás seguro de eliminar este coche?"
2. Si confirma → elimina y actualiza tabla
3. Si estaba editando ese coche → resetea formulario

---

## Tabla de coches

| Columna | Contenido                              |
|---------|----------------------------------------|
| ID      | Identificador numérico                 |
| Marca   | Nombre de la marca (no el ID)          |
| Modelo  | Nombre del modelo                      |
| Año     | Año o "-" si vacío                     |
| Precio  | Formato "25000.00 €" o "-" si vacío    |
| Acciones| Botones Editar y Eliminar              |

---

## Mensajes al usuario

| Situación           | Mensaje                              |
|---------------------|--------------------------------------|
| Sin marca           | Debe seleccionar una marca           |
| Sin modelo          | El modelo es obligatorio             |
| Error al cargar     | Error al cargar los coches / marcas  |
| Sin coches          | No hay coches registrados            |

---

## Dependencia de Marcas

- El desplegable de marcas se carga con `fetchMarcas()` del módulo Marcas
- **Flujo recomendado:** crear marcas primero en `marcas.html`, luego coches aquí
- Si el select está vacío, el hint del formulario enlaza a Gestión de Marcas

---

## Referencias

- Implementación: [`cochesImplementation.md`](cochesImplementation.md)
- Base de datos: [`../../database.md`](../../database.md)
- Módulo Marcas: [`../marcas/marcasSpec.md`](../marcas/marcasSpec.md)
