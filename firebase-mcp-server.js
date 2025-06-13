#!/usr/bin/env node

import { config } from "dotenv";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  set,
  get,
  remove,
  push,
  child,
  query,
  orderByChild,
  equalTo,
  limitToLast,
} from "firebase/database";

// Load environment variables
config();

// Validate required environment variables
const requiredEnvVars = [
  "FIREBASE_API_KEY",
  "FIREBASE_AUTH_DOMAIN",
  "FIREBASE_PROJECT_ID",
  "FIREBASE_STORAGE_BUCKET",
  "FIREBASE_MESSAGING_SENDER_ID",
  "FIREBASE_APP_ID",
  "FIREBASE_DATABASE_URL",
];

const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.error(
    "Missing required environment variables:",
    missingEnvVars.join(", ")
  );
  console.error("Please check your .env file or environment configuration.");
  process.exit(1);
}

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
};

// Initialize Firebase
let app, database;
try {
  app = initializeApp(firebaseConfig);
  database = getDatabase(app);
  console.error("Firebase initialized successfully");
} catch (error) {
  console.error("Failed to initialize Firebase:", error.message);
  process.exit(1);
}

// Create server instance
const server = new Server(
  {
    name: "firebase-memory",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "store_memory",
        description: "Store a memory with content and optional metadata",
        inputSchema: {
          type: "object",
          properties: {
            content: {
              type: "string",
              description: "The memory content to store",
            },
            metadata: {
              type: "object",
              description: "Optional metadata for the memory",
              properties: {
                tags: {
                  type: "array",
                  items: { type: "string" },
                  description: "Tags for categorizing the memory",
                },
                importance: {
                  type: "number",
                  description: "Importance level (1-10)",
                  minimum: 1,
                  maximum: 10,
                },
                type: {
                  type: "string",
                  description: "Type of memory (fact, conversation, task, etc.)",
                },
              },
            },
          },
          required: ["content"],
        },
      },
      {
        name: "search_memories",
        description: "Search memories by content or metadata",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query to match against memory content",
            },
            tag: {
              type: "string",
              description: "Filter by specific tag",
            },
            type: {
              type: "string",
              description: "Filter by memory type",
            },
            limit: {
              type: "number",
              description: "Maximum number of results to return",
              default: 10,
            },
          },
        },
      },
      {
        name: "get_memory",
        description: "Retrieve a specific memory by ID",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "The memory ID to retrieve",
            },
          },
          required: ["id"],
        },
      },
      {
        name: "delete_memory",
        description: "Delete a specific memory by ID",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "The memory ID to delete",
            },
          },
          required: ["id"],
        },
      },
      {
        name: "list_recent_memories",
        description: "List recent memories with optional limit",
        inputSchema: {
          type: "object",
          properties: {
            limit: {
              type: "number",
              description: "Maximum number of recent memories to return",
              default: 10,
            },
          },
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "store_memory": {
        const { content, metadata = {} } = args;
        
        if (!content || typeof content !== 'string') {
          throw new McpError(
            ErrorCode.InvalidParams,
            "Content is required and must be a string"
          );
        }

        try {
          const memoryRef = push(ref(database, "memories"));
          const memoryData = {
            content,
            metadata: {
              ...metadata,
              // Ensure arrays and validate metadata
              tags: Array.isArray(metadata.tags) ? metadata.tags : [],
              importance: typeof metadata.importance === 'number' && 
                         metadata.importance >= 1 && 
                         metadata.importance <= 10 ? metadata.importance : 5,
              type: typeof metadata.type === 'string' ? metadata.type : 'general'
            },
            timestamp: Date.now(),
            id: memoryRef.key,
          };
          
          await set(memoryRef, memoryData);
          
          return {
            content: [
              {
                type: "text", 
                text: `Memory stored successfully with ID: ${memoryRef.key}`,
              },
            ],
          };
        } catch (error) {
          console.error('Error storing memory:', error);
          throw new McpError(
            ErrorCode.InternalError,
            `Failed to store memory: ${error.message}`
          );
        }
      }

      case "search_memories": {
        const { query, tag, type, limit = 10 } = args;
        const memoriesRef = ref(database, "memories");
        const snapshot = await get(memoriesRef);

        if (!snapshot.exists()) {
          return {
            content: [
              {
                type: "text",
                text: "No memories found.",
              },
            ],
          };
        }

        const memories = [];
        snapshot.forEach((childSnapshot) => {
          const memory = childSnapshot.val();
          let matches = true;

          // Filter by query (case-insensitive content search)
          if (
            query &&
            !memory.content.toLowerCase().includes(query.toLowerCase())
          ) {
            matches = false;
          }

          // Filter by tag
          if (
            tag &&
            (!memory.metadata?.tags || !memory.metadata.tags.includes(tag))
          ) {
            matches = false;
          }

          // Filter by type
          if (type && memory.metadata?.type !== type) {
            matches = false;
          }

          if (matches) {
            memories.push(memory);
          }
        });

        // Sort by timestamp (newest first) and limit results
        memories.sort((a, b) => b.timestamp - a.timestamp);
        const limitedMemories = memories.slice(0, limit);

        return {
          content: [
            {
              type: "text",
              text: `Found ${limitedMemories.length} memories:\n\n${limitedMemories
                .map(
                  (memory) =>
                    `ID: ${memory.id}\nContent: ${memory.content}\nTimestamp: ${new Date(
                      memory.timestamp
                    ).toISOString()}\nMetadata: ${JSON.stringify(
                      memory.metadata,
                      null,
                      2
                    )}`
                )
                .join("\n\n---\n\n")}`,
            },
          ],
        };
      }

      case "get_memory": {
        const { id } = args;
        const memoryRef = ref(database, `memories/${id}`);
        const snapshot = await get(memoryRef);

        if (!snapshot.exists()) {
          return {
            content: [
              {
                type: "text",
                text: `Memory with ID ${id} not found.`,
              },
            ],
          };
        }

        const memory = snapshot.val();
        return {
          content: [
            {
              type: "text",
              text: `Memory ID: ${memory.id}\nContent: ${memory.content}\nTimestamp: ${new Date(
                memory.timestamp
              ).toISOString()}\nMetadata: ${JSON.stringify(memory.metadata, null, 2)}`,
            },
          ],
        };
      }

      case "delete_memory": {
        const { id } = args;
        const memoryRef = ref(database, `memories/${id}`);

        // Check if memory exists first
        const snapshot = await get(memoryRef);
        if (!snapshot.exists()) {
          return {
            content: [
              {
                type: "text",
                text: `Memory with ID ${id} not found.`,
              },
            ],
          };
        }

        await remove(memoryRef);
        return {
          content: [
            {
              type: "text",
              text: `Memory with ID ${id} deleted successfully.`,
            },
          ],
        };
      }

      case "list_recent_memories": {
        const { limit = 10 } = args;
        const memoriesRef = query(
          ref(database, "memories"),
          orderByChild("timestamp"),
          limitToLast(limit)
        );
        const snapshot = await get(memoriesRef);

        if (!snapshot.exists()) {
          return {
            content: [
              {
                type: "text",
                text: "No memories found.",
              },
            ],
          };
        }

        const memories = [];
        snapshot.forEach((childSnapshot) => {
          memories.push(childSnapshot.val());
        });

        // Sort by timestamp (newest first)
        memories.sort((a, b) => b.timestamp - a.timestamp);

        return {
          content: [
            {
              type: "text",
              text: `Recent memories (${memories.length}):\n\n${memories
                .map(
                  (memory) =>
                    `ID: ${memory.id}\nContent: ${memory.content}\nTimestamp: ${new Date(
                      memory.timestamp
                    ).toISOString()}\nMetadata: ${JSON.stringify(
                      memory.metadata,
                      null,
                      2
                    )}`
                )
                .join("\n\n---\n\n")}`,
            },
          ],
        };
      }

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${name}`
        );
    }
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Error executing tool ${name}: ${error.message}`
    );
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Firebase Memory MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
