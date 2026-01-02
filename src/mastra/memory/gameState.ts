import {Memory} from "@mastra/memory";
import {LibSQLStore} from "@mastra/libsql";

// GameState en forma de WorkingMemory
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
                - reto (opcional): [nombre del reto para acceder al objeto localizacion 1]
            - [objeto localizacion 2]: [descripcion del objeto localizacion 2]
            ### escenario
            - [objeto escenario 1]: [descripcion del objeto escenario 1]
            - [objeto escenario 2]: [descripcion del objeto escenario 2]
            ### salidas
            - [salida 1]: [localizacion de la salida 1]
            - [salida 2]: [localizacion de la salida 2]
                - reto (opcional): [nombre del reto para acceder a la salida2]
            ### retos
            - [nombre del reto1]
                - condiciones: [condiciones para completar el reto1]
                - objetos necesarios: [lista de objetos necesarios para completar el reto1]
                - esta completado: [true/false seun se logre o no el reto1]
`,
            }
        },
    });