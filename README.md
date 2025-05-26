
# Agent-Computer

## Overview
Agent-Computer is a revolutionary, full-screen online operating environment designed to enhance productivity and creativity through AI-powered tools and agents. It provides a unified workspace where users can seamlessly switch between specialized applications, each augmented by its own contextual AI assistant. The core philosophy is to have AI as an intelligent partner, deeply integrated into the user's workflow, with enhanced extensibility through the Model Context Protocol (MCP) for integrating external tools and data sources.

## Features
*   **Tool-Based Architecture**: A suite of tools including Document Processor, Web Navigator, Comms Hub, Creative Suite, Task Manager, Spreadsheet Tool, Presentation Builder, Code Editor, Game Center, and Settings.
*   **Integrated Agent Stream**: Each tool features its own dedicated AI agent accessible via an embedded "Agent Stream." This stream provides:
    *   A chat interface for natural language interaction.
    *   Real-time logs of agent actions.
    *   Contextual action buttons (Approve, Undo, Modify).
    *   Smart suggestions relevant to the active tool and task.
*   **Orchestration Command Center**: The main page when no tool is active, allowing users to define and initiate complex, multi-tool tasks with a central Orchestration Agent. This agent can leverage both built-in UI tools and external tools connected via MCP.
*   **External Tool Integration via MCP**: Supports connecting to external MCP servers, making their tools available to the Orchestration Agent. Initial integration includes a "Sequential Thinking" MCP server.
*   **Quick Access**: Easily launch specific tools or connect to new services directly from the Orchestration Center.
*   **Responsive Design**: Adapts to various screen sizes with a collapsible sidebar.
*   **Themeable UI**: Light and dark mode support, switchable via the sidebar.
*   **Tutorial Modal**: An in-app guide to help users get started.
*   **AI-Powered Capabilities**:
    *   Document drafting assistance.
    *   Webpage summarization.
    *   Smart suggestions for tool usage.
    *   Complex task planning and execution using a combination of UI and MCP tools.
    *   (Placeholders for future AI integrations within each tool)

## Tech Stack
*   **Frontend**:
    *   Next.js (App Router)
    *   React
    *   TypeScript
*   **UI**:
    *   ShadCN UI Components
    *   Tailwind CSS
    *   Lucide React (Icons)
*   **AI Integration**:
    *   Google Genkit (leveraging Gemini models)
*   **External Tool Integration**:
    *   Model Context Protocol (MCP) SDK
*   **Deployment**:
    *   Firebase Hosting (as indicated by `firebase.json`)

## Getting Started

### Prerequisites
*   Node.js (version recommended by Next.js, typically LTS)
*   npm, yarn, or pnpm

### Installation
1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd agent-computer
    ```
2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

### Running the Development Server
To start the Next.js development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```
The application will typically be available at `http://localhost:9002`.
MCP Servers configured with `autoConnect: true` in `src/config/mcp-servers.ts` will attempt to start automatically with the Next.js development server.

### Managing MCP Servers
MCP (Model Context Protocol) servers extend Agent-Computer's capabilities by providing access to external tools and data.
*   **Configuration**: MCP servers are defined in `src/config/mcp-servers.ts`. You can add or modify server configurations here.
*   **Running Individual Servers**: If a server is not set to `autoConnect` or you need to run it separately, you can use its dedicated npm script. For example, to run the "Sequential Thinking" server:
    ```bash
    npm run mcp:sequential-thinking
    ```
    Ensure the command and arguments in `package.json` and `src/config/mcp-servers.ts` are correct for each server.
*   **Viewing Connected Servers**: In the Agent-Computer UI, click the "Add MCP Server" button (plug icon) in the sidebar Dock to view currently connected MCP servers and the number of tools they provide.

### Running Genkit Flows (for AI features)
Genkit flows are part of the Next.js server environment. To run them locally for development and testing separate from the main Next.js dev server (e.g., using the Genkit Developer UI):

1.  Ensure you have Google Cloud CLI configured with Application Default Credentials if using Google AI models locally. You might need to set up a `.env` file with your `GOOGLE_API_KEY`.
2.  Start the Genkit development server:
    ```bash
    npm run genkit:dev
    # or for watching changes
    npm run genkit:watch
    ```
    This will typically start the Genkit Developer UI on `http://localhost:4000`.

## Key Components & Architecture

