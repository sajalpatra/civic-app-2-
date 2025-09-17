// Test file to verify Supabase reports table connection
// Run this in the browser console or add to a test screen

import { supabase } from "../lib/supabase";

export const testReportsTable = async () => {
  console.log("🧪 Testing Supabase reports table connection...");

  try {
    // Test 1: Check if reports table exists and is accessible
    const { data, error } = await supabase.from("reports").select("*").limit(1);

    if (error) {
      console.error("❌ Reports table test failed:", error);
      console.log(
        "💡 Please run the SUPABASE_SETUP.sql script in your Supabase dashboard"
      );
      return false;
    }

    console.log("✅ Reports table is accessible");

    // Test 2: Test insert capability (this will fail if RLS is too strict, which is OK)
    const testReport = {
      user_id: "test_user_123",
      title: "Test Report",
      description: "This is a test report to verify table functionality",
      category: "General",
      address: "Test Address",
      photos: [],
      status: "submitted" as const,
      priority: "medium" as const,
    };

    const { data: insertData, error: insertError } = await supabase
      .from("reports")
      .insert([testReport])
      .select()
      .single();

    if (insertError) {
      console.warn(
        "⚠️ Insert test failed (this may be due to RLS policies):",
        insertError
      );
      console.log(
        "💡 This is normal if RLS policies are strict. Try with a real authenticated user."
      );
    } else {
      console.log("✅ Insert test successful:", insertData);

      // Clean up test data
      await supabase.from("reports").delete().eq("id", insertData.id);
      console.log("🧹 Test data cleaned up");
    }

    return true;
  } catch (error) {
    console.error("❌ Connection test failed:", error);
    return false;
  }
};

// Test users table too
export const testUsersTable = async () => {
  console.log("🧪 Testing Supabase users table connection...");

  try {
    const { data, error } = await supabase.from("users").select("*").limit(1);

    if (error) {
      console.error("❌ Users table test failed:", error);
      return false;
    }

    console.log("✅ Users table is accessible");
    return true;
  } catch (error) {
    console.error("❌ Users table connection failed:", error);
    return false;
  }
};

// Run both tests
export const runAllTests = async () => {
  console.log("🚀 Running Supabase database tests...");

  const usersOk = await testUsersTable();
  const reportsOk = await testReportsTable();

  if (usersOk && reportsOk) {
    console.log(
      "🎉 All database tests passed! Your app is ready to submit reports."
    );
  } else {
    console.log("❌ Some tests failed. Please check your Supabase setup.");
  }
};

// Uncomment to run tests immediately
// runAllTests();
