import { supabase } from "./supabase";

// Simple function to test database connection and table access
export async function testDatabaseConnection() {
  try {
    console.log("🔍 Testing database connection...");

    // Test basic connection
    const { data: tables, error: tablesError } = await supabase
      .from("users")
      .select("count", { count: "exact" });

    if (tablesError) {
      console.error("❌ Database connection error:", tablesError);
      return { success: false, error: tablesError.message };
    }

    console.log("✅ Database connection successful!");
    console.log("📊 Current users table count:", tables);

    return { success: true };
  } catch (error) {
    console.error("❌ Database test error:", error);
    return { success: false, error: String(error) };
  }
}

// Test insert with a simple record
export async function testUserInsert() {
  try {
    console.log("🧪 Testing user insert...");

    const testUser = {
      id: "test-" + Date.now(),
      email: "test@example.com",
      full_name: "Test User",
      phone: "1234567890",
    };

    const { data, error } = await supabase
      .from("users")
      .insert([testUser])
      .select()
      .single();

    if (error) {
      console.error("❌ Test insert error:", error);
      return { success: false, error: error.message };
    }

    console.log("✅ Test insert successful:", data);

    // Clean up test data
    await supabase.from("users").delete().eq("id", testUser.id);
    console.log("🧹 Test data cleaned up");

    return { success: true, data };
  } catch (error) {
    console.error("❌ Test insert error:", error);
    return { success: false, error: String(error) };
  }
}
