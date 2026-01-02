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
import {
    getWorkingMemory,
    printParsedGameState,
} from "../memory/memoryUtils";

// Define the Zod schema
const out_filter = z.object({
    actionType: z.enum(["description", "accion", "move"]),
    query: z.string()
});



// cargamos la memoria de la base de datos
const gameStateThread = await gameStateMemory.getThreadById({ threadId: "1234" });

if (!gameStateThread) {
    throw new Error("Game state thread not found with ID '1234'. Please create it first using gameStateMemory.createThread()");
}

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

        // ============= ACCEDER A LA MEMORIA =============
        // Opción 1: Ver la memoria sin procesar
        const rawMemory = await getWorkingMemory(gameStateThread.id);
        console.log("\n[MEMORY] Raw Working Memory:\n", rawMemory);

        // Opción 2: Ver la memoria formateada (con print bonito)
        // await printWorkingMemory(gameStateThread.id);

        // Opción 3: Ver la memoria parseada y estructurada
        // await printParsedGameState(gameStateThread.id);
        // ================================================

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
                memory: {
                    thread: "1234",
                    resource: "1234"
                },
            },
        );

        return res.object;
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
        console.log("[DEBUG] Step Accion Query: ", inputData.query);

        // ============= VER MEMORIA ANTES DE LA ACCIÓN =============
        console.log("\n[MEMORY] Before Action:");
        const memoryBefore = await getWorkingMemory(gameStateThread.id);
        console.log(memoryBefore);
        // ===========================================================

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
                memory: {
                    thread: "1234",
                    resource: "1234"
                },
            },
        );

        // ============= VER MEMORIA DESPUÉS DE LA ACCIÓN =============
        console.log("\n[MEMORY] After Action:");
        const memoryAfter = await getWorkingMemory(gameStateThread.id);
        console.log(memoryAfter);
        // ===========================================================

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

        // ============= VER MEMORIA ANTES DEL MOVIMIENTO =============
        console.log("\n[MEMORY] Before Movement:");
        await printParsedGameState(gameStateThread.id);
        // ===========================================================

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
                memory: {
                    thread: "1234",
                    resource: "1234"
                },
            },
        );
        // console.log("[DEBUG] Step Move Response: ", res);

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
            // console.log("[DEBUG] Step Move Result: ", resultadoMove);

            // ============= VER MEMORIA DESPUÉS DEL MOVIMIENTO =============
            console.log("\n[MEMORY] After Movement:");
            await printParsedGameState(gameStateThread.id);
            // ===========================================================
        }

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