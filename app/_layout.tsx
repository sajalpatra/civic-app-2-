import { ClerkProvider } from "@clerk/clerk-expo";
import * as NavigationBar from "expo-navigation-bar";
import { Stack } from "expo-router";
import React, { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { getThemeColors } from "../constants/Colors";
import { ClerkAuthProvider } from "../contexts/ClerkAuthContext";
import { ThemeProvider, useTheme } from "../contexts/ThemeContext";
import { ClerkConfig } from "../lib/clerk";
import { ToastProvider } from "../components/ToastProvider";
import NotificationManager, {
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
} from "../lib/NotificationService";
import { router } from "expo-router";

const NavigationBarManager = () => {
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);

  useEffect(() => {
    // Configure navigation bar for Android based on theme
    NavigationBar.setBackgroundColorAsync(colors.secondary);
    NavigationBar.setButtonStyleAsync(isDark ? "light" : "dark");
  }, [isDark, colors]);

  return null;
};

const NotificationManager_Component = () => {
  useEffect(() => {
    // Initialize notification service
    const initializeNotifications = async () => {
      await NotificationManager.initialize();
    };

    initializeNotifications();

    // Set up notification listeners
    const notificationListener = addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received:", notification);
      }
    );

    const responseListener = addNotificationResponseReceivedListener(
      (response) => {
        console.log("Notification response:", response);

        // Handle notification tap - navigate based on notification data
        const data = response.notification.request.content.data;

        if (data?.type === "complaint_update" && data?.complaintId) {
          router.push(`/complaint-details?id=${data.complaintId}`);
        } else if (data?.type === "complaint_followup" && data?.complaintId) {
          router.push(`/my-complaints`);
        } else if (data?.type === "emergency") {
          router.push("/dashboard");
        }
      }
    );

    // Cleanup listeners
    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  return null;
};

const _layout = () => {
  return (
    <SafeAreaProvider>
      <ClerkProvider publishableKey={ClerkConfig.publishableKey}>
        <ThemeProvider>
          <ClerkAuthProvider>
            <NavigationBarManager />
            <NotificationManager_Component />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="clerk-login" />
              <Stack.Screen name="clerk-signup" />
              <Stack.Screen name="dashboard" />
              <Stack.Screen name="new-complaint" />
              <Stack.Screen name="my-complaints" />
              <Stack.Screen name="nearby-issues" />
              <Stack.Screen name="complaint-details" />
              <Stack.Screen name="profile" />
              <Stack.Screen name="report" />
              <Stack.Screen name="tracking" />
              <Stack.Screen name="map" />
            </Stack>
            <ToastProvider />
          </ClerkAuthProvider>
        </ThemeProvider>
      </ClerkProvider>
    </SafeAreaProvider>
  );
};

export default _layout;
