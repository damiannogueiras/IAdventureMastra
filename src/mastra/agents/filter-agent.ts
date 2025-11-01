
import { Agent } from '@mastra/core/agent';

type FilterOutput = {
  actionType: 'description' | 'challenge' | 'object' | 'move';
  details: string;
  object?: string;
  direction?: string;
};

// Agente para el filtrado de acciones con salida JSON obligatoria
export const filterAgent = new Agent({
  name: 'Filter Agent',
  instructions: `
      Eres un agente que determina que tipo de acción requiere el jugador para completar una tarea.
      Responde únicamente con JSON válido y nada más. Usa exactamente este esquema:
      {
        "actionType": "description|challenge|object|move",
        "details": "Descripción breve de la intención",
        "object": "nombre del objeto si aplica (opcional)",
        "direction": "dirección si aplica (opcional)"
      }
      No incluyas explicaciones, texto adicional ni comentarios.
  `,
  model: 'groq/llama-3.3-70b-versatile'
});