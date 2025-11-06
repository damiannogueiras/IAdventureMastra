import { z } from "zod";
import {filterAgent} from "../agents/filter-agent";

// Si usas .env, instala dotenv: npm install dotenv
import 'dotenv/config';
import {describeAgent} from "../agents/describe-agent";
import {gameStateMemory} from "../memory/gameState";
import {mastra} from "../index";

// carga variables desde `agente86/.env`

//const API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const API_KEY = process.env.GROQ_API_KEY;

if (!API_KEY) {
    throw new Error('Falta GOOGLE_GENERATIVE_AI_API_KEY en el entorno. Define en .env o exportala antes de ejecutar.');
}

// continúa con el resto del archivo que usa la API key
console.log('API key cargada correctamente.');

// test filtro agent
async function filtro_Agent() {
    const query =
        "Quiero ir a la derecha";
    console.log(`Query stream: ${query}`);

    const stream = await filterAgent.stream([{
        role: "user",
        content: query
    }]);

    console.log("\n Agente Filtro (stream): ");

    for await (const chunk of stream.textStream) {
        process.stdout.write(chunk);
    }

    console.log("\n\n✅ Recipe complete!");
}

// test describe agent
async function describe_Agent(query: string) {
    // Create a thread with initial working memory
    const thread = await gameStateMemory.createThread({
        threadId: "12134",
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




    console.log(`Test Describe Query: ${query}`);
    const response = await describeAgent.generate(query,
        {
            threadId: thread.id,
            resourceId: "1234",
        },
    )
    // salida del LLM
    console.log(response.text)
}


async function main_estruct() {
    const query =
        "Describeme la sala de chocolate";
    console.log(`Query: ${query}`);

    // Define the Zod schema
    const schema = z.object({
                actionType: z.enum(["description", "challenge", "object", "move"]),
                query: z.string()
    });

    const response = await filterAgent.generate(
        [{ role: "user", content: query }],
        {
            structuredOutput: {
                schema,
                jsonPromptInjection: true,
            },
        },
    );
    console.log("\n👨‍🍳 Agente Filtro(estruct):", response.object);
}


// definimos el tipo de dato para que no tenga error
type MyWorkflowOutput = {
    status: string;
    steps: any[];
    result: any;
    input: any;
    traceId: string;
}
// test workflow
async function test_Workflow(consulta: string) {
    const run = await mastra.getWorkflow("actionWorkflow")
        .createRunAsync();

    const res = await run.start({
        inputData: {
            query: consulta,
        },
    }) // as unknown as MyWorkflowOutput;

    // Dump the complete workflow result (includes status, steps and result)
    // Devuelve la salida estructurada; soporta `res.result` (nuevo formato) o `res.object` (antiguo)
    let _res = (res as any).result ?? (res as any).object ?? res;
    console.log(JSON.stringify(_res, null, 2));

    // Get the workflow output value
    // console.log(`Output value: ${JSON.stringify(res.steps, null, 2)}`);

}

// describe_Agent("Describeme la sala")
// describe_Agent("Como me llamo?")
// main_estruct();
// test_Workflow("Describe donde estoy")
// test_Workflow("Como me llamo?")
// test_Workflow("Describe las salidas que hay")
await test_Workflow("coje la manzana")
//await verMemoria("1234")
await test_Workflow("Dale la manzana a Grok")
//await verMemoria("1234")
await test_Workflow("Que tengo en el inventario?")
//await verMemoria("1234")
