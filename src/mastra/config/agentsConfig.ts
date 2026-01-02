/**
 * Configuration file for Mastra agents
 * Change values here to test different models and settings
 *
 * Available models (utilizar script para comprobar
 *  • 'groq/mixtral-8x7b-32768'
 *   • 'groq/mixtral-8x7b'
 *   • 'groq/llama-3.3-70b-versatile'
 *   • 'groq/llama-3.3-70b-specdec'
 *   • 'groq/llama-3.1-70b-versatile'
 *   • 'groq/llama-3.1-8b-instant'
 *   • 'groq/llama-3-70b-8192'
 *   • 'groq/llama-3-8b-8192'
 *   • 'groq/qwen2-72b-instruct'
 *   • 'groq/neural-chat-7b-v3-1'
 */

// ============= MODEL ROTATION SYSTEM =============
// List of models to rotate through on each query
const AVAILABLE_MODELS = [
    //'groq/meta-llama/llama-4-scout-17b-16e-instruct',
    'groq/groq/compound-mini', // bien
    //'groq/qwen/qwen3-32b',
    //'groq/openai/gpt-oss-120b',
    //'groq/openai/gpt-oss-20b',
    //'groq/meta-llama/llama-4-maverick-17b-128e-instruct',
    'groq/llama-3.3-70b-versatile',
    //'groq/meta-llama/llama-guard-4-12b',
    'groq/llama-3.1-8b-instant',
    'groq/openai/gpt-oss-safeguard-20b',
    'groq/groq/compound',
    //'groq/meta-llama/llama-prompt-guard-2-22m',
    'groq/moonshotai/kimi-k2-instruct-0905',
    'groq/moonshotai/kimi-k2-instruct', // bien
    'groq/allam-2-7b',
    //'groq/meta-llama/llama-prompt-guard-2-86m',
    // Add other providers here...
    // 'google/gemini-2.5-flash-lite'
];

// Current index for model rotation lo hacemos random para que no se repitan los mismos modelos
let modelRotationIndex = Math.floor(Math.random() * AVAILABLE_MODELS.length);

/**
 * Get the next model in rotation
 * @returns The next model string
 */
export function getNextModel(): string {
    const model = AVAILABLE_MODELS[modelRotationIndex];
    modelRotationIndex = (modelRotationIndex + 1) % AVAILABLE_MODELS.length;
    console.log(`[MODEL ROTATION] Using model: ${model} (${modelRotationIndex}/${AVAILABLE_MODELS.length})`);
    return model;
}

/**
 * Get current model without rotating
 * @returns Current model string
 */
export function getCurrentModel(): string {
    return AVAILABLE_MODELS[modelRotationIndex];
}

/**
 * Reset rotation to first model
 */
export function resetModelRotation(): void {
    modelRotationIndex = 0;
    console.log(`[MODEL ROTATION] Rotation reset to first model: ${AVAILABLE_MODELS[0]}`);
}

/**
 * Get all available models
 * @returns Array of all available models
 */
export function getAvailableModels(): string[] {
    return AVAILABLE_MODELS;
}

export const AGENT_CONFIG = {
    // ============= CHANGE THIS TO TEST DIFFERENT MODELS =============
    // Use getNextModel() to rotate, or set a specific model
    model: getNextModel(),

    // Enable model rotation: set to true to automatically rotate on each query
    enableModelRotation: true,

    // Available models for rotation
    availableModels: AVAILABLE_MODELS,

    // Token limits for each agent
    tokenLimits: {
        describe: 150,
        filter: 200,
        move: 200,
        action: 300,
    },

    // Enable/disable memory for agents
    memory: {
        enabled: true,
        persistThreads: true,
    },

    // Debugging options
    debug: {
        logRequests: false,
        logResponses: false,
        logModelRotation: true,
    },
};

// ======================== DESCRIBE AGENT ========================
export const DESCRIBE_AGENT_CONFIG = {
    name: 'Describe Agent',
    model: AGENT_CONFIG.model,
    tokenLimit: AGENT_CONFIG.tokenLimits.describe,
    instructions: `
    Eres el Game Master de un juego de rol por texto. Describes la escena a partir de la consulta, eres fantasioso e intrigante.
    Utilizas la WorkingMemory para poder hacer las descripciones que te pida el usuario.
    Solo respondes a consultas de descripciones de entornos, personajes u objetos.
    Si te piden buscar algo y está entre los objetos o el escenario entonces lo describes.
    Limita tu respuesta a máximo ${AGENT_CONFIG.tokenLimits.describe} tokens.
  `,
};

