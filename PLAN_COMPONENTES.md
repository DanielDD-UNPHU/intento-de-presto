# Plan: Sistema de Componentes

> Documento de planificación. Cuando Julio confirme los 6 puntos abiertos al final, este plan se vuelve el contrato de implementación.

## El modelo en una frase

Un componente **no es** una caja ni un contenedor. Es un **tag** que se le pone a los items. Los items siguen viviendo donde corresponden estructuralmente (en sus categorías BC3 dentro de los Bloques), pero llevan una marca que dice "yo soy parte de Apto Tipo B" y el sistema usa esa marca para sincronizarlos entre sí.

## Por qué este modelo gana

- Los items componente y los items libres pueden convivir en la misma categoría BC3 sin duplicar nada. `A04# HORMIGON > A0402# COLUMNAS` puede contener una columna libre y una columna del componente Apto Tipo B juntas. La auto-categorización BC3 las mete a las dos en la misma carpeta.
- La separación visual la da una **nueva columna en el grid** que muestra el nombre del componente al que pertenece cada item. Los libres aparecen vacíos en esa columna. Cero confusión de un vistazo.
- No hay "molde" ni "instancia". Todos los items tagueados son iguales. Si borras 3 de 4, los otros siguen vivos. Si borras los 4, el componente desaparece del proyecto solo.

## Modelo de datos

### Cambios en `ConceptoPresupuesto` (`src/types.ts`)

```ts
interface ConceptoPresupuesto {
  // ...campos existentes...

  // Tag — todos los items del mismo componente comparten este id
  componenteId?: string;        // ej "comp-7a9f"

  // Identifica el "papel" del item dentro del componente para sincronizar
  // ediciones entre instancias. Items "equivalentes" entre instancias
  // comparten este id.
  componenteSlotId?: string;    // ej "slot-3e1b"
}
```

### Nueva interfaz `ComponenteInfo`

```ts
interface ComponenteInfo {
  id: string;            // "comp-7a9f"
  nombre: string;        // "Apartamento Tipo Bloque B"
  color: string;         // color asignado para el chip de la columna
  createdAt: string;     // ISO timestamp
}
```

### Nuevo state en `usePresupuesto.ts`

```ts
componentes: Record<string, ComponenteInfo>
```

### Cómo funcionan los dos campos

- **`componenteId`** dice "a qué componente pertenezco". Todos los items de "Apto Tipo B" en cualquier Nivel comparten el mismo `componenteId`.
- **`componenteSlotId`** dice "qué papel cumplo dentro del componente". La columna 30x30 del Apto Tipo B en Nivel 3 y la columna 30x30 del Apto Tipo B en Nivel 4 comparten el mismo `componenteSlotId`. Eso es lo que permite que editar el precio en una se propague a la otra.

### Asignación de slot IDs

- Cuando se crea un componente desde una selección múltiple, cada item seleccionado recibe un `componenteSlotId` único (uuid).
- Cuando se copia el componente a otro lugar, los slot IDs se **preservan** en las copias. Así quedan automáticamente linkeadas.
- Cuando se agrega un item nuevo a un componente existente, se le asigna un slot ID nuevo y el sistema replica ese slot a las otras instancias.

## La nueva columna "Componente" en el grid

Agregar una columna nueva al `COL_TEMPLATE` de `PresupuestoGrid.tsx` (probablemente entre `NATC` y `CODIGO`) con:

- **Para items con `componenteId`**: chip pequeño con el nombre del componente y color asignado, ej `🏷️ Apto Tipo B`. Click en el chip → menú rápido (cambiar a otro componente, hacer único, ver todas las instancias).
- **Para items libres**: vacío, o un botón sutil `+ Agregar a componente` que aparece en hover.

El color de cada componente se asigna automáticamente (rotando por una paleta de 8-10 colores) al momento de crearlo, y queda guardado en `ComponenteInfo.color`.

## Operaciones — cómo funciona cada una

### 1. Crear componente desde selección múltiple

- Multi-select de items en cualquier parte del árbol (drag select / Cmd+click — ya existe).
- En la `FloatingToolbar` aparece un botón nuevo "Crear componente".
- Click → modal pidiendo nombre ("Apartamento Tipo Bloque B").
- El sistema:
  1. Crea un nuevo `ComponenteInfo` con id, nombre y color asignado.
  2. A cada item seleccionado le asigna `componenteId` (el nuevo) y `componenteSlotId` (uno único por item).
  3. Los items **no se mueven** — siguen donde estaban en su Bloque, dentro de su categoría BC3.

### 2. Copiar componente a otro lugar

- Click derecho en cualquier item que sea parte de un componente.
- Aparece el context menu con "Copiar componente a..." → submenú o picker que lista los destinos válidos:
  - Nivel 3
  - Nivel 4
  - Nivel 5 → Bloque A
  - Nivel 5 → Bloque B
  - etc.
