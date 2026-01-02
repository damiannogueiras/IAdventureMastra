# Accessing Working Memory in Mastra

## Overview
La memoria de trabajo (WorkingMemory) en Mastra se almacena en el `metadata` del thread y se accede a través de las utilidades en `memoryUtils.ts`.

## Estructura de la Memoria

La memoria se almacena como un string de markdown en el thread:

```
gameStateThread {
  id: "1234",
  resourceId: "1234",
  title: "Game State",
  metadata: {
    workingMemory: "# Game State\n## jugador: viktor\n..."
  }
}
```

## Formas de Acceder a la Memoria

### 1. **Obtener la memoria sin procesar** (string)
```typescript
import { getWorkingMemory } from "../memory/memoryUtils";

// En tu paso del workflow
const rawMemory = await getWorkingMemory(gameStateThread.id);
console.log(rawMemory);  // Imprime el string completo de la memoria
```

**Output:**
```
# Game State
## jugador: viktor
## inventario:
- script exploit-2sP: en python
## localizacion actual: exterior cueva
   El exterior de la cueva es un lugar húmedo y oscuro...
### objetos localizacion
- manzana: roja y apetitosa
...
```

### 2. **Imprimir la memoria formateada** (bonito)
```typescript
import { printWorkingMemory } from "../memory/memoryUtils";

// En tu paso del workflow
await printWorkingMemory(gameStateThread.id);
```

**Output:**
```
============================================================
📋 WORKING MEMORY
============================================================
# Game State
## jugador: viktor
## inventario:
- script exploit-2sP: en python
...
============================================================
```

### 3. **Obtener memoria parseada y estructurada** (objeto TypeScript)
```typescript
import { parseWorkingMemory } from "../memory/memoryUtils";

// En tu paso del workflow
const gameState = await parseWorkingMemory(gameStateThread.id);

// Ahora tienes acceso a propiedades específicas:
console.log(gameState.player);              // "viktor"
console.log(gameState.inventory);           // ["script exploit-2sP: en python"]
console.log(gameState.currentLocation);     // "exterior cueva"
console.log(gameState.locationObjects);     // ["manzana: roja y apetitosa"]
console.log(gameState.scenarioObjects);     // ["Grok: un troll..."]
console.log(gameState.exits);               // ["norte: cueva magica", ...]
console.log(gameState.challenges);          // ["Gronk no deja pasar", ...]
```

### 4. **Imprimir la memoria parseada** (visual)
```typescript
import { printParsedGameState } from "../memory/memoryUtils";

// En tu paso del workflow
await printParsedGameState(gameStateThread.id);
```

**Output:**
```
============================================================
🎮 PARSED GAME STATE
============================================================
👤 Player: viktor
📍 Location: exterior cueva

🎒 Inventory (1 items):
   • script exploit-2sP: en python

🏠 Location Objects (1):
   • manzana: roja y apetitosa

🌍 Scenario Objects (1):
   • Grok: un troll que vigila ferozmente la entrada de la cueva

🚪 Exits (2):
   • norte: cueva magica
   • sur: bosque encantado

⚔️ Challenges (1):
   • Gronk no deja pasar
============================================================
```

## Actualizar la Memoria

Para actualizar la memoria del thread:

```typescript
import { updateWorkingMemory } from "../memory/memoryUtils";

// Crear nueva memoria (manual)
const newMemory = `
# Game State
## jugador: viktor
## inventario:
- script exploit-2sP: en python
- manzana: roja y electrica
## localizacion actual: cueva magica
...
`;

// Actualizar
await updateWorkingMemory(gameStateThread.id, newMemory);
```

## Acceso a la Memoria Dentro de los Agentes

Cuando pasas `threadId` y `resourceId` al agente, la memoria se proporciona automáticamente:

```typescript
const describeAgent = mastra.getAgent("describeAgent");
const res = await describeAgent.generate(
    [{ role: "user", content: userQuery }],
    {
        structuredOutput: { /* ... */ },
        threadId: gameStateThread.id,      // ← Proporciona acceso a la memoria
        resourceId: "1234",                // ← Identifica el recurso
    },
);
```

El agente recibe la memoria automáticamente en su contexto y puede usarla para tomar decisiones.

## Ejemplo Completo: Ver Memoria en Cada Paso

```typescript
// paso para la descripcion
const describe = createStep({
    id: "describe",
    inputSchema: out_filter,
    outputSchema: z.object({ answer: z.string() }),
    execute: async ({ inputData }) => {
        console.log(`[DEBUG] Query: ${inputData.query}`);
        
        // Ver la memoria antes
        await printWorkingMemory(gameStateThread.id);
        
        const describeAgent = mastra.getAgent("describeAgent");
        const res = await describeAgent.generate(
            [{ role: "user", content: inputData.query }],
            {
                structuredOutput: {
                    schema: z.object({ answer: z.string() }),
                    jsonPromptInjection: true,
                },
                threadId: gameStateThread.id,
                resourceId: "1234",
            },
        );
        
        // Ver la memoria después (si cambia)
        const gameState = await parseWorkingMemory(gameStateThread.id);
        console.log("Inventario actual:", gameState.inventory);
        
        return res.object;
    },
});
```

## Tipos de Datos

```typescript
interface ParsedGameState {
    player: string;                 // Nombre del jugador
    inventory: string[];            // Lista de objetos en inventario
    currentLocation: string;        // Localización actual
    locationObjects: string[];      // Objetos en la localización
    scenarioObjects: string[];      // NPCs y objetos del escenario
    exits: string[];                // Salidas disponibles
    challenges: string[];           // Retos de la localización
    rawMemory: string;              // Memoria sin procesar
}
```

## Notas Importantes

1. **La memoria es compartida entre agentes** - Cuando pasas el mismo `threadId`, todos los agentes ven la misma memoria.

2. **La memoria persiste** - Se guarda en la base de datos `gameState.db` y permanece entre ejecuciones.

3. **Los agentes pueden leer pero no escribir directamente** - La memoria es context para los agentes, pero las actualizaciones deben hacerse explícitamente con `updateWorkingMemory`.

4. **Para debugging**, usa `printParsedGameState` en lugar de `printWorkingMemory` para una mejor visualización.

5. **Rendimiento** - Para threads con memoria muy grande, `parseWorkingMemory` hace un parsing simple. Considera mejorarlo con regex para mejor rendimiento.