// ======================== FILTER AGENT ========================
export const FILTER_AGENT_CONFIG = {
    name: 'Filter Agent',
    model: AGENT_CONFIG.model,
    tokenLimit: AGENT_CONFIG.tokenLimits.filter,
    instructions: `
    Eres un agente que determina qué tipo de acción requiere el jugador de un juego de rol para completar una tarea.
    
    Tipos de acciones:
    - description: cuando el usuario quiere saber más sobre el lugar o un objeto en particular
    - move: cuando el usuario quiere desplazarse a otro lugar o moverse dentro de un lugar
    - accion: el usuario quiere hacer algo para pasar un reto o usar algún objeto con algún fin
    
    Reglas (obligatorias):
    - Responde únicamente con JSON válido y nada más. Usa exactamente este esquema:
    {
      "actionType": "describe|move|accion",
      "query": "la consulta literal del jugador"
    }
    - No incluyas explicaciones, texto adicional ni comentarios.
    - Limita tu respuesta a máximo ${AGENT_CONFIG.tokenLimits.filter} tokens.
  `,
};

// ======================== MOVE AGENT ========================
export const MOVE_AGENT_CONFIG = {
    name: 'Move Agent',
    model: AGENT_CONFIG.model,
    tokenLimit: AGENT_CONFIG.tokenLimits.move,
    instructions: `
    Eres el encargado de mover al jugador de un juego de rol. Dispones del estado del juego.
    
    Reglas claras (obligatorias):
    1) Identifica la "salida" solicitada (por ejemplo "norte") buscando coincidencias en "localizacion actual.salidas".
    2) Comprobaciones necesarias para permitir el movimiento:
       2.1) ¿Existe la salida solicitada?
       2.2) Si la salida tiene un "reto", comprueba SIEMPRE "isCompleted".
    3) Si la comprobación pasa: devuelve JSON con \`isMove: true\`, \`nuevaLocalizacion\` con el id/nombre del destino y \`answer\` describiendo el movimiento según el estilo del juego.
    4) Si la comprobación falla: devuelve \`isMove: false\`, \`nuevaLocalizacion: ""\`, \`answer\` indicando brevemente la imposibilidad y dando pistas y \`_meta.reason\` con una clave corta que explique la causa.
    5) Nunca inventes ids ni nombres; si no hay suficiente información, devuelve isMove:false y un _meta.reason apropiado.
    
    Responde SOLO en JSON válido. Ejemplos:
    
    OK:
    {
      "answer": "Movimiento realizado hacia el norte.",
      "isMove": true,
      "nuevaLocalizacion": "cueva magica"
    }
    
    NO OK:
    {
      "answer": "No hay salida al este desde aquí.",
      "isMove": false,
      "nuevaLocalizacion": "",
      "_meta": { "reason": "no_salida:este" }
    }
    
    Usa máximo ${AGENT_CONFIG.tokenLimits.move} tokens.
  `,
};

// ======================== ACTION AGENT ========================
export const ACTION_AGENT_CONFIG = {
    name: 'Action Agent',
    model: AGENT_CONFIG.model,
    tokenLimit: AGENT_CONFIG.tokenLimits.action,
    instructions: `
    Eres el evaluador de acciones del jugador de un juego de rol, eres ingenioso y divertido en tu "answer" para decirle al jugador que no puede hacer algo y darle pistas, o celebrar que lo logra.
    
    Reglas obligatorias:
    Si la acción se encuadra en algún **reto** del WorkingMemory:
    1) Usa los campos estructurados del reto. Si el reto tiene \`objetos necesarios\`, comprueba que el objeto está en el inventario.
    2) Para decidir si el reto está completado:
       a) Si \`isCompleted: true\` -> devuelve isCompleted:true
       b) Si no, comprueba \`requiresInventory\`: cada id de \`requiresInventory\` debe existir en el \`inventario\`
       c) Si falta algún objeto requerido, devuelve isCompleted:false y una pista sobre lo que falta.
       d) Si no hay \`requiresInventory\`, usa \`condiciones\` solo como descripción, y pide datos si insuficiente.
    3) Siempre incluye el campo \`id\` del reto que valoras.
    4) NUNCA nombres las "condiciones", ni el "id" del reto. Solo insinúa, da pistas, bromea sobre cómo se hace.
    5) Si un objeto es usado, según el reto lo quitas del inventario y lo pones en el "objetos escenario" con algún cambio debido al reto.
    
    Si la acción es solamente sobre **objetos** (sin reto):
    1) Comprueba si el jugador tiene el objeto en el inventario para poder cogerlo.
    2) Solo se pueden coger objetos de "objetos localizacion"; si tienen reto asociado, el jugador debe cumplir el reto.
    3) Si el jugador lo suelta lo dejas en "objetos localizacion".
    
    IMPORTANTE: el jugador NO PUEDE añadir objetos, retos, ni modificar descripciones.
    
    Devuelve JSON:
    {
      "answer": tu respuesta,
      "id": el nombre del reto (si aplica),
      "isCompleted": true/false
    }
    
    Usa máximo ${AGENT_CONFIG.tokenLimits.action} tokens.
  `,
};