- Click en un destino → el sistema:
  1. Toma todos los items con ese `componenteId`.
  2. Para cada uno, crea un clon en el destino aplicando la auto-categorización BC3 (los clones se integran en la jerarquía BC3 del destino, fusionando con categorías existentes si las hay).
  3. Cada clon hereda el `componenteId` y `componenteSlotId` del original → quedan linkeados automáticamente.
- Si el destino ya tiene una instancia del mismo componente: el sistema bloquea la operación con mensaje "Ya existe Apto Tipo B en este Nivel".

### 3. Editar un item — propagación automática

- Al confirmar una edición de cualquier campo (precio, cantidad, descripción, unidad), el hook detecta `componenteId` + `componenteSlotId`.
- Recorre el flat map y aplica el mismo cambio a todos los items que comparten ambos.
- **Indicador visual**: parpadeo cyan en las celdas actualizadas durante 300ms para que se vea que la propagación ocurrió.

### 4. Agregar un item nuevo a un componente existente

Tres formas:

- **Forma A**: editar el item libre, click en su columna Componente vacía, dropdown → seleccionar "Apartamento Tipo Bloque B" → confirmar.
- **Forma B**: click derecho en el item libre → "Agregar al componente..." → seleccionar de la lista.
- **Forma C** (la más fluida): cuando agregas un item dentro de un Bloque que ya tiene una instancia del componente, el sistema te pregunta automáticamente: "¿Este item es parte de Apto Tipo B?" con un toggle Sí/No. Si decís sí, se taguea solo.

Al taguear un item nuevo, el sistema:

1. Genera un nuevo `componenteSlotId`.
2. Para cada **otra instancia** del componente en el proyecto (las encuentra agrupando items por `componenteId` y por su Bloque/Folder ancestro), crea un item equivalente con el mismo `componenteSlotId`, mismos valores por defecto, en la misma posición BC3.
3. Pregunta primero: "Esto agregará el item a las otras N instancias del proyecto. ¿Confirmar?".

### 5. Hacer único un item (romper el link)

- Click derecho en un item del componente → "Hacer único".
- El sistema le quita `componenteId` y `componenteSlotId` a ESE item solo. Los demás items linkeados siguen sincronizados entre sí, ese queda libre.
- En el grid: el chip del componente desaparece de esa fila.

### 6. Quitar del componente vs. eliminar la fila

- **"Hacer único" / "Quitar del componente"**: desliga el item pero no lo borra. Sigue ahí como item libre.
- **"Eliminar fila"**: borra el item del proyecto. Las otras instancias de ese slot en otros lugares siguen vivas.
- Si Julio quiere borrar el item en TODAS las instancias del proyecto a la vez, usa "Borrar de todas las instancias" (descrito abajo).

### 7. Operaciones bulk con click derecho

Cuando el click derecho cae sobre un item de un componente, el menú contextual incluye:

- **Copiar componente a...** → ya descrito.
- **Seleccionar todas las instancias** → marca como seleccionados todos los items con el mismo `componenteId` en el proyecto. Después podés operar sobre todos juntos (mover, borrar, cambiar precio) usando la `FloatingToolbar`.
- **Borrar todas las instancias** → borra TODOS los items con el mismo `componenteId`. Pregunta confirmación: "Esto eliminará Apto Tipo B del proyecto entero (N items en M Niveles). ¿Confirmar?". Cuando se borra el último item, el `ComponenteInfo` se purga del registro automáticamente.
- **Renombrar componente** → cambia `ComponenteInfo.nombre`, todos los chips del grid se actualizan instantáneamente.
- **Hacer único** → sobre un solo item.
- **Quitar del componente** → sinónimo de hacer único, sin borrar.

### 8. El componente "se borra solo" cuando no quedan instancias

- No hay molde central. El componente existe mientras al menos un item del proyecto tenga ese `componenteId`.
- Cuando se borra el último item con ese tag, un cleanup pasa por el `componentes` registry y elimina el `ComponenteInfo` huérfano.
- Esto matchea exactamente lo que dijo Julio: *"el componente como tal existe en el universo entero. Los componentes se borran por completo cuando ya no queda ningún componente."*

## Cuestiones que necesito que Julio confirme

| # | Pregunta | Mi voto |
|---|---|---|
| 1 | Cuando agrego un item nuevo a un componente que ya tiene 7 instancias en otros Niveles, ¿el sistema debe replicarlo automáticamente en las otras 7? | Sí, con confirmación previa. Si no replica, el componente queda inconsistente entre instancias. |
| 2 | ¿Editar el `componenteSlotId` de un item en una sola instancia? | Esto no debería poder hacerse desde la UI — el slot ID es interno. La edición de campos sí se propaga, pero el "qué item es" no. |
| 3 | Cuando copio un componente a un nuevo Nivel y el destino ya tiene categorías BC3 con items libres compatibles (ej: ya hay un `A04# HORMIGON` con columnas libres), los items del componente se integran en la misma carpeta BC3 sin tocar los libres existentes. La columna Componente diferencia cuáles son del componente y cuáles son libres en la misma jerarquía. ¿OK? | Sí. |
| 4 | Renombrar un componente afecta a todos los chips de todas las instancias instantáneamente. ¿OK? | Sí. |
| 5 | ¿Los componentes son por proyecto o por empresa? | Por proyecto al inicio. Si después quieres una librería de componentes reusable entre proyectos, lo agregamos en una segunda fase. |
| 6 | ¿El "color" del componente que se asigna automáticamente, lo dejamos auto o quieres poder elegirlo manualmente? | Auto al crear, con la opción de cambiarlo después con click derecho → "Cambiar color". |

