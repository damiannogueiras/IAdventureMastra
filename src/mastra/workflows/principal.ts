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
import {moveTool} from "../tools/move-tool";
import {gameStateMemory} from "../memory/gameState";

// Define the Zod schema
const out_filter = z.object({
    actionType: z.enum(["description", "accion", "move"]),
    query: z.string()
});

// condiciones iniciales de la memoria
const gameStateThread = await gameStateMemory.createThread({
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

// paso para filtrar la pregunta
const filtrarPregunta = createStep({
    id: "filtrarPregunta",
    inputSchema: z.object({
        query: z.string(),
    }),
    outputSchema: out_filter,
    execute: async ({ inputData }) => {
        const filterAgent = mastra.getAgent("filterAgent");
        console.log("[DEBUG] Step Filtrar Query: ", inputData.query);
        const res = await filterAgent.generate(
            [{ role: "user", content: inputData.query }],
            {
                structuredOutput: {
                    schema: out_filter,
                    jsonPromptInjection: true,
                },
            },
        );
        return res.object;
    },
});

// paso para la descripcion
const describe = createStep({
    id: "describe",
    inputSchema: out_filter,
    outputSchema: z.object({
        answer: z.string(),
    }),
    execute: async ({ inputData }) => {
        // Placeholder logic for the "describe" step
        console.log(`[DEBUG] Step Describe Query: ${inputData.query}`);
        const describeAgent = mastra.getAgent("describeAgent");
        const res = await describeAgent.generate(
            [{ role: "user", content: inputData.query }],
            {
                structuredOutput: {
                schema: z.object({
                    answer: z.string()
                }),
                    jsonPromptInjection
            :
                true,
            },
                threadId: gameStateThread.id,
                resourceId: "1234",
            },
        );

        // console.log("[DEBUG] Step Describe: ", gameStateThread.metadata.workinMemory);
        return res.object;
        // return { answer: `Descripción generada para: ${inputData.query}` };
    },
});

// definimos el paso para el reto
const accion = createStep({
    id: "accion",
    inputSchema: out_filter,
    outputSchema: z.object({
        answer: z.string(),
    }),
    execute: async ({ inputData }) => {
        // Placeholder logic for the "reto" step
        console.log("[DEBUG] Step Accion Query: ", inputData.query);
        const accionAgent = mastra.getAgent("accionAgent");
        const res = await accionAgent.generate(
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
                threadId: gameStateThread.id,
                resourceId: "1234",
            },
        );
        // Devuelve la salida estructurada; soporta `res.result` (nuevo formato) o `res.object` (antiguo)
        return (res as any).result ?? (res as any).object ?? res;
    },
});

// paso para el movimiento
const move = createStep({
    id: "move",
    inputSchema: out_filter,
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
        [async ({ inputData: { actionType } }) => actionType == "accion", accion],
        [async ({ inputData: { actionType } }) => actionType == "move", move],
    ])
actionWorkflow.commit()

export {actionWorkflow}