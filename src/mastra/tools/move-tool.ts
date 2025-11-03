import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const moveTool = createTool({
    id: "move-tool",
    description: "Desplaza el jugador a otra localizacion",
    inputSchema: z.object({
        location: z.string(),
    }),
    outputSchema: z.object({
        isOK: z.boolean(),
    }),
    execute: async ({ context }) => {
        const { location } = context;
        // Lógica para mover al jugador a la ubicación especificada
        console.log(`[DEBUG] moveTool: Moviendo al jugador a la ubicación: ${location}`);

        return { isOK: true };
    },
});