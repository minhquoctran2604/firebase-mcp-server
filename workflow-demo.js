#!/usr/bin/env node

import { config } from "dotenv";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, push, query, orderByChild } from "firebase/database";

// Load environment variables
config();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

console.log("🎭 Demo: Cách Firebase MCP Server hoạt động\n");

// Simulate các tool calls như Claude sẽ gọi
async function simulateClaudeInteraction() {
  
  console.log("=" .repeat(60));
  console.log("🔵 SCENARIO: Claude đang chat với user về React projects");
  console.log("=" .repeat(60));
  
  // 1. Claude learns something about user
  console.log("\n1️⃣ User: 'Tôi thích sử dụng React với TypeScript cho frontend'");
  console.log("🤖 Claude: Để tôi lưu thông tin này vào memory...");
  
  // Simulate store_memory tool call
  const memoryRef1 = push(ref(database, "memories"));
  const memory1 = {
    content: "User thích sử dụng React với TypeScript cho frontend development",
    metadata: {
      tags: ["preference", "tech", "frontend"],
      importance: 8,
      type: "preference",
      context: "technology_discussion"
    },
    timestamp: Date.now(),
    id: memoryRef1.key,
  };
  
  await set(memoryRef1, memory1);
  console.log("✅ Memory stored with ID:", memoryRef1.key);
  
  // 2. Later conversation
  console.log("\n" + "=" .repeat(60));
  console.log("🔵 SCENARIO: Một ngày sau, user hỏi về project setup");
  console.log("=" .repeat(60));
  
  console.log("\n2️⃣ User: 'Nên setup project frontend như thế nào?'");
  console.log("🤖 Claude: Để tôi tìm thông tin về preferences của bạn...");
  
  // Simulate search_memories tool call
  const memoriesRef = ref(database, "memories");
  const snapshot = await get(memoriesRef);
  const relevantMemories = [];
  
  if (snapshot.exists()) {
    snapshot.forEach((childSnapshot) => {
      const memory = childSnapshot.val();
      // Search for frontend preferences
      if (memory.metadata?.tags?.includes("frontend") || 
          memory.content.toLowerCase().includes("frontend")) {
        relevantMemories.push(memory);
      }
    });
  }
  
  console.log(`🔍 Found ${relevantMemories.length} relevant memories about frontend`);
  if (relevantMemories.length > 0) {
    console.log("📋 Retrieved memory:", relevantMemories[0].content);
    console.log("🤖 Claude: Dựa trên preferences trước đó, tôi thấy bạn thích React + TypeScript...");
  }
  
  // 3. Claude provides personalized advice and stores new info
  console.log("\n3️⃣ Claude gives advice and learns more");
  const memoryRef2 = push(ref(database, "memories"));
  const memory2 = {
    content: "User được recommend sử dụng Vite cho React+TS setup vì fast hot reload",
    metadata: {
      tags: ["recommendation", "tech", "tools"],
      importance: 7,
      type: "advice_given",
      context: "project_setup_discussion"
    },
    timestamp: Date.now(),
    id: memoryRef2.key,
  };
  
  await set(memoryRef2, memory2);
  console.log("✅ New recommendation stored for future reference");
  
  // 4. Show accumulated knowledge
  console.log("\n" + "=" .repeat(60));
  console.log("🧠 ACCUMULATED KNOWLEDGE về user:");
  console.log("=" .repeat(60));
  
  const allMemoriesSnapshot = await get(memoriesRef);
  const allMemories = [];
  
  if (allMemoriesSnapshot.exists()) {
    allMemoriesSnapshot.forEach((childSnapshot) => {
      allMemories.push(childSnapshot.val());
    });
    
    // Sort by timestamp
    allMemories.sort((a, b) => b.timestamp - a.timestamp);
    
    console.log(`📚 Total memories: ${allMemories.length}`);
    allMemories.forEach((memory, index) => {
      console.log(`\n${index + 1}. ${memory.content}`);
      console.log(`   Tags: ${memory.metadata.tags?.join(", ")}`);
      console.log(`   Type: ${memory.metadata.type}`);
      console.log(`   Importance: ${memory.metadata.importance}/10`);
      console.log(`   Time: ${new Date(memory.timestamp).toLocaleString()}`);
    });
  }
  
  // 5. Demonstrate search by tags
  console.log("\n" + "=" .repeat(60));
  console.log("🔍 DEMO: Search memories by tag 'preference'");
  console.log("=" .repeat(60));
  
  const preferenceMemories = allMemories.filter(memory => 
    memory.metadata?.tags?.includes("preference")
  );
  
  console.log(`Found ${preferenceMemories.length} preference memories:`);
  preferenceMemories.forEach((memory, index) => {
    console.log(`${index + 1}. ${memory.content}`);
  });
  
  // 6. Show how this enables continuity across sessions
  console.log("\n" + "=" .repeat(60));
  console.log("🔄 BENEFIT: Continuity across chat sessions");
  console.log("=" .repeat(60));
  
  console.log("💡 Trong chat sessions tương lai:");
  console.log("- Claude sẽ nhớ user thích React + TypeScript");
  console.log("- Claude sẽ nhớ đã recommend Vite");
  console.log("- Claude có thể suggest consistent với preferences");
  console.log("- User không cần repeat preferences mỗi lần chat");
  
  // Clean up demo data
  console.log("\n🧹 Cleaning up demo data...");
  // Note: In real usage, we wouldn't clean up - data persists!
  
  console.log("\n🎉 Demo completed! This is how Firebase MCP Server enables long-term memory for Claude.");
}

// Run the demo
simulateClaudeInteraction().catch(console.error);
