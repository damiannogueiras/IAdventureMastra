// Uso de Zod:
// - Zod se utiliza para definir esquemas (schemas) que validan los datos tanto en
//   tiempo de desarrollo (tipado TypeScript) como en tiempo de ejecución (validación
//   y parseo de valores). Aquí se usan `inputSchema` y `outputSchema` para garantizar
//   que los datos que entran y salen del workflow cumplen la forma esperada.
// - Beneficios:
//   * Tipos derivables: Zod permite inferir tipos TypeScript desde el esquema, con
//     lo que obtienes autocompletado y comprobación estática.
//   * Validación en runtime: puedes llamar a `schema.parse(value)` para validar y
//     normalizar datos (lanzará un error si no cumplen el esquema).
//   * Transformaciones y refinamientos: Zod soporta refinamientos, parsers y valores
//     por defecto cuando lo necesites.
// - Ejemplo rápido:
//   * `candidateWorkflow.inputSchema.parse(someData)` validará `someData` y devolverá
//     el objeto tipado si es correcto, o lanzará una excepción con detalles del error.

import {createStep, createWorkflow} from "@mastra/core/workflows";
import {z} from "zod";
import {mastra} from "../index";
import {moveAgent} from "../agents/move-agent";
import {moveTool} from "../tools/move-tool";
import {Memory} from "@mastra/memory";
import {LibSQLStore} from "@mastra/libsql";

// GameState en forma de WorkingMemort
export const gameStateMemory = new Memory({
    storage: new LibSQLStore({
        url: "file:gameState.db",
    }),
    options: {
        workingMemory: {
            enabled: true,
            scope: 'thread', // Default - memory is isolated per thread
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
    threadId: "thread-123",
    resourceId: "user-456",
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

// Define the Zod schema
const schema = z.object({
    actionType: z.enum(["description", "challenge", "object", "move"]),
    query: z.string()
});

// definimos el paso para clasificar el candidato
const filtrarPregunta = createStep({
    id: "filtrarPregunta",
    inputSchema: z.object({
        query: z.string(),
    }),
    outputSchema: z.object({
        actionType: z.enum(["description", "challenge", "object", "move"]),
        query: z.string()
    }),
    execute: async ({ inputData }) => {
        const filterAgent = mastra.getAgent("filterAgent");
        console.log("[DEBUG] Step Filtrar Query: ", inputData.query);
        const res = await filterAgent.generate(
            [{ role: "user", content: inputData.query }],
            {
                structuredOutput: {
                    schema,
                    jsonPromptInjection: true,
                },
            },
        );
        return res.object;
    },
});

// definimos el paso (llamamos al agente con un prompt en cncreto) para candidato tecnico
const describe = createStep({
    id: "describe",
    inputSchema: z.object({
        actionType: z.enum(["description", "challenge", "object", "move"]),
        query: z.string(),
    }),
    outputSchema: z.object({
        answer: z.string(),
    }),
    execute: async ({ inputData }) => {
        // Placeholder logic for the "describe" step
        console.log("[DEBUG] Step Describe Query: ", inputData.query);
        const describeAgent = mastra.getAgent("describeAgent");
        const res = await describeAgent.generate(
            [{ role: "user", content: inputData.query }],
            {
                structuredOutput: {
                    schema: z.object({
                        answer: z.string()
                    }),
                    jsonPromptInjection: true,
                },
                threadId: thread.id,
            },
        );
        return res.object;
        // return { answer: `Descripción generada para: ${inputData.query}` };
    },
});

// definimos paso (llamamos al agente con un prompt en concreto) para candidato no tecnico
const reto = createStep({
    id: "reto",
    inputSchema: z.object({
        actionType: z.enum(["description", "challenge", "object", "move"]),
        query: z.string(),
    }),
    outputSchema: z.object({
        answer: z.string(),
    }),
    execute: async ({ inputData }) => {
        // Placeholder logic for the "reto" step
        console.log("[DEBUG] Step Reto Query: ", inputData.query);
        const retoAgent = mastra.getAgent("retoAgent");
        const res = await retoAgent.generate(
            [{ role: "user", content: inputData.query }],
            {
                structuredOutput: {
                    schema: z.object({
                        answer: z.string(),
                        id: z.string().optional(),
                        isCompleted: z.boolean()
                    }),
                    jsonPromptInjection: true,
                },
            },
        );
        // Devuelve la salida estructurada; soporta `res.result` (nuevo formato) o `res.object` (antiguo)
        return (res as any).result ?? (res as any).object ?? res;
    },
});

// paso para el movimiento
const move = createStep({
    id: "move",
    inputSchema: z.object({
        actionType: z.enum(["description", "challenge", "object", "move"]),
        query: z.string(),
    }),
    outputSchema: z.object({
        answer: z.string(),
        isMove: z.boolean(),
        nuevoLugar: z.string().optional(),
    }),
    execute: async ({ inputData, runtimeContext }) => {
        console.log("[DEBUG] Step Move Query: ", inputData.query);
        const moveAgent = mastra.getAgent("moveAgent");
        const res = await moveAgent.generate(
            [{ role: "user", content: inputData.query }],
            {
                structuredOutput: {
                    schema: z.object({
                        answer: z.string(),
                        isMove: z.boolean(),
                        nuevoLugar: z.string().optional(),
                    }),
                    jsonPromptInjection: true,
                },
            },
        );
        console.log("[DEBUG] Step Move Response: ", res);

        // si no esta definida la ponemos en blanco
        const nuevaLocalizacion = res.object.nuevoLugar || "";

        // Si queremos usar la herramienta aqui en vez del Agente
        // comprueba si se puede mover el jugador
        if (res.object.isMove) {
            const resultadoMove = await moveTool.execute({
                context: {
                    location: nuevaLocalizacion,
                },
                runtimeContext,
            });
            console.log("[DEBUG] Step Move Result: ", resultadoMove);
        }
        // Devuelve la salida estructurada; soporta `res.result` (nuevo formato) o `res.object` (antiguo)
        return (res as any).result ?? (res as any).object ?? res;
    },
});


// definimos el workflow
const actionWorkflow = createWorkflow({
    id: "action-workflow",
    inputSchema: z.object({
        query: z.string()
    }),
    outputSchema: z.object({
        describe: z.object({
            answer: z.string(),
        }),
        reto: z.object({
            answer: z.string(),
        }),
    })
})
    .then(filtrarPregunta)
    .branch([
        [async ({ inputData: { actionType } }) => actionType == "description", describe],
        [async ({ inputData: { actionType } }) => actionType == "challenge", reto],
        [async ({ inputData: { actionType } }) => actionType == "move", move]
    ])
actionWorkflow.commit()

export {actionWorkflow}