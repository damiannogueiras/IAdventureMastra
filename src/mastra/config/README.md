# Agent Configuration Guide

## Overview
El archivo `agentsConfig.ts` centraliza toda la configuración de los agentes de Mastra. Es el único lugar donde necesitas hacer cambios para:
- Cambiar el modelo de IA que se usa
- Ajustar límites de tokens
- Modificar instrucciones de agentes
- Habilitar/deshabilitar características
- **NUEVO:** Rotar entre múltiples modelos en cada consulta

## Quick Start - Cambiar Modelo

Abre `src/mastra/config/agentsConfig.ts` y modifica esta línea:

```typescript
export const AGENT_CONFIG = {
  model: 'google/gemini-2.5-flash-lite',  // ← Cambia aquí
  enableModelRotation: true,              // ← Desactiva rotación si quieres un modelo fijo
}
```

## 🎯 Sistema de Rotación de Modelos (NUEVO)

### ¿Qué es?
Es un sistema que **alterna automáticamente entre diferentes modelos** en cada consulta. Útil para:
- Probar múltiples LLMs sin cambiar código
- Comparar rendimiento de diferentes modelos
- Distribuir carga entre proveedores
- Testing con múltiples modelos

### Cómo Activarlo

```typescript
// En agentsConfig.ts
export const AGENT_CONFIG = {
  enableModelRotation: true,  // ← Activa la rotación
  availableModels: [
    'google/gemini-2.5-flash-lite',
    'groq/llama-3.3-70b-versatile',
    'openai/gpt-4o',
    'anthropic/claude-3-5-sonnet-20241022',
  ],
}
```

### Funciones Disponibles

```typescript
import { 
  getNextModel,      // Obtiene el siguiente modelo y avanza
  getCurrentModel,   // Obtiene el modelo actual sin avanzar
  resetModelRotation // Reinicia la rotación al primer modelo
} from "../config/agentsConfig";

// Uso en tu código
const model = getNextModel(); // 'google/gemini-2.5-flash-lite'
const model = getNextModel(); // 'groq/llama-3.3-70b-versatile'
const model = getNextModel(); // 'openai/gpt-4o'
const model = getNextModel(); // 'anthropic/claude-3-5-sonnet-20241022'
const model = getNextModel(); // 'google/gemini-2.5-flash-lite' (vuelve al inicio)
```

### Ejemplo de Uso en el Workflow

```typescript
import { getNextModel, AGENT_CONFIG } from "../config/agentsConfig";

const describe = createStep({
    id: "describe",
    execute: async ({ inputData }) => {
        // Obtiene el siguiente modelo si está activada la rotación
        const currentModel = AGENT_CONFIG.enableModelRotation 
            ? getNextModel() 
            : getCurrentModel();
        
        console.log(`[DEBUG] Using model: ${currentModel}`);
        
        const describeAgent = mastra.getAgent("describeAgent");
        const res = await describeAgent.generate(
            [{ role: "user", content: inputData.query }],
            {
                model: currentModel,  // ← Usa el modelo seleccionado
                // ...rest of config
            },
        );
        
        return res.object;
    },
});
```

### Salida en Consola

Cuando está activada la rotación, verás:

```
[MODEL ROTATION] Using model: google/gemini-2.5-flash-lite (1/4)
[DEBUG] Using model: google/gemini-2.5-flash-lite
[MODEL ROTATION] Using model: groq/llama-3.3-70b-versatile (2/4)
[DEBUG] Using model: groq/llama-3.3-70b-versatile
[MODEL ROTATION] Using model: openai/gpt-4o (3/4)
[DEBUG] Using model: openai/gpt-4o
```

## Modelos Disponibles

| Modelo | Identificador | Velocidad | Calidad |
|--------|---------------|-----------|---------|
| **Google Gemini 2.5 Flash** | `google/gemini-2.5-flash-lite` | ⚡⚡⚡ Muy rápido | ⭐⭐⭐⭐ |
| Google Gemini 1.5 Pro | `google/gemini-1.5-pro` | ⚡⚡ Rápido | ⭐⭐⭐⭐⭐ |
| Groq Llama 3.3 70B | `groq/llama-3.3-70b-versatile` | ⚡⚡⚡ Muy rápido | ⭐⭐⭐⭐ |
| Groq Mixtral 8x7B | `groq/mixtral-8x7b-32768` | ⚡⚡⚡ Muy rápido | ⭐⭐⭐ |
| OpenAI GPT-4o | `openai/gpt-4o` | ⚡⚡ Rápido | ⭐⭐⭐⭐⭐ |
| Claude 3.5 Sonnet | `anthropic/claude-3-5-sonnet-20241022` | ⚡⚡ Rápido | ⭐⭐⭐⭐⭐ |

