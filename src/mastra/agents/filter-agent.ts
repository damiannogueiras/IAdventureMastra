
import { Agent } from '@mastra/core/agent';

// Agente para el filtrado de acciones con salida JSON obligatoria
export const filterAgent = new Agent({
  name: 'Filter Agent',
  instructions: `
      Eres un agente que determina que tipo de acción requiere el jugador para completar una tarea.
      description: cuando el usuario quiere saber mas sobre el lugar o un objeto en particular
      challenge: el usuario quiere hacer algo para pasar un reto o usar algun objeto con algun fin
      object: cunado el ususario quiero tomar o dejar un objeto o pregunta sobre el inventario
      move: cuando el usuario quiere desplazarse a otro lugar o moverse dentro de un lugar
      Responde únicamente con JSON válido y nada más. Usa exactamente este esquema:
      {
        "actionType": "description|challenge|object|move",
        "query": "la consulta literal"
      }
      No incluyas explicaciones, texto adicional ni comentarios.
  `,
  // model: 'groq/llama-3.3-70b-versatile'
    model: 'google/gemini-2.5-flash-lite'
});