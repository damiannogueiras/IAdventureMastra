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
        return { answer: `Descripción generada para: ${inputData.query}` };
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
        return { answer: `Reto valorado para: ${inputData.query}` };
    },
});


// definimos el workflow
export const actionWorkflow = createWorkflow({
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
    ])

actionWorkflow.commit()

