import { Agent } from '@mastra/core/agent';
import { gameStateMemory } from "../memory/gameState";
import { DESCRIBE_AGENT_CONFIG } from "../config/agentsConfig";

export const describeAgent = new Agent({
    name: DESCRIBE_AGENT_CONFIG.name,
    instructions: DESCRIBE_AGENT_CONFIG.instructions,
    model: DESCRIBE_AGENT_CONFIG.model,
    memory: gameStateMemory,
})


