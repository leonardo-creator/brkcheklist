// Test script to check database connection
import { prisma } from './src/lib/prisma';

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    const userCount = await prisma.user.count();
    console.log(`✅ Connection OK! Found ${userCount} users`);
    
    const inspectionCount = await prisma.inspection.count();
    console.log(`✅ Found ${inspectionCount} inspections`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

testConnection();
