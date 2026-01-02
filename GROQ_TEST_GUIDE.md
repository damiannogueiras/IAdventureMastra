# 🧪 Groq Models Testing Guide

## Quick Start

El script automáticamente lee tu API key del archivo `.env`. Solo necesitas ejecutar:

### Opción 1: Script Helper (Más Simple)

**Bash (macOS/Linux):**
```bash
./test-groq-models.sh
```

**Node.js (Todas las plataformas):**
```bash
node test-groq-models.js
```

**Con npm:**
```bash
npm run test:models
```

### Opción 2: Pasar API Key como Argumento

Si prefieres no usar `.env`:

```bash
./test-groq-models.sh gsk_tu_clave_aqui
# o
node test-groq-models.js gsk_tu_clave_aqui
```

## ¿Cómo Obtener tu API Key de Groq?

1. Ve a https://console.groq.com/
2. Inicia sesión con tu cuenta
3. Ve a "API Keys"
4. Copia tu clave (comienza con `gsk_`)

## Qué Hace el Test

El test verifica:

✅ Que tu API key es válida
✅ Qué modelos están disponibles en tu cuenta
✅ Que cada modelo responde correctamente
✅ Los IDs exactos de los modelos

## Output Ejemplo

```
======================================================================
🧪 GROQ MODELS AVAILABILITY TEST
======================================================================

Testing 14 Groq models...

✅ mixtral-8x7b-32768: Available
✅ llama-3.3-70b-versatile: Available
✅ llama-3.1-70b-versatile: Available
❌ gemma-7b-it: Model not found

======================================================================
📊 SUMMARY
======================================================================

✅ Available Models: 3

You can use these models in your config:

  • 'groq/mixtral-8x7b-32768'
  • 'groq/llama-3.3-70b-versatile'
  • 'groq/llama-3.1-70b-versatile'

❌ Unavailable Models: 11

These models are not accessible:

  • gemma-7b-it
  • gemma2-9b-it
  ...

======================================================================
🎯 RECOMMENDED CONFIGURATION
======================================================================

Update your agentsConfig.ts with available Groq models:

const AVAILABLE_MODELS = [
  'groq/mixtral-8x7b-32768',
  'groq/llama-3.3-70b-versatile',
  'groq/llama-3.1-70b-versatile',
  // Add other providers here...
];
```

## Cómo Usar los Resultados

### 1. Actualizar `agentsConfig.ts`

```typescript
// src/mastra/config/agentsConfig.ts

const AVAILABLE_MODELS = [
  'groq/mixtral-8x7b-32768',      // ← Del test
  'groq/llama-3.3-70b-versatile', // ← Del test
  'google/gemini-2.5-flash-lite',
  'openai/gpt-4o',
];

export const AGENT_CONFIG = {
  enableModelRotation: true,
  availableModels: AVAILABLE_MODELS,
  model: AVAILABLE_MODELS[0],
  // ...
};
```

### 2. Rotar Automáticamente entre Modelos

Una vez actualizado `agentsConfig.ts`, tu código automáticamente rotará:

```typescript
// Cada consulta usa un modelo diferente
const model1 = getNextModel(); // groq/mixtral-8x7b-32768
const model2 = getNextModel(); // groq/llama-3.3-70b-versatile
const model3 = getNextModel(); // google/gemini-2.5-flash-lite
const model4 = getNextModel(); // openai/gpt-4o
const model5 = getNextModel(); // groq/mixtral-8x7b-32768 (vuelve al inicio)
```

## Modelos Probados por Defecto

| Categoría | Modelos |
|-----------|---------|
| **Mixtral** | `mixtral-8x7b-32768`, `mixtral-8x7b` |
| **Llama 3.3** | `llama-3.3-70b-versatile`, `llama-3.3-70b-specdec` |
| **Llama 3.1** | `llama-3.1-70b-versatile`, `llama-3.1-8b-instant` |
| **Llama 3** | `llama-3-70b-8192`, `llama-3-8b-8192` |
| **Gemma** | `gemma-7b-it`, `gemma2-9b-it` |
| **Otros** | `qwen2-72b-instruct`, `neural-chat-7b-v3-1` |

## Agregar Más Modelos al Test

Edita `src/mastra/test/models.ts`:

```typescript
const groqModelsToTest = [
  // Existing models...
  
  // Add new models here:
  "tu-nuevo-modelo",
  "otro-modelo-a-probar",
];
```

## Solución de Problemas

### ❌ "GROQ_API_KEY environment variable is not set"

**Solución**: Usa uno de los métodos para pasar tu API key:

```bash
# Opción 1: Script helper
./test-groq-models.sh gsk_tu_clave

# Opción 2: Variable de entorno
export GROQ_API_KEY="gsk_tu_clave"
npm run test:models

# Opción 3: Inline (Linux/Mac)
GROQ_API_KEY=gsk_tu_clave npm run test:models
```

### ❌ "401 Unauthorized"

**Causa**: Tu API key es inválida o ha expirado

**Solución**:
1. Ve a https://console.groq.com/
2. Verifica que la API key es correcta
3. Si es muy antigua, genera una nueva
4. Intenta de nuevo

### ❌ "Model not found"

**Causa**: El modelo no existe o no está disponible en tu cuenta

**Solución**: Verifica los [modelos disponibles en Groq](https://console.groq.com/docs)

### ❌ Timeout o errores de conexión

**Solución**:
1. Verifica tu conexión a Internet
2. Intenta de nuevo más tarde
3. Comprueba el [estado de Groq](https://status.groq.com/)

## Archivos Incluidos

```
IAdventureMastra/
├── src/mastra/test/
│   ├── models.ts          ← Test principal
│   └── README.md          ← Docs del test
├── test-groq-models.sh    ← Script para macOS/Linux
├── test-groq-models.js    ← Script para todas las plataformas
└── GROQ_TEST_GUIDE.md     ← Este archivo
```

## Tips y Recomendaciones

✅ **Ejecuta el test regularmente** para descubrir nuevos modelos
✅ **Usa los modelos más rápidos** para desarrollo (Mixtral, Llama 3.3)
✅ **Usa los modelos más inteligentes** para producción (depende del caso)
✅ **Rota modelos** para distribuir carga y evitar rate limits
✅ **Guarda los resultados** en un archivo para referencia

## Ejemplo: Guardar Resultados

```bash
# Guardar output en archivo
npm run test:models > groq_models_report.txt

# Ver el archivo
cat groq_models_report.txt
```

## Máximo Uso de Recursos

El test:
- Hace 1 llamada por modelo
- Espera 1 segundo entre modelos
- Genera ~10 tokens por modelo
- Tarda ~2 minutos en completarse (14 modelos)

## Preguntas Frecuentes

**P: ¿Consume muchos tokens?**
R: No, solo ~10 tokens por modelo. Son llamadas muy simples.

**P: ¿Puedo correr el test múltiples veces?**
R: Sí, sin problemas. Está diseñado para ser seguro de ejecutar.

**P: ¿Necesito actualizar la lista de modelos?**
R: Sí, Groq agrega nuevos modelos. Revisa https://console.groq.com/docs

**P: ¿Funciona offline?**
R: No, necesita conexión a Internet para probar los modelos.

**P: ¿Cómo contribuyo con nuevos modelos?**
R: Edita `src/mastra/test/models.ts` y agrega el modelo a probar.

---

¡Listo! Ahora puedes probar qué modelos de Groq funcionan con tu plataforma. 🚀

