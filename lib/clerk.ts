// Clerk configuration for React Native
export const ClerkConfig = {
  publishableKey:
    process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    "pk_test_c3VpdGFibGUtc3F1aWQtMjYuY2xlcmsuYWNjb3VudHMuZGV2JA",
};

// You'll need to add your Clerk publishable key to your environment variables
// Create a .env file in your project root and add:
// EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
