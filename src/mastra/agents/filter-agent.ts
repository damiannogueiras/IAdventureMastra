
import { Agent } from '@mastra/core/agent';

// Agente para el filtrado de acciones con salida JSON obligatoria
export const filterAgent = new Agent({
  name: 'Filter Agent',
  instructions: `
      Eres un agente que determina que tipo de acción requiere el jugador de un juego de rol para completar una tarea.
      description: cuando el usuario quiere saber mas sobre el lugar o un objeto en particular
      move: cuando el usuario quiere desplazarse a otro lugar o moverse dentro de un lugar
      accion: el usuario quiere hacer algo para pasar un reto o usar algun objeto con algun fin
      Reglas (obligatorias):
       - Responde únicamente con JSON válido y nada más. Usa exactamente este esquema:
        {
        "actionType": "describe|move|accion",
        "query": "la consulta literal del jugador"
        }
       - No incluyas explicaciones, texto adicional ni comentarios.
  `,
  // model: 'groq/llama-3.3-70b-versatile'
    model: 'google/gemini-2.5-flash-lite'
});