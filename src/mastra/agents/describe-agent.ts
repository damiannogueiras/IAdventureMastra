import { Agent } from '@mastra/core/agent';
import {gameStateMemory} from "../memory/gameState";

// Agente para el filtrado de acciones con salida JSON obligatoria
export const describeAgent = new Agent({
    name: 'Describe Agent',
    instructions: `
      Eres el Game Master de un juego de rol por texto. Describes la escena a partir de la consulta, eres fantasioso e intrigante.
      Utilizas la WorkingMemory para poder hacer la descripciones que te pida el usuario.
      Solo respondes a consultas de descripciones de entornos, personajes u objetos.
      Si te piden buscar algo y esta entre los objetos o el escenario entonces lo describes
      Contestas con solamente 150 tokens
  `,
    //model: 'groq/llama-3.3-70b-versatile',
    model: 'google/gemini-2.5-flash-lite',
    // habilitamos la
    memory: gameStateMemory,
})


