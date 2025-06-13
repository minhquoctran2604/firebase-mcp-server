# Firebase MCP Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Realtime%20Database-orange.svg)](https://firebase.google.com/)

🧠 **Self-hosted MCP Server providing long-term memory for AI assistants using Firebase Realtime Database**

## ✨ Features

- 🔥 **Firebase Integration**: Uses Firebase Realtime Database for reliable, real-time data storage
- 🧠 **Long-term Memory**: Persistent memory across chat sessions
- 🏷️ **Flexible Metadata**: Store memories with tags, importance levels, and custom types
- 🔍 **Smart Search**: Search by content, tags, or memory types
- 🛡️ **Privacy-First**: Your data stays in YOUR Firebase project
- ⚡ **Real-time Sync**: Changes sync instantly across devices
- 💰 **Cost-Effective**: Firebase free tier supports substantial usage

## 🎯 Why Choose This Over Cloud Solutions?

| Feature | Firebase MCP Server | Cloud Alternatives (e.g. HPKV) |
|---------|--------------------|--------------------|
| **Data Ownership** | ✅ Your Firebase, your data | ❌ Third-party servers |
| **Cost** | ✅ Firebase free tier + unlimited usage | ❌ API call limits (100/month free) |
| **Customization** | ✅ Fully customizable | ❌ Limited to provider features |
| **Privacy** | ✅ Complete control | ❌ Data shared with providers |
| **Setup** | ⚠️ Manual setup required | ✅ Plug & play |
| **AI Features** | ⚠️ Basic search | ✅ Semantic search, vector similarity |

## 🚀 Quick Start

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/your-username/firebase-mcp-server.git
cd firebase-mcp-server
npm install
```

### 2. Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Realtime Database**
4. Choose region (recommend: `asia-southeast1` for Vietnam)
5. Get your Firebase config from Project Settings

### 3. Environment Configuration
```bash
cp .env.example .env
# Edit .env with your Firebase credentials
```

### 4. Test Connection
```bash
npm test
npm run demo  # See it in action!
```

### 5. Configure Claude Desktop
Add to your `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "firebase-memory": {
      "command": "node",
      "args": ["/path/to/firebase-mcp-server/firebase-mcp-server.js"],
      "env": {
        "FIREBASE_API_KEY": "your-api-key",
        "FIREBASE_AUTH_DOMAIN": "your-project.firebaseapp.com",
        "FIREBASE_PROJECT_ID": "your-project-id",
        "FIREBASE_STORAGE_BUCKET": "your-project.appspot.com",
        "FIREBASE_MESSAGING_SENDER_ID": "your-sender-id",
        "FIREBASE_APP_ID": "your-app-id",
        "FIREBASE_DATABASE_URL": "https://your-project-default-rtdb.region.firebasedatabase.app/"
      }
    }
  }
}
```

## 🛠️ Available Tools

## 🛠️ Available Tools

Once configured, Claude Desktop will have access to these memory tools:

### `bb7_store_memory`
Store a memory with flexible metadata.
```javascript
// Example usage in Claude
{
  "content": "User prefers React with TypeScript for frontend projects",
  "metadata": {
    "tags": ["preference", "tech", "frontend"],
    "importance": 8,
    "type": "preference"
  }
}
```

### `bb7_search_memories`
Search memories by content, tags, or type.
```javascript
// Search examples
{ "query": "React" }                    // Content search
{ "tag": "preference" }                 // Tag filter
{ "type": "preference", "limit": 5 }    // Type + limit
```

### `bb7_get_memory`
Retrieve specific memory by ID.

### `bb7_delete_memory`
Delete specific memory by ID.

### `bb7_list_recent_memories`
List recent memories with optional limit.

## 📊 Memory Structure

Each memory is stored with this structure:
```json
{
  "id": "unique-firebase-key",
  "content": "The actual memory content",
  "metadata": {
    "tags": ["tag1", "tag2"],
    "importance": 5,
    "type": "preference",
    "custom_field": "any custom data"
  },
  "timestamp": 1672531200000
}
```

## 🎯 Use Cases

### Personal AI Assistant
- Remember user preferences and habits
- Track important dates and deadlines
- Store personal facts and relationships

### Coding Assistant
- Remember coding style preferences
- Track project patterns and decisions
- Store solutions to recurring problems

### Learning Assistant
- Track learning progress and weak areas
- Remember key concepts and explanations
- Store study schedules and goals

## 🔧 Development

### Project Structure
```
firebase-mcp-server/
├── firebase-mcp-server.js    # Main MCP server
├── package.json              # Dependencies & scripts
├── .env.example              # Environment template
├── test.js                   # Connection tests
├── demo.js                   # Usage demonstration
├── workflow-demo.js          # Workflow examples
├── check-config.js           # Config verification
├── README.md                 # This file
├── HOW-IT-WORKS.md          # Detailed explanation
├── COMPARISON.md             # vs other solutions
└── .gitignore               # Git ignore rules
```

### NPM Scripts
```bash
npm start          # Start the MCP server
npm test          # Test Firebase connection
npm run demo      # Run usage demonstration
npm run dev       # Development mode
```

## 🔒 Security & Privacy

### Quick Security Setup
```json
// Firebase Database Rules - Production
{
  "rules": {
    "memories": {
      ".read": "auth != null",
      ".write": "auth != null && auth.uid == $uid"
    }
  }
}
```

### Security Checklist
- ✅ Never commit `.env` files (already in .gitignore)
- ✅ Use Firebase project-level security  
- ✅ Implement authentication for production
- ✅ Monitor Firebase console for unusual activity
- ✅ Keep dependencies updated: `npm audit`

## 🛠️ How It Works

### Architecture
```
Claude Desktop ↔ MCP Protocol ↔ Firebase MCP Server ↔ Firebase Realtime Database
```

### Tool Flow Example
```javascript
// 1. User talks to Claude
User: "I like React with TypeScript"

// 2. Claude stores memory
bb7_store_memory({
  content: "User likes React with TypeScript",
  metadata: { tags: ["preference", "tech"], importance: 8 }
})

// 3. Later, Claude retrieves relevant info
bb7_search_memories({ tag: "preference" })
// Returns: "User likes React with TypeScript"

// 4. Claude gives personalized advice
Claude: "Based on your React+TS preference, I recommend..."
```
