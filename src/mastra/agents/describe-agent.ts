
import { Agent } from '@mastra/core/agent';
import { GameState } from  '../json/gameState'
import {Memory} from "@mastra/memory";
import {LibSQLStore} from "@mastra/libsql";
// import {gameStateMemory} from "../workflows/principal";

// const localizacion_actual = JSON.stringify(GameState.gameState["localizacion actual"])

// Creamos la memoria para el juego

// GameState en forma de WorkingMemort
export const gameStateMemory = new Memory({
    storage: new LibSQLStore({
        url: "file:gameState.db",
    }),
    options: {
        workingMemory: {
            enabled: true,
            template: `
            # Game State
            ## jugador: [nombre del jugador]
            ## inventario
            - [objeto1]: [descripcion del objeto 1]
            - [objeto2]: [descripcion del objeto 2]
            ## localizacion actual: [nombre de la localizacion actual]
               [descripcion de la localizacion actual]
            ### objetos localizacion
            - [objeto localizacion 1]: [descripcion del objeto localizacion 1]
            - [objeto localizacion 2]: [descripcion del objeto localizacion 2]
            ### escenario
            - [objeto escenario 1]: [descripcion del objeto escenario 1]
            - [objeto escenario 2]: [descripcion del objeto escenario 2]
            ### salidas
            - [salida 1]: [localizacion de la salida 1]
            - [salida 2]: [localizacion de la salida 2]
                - reto: [nombre del reto para acceder a la salida2]
            ### retos
            - [nombre del reto1]
                - condiciones: [condiciones para completar el reto1]
                - objetos necesarios: [lista de objetos necesarios para completar el reto1]
                - esta completado: [true/false seun se logre o no el reto1]
`,
        },
    },
});

// Create a thread with initial working memory
const thread = await gameStateMemory.createThread({
    threadId: "1234",
    resourceId: "1234",
    title: "Game State",
    metadata: {
        workingMemory: `
            # Game State
            ## jugador: viktor
            ## inventario:
            - script exploit-2sP: en python
            ## localizacion actual: exterior cueva
               El exterior de la cueva es un lugar húmedo y oscuro.
               Lleno de silvas y rocas cubiertas de musgo, con una atmósfera misteriosa.
            ### objetos localizacion
            - manzana: roja y apetitosa
            ### escenario
            - Grok: un troll que vigila ferozmente la entrada de la cueva
            ### salidas
            - norte: cueva magica
                -reto: Gronk no deja pasar
            - sur: bosque encantado
            ### retos
            - Gronk no deja pasar
                - condiciones: darle la manzana a Gronk para que se calme deje pasar
                - objetos necesarios: manzana
                - esta completado: false
`,
    },
});


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
    model: 'groq/llama-3.3-70b-versatile',
    // model: 'google/gemini-2.5-flash-lite',
    // habilitamos la
    memory: gameStateMemory,
})


