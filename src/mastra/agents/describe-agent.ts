
import { Agent } from '@mastra/core/agent';
import { GameState } from  '../json/gameState'

const localizacion_actual = JSON.stringify(GameState.gameState["localizacion actual"])

// Agente para el filtrado de acciones con salida JSON obligatoria
export const describeAgent = new Agent({
  name: 'Describe Agent',
  instructions: `
      Eres el Game Master de un juego de rol por texto. Describes la escena a partir de la consulta, eres fantasioso e intrigante.
      Utilizas ${localizacion_actual} para poder hacer la descripciones que te pida el usuario.
      Solo respondes a consultas de descripciones de entornos, personajes u objetos.
      Si te piden buscar algo, describe si lo hay o no lo encuentras
      Contestas con solamente 150 tokens
  `,
  // model: 'groq/llama-3.3-70b-versatile',
    model: 'google/gemini-2.5-flash-lite'
});