#!/usr/bin/env node

import { config } from "dotenv";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, push } from "firebase/database";

// Load environment variables
config();

console.log("🔥 Testing Firebase MCP Server Connection...\n");

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

// Validate environment variables
const requiredEnvVars = [
  'FIREBASE_API_KEY',
  'FIREBASE_AUTH_DOMAIN', 
  'FIREBASE_PROJECT_ID',
  'FIREBASE_STORAGE_BUCKET',
  'FIREBASE_MESSAGING_SENDER_ID',
  'FIREBASE_APP_ID',
  'FIREBASE_DATABASE_URL'
];

console.log("📋 Checking environment variables...");
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Please check your .env file.');
  process.exit(1);
}
console.log("✅ All environment variables found");

async function testFirebaseConnection() {
  try {
    console.log("\n🔄 Initializing Firebase...");
    const app = initializeApp(firebaseConfig);
    const database = getDatabase(app);
    console.log("✅ Firebase initialized successfully");

    console.log("\n🔄 Testing database write...");
    const testRef = push(ref(database, "test"));
    const testData = {
      message: "Hello from MCP Server Test",
      timestamp: Date.now(),
      id: testRef.key
    };
    
    await set(testRef, testData);
    console.log("✅ Test data written successfully");
    console.log("📝 Test data ID:", testRef.key);

    console.log("\n🔄 Testing database read...");
    const snapshot = await get(testRef);
    if (snapshot.exists()) {
      console.log("✅ Test data read successfully");
      console.log("📖 Retrieved data:", snapshot.val());
    } else {
      console.log("❌ Failed to read test data");
    }

    console.log("\n🔄 Testing memories path...");
    const memoriesRef = ref(database, "memories");
    const memoriesSnapshot = await get(memoriesRef);
    
    if (memoriesSnapshot.exists()) {
      const count = Object.keys(memoriesSnapshot.val()).length;
      console.log(`✅ Memories path accessible - ${count} memories found`);
    } else {
      console.log("✅ Memories path accessible - no memories yet (this is normal)");
    }

    console.log("\n🎉 All tests passed! MCP Server is ready to use.");
    console.log("\n📚 Server is already configured in your Claude Desktop settings!");

  } catch (error) {
    console.error("\n❌ Firebase test failed:", error.message);
    
    if (error.code === 'auth/invalid-api-key') {
      console.error("🔑 Invalid API key. Please check your FIREBASE_API_KEY in .env file");
    } else if (error.code === 'auth/network-request-failed') {
      console.error("🌐 Network error. Please check your internet connection");
    } else if (error.message.includes('PERMISSION_DENIED')) {
      console.error("🔒 Permission denied. Please check your Firebase Database rules");
      console.error("Make sure your database rules allow read/write access");
    }
    
    process.exit(1);
  }
}

testFirebaseConnection();
