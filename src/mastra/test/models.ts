/**
 * Test file to verify available Groq models
 * Run with: npx ts-node src/mastra/test/models.ts
 */

// Load environment variables from .env file
import dotenv from "dotenv";
dotenv.config();

import { createGroq } from "@ai-sdk/groq";

// Default fallback models to test if API call fails
const groqModelsToTest = [
  // Fast models
  "mixtral-8x7b-32768",
  "mixtral-8x7b",

  // Llama models
  "llama-3.3-70b-versatile",
  "llama-3.3-70b-specdec",
  "llama-3.1-70b-versatile",
  "llama-3.1-8b-instant",
  "llama-3-70b-8192",
  "llama-3-8b-8192",

  // Other models
  "qwen2-72b-instruct",
  "neural-chat-7b-v3-1",
];

interface ModelTestResult {
  modelId: string;
  fullModelId: string;
  available: boolean;
  error?: string;
}

/**
 * Fetch available models from Groq API
 */
async function fetchGroqModels(apiKey: string): Promise<string[]> {
  try {
    const response = await fetch("https://api.groq.com/openai/v1/models", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const data = await response.json() as { data: Array<{ id: string }> };

    if (!data.data || !Array.isArray(data.data)) {
      throw new Error("Invalid response format from Groq API");
    }

    // Extract model IDs from the response
    const modelIds = data.data.map((model) => model.id);
    console.log(`✅ Fetched ${modelIds.length} models from Groq API\n`);
    return modelIds;
  } catch (error: any) {
    console.log(`⚠️  Could not fetch models from Groq API: ${error?.message}`);
    console.log(`Using ${groqModelsToTest.length} fallback models instead\n`);
    return groqModelsToTest;
  }
}

/**
 * Test a single Groq model
 */
async function testModel(modelId: string): Promise<ModelTestResult> {
  try {
    const groq = createGroq({
      apiKey: process.env.GROQ_API_KEY,
    });

    // Create model instance
    const model = groq(modelId);

    // Test the model by calling doGenerate directly
    await model.doGenerate({
      prompt: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Say 'Works!' in exactly those words, nothing else.",
            },
          ],
        },
      ],
    });

    console.log(`✅ ${modelId}: Available & Responsive`);
    return {
      modelId,
      fullModelId: `groq/${modelId}`,
      available: true,
    };
  } catch (error: any) {
    const errorMessage = error?.message || String(error);
    console.log(`❌ ${modelId}: ${errorMessage.substring(0, 80)}`);
    return {
      modelId,
      fullModelId: `groq/${modelId}`,
      available: false,
      error: errorMessage,
    };
  }
}

/**
 * Test all Groq models
 */
async function testAllModels(): Promise<void> {
  console.log("\n" + "=".repeat(70));
  console.log("🧪 GROQ MODELS AVAILABILITY TEST");
  console.log("=".repeat(70) + "\n");

  // Check API key
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    console.error("❌ ERROR: GROQ_API_KEY environment variable is not set");
    console.error("\nTried to load from:");
    console.error("  1. Environment variable (GROQ_API_KEY)");
    console.error("  2. .env file (via dotenv)");
    console.error("\nPlease ensure:");
    console.error("  1. Your .env file exists and contains: GROQ_API_KEY=gsk_...");
    console.error("  2. The .env file is in the project root directory");
    process.exit(1);
  }

  // Show that API key was loaded (masked for security)
  const maskedKey = apiKey.substring(0, 10) + "..." + apiKey.substring(apiKey.length - 10);
  console.log(`✅ API Key loaded: ${maskedKey}`);

  // Fetch available models from Groq API
  console.log("📡 Fetching available models from Groq API...");
  const modelsToTest = await fetchGroqModels(apiKey);

  console.log(`Testing ${modelsToTest.length} Groq models...\n`);

  const results: ModelTestResult[] = [];

  // Test each model sequentially
  for (const modelId of modelsToTest) {
    const result = await testModel(modelId);
    results.push(result);
    // Add delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Print summary
  console.log("\n" + "=".repeat(70));
  console.log("📊 SUMMARY");
  console.log("=".repeat(70) + "\n");

  const available = results.filter((r) => r.available);
  const unavailable = results.filter((r) => !r.available);

  console.log(`✅ Available Models: ${available.length}`);
  if (available.length > 0) {
    console.log("\nYou can use these models in your config:\n");
    available.forEach((result) => {
      console.log(`  • '${result.fullModelId}'`);
    });
  }

  console.log(`\n❌ Unavailable Models: ${unavailable.length}`);
  if (unavailable.length > 0) {
    console.log("\nThese models are not accessible:\n");
    unavailable.forEach((result) => {
      console.log(`  • ${result.modelId}`);
      if (result.error) {
        console.log(`    Error: ${result.error.substring(0, 100)}...`);
      }
    });
  }

  // Print recommended configuration
  console.log("\n" + "=".repeat(70));
  console.log("🎯 RECOMMENDED CONFIGURATION");
  console.log("=".repeat(70) + "\n");

  if (available.length > 0) {
    console.log("Update your agentsConfig.ts with available Groq models:\n");
    console.log("const AVAILABLE_MODELS = [");
    available.forEach((result) => {
      console.log(`  '${result.fullModelId}',`);
    });
    console.log("  // Add other providers here...");
    console.log("];\n");

    console.log("Or use in your workflow:\n");
    console.log("const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });");
    console.log(`const model = groq('${available[0]?.modelId}');\n`);
  }

  console.log("=".repeat(70) + "\n");
}

// Run the test
testAllModels().catch((error) => {
  console.error("Fatal error during testing:", error);
  process.exit(1);
});

