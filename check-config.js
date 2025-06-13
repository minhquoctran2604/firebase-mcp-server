#!/usr/bin/env node

import { readFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

console.log("🔍 Checking Claude Desktop Configuration...\n");

// Find Claude Desktop config file location
const possibleConfigPaths = [
  join(homedir(), 'AppData', 'Roaming', 'Claude', 'claude_desktop_config.json'),
  join(homedir(), '.config', 'claude', 'claude_desktop_config.json'),
  join(homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json')
];

let configPath = null;
let config = null;

for (const path of possibleConfigPaths) {
  try {
    const content = readFileSync(path, 'utf8');
    config = JSON.parse(content);
    configPath = path;
    console.log("✅ Found Claude Desktop config at:", path);
    break;
  } catch (error) {
    // File doesn't exist or can't be read, continue
  }
}

if (!config) {
  console.log("❌ Claude Desktop config file not found.");
  console.log("Expected locations:");
  possibleConfigPaths.forEach(path => console.log(`  - ${path}`));
  console.log("\nPlease create the config file manually.");
  process.exit(1);
}

// Check if firebase-memory server is configured
console.log("\n📋 Checking MCP server configuration...");

if (!config.mcpServers) {
  console.log("❌ No mcpServers section found in config");
} else if (!config.mcpServers['firebase-memory']) {
  console.log("❌ firebase-memory server not configured");
  console.log("\n📝 Add this to your claude_desktop_config.json:");
  console.log(`
{
  "mcpServers": {
    "firebase-memory": {
      "command": "node",
      "args": ["D:\\\\firebase-mcp-server\\\\firebase-mcp-server.js"],
      "env": {
        "FIREBASE_API_KEY": "AIzaSyDbpkZFwxRIcg9JP8VV9fYKAwmIfcuF5io",
        "FIREBASE_AUTH_DOMAIN": "mcp-server-for-storage.firebaseapp.com",
        "FIREBASE_PROJECT_ID": "mcp-server-for-storage",
        "FIREBASE_STORAGE_BUCKET": "mcp-server-for-storage.firebasestorage.app",
        "FIREBASE_MESSAGING_SENDER_ID": "287848165413",
        "FIREBASE_APP_ID": "1:287848165413:web:a9306c4134ea970c754fcc",
        "FIREBASE_DATABASE_URL": "https://mcp-server-for-storage-default-rtdb.asia-southeast1.firebasedatabase.app"
      }
    }
  }
}
`);
} else {
  console.log("✅ firebase-memory server is configured");
  
  const serverConfig = config.mcpServers['firebase-memory'];
  console.log("\n📋 Current configuration:");
  console.log("Command:", serverConfig.command);
  console.log("Args:", serverConfig.args);
  
  // Check if environment variables are set
  if (serverConfig.env) {
    const requiredEnvVars = [
      'FIREBASE_API_KEY',
      'FIREBASE_AUTH_DOMAIN',
      'FIREBASE_PROJECT_ID',
      'FIREBASE_STORAGE_BUCKET',
      'FIREBASE_MESSAGING_SENDER_ID',
      'FIREBASE_APP_ID',
      'FIREBASE_DATABASE_URL'
    ];
    
    console.log("\n🔑 Environment variables:");
    requiredEnvVars.forEach(varName => {
      if (serverConfig.env[varName]) {
        console.log(`✅ ${varName}: Configured`);
      } else {
        console.log(`❌ ${varName}: Missing`);
      }
    });
  } else {
    console.log("❌ No environment variables configured");
  }
}

console.log("\n📚 Next steps:");
console.log("1. Make sure Claude Desktop is closed");
console.log("2. Update the configuration if needed");
console.log("3. Restart Claude Desktop");
console.log("4. The firebase-memory tools should appear in Claude");

console.log("\n🛠️ Available tools once configured:");
console.log("- bb7_store_memory: Store memories with metadata");
console.log("- bb7_get_memory: Retrieve specific memory by ID");
console.log("- bb7_search_memories: Search by content, tag, or type");  
console.log("- bb7_delete_memory: Delete specific memory");
console.log("- bb7_list_recent_memories: List recent memories");
