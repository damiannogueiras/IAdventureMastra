import { Agent } from '@mastra/core/agent';
import { gameStateMemory } from "../memory/gameState";
import { ACTION_AGENT_CONFIG } from "../config/agentsConfig";

export const accionAgent = new Agent({
    name: ACTION_AGENT_CONFIG.name,
    instructions: ACTION_AGENT_CONFIG.instructions,
    model: ACTION_AGENT_CONFIG.model,
    memory: gameStateMemory,
});