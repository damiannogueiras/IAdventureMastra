import { z } from "zod";
import {mastra} from "./mastra";
import {filterAgent} from "./mastra/agents/filter-agent";

// Si usas .env, instala dotenv: npm install dotenv
import 'dotenv/config';

// carga variables desde `agente86/.env`

//const API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const API_KEY = process.env.GROQ_API_KEY;

if (!API_KEY) {
    throw new Error('Falta GOOGLE_GENERATIVE_AI_API_KEY en el entorno. Define en .env o exportala antes de ejecutar.');
}

// continúa con el resto del archivo que usa la API key
console.log('API key cargada correctamente.');

// test chef agent with streaming response
async function test_Agent() {
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

// test chef agent with structured output
async function main_estruct() {
    const query =
        "DESCRIBEME LA SALA";
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

// test workflow
async function test_Workflow() {
    const run = await mastra.getWorkflow("actionWorkflow").createRunAsync();

    const res = await run.start({
        inputData: {
            query: "Quiero ir a la derecha"
        },
    });

    // Dump the complete workflow result (includes status, steps and result)
    console.log(JSON.stringify(res, null, 2));

    // Get the workflow output value
    if (res.status === "success") {
        const question = res.result.askAboutRole?.question ?? res.result.askAboutSpecialty?.question;

        console.log(`Output value: ${question}`);
    }
}

// test_Agent()
// main_estruct();
test_Workflow()