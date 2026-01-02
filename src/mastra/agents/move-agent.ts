import { Agent } from '@mastra/core/agent';
import { gameStateMemory } from "../memory/gameState";
import { MOVE_AGENT_CONFIG } from "../config/agentsConfig";

export const moveAgent = new Agent({
  name: MOVE_AGENT_CONFIG.name,
  instructions: MOVE_AGENT_CONFIG.instructions,
  model: MOVE_AGENT_CONFIG.model,
  memory: gameStateMemory,
});