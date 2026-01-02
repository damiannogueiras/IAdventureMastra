import { Agent } from '@mastra/core/agent';
import { FILTER_AGENT_CONFIG } from "../config/agentsConfig";

export const filterAgent = new Agent({
  name: FILTER_AGENT_CONFIG.name,
  instructions: FILTER_AGENT_CONFIG.instructions,
  model: FILTER_AGENT_CONFIG.model,
});