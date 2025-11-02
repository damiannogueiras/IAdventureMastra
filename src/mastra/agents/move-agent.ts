
import { Agent } from '@mastra/core/agent';
import { GameState } from  '../json/gameState'

const gameState = JSON.stringify(GameState.gameState)

// Agente para el movimiento
export const moveAgent = new Agent({
  name: 'Move Agent',
  instructions: `
      Eres el encargado de mover al jugador de un juego de rol por su escenario.
      Para saber si puede hacer o no el movimiento tienes el estado del juego: ${gameState}
      Compruebas si es posible o no el movimiento según las salidas disponibles y los retos asociados.
      Si se puede desplazar le cuentas al jugador como se desplazó, si no puede porque no tiene el reto,
      solo das pistas de porque no puede desplazarse
      Nunca dices los nombres de los retos
      Tu respuesta es de la forma:
      {"answer": "respuesta del movimiento"}
      Utilizas 300 tokens
  `,
  // model: 'groq/llama-3.3-70b-versatile',
    model: 'google/gemini-2.5-flash-lite'
});