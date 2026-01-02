# IAdventure: An LLM-Powered Conversational Adventure Game Engine

## Overview

IAdventure is a conversational adventure game engine inspired by vintage text-based games like 'Colossal Cave Adventure'. The primary objective of this project is to leverage Large Language Models (LLMs) to act as a dynamic Game Master, directing the game flow and narrative.

A core design principle is the use of Markdown for complete story and world creation. This approach empowers writers and game designers without a technical background to build immersive worlds, define locations, items, and challenges using a simple and intuitive syntax. See the [template](./src/md/plantilla.md) for the specific structure of a location file.

The game engine is designed to be highly extensible, with the ultimate goal of creating a platform for a wide range of conversational adventure games.

## Technical Architecture

The IAdventure engine is built on a modular architecture, with a clear separation of concerns between the game world, the game logic, and the user interface.

### Game World and State

*   **Locations**: The game world is composed of interconnected locations, each defined in its own Markdown file. These files describe the location, the objects within it, and the challenges that the player must overcome.
*   **NoSQL Database**: On startup, the Markdown files are parsed and loaded into a NoSQL database. This provides a flexible and scalable way to manage the game world.
*   **Game State**: The current state of the game, including the player's inventory and the status of various challenges, is maintained in a dedicated [game state object](./src/md/localizaciones/GameState.md). This ensures a consistent and up-to-date view of the game world at all times.

### Game Engine

*   **Mastra Workflow**: The core of the game engine is a Mastra workflow. This workflow orchestrates the various agents and components of the game, processing player input and generating appropriate responses.
*   **Specialized Agents**: The engine utilizes a set of specialized agents, each responsible for a specific type of player action:
    *   **Describe Agent**: Provides descriptions of the player's current location.
    *   **Challenge Agent**: Evaluates the player's attempts to solve challenges.
    *   **Inventory Agent**: Manages the player's inventory, including picking up and dropping objects.
    *   **Move Agent**: Handles player movement between locations.
*   **LLM Integration**: The LLM is the heart of the game engine. It receives the player's input, along with the current game state, and determines the appropriate course of action. This allows for a much richer and more dynamic interaction model than traditional text-based games.
*   **Mastra Control Protocol (MCP)**: The engine will use MCP to update the game world in the database. For example, when a player picks up an object or completes a challenge, the corresponding location file is updated to reflect the change.

## Advanced Goals and Roadmap

The long-term vision for IAdventure includes a number of advanced features:

*   **Interactive NPCs**: The introduction of non-player characters (NPCs) that can interact with the player. These NPCs will be defined in Markdown, with their conversations and behavior driven by the LLM.
*   **Multiplayer**: The ability for multiple players to inhabit the same game world, sharing common locations while experiencing their own individual story arcs. This will include collaborative challenges that require players to work together to solve.
*   **Discord Integration**: A first version of the game will be playable on Discord, leveraging its bot framework and user interface components.

## [Base Repository](https://github.com/damiannogueiras/IAdventure)