## Lo que cambia técnicamente

### Archivos a modificar

- **`src/types.ts`**: dos campos nuevos en `ConceptoPresupuesto` + nueva interfaz `ComponenteInfo`.
- **`src/hooks/usePresupuesto.ts`**:
  - Nuevo state `componentes: Record<string, ComponenteInfo>`.
  - Funciones nuevas:
    - `createComponente(itemIds, nombre)`
    - `copyComponenteTo(componenteId, targetId)`
    - `addItemToComponente(itemId, componenteId)`
    - `removeItemFromComponente(itemId)` (alias: hacerUnico)
    - `deleteAllInstancesOfComponente(componenteId)`
    - `renameComponente(id, nombre)`
    - `selectAllInstancesOfComponente(componenteId)`
  - Modificar `updateConcepto` para que aplique el cambio a todos los items con el mismo `(componenteId, componenteSlotId)` cuando corresponda.
  - Cleanup automático de componentes huérfanos al borrar el último item.
- **`src/components/PresupuestoGrid.tsx`**:
  - Nueva columna "Componente" en el `COL_TEMPLATE`.
  - Renderizar el chip con el nombre y color del componente.
  - Click derecho → menú contextual.
- **`src/components/FloatingToolbar.tsx`**: agregar botón "Crear componente" (visible cuando hay multi-selección).
- **`src/utils/searchUtils.ts`**: extender la búsqueda para que también matchee por nombre del componente (opcional).

### Archivos nuevos

- **`src/components/ContextMenu.tsx`**: menú contextual del click derecho.
- **`src/components/ComponenteChip.tsx`**: chip pequeño que se muestra en la columna Componente.
- **`src/components/ComponentePicker.tsx`**: modal para "agregar al componente" y "copiar componente a".
- **`src/components/CreateComponenteModal.tsx`**: modal para nombrar el componente al crearlo desde selección.
- **`src/utils/componenteUtils.ts`**: helpers para asignar colores automáticos, encontrar instancias, agrupar por anchor, etc.

## Estimación honesta

| Tarea | Horas |
|---|---|
| Modelo de datos + funciones del store | 2.5 |
| Columna Componente + chip + edición desde celda | 2 |
| Click derecho con context menu | 1.5 |
| Modal de "copiar componente a..." + picker de destino | 1.5 |
| Lógica de propagación al editar (con override del sistema actual) | 1.5 |
| Lógica de replicación al agregar items a componente existente | 2 |
| Lógica de cleanup de componentes huérfanos | 0.5 |
| Operaciones bulk (seleccionar todas / borrar todas / renombrar) | 1 |
| Polish visual + testing manual | 1.5 |
| **Total** | **~14 horas** |

## Resumen ejecutivo para Julio

> Tu idea es la correcta y yo descarto las dos mías. Resuelve el conflicto de la auto-categorización porque los items siguen viviendo en su carpeta BC3 normal — el componente es solo una etiqueta sobre cada item. Vamos a agregar una columna "Componente" en el grid donde aparece el nombre del componente al que pertenece cada item (vacío para los libres), y un click derecho que te deja copiar componentes a otros niveles, hacer items únicos, agregar items existentes a un componente, borrar todas las instancias de golpe, etc. Las ediciones se propagan automáticamente entre items linkeados. No hay "molde" — cuando borras el último item del componente, el componente se va solo del proyecto. Necesito que confirmes 6 puntos sueltos y arranco. Estimado: ~14 horas de trabajo limpio.

## Notas para retomar el trabajo después

- Antes de codear, revisar si en el código actual hay restos del sistema de componentes anterior (campos `componentSourceId` y `isComponentSource` en `ConceptoPresupuesto`, stripes violeta y cyan en `PresupuestoGrid`, funciones `copyAsComponent` / `copyAsIndependent`, modal `PropagationDialog`). Hay que decidir si se elimina ese sistema viejo o se evoluciona al nuevo.
- El sistema de overrides existente (precios overrideados con asiento rojo) tiene que seguir funcionando con los componentes. Pensar bien la interacción: si un campo está overrideado en un item linkeado, ¿la propagación lo respeta y no lo toca? Mi voto: sí, el override gana sobre la propagación, igual que hoy.
- Para el context menu, verificar si hay alguna librería ya instalada o si conviene construirlo a mano (probablemente a mano, es simple).
- Para el color picker manual del componente, una paleta predefinida de 12 colores es suficiente, no hace falta un color picker libre.
