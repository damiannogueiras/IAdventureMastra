# Groq Models Test

## Descripción

Este test verifica qué modelos de Groq están disponibles y funcionan correctamente con tu plataforma. Es útil para:

- Verificar que tu API key de Groq es válida
- Descubrir qué modelos puedes usar en tu rotación
- Obtener los IDs correctos de los modelos
- Generar configuración recomendada automáticamente

## Cómo Ejecutar

### Opción 1: Con npm script (Recomendado)
```bash
npm run test:models
```

### Opción 2: Script Helper - Lee automáticamente del .env

**macOS/Linux:**
```bash
./test-groq-models.sh
```

**Todas las plataformas:**
```bash
node test-groq-models.js
```

### Opción 3: Directamente con tsx
```bash
npx tsx src/mastra/test/models.ts
```

## Requisitos

1. **`.env` file**: Debe contener tu API key
   ```env
   GROQ_API_KEY=gsk_tu_clave_aqui
   ```

   Los scripts automáticamente lo leerán de este archivo.

2. **Conexión a Internet**: El test hace llamadas reales a los servidores de Groq

## Qué Hace el Test

1. ✅ Verifica que el `GROQ_API_KEY` esté configurado
2. ✅ Intenta conectar con cada modelo de la lista
3. ✅ Realiza una pequeña generación para verificar que funciona
4. ✅ Genera un reporte con:
   - Modelos disponibles
   - Modelos no disponibles (con motivo del error)
   - Configuración recomendada para `agentsConfig.ts`

## Salida del Test

Verás algo como:

```
======================================================================
🧪 GROQ MODELS AVAILABILITY TEST
======================================================================

Testing 14 Groq models...

✅ mixtral-8x7b-32768: Available
✅ llama-3.3-70b-versatile: Available
❌ gemma-7b-it: Model not found
...

======================================================================
📊 SUMMARY
======================================================================

✅ Available Models: 8

You can use these models in your config:

  • 'groq/mixtral-8x7b-32768'
  • 'groq/llama-3.3-70b-versatile'
  ...

❌ Unavailable Models: 6

======================================================================
🎯 RECOMMENDED CONFIGURATION
======================================================================

Update your agentsConfig.ts with available Groq models:

const AVAILABLE_MODELS = [
  'groq/mixtral-8x7b-32768',
  'groq/llama-3.3-70b-versatile',
  ...
];
```

## Usar los Resultados en tu Código

### Opción 1: Actualizar `agentsConfig.ts`

Una vez que tengas la lista de modelos disponibles, cópia la configuración recomendada a tu `agentsConfig.ts`:

```typescript
// En src/mastra/config/agentsConfig.ts

const AVAILABLE_MODELS = [
  'groq/mixtral-8x7b-32768',      // Del test
  'groq/llama-3.3-70b-versatile', // Del test
  'google/gemini-2.5-flash-lite',
  'openai/gpt-4o',
];

export const AGENT_CONFIG = {
  enableModelRotation: true,
  availableModels: AVAILABLE_MODELS,
  // ... resto de config
};
```

### Opción 2: Crear un Cliente Groq Directamente

```typescript
import { createGroq } from "@ai-sdk/groq";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

// Usar los modelos encontrados
const model = groq("mixtral-8x7b-32768");
```

## Modelos Probados

El test verifica los siguientes modelos por defecto:

- **Mixtral**: `mixtral-8x7b-32768`, `mixtral-8x7b`
- **Llama 3.3**: `llama-3.3-70b-versatile`, `llama-3.3-70b-specdec`
- **Llama 3.1**: `llama-3.1-70b-versatile`, `llama-3.1-8b-instant`
- **Llama 3**: `llama-3-70b-8192`, `llama-3-8b-8192`
- **Gemma**: `gemma-7b-it`, `gemma2-9b-it`
- **Otros**: `qwen2-72b-instruct`, `neural-chat-7b-v3-1`

## Agregar Más Modelos

Si quieres probar modelos adicionales, edita el array `groqModelsToTest` en `src/mastra/test/models.ts`:

```typescript
const groqModelsToTest = [
  // ... modelos existentes
  "tu-nuevo-modelo",
  "otro-modelo",
];
```

## Solución de Problemas

### Error: "GROQ_API_KEY environment variable is not set"

**Solución**: Configura tu API key:

```bash
export GROQ_API_KEY="gsk_..."
npm run test:models
```

### Error: "401 Unauthorized"

**Posibles causas**:
- Tu API key es inválida
- Tu API key ha expirado
- No tienes acceso a Groq

**Solución**: Verifica tu API key en https://console.groq.com/

### Error: "Model not found"

**Causa**: El modelo no está disponible en tu cuenta o no existe

**Solución**: 
- Verifica que el nombre del modelo es correcto
- Comprueba la [documentación oficial de Groq](https://console.groq.com/docs) para modelos disponibles

### Timeout o errores de conexión

**Causa**: Problemas de red o servidor de Groq

**Solución**:
- Intenta de nuevo más tarde
- Verifica tu conexión a Internet
- Comprueba el estado de Groq en https://status.groq.com/

## Notas

- El test añade un delay de 1 segundo entre modelos para evitar rate limiting
- Los tiempos de respuesta pueden variar según tu conexión
- El test NO guarda los resultados, solo los imprime en consola
- Ejecutar el test consume tokens de tu API key de Groq

