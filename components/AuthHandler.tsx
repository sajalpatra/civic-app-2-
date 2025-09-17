import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { getThemeColors } from "../constants/Colors";
import { useTheme } from "../contexts/ThemeContext";

export const AuthHandler: React.FC = () => {
  const { isSignedIn, isLoaded, sessionId } = useAuth();
  const router = useRouter();
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);

  useEffect(() => {
    if (!isLoaded) return;

    try {
      if (isSignedIn && sessionId) {
        // Authentication successful, navigate to dashboard
        console.log("✅ Authentication successful, navigating to dashboard");
        router.replace("/dashboard");
      } else {
        // Not authenticated, go back to login
        console.log("❌ Authentication failed, redirecting to login");
        router.replace("/clerk-login");
      }
    } catch (error) {
      console.error("❌ Auth handler error:", error);
      // On any authentication error, redirect to login
      router.replace("/clerk-login");
    }
  }, [isLoaded, isSignedIn, sessionId]);

  if (!isLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.primary,
        }}
      >
        <ActivityIndicator size="large" color={colors.accent} />
        <Text
          style={{
            color: colors.text,
            marginTop: 16,
            fontSize: 16,
          }}
        >
          Authenticating...
        </Text>
      </View>
    );
  }

  return null;
};