## Estructura de Configuración

### AGENT_CONFIG (Global)
Configuración general aplicada a todos los agentes:

```typescript
export const AGENT_CONFIG = {
  model: 'google/gemini-2.5-flash-lite',  // Modelo por defecto
  enableModelRotation: true,               // Activar rotación
  availableModels: [...],                  // Lista de modelos a rotar
  
  tokenLimits: {
    describe: 150,
    filter: 200,
    move: 200,
    action: 300,
  },
  
  memory: {
    enabled: true,
    persistThreads: true,
  },
  
  debug: {
    logRequests: false,
    logResponses: false,
    logModelRotation: true,  // Log de rotación de modelos
  },
};
```

### Configuraciones por Agente
Cada agente tiene su propia configuración que hereda del `AGENT_CONFIG`:

```typescript
export const DESCRIBE_AGENT_CONFIG = {
  name: 'Describe Agent',
  model: AGENT_CONFIG.model,
  tokenLimit: AGENT_CONFIG.tokenLimits.describe,
  instructions: `...`,
};
```

## Cómo se usa en los Agentes

Los agentes importan estas configuraciones:

```typescript
import { DESCRIBE_AGENT_CONFIG } from "../config/agentsConfig";

export const describeAgent = new Agent({
    name: DESCRIBE_AGENT_CONFIG.name,
    instructions: DESCRIBE_AGENT_CONFIG.instructions,
    model: DESCRIBE_AGENT_CONFIG.model,
    memory: gameStateMemory,
})
```

## Casos de Uso Comunes

### 1. Usar modelo fijo
```typescript
export const AGENT_CONFIG = {
  enableModelRotation: false,
  model: 'google/gemini-2.5-flash-lite',
}
```

### 2. Rotar entre 2 modelos rápidos
```typescript
const AVAILABLE_MODELS = [
  'google/gemini-2.5-flash-lite',
  'groq/llama-3.3-70b-versatile',
];

export const AGENT_CONFIG = {
  enableModelRotation: true,
  availableModels: AVAILABLE_MODELS,
}
```

### 3. Rotar entre todos los modelos premium
```typescript
const AVAILABLE_MODELS = [
  'openai/gpt-4o',
  'anthropic/claude-3-5-sonnet-20241022',
  'google/gemini-1.5-pro',
];

export const AGENT_CONFIG = {
  enableModelRotation: true,
  availableModels: AVAILABLE_MODELS,
}
```

### 4. Aumentar tokens para respuestas más largas
```typescript
tokenLimits: {
    describe: 300,     // Aumentado
    filter: 250,       // Aumentado
    move: 250,
    action: 400,       // Aumentado
},
```

### 5. Habilitar debug
```typescript
debug: {
    logRequests: true,
    logResponses: true,
    logModelRotation: true,
},
```

## Recomendaciones

- **Para desarrollo rápido:** Rotación de modelos rápidos
  ```typescript
  enableModelRotation: true,
  availableModels: [
    'google/gemini-2.5-flash-lite',
    'groq/llama-3.3-70b-versatile',
  ]
  ```

- **Para máxima calidad:** Modelos premium sin rotación
  ```typescript
  enableModelRotation: false,
  model: 'openai/gpt-4o'
  ```

- **Para comparación:** Rotar todos los modelos
  ```typescript
  enableModelRotation: true,
  availableModels: AVAILABLE_MODELS
  ```

- **Para producción:** Modelo fijo probado
  ```typescript
  enableModelRotation: false,
  model: 'tu-modelo-elegido'
  ```

## Estructura de Archivos

```
src/mastra/
├── config/
│   ├── agentsConfig.ts        ← ¡Edita aquí!
│   └── README.md              ← Estás aquí
├── agents/
│   ├── describe-agent.ts
│   ├── filter-agent.ts
│   ├── move-agent.ts
│   └── accion-agent.ts
├── workflows/
│   └── principal.ts           ← Usa getNextModel()
└── ...
```

## Variables de Entorno

Asegúrate de tener las variables de entorno configuradas para cada modelo que uses:

```bash
# Para Google
GOOGLE_API_KEY=tu_clave_aqui

# Para Groq
GROQ_API_KEY=tu_clave_aqui

# Para OpenAI
OPENAI_API_KEY=tu_clave_aqui

# Para Claude
ANTHROPIC_API_KEY=tu_clave_aqui
```

