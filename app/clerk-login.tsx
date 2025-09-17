import { useOAuth, useSignIn } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useClerkAuth } from "../contexts/ClerkAuthContext";
import { useTheme } from "../contexts/ThemeContext";
import NotificationManager from "../lib/NotificationService";
import ToastService from "../services/ToastService";

const ClerkLogin = () => {
  const router = useRouter();
  const { isDark } = useTheme();
  const { signIn, isLoaded } = useSignIn();
  const { pendingRoute, setPendingRoute } = useClerkAuth();
  const { startOAuthFlow: startGoogleOAuth } = useOAuth({
    strategy: "oauth_google",
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoogleLogin = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      console.log(`🔐 Attempting Google sign in...`);

      const { createdSessionId, setActive } = await startGoogleOAuth();

      if (createdSessionId) {
        await setActive!({ session: createdSessionId });
        console.log("✅ Google sign in successful!");

        // Send welcome notification
        setTimeout(async () => {
          await NotificationManager.notifyGeneral(
            "🎉 Welcome Back!",
            "You're now logged in and ready to report civic issues and track your complaints."
          );
        }, 2000);

        // Navigate to pending route or dashboard
        if (pendingRoute) {
          const route = pendingRoute;
          setPendingRoute(null);
          router.push(route as any);
        } else {
          router.push("/dashboard");
        }
      }
    } catch (error: any) {
      console.error(`❌ Google sign in error:`, error);
      ToastService.error({
        title: "Google Sign In Failed",
        message:
          error.message ||
          "An error occurred during Google sign in. Please try email/password login instead.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async () => {
    if (!isLoaded || isSubmitting) return;

    setIsSubmitting(true);

    try {
      if (!email.trim()) {
        ToastService.error({
          title: "Email Required",
          message: "Please enter your email address",
        });
        return;
      }

      if (!password.trim()) {
        ToastService.error({
          title: "Password Required",
          message: "Please enter your password",
        });
        return;
      }

      console.log("🔐 Attempting sign in with Clerk...");

      const signInAttempt = await signIn.create({
        identifier: email,
        password,
      });

      if (signInAttempt.status === "complete") {
        console.log("✅ Sign in successful!");

        // Send welcome notification
        setTimeout(async () => {
          await NotificationManager.notifyGeneral(
            "🎉 Welcome Back!",
            "You're now logged in and ready to report civic issues and track your complaints."
          );
        }, 2000);

        // Clear any sensitive data from memory
        setEmail("");
        setPassword("");

        // Navigate to pending route or dashboard
        if (pendingRoute) {
          const route = pendingRoute;
          setPendingRoute(null);
          router.push(route as any);
        } else {
          router.push("/dashboard");
        }
      } else {
        console.log("⚠️ Sign in incomplete, status:", signInAttempt.status);
        ToastService.error({
          title: "Sign In Error",
          message: "Unable to complete sign in. Please try again.",
        });
      }
    } catch (error: any) {
      console.error("❌ Sign in error:", error);
      ToastService.error({
        title: "Sign In Failed",
        message: error.message || "An error occurred during sign in",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-gray-900" : "bg-white"}`}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#111827" : "#ffffff"}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* Header */}
        <View className="items-center pt-16 pb-8">
          <TouchableOpacity
            className="absolute left-6 top-16 p-2"
            onPress={() => router.back()}
          >
            <Text
              className={`${isDark ? "text-blue-400" : "text-blue-600"} text-2xl`}
            >
              ←
            </Text>
          </TouchableOpacity>

          <View
            className={`w-20 h-20 ${isDark ? "bg-blue-900" : "bg-blue-100"} rounded-full items-center justify-center mb-4`}
          >
            <Text
              className={`${isDark ? "text-blue-400" : "text-blue-600"} text-3xl`}
            >
              🏛️
            </Text>
          </View>

          <Text
            className={`${isDark ? "text-white" : "text-gray-800"} text-2xl font-bold mb-2`}
          >
            Welcome Back
          </Text>
          <Text
            className={`${isDark ? "text-gray-400" : "text-gray-500"} text-center text-base px-8`}
          >
            Sign in to your CivicApp account powered by Clerk
          </Text>
        </View>

        {/* Form */}
        <View className="px-6 flex-1">
          {/* Email Input */}
          <View className="mb-4">
            <Text
              className={`${isDark ? "text-gray-300" : "text-gray-700"} text-base font-medium mb-2`}
            >
              Email Address
            </Text>
            <TextInput
              className={`border ${isDark ? "border-gray-600 bg-gray-800 text-white" : "border-gray-300 bg-white text-gray-800"} rounded-xl px-4 py-3`}
              placeholder="Enter your email"
              placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password Input */}
          <View className="mb-6">
            <Text
              className={`${isDark ? "text-gray-300" : "text-gray-700"} text-base font-medium mb-2`}
            >
              Password
            </Text>
            <TextInput
              className={`border ${isDark ? "border-gray-600 bg-gray-800 text-white" : "border-gray-300 bg-white text-gray-800"} rounded-xl px-4 py-3`}
              placeholder="Enter your password"
              placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            className={`${
              isSubmitting
                ? isDark
                  ? "bg-gray-600"
                  : "bg-gray-400"
                : isDark
                  ? "bg-blue-500"
                  : "bg-blue-600"
            } py-4 rounded-xl shadow-lg mb-4`}
            onPress={handleLogin}
            disabled={isSubmitting}
          >
            <Text className="text-white text-center font-semibold text-lg">
              {isSubmitting ? "Signing In..." : "Sign In"}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center mb-4">
            <View
              className={`flex-1 h-px ${isDark ? "bg-gray-600" : "bg-gray-300"}`}
            />
            <Text
              className={`${isDark ? "text-gray-400" : "text-gray-500"} mx-4`}
            >
              or
            </Text>
            <View
              className={`flex-1 h-px ${isDark ? "bg-gray-600" : "bg-gray-300"}`}
            />
          </View>

          {/* Social Login Button */}
          <TouchableOpacity
            className={`${isDark ? "bg-green-600" : "bg-green-500"} py-4 rounded-xl mb-4 flex-row items-center justify-center`}
            onPress={handleGoogleLogin}
            disabled={isSubmitting}
          >
            <Text className="text-white text-center font-semibold text-lg mr-2">
              📧
            </Text>
            <Text className="text-white text-center font-semibold text-lg">
              Continue with Google
            </Text>
          </TouchableOpacity>

          {/* Forgot Password */}
          <TouchableOpacity className="mb-6">
            <Text
              className={`${isDark ? "text-blue-400" : "text-blue-600"} text-center`}
            >
              Forgot Password?
            </Text>
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View className="flex-row justify-center items-center">
            <Text
              className={`${isDark ? "text-gray-400" : "text-gray-500"} text-base`}
            >
              Don't have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("./clerk-signup")}>
              <Text
                className={`${isDark ? "text-blue-400" : "text-blue-600"} font-semibold`}
              >
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View className="mt-auto pb-8 px-6">
          <Text
            className={`${isDark ? "text-gray-400" : "text-gray-500"} text-center text-sm`}
          >
            Powered by Clerk Authentication
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ClerkLogin;