*   **`src/app/agent-computer-layout.tsx`**: The main layout component that sets up the sidebar and the central "Space".
*   **`src/components/cognicanvas/`**: Contains the core UI elements.
    *   **`dock.tsx`**: The sidebar tool launcher. Also includes a button to open the "Add MCP Server" modal.
    *   **`space.tsx`**: The main content area that hosts either the `OrchestrationCenter` or the active tool.
    *   **`orchestration-center.tsx`**: The main dashboard for high-level task management. Interacts with `useMCPContext` to access MCP tools and makes them available to the `orchestrateTask` AI flow. Can initiate actions using both UI and MCP tools.
    *   **`agent-stream.tsx`**: The UI component for interacting with individual tool agents (chat, logs, actions).
    *   **`smart-suggestions.tsx`**: Displays AI-generated suggestions relevant to the active tool.
    *   **`add-mcp-server-modal.tsx`**: Displays information about MCP servers currently connected to the Agent-Computer backend, fetched via `useMCPContext`.
    *   **`tools/`**: Directory containing individual tool components (e.g., `document-processor.tsx`, `web-navigator.tsx`, etc.).
*   **`src/components/ui/`**: ShadCN UI components used throughout the application.
*   **`src/ai/`**: Contains Genkit AI flows.
    *   **`genkit.ts`**: Initializes and configures Genkit.
    *   **`flows/`**: Individual Genkit flows.
        *   `orchestrate-task-flow.ts`: The AI flow for the Orchestration Center, capable of planning tasks using both UI and MCP tools.
*   **MCP Integration Components**:
    *   **`src/config/mcp-servers.ts`**: Defines configurations for all known MCP servers, including how to start them and whether to auto-connect.
    *   **`src/mcp-servers/`**: Contains the actual MCP server implementations (e.g., `sequential-thinking-server.ts`). These are typically Node.js processes.
    *   **`src/actions/mcp-actions.ts`**: Next.js Server Actions that manage the lifecycle (spawning, connecting, disconnecting) of MCP server processes and provide an interface for calling their tools. This module instantiates `MCPManager`.
    *   **`src/contexts/mcp-context.tsx`**: React context and provider (`MCPProvider`) that uses the `useMCP` hook to make MCP server information and tool execution functions available to the application.
    *   **`src/hooks/use-mcp.ts`**: React hook that calls server actions in `mcp-actions.ts` to initialize connections, list tools, and execute MCP tools.
    *   **`src/types/mcp.ts`**: TypeScript definitions related to MCP server configurations and tools.

## AI Integration with Genkit
The application leverages Genkit for its AI capabilities:
*   **Flows**: AI logic is encapsulated in Genkit flows, typically found in `src/ai/flows/`.
*   **Models**: The primary model used is Gemini 2.0 Flash, configured in `src/ai/genkit.ts`.
*   **Schema**: Zod schemas are used to define the input and output types for AI flows.
*   **Server Actions**: Genkit flows are exposed as server actions.

### MCP Tool Orchestration
*   The `orchestrateTask` flow used by the `OrchestrationCenter` is designed to incorporate tools from connected MCP servers alongside standard UI tools.
*   The `OrchestrationCenter` component fetches available MCP tools via `useMCPContext`, formats their information, and includes them in the `availableTools` list passed to the `orchestrateTask` flow.
*   The AI can then plan steps involving these external MCP tools. The `OrchestrationCenter` handles the execution by calling the appropriate server action from `mcp-actions.ts`.

## How to Use Agent-Computer
1.  **Orchestration Center**: Upon loading, you'll see the Orchestration Center. Use the chat interface to describe complex tasks to the main AI agent. The agent can now formulate plans involving both built-in UI tools and external tools provided by connected MCP servers (like the "Sequential Thinking" tool).
2.  **Launching Tools**:
    *   Use the "Quick Access" section in the Orchestration Center to directly launch UI tools.
    *   Or, select UI tools from the sidebar Dock.
    *   View connected MCP servers by clicking the "Add MCP Server" button (plug icon) in the Dock.
3.  **Interacting with Tool Agents**: Once a UI tool is open, its dedicated Agent Stream panel will be visible for AI assistance specific to that tool.
4.  **Navigation**:
    *   Click the "Agent-Computer" logo in the sidebar header to return to the Orchestration Center.
    *   Use the sidebar Dock to switch between different UI tools.
5.  **Customization**:
    *   Toggle between light and dark themes using the palette icon in the sidebar footer.
    *   Access the tutorial via the help icon in the sidebar footer.

## Firebase Integration
This project is set up for deployment with Firebase Hosting. The `firebase.json` file configures how the Next.js application is served.

## Future Development Ideas
*   Implement full functionality for all placeholder UI tools.
*   Develop sophisticated Genkit flows for the Orchestration Agent to manage complex multi-tool tasks involving more intricate MCP tool interactions.
*   Introduce persistent learning for agents based on user feedback.
*   Add more advanced window management features within the "Space".
*   Expand AI capabilities within each tool.
*   Implement user accounts and data persistence.
*   Integrate a wider variety of diverse MCP servers (e.g., filesystem, web search, database tools).
*   Allow dynamic connection/disconnection of MCP servers from the UI.

---

*This README provides an overview of the Agent-Computer application as of the current development stage.*
