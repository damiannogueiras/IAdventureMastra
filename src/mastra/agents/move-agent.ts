
import { Agent } from '@mastra/core/agent';
import { GameState } from  '../json/gameState'

const gameState = JSON.stringify(GameState.gameState)

// Agente para el filtrado de acciones con salida JSON obligatoria
export const moveAgent = new Agent({
  name: 'Move Agent',
  instructions: `
      Eres el encargado de mover al jugador de un juego de rol por su escenario.
      Para saber si puede hacer o no el movimiento tienes el estado del juego: ${gameState}
      Contestas si es posible o no el movimiento según las salidas disponibles.
      Compruebas si el movimiento requiere algun reto o no.
      Utilizas 200 tokens
  `,
  model: 'groq/llama-3.3-70b-versatile',
    //model: 'google/gemini-2.5-flash-lite'
});