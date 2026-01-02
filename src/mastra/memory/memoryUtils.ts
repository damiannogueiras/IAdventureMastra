/**
 * Utility functions for accessing and debugging GameState memory
 * This file provides helpers to read and inspect the working memory
 */

import { gameStateMemory } from "./gameState";

/**
 * Get the full working memory from a thread
 * @param threadId - The thread ID to fetch memory from
 * @returns The working memory content as a string
 */
export async function getWorkingMemory(threadId: string): Promise<string> {
    try {
        const thread = await gameStateMemory.getThreadById({ threadId });
        const metadata = thread?.metadata || {};
        return typeof metadata.workingMemory === "string" ? metadata.workingMemory : "";
    } catch (error) {
        console.error("[ERROR] Failed to get working memory:", error);
        return "";
    }
}

/**
 * Print the working memory in a readable format
 * @param threadId - The thread ID to fetch memory from
 */
export async function printWorkingMemory(threadId: string): Promise<void> {
    const memory = await getWorkingMemory(threadId);

    if (!memory) {
        console.log("[INFO] No working memory found for this thread");
        return;
    }

    console.log("\n" + "=".repeat(60));
    console.log("📋 WORKING MEMORY");
    console.log("=".repeat(60));
    console.log(memory);
    console.log("=".repeat(60) + "\n");
}

/**
 * Update the working memory for a thread
 * @param threadId - The thread ID to update
 * @param newMemory - The new memory content
 */
export async function updateWorkingMemory(
    threadId: string,
    newMemory: string
): Promise<void> {
    try {
        const thread = await gameStateMemory.getThreadById({ threadId });

        if (!thread) {
            console.error("[ERROR] Thread not found:", threadId);
            return;
        }

        const updatedMetadata = {
            ...thread.metadata,
            workingMemory: newMemory,
        };

        await gameStateMemory.createThread({
            threadId: thread.id,
            resourceId: thread.resourceId,
            metadata: updatedMetadata,
        });

        console.log("[INFO] Working memory updated successfully");
    } catch (error) {
        console.error("[ERROR] Failed to update working memory:", error);
    }
}

/**
 * Parse and extract specific information from working memory
 * @param threadId - The thread ID
 * @returns Parsed memory object with game state information
 */
export async function parseWorkingMemory(threadId: string): Promise<ParsedGameState> {
    const memory = await getWorkingMemory(threadId);
    
    const parsed: ParsedGameState = {
        player: "",
        inventory: [],
        currentLocation: "",
        locationObjects: [],
        scenarioObjects: [],
        exits: [],
        challenges: [],
        rawMemory: memory,
    };

    // Simple parsing - you can enhance this with regex for better extraction
    const lines = memory.split('\n');
    let currentSection = '';

    for (const line of lines) {
        const trimmed = line.trim();
        
        if (trimmed.startsWith('## jugador:')) {
            parsed.player = trimmed.replace('## jugador:', '').trim();
        } else if (trimmed.startsWith('## inventario')) {
            currentSection = 'inventory';
        } else if (trimmed.startsWith('## localizacion actual:')) {
            parsed.currentLocation = trimmed.replace('## localizacion actual:', '').trim();
            currentSection = 'location';
        } else if (trimmed.startsWith('### objetos localizacion')) {
            currentSection = 'locationObjects';
        } else if (trimmed.startsWith('### escenario')) {
            currentSection = 'scenarioObjects';
        } else if (trimmed.startsWith('### salidas')) {
            currentSection = 'exits';
        } else if (trimmed.startsWith('### retos')) {
            currentSection = 'challenges';
        } else if (trimmed.startsWith('- ') && trimmed.length > 2) {
            const item = trimmed.substring(2).trim();
            
            if (currentSection === 'inventory') {
                parsed.inventory.push(item);
            } else if (currentSection === 'locationObjects') {
                parsed.locationObjects.push(item);
            } else if (currentSection === 'scenarioObjects') {
                parsed.scenarioObjects.push(item);
            } else if (currentSection === 'exits') {
                parsed.exits.push(item);
            } else if (currentSection === 'challenges') {
                parsed.challenges.push(item);
            }
        }
    }

    return parsed;
}

/**
 * Pretty print the parsed game state
 * @param threadId - The thread ID
 */
export async function printParsedGameState(threadId: string): Promise<void> {
    const state = await parseWorkingMemory(threadId);

    console.log("\n" + "=".repeat(60));
    console.log("🎮 PARSED GAME STATE");
    console.log("=".repeat(60));
    console.log(`👤 Player: ${state.player}`);
    console.log(`📍 Location: ${state.currentLocation}`);
    console.log(`\n🎒 Inventory (${state.inventory.length} items):`);
    state.inventory.forEach(item => console.log(`   • ${item}`));
    console.log(`\n🏠 Location Objects (${state.locationObjects.length}):`);
    state.locationObjects.forEach(item => console.log(`   • ${item}`));
    console.log(`\n🌍 Scenario Objects (${state.scenarioObjects.length}):`);
    state.scenarioObjects.forEach(item => console.log(`   • ${item}`));
    console.log(`\n🚪 Exits (${state.exits.length}):`);
    state.exits.forEach(item => console.log(`   • ${item}`));
    console.log(`\n⚔️ Challenges (${state.challenges.length}):`);
    state.challenges.forEach(item => console.log(`   • ${item}`));
    console.log("=".repeat(60) + "\n");
}

interface ParsedGameState {
    player: string;
    inventory: string[];
    currentLocation: string;
    locationObjects: string[];
    scenarioObjects: string[];
    exits: string[];
    challenges: string[];
    rawMemory: string;
}

export type { ParsedGameState };
