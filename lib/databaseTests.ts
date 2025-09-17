import { UserService } from "../lib/userService";

export const DatabaseTests = {
  // Test database connection
  testConnection: async () => {
    try {
      console.log("🧪 Testing database connection...");

      // Try to fetch a user profile (will fail if no users exist, but connection will work)
      const { error } = await UserService.getUserProfile("test-id");

      if (error && error.includes("No rows returned")) {
        console.log(
          "✅ Database connection working (no users found, which is expected)"
        );
        return { success: true, message: "Database connection working" };
      } else if (error) {
        console.log("❌ Database connection failed:", error);
        return { success: false, message: error };
      } else {
        console.log("✅ Database connection working");
        return { success: true, message: "Database connection working" };
      }
    } catch (error) {
      console.log("❌ Database test failed:", error);
      return { success: false, message: "Database connection failed" };
    }
  },

  // Test creating a user profile
  testCreateUser: async () => {
    try {
      console.log("🧪 Testing user creation...");

      const testUser = {
        id: `test-${Date.now()}`,
        email: "test@example.com",
        fullName: "Test User",
        phone: "1234567890",
      };

      const { data, error } = await UserService.createUserProfile(
        testUser.id,
        testUser.email,
        testUser.fullName,
        testUser.phone
      );

      if (error) {
        console.log("❌ User creation failed:", error);
        return { success: false, message: error };
      }

      console.log("✅ User created successfully:", data);

      // Clean up test user
      await UserService.deleteUserProfile(testUser.id);
      console.log("🧹 Test user cleaned up");

      return { success: true, message: "User creation working", data };
    } catch (error) {
      console.log("❌ User creation test failed:", error);
      return { success: false, message: "User creation failed" };
    }
  },

  // Run all tests
  runAllTests: async () => {
    console.log("🔬 Running database integration tests...");

    const connectionTest = await DatabaseTests.testConnection();
    const userCreationTest = await DatabaseTests.testCreateUser();

    const results = {
      connection: connectionTest,
      userCreation: userCreationTest,
      overall: connectionTest.success && userCreationTest.success,
    };

    console.log("📊 Test Results:", results);
    return results;
  },
};
