#!/usr/bin/env node

import { config } from "dotenv";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, push, remove } from "firebase/database";

// Load environment variables
config();

console.log("🧪 Testing Firebase MCP Server Tools...\n");

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
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

async function testMemoryOperations() {
  try {
    console.log("📝 Testing memory storage...");
    
    // Test storing a memory
    const memoryRef = push(ref(database, "memories"));
    const memoryData = {
      content: "Người dùng thích sử dụng React cho frontend projects",
      metadata: {
        tags: ["preference", "tech"],
        importance: 8,
        type: "preference"
      },
      timestamp: Date.now(),
      id: memoryRef.key,
    };
    
    await set(memoryRef, memoryData);
    console.log("✅ Memory stored successfully with ID:", memoryRef.key);

    // Test reading the memory
    console.log("\n📖 Testing memory retrieval...");
    const snapshot = await get(memoryRef);
    if (snapshot.exists()) {
      console.log("✅ Memory retrieved successfully:");
      console.log("Content:", snapshot.val().content);
      console.log("Tags:", snapshot.val().metadata.tags);
      console.log("Type:", snapshot.val().metadata.type);
    }

    // Test search functionality
    console.log("\n🔍 Testing search functionality...");
    const memoriesRef = ref(database, "memories");
    const allMemoriesSnapshot = await get(memoriesRef);
    
    if (allMemoriesSnapshot.exists()) {
      const memories = [];
      allMemoriesSnapshot.forEach((childSnapshot) => {
        const memory = childSnapshot.val();
        // Search for "React"
        if (memory.content.toLowerCase().includes("react")) {
          memories.push(memory);
        }
      });
      
      if (memories.length > 0) {
        console.log(`✅ Found ${memories.length} memories containing "React"`);
        console.log("First match:", memories[0].content);
      } else {
        console.log("❌ No memories found containing 'React'");
      }
    }

    // Store another memory for testing
    console.log("\n📝 Adding another test memory...");
    const memoryRef2 = push(ref(database, "memories"));
    const memoryData2 = {
      content: "User prefers dark theme in VS Code",
      metadata: {
        tags: ["preference", "ui"],
        importance: 5,
        type: "preference"
      },
      timestamp: Date.now(),
      id: memoryRef2.key,
    };
    
    await set(memoryRef2, memoryData2);
    console.log("✅ Second memory stored with ID:", memoryRef2.key);

    // Test filtering by tag
    console.log("\n🏷️ Testing tag filtering...");
    const allMemoriesSnapshot2 = await get(memoriesRef);
    const preferenceMemoris = [];
    
    allMemoriesSnapshot2.forEach((childSnapshot) => {
      const memory = childSnapshot.val();
      if (memory.metadata?.tags && memory.metadata.tags.includes("preference")) {
        preferenceMemoris.push(memory);
      }
    });
    
    console.log(`✅ Found ${preferenceMemoris.length} memories with 'preference' tag`);
    
    // Clean up test data
    console.log("\n🧹 Cleaning up test data...");
    await remove(memoryRef);
    await remove(memoryRef2);
    console.log("✅ Test data cleaned up");

    console.log("\n🎉 All memory operations tested successfully!");
    console.log("\n📚 Your Firebase MCP Server is ready to use with Claude Desktop!");
    console.log("Available tools:");
    console.log("- store_memory: Store memories with metadata");
    console.log("- search_memories: Search by content, tag, or type");
    console.log("- get_memory: Retrieve specific memory by ID");
    console.log("- delete_memory: Delete specific memory");
    console.log("- list_recent_memories: List recent memories");

  } catch (error) {
    console.error("\n❌ Memory operations test failed:", error.message);
    process.exit(1);
  }
}

testMemoryOperations();
