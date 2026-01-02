# Agent Configuration Guide

## Overview
El archivo `agentsConfig.ts` centraliza toda la configuración de los agentes de Mastra. Es el único lugar donde necesitas hacer cambios para:
- Cambiar el modelo de IA que se usa
- Ajustar límites de tokens
- Modificar instrucciones de agentes
- Habilitar/deshabilitar características

## Quick Start - Cambiar Modelo

Abre `src/mastra/config/agentsConfig.ts` y modifica esta línea:

```typescript
export const AGENT_CONFIG = {
  // ============= CHANGE THIS TO TEST DIFFERENT MODELS =============
  model: 'google/gemini-2.5-flash-lite',  // ← Cambia aquí
  // ...
}
```

### Modelos disponibles:

| Modelo | Identificador | Velocidad | Calidad |
|--------|---------------|-----------|---------|
| **Google Gemini 2.5 Flash** | `google/gemini-2.5-flash-lite` | ⚡⚡⚡ Muy rápido | ⭐⭐⭐⭐ |
| Google Gemini 1.5 Pro | `google/gemini-1.5-pro` | ⚡⚡ Rápido | ⭐⭐⭐⭐⭐ |
| Groq Llama 3.3 70B | `groq/llama-3.3-70b-versatile` | ⚡⚡⚡ Muy rápido | ⭐⭐⭐⭐ |
| Groq Mixtral 8x7B | `groq/mixtral-8x7b-32768` | ⚡⚡⚡ Muy rápido | ⭐⭐⭐ |
| OpenAI GPT-4o | `openai/gpt-4o` | ⚡⚡ Rápido | ⭐⭐⭐⭐⭐ |
| Claude 3.5 Sonnet | `anthropic/claude-3-5-sonnet-20241022` | ⚡⚡ Rápido | ⭐⭐⭐⭐⭐ |

### Ejemplos de cambio:

```typescript
// Para probar con Groq
model: 'groq/llama-3.3-70b-versatile',

// Para probar con OpenAI
model: 'openai/gpt-4o',

// Para probar con Claude
model: 'anthropic/claude-3-5-sonnet-20241022',
```

## Estructura de Configuración

### AGENT_CONFIG (Global)
Configuración general aplicada a todos los agentes:

```typescript
export const AGENT_CONFIG = {
  model: 'google/gemini-2.5-flash-lite',  // Modelo para todos
  
  tokenLimits: {
    describe: 150,  // Límite para describe agent
    filter: 200,    // Límite para filter agent
    move: 200,      // Límite para move agent
    action: 300,    // Límite para action agent
  },
  
  memory: {
    enabled: true,           // Habilitar memoria
    persistThreads: true,    // Guardar conversaciones
  },
  
  debug: {
    logRequests: false,      // Log de requests (debug)
    logResponses: false,     // Log de responses (debug)
  },
};
```

### Configuraciones por Agente
Cada agente tiene su propia configuración que hereda del `AGENT_CONFIG`:

```typescript
export const DESCRIBE_AGENT_CONFIG = {
  name: 'Describe Agent',
  model: AGENT_CONFIG.model,           // Usa el modelo global
  tokenLimit: AGENT_CONFIG.tokenLimits.describe,  // Usa el límite global
  instructions: `...instrucciones del agente...`,
};
```

## Cómo se usa en los Agentes

Los agentes importan estas configuraciones:

```typescript
// En describe-agent.ts
import { DESCRIBE_AGENT_CONFIG } from "../config/agentsConfig";

export const describeAgent = new Agent({
    name: DESCRIBE_AGENT_CONFIG.name,
    instructions: DESCRIBE_AGENT_CONFIG.instructions,
    model: DESCRIBE_AGENT_CONFIG.model,
    memory: gameStateMemory,
})
```

## Casos de Uso Comunes

### 1. Probar un modelo diferente
```typescript
// ANTES
model: 'google/gemini-2.5-flash-lite',

// DESPUÉS (para probar Groq)
model: 'groq/llama-3.3-70b-versatile',
```

### 2. Aumentar tokens para respuestas más largas
```typescript
tokenLimits: {
    describe: 300,  // Aumentado de 150
    filter: 200,
    move: 200,
    action: 400,    // Aumentado de 300
},
```

### 3. Habilitar debug
```typescript
debug: {
    logRequests: true,   // Ver qué se envía al LLM
    logResponses: true,  // Ver qué responde el LLM
},
```

### 4. Modificar instrucciones específicas
Solo edita la sección del agente que necesites:

```typescript
export const MOVE_AGENT_CONFIG = {
  // ...
  instructions: `
    [Aquí edita las instrucciones del move agent]
  `,
};
```

## Recomendaciones

- **Para desarrollo rápido**: Usa `google/gemini-2.5-flash-lite` (muy rápido, buena calidad)
- **Para máxima calidad**: Usa `google/gemini-1.5-pro` o `openai/gpt-4o`
- **Para juego en producción**: Elige según costo/velocidad requerida
- **Para debugging**: Habilita `debug.logRequests` y `debug.logResponses`

## Estructura de Archivos

```
src/mastra/
├── config/
│   └── agentsConfig.ts        ← ¡Edita aquí!
├── agents/
│   ├── describe-agent.ts      (usa DESCRIBE_AGENT_CONFIG)
│   ├── filter-agent.ts        (usa FILTER_AGENT_CONFIG)
│   ├── move-agent.ts          (usa MOVE_AGENT_CONFIG)
│   └── accion-agent.ts        (usa ACTION_AGENT_CONFIG)
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

