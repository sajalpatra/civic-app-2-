import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { useClerkAuth } from "../contexts/ClerkAuthContext";
import { DatabaseService } from "../lib/database";
import { useProfileImage } from "../hooks/useProfileImage";
import { AppIcon, IconComponent } from "../components/IconComponent";
import NotificationManager from "../lib/NotificationService";

const Dashboard = () => {
  const router = useRouter();
  const { isDark } = useTheme();
  const { user } = useClerkAuth();

  // State for dynamic stats from database
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    pending: 0,
    inProgress: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const { profileImage, refreshProfileImage } = useProfileImage();

  // Load stats from database
  useEffect(() => {
    loadStats();

    // Debug user profile info
    if (user) {
      console.log("👤 User profile data:", {
        fullName: user?.unsafeMetadata?.full_name,
        firstName: user?.firstName,
        profileImage: user?.unsafeMetadata?.profile_image,
        imageUrl: user?.imageUrl,
      });
    }
  }, [user]);

  const loadStats = async () => {
    try {
      const reportStats = await DatabaseService.getReportStats();
      setStats(reportStats);
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Test notification function
  const testNotification = async () => {
    await NotificationManager.notifyGeneral(
      "🎉 Test Notification",
      "This is a test notification from your Civic App!"
    );

    // Also test a scheduled notification in 10 seconds
    await NotificationManager.scheduleNotification({
      title: "⏰ Scheduled Test",
      body: "This notification was scheduled 10 seconds ago!",
      data: { type: "test" },
      trigger: { seconds: 10 },
    });
  };

  const mainActions = [
    {
      id: 1,
      title: "Report Issue",
      subtitle: "Submit with photos & GPS",
      iconName: "add" as const,
      color: "bg-blue-500",
      route: "/report",
    },
    {
      id: 2,
      title: "Track Reports",
      subtitle: "Monitor your submissions",
      iconName: "analytics" as const,
      color: "bg-green-500",
      route: "/tracking",
    },
    {
      id: 3,
      title: "Issues Map",
      subtitle: "Real-time community view",
      iconName: "map" as const,
      color: "bg-purple-500",
      route: "/map",
    },
    {
      id: 4,
      title: "Nearby Issues",
      subtitle: "See local problems",
      iconName: "location" as const,
      color: "bg-orange-500",
      route: "/nearby-issues",
    },
    {
      id: 5,
      title: "Test Notifications",
      subtitle: "Demo notification system",
      iconName: "notification" as const,
      color: "bg-pink-500",
      action: testNotification,
    },
  ];

  const quickStats = [
    {
      label: "Open Issues",
      value: stats.pending.toString(),
      color: "text-red-600",
    },
    {
      label: "Resolved",
      value: stats.resolved.toString(),
      color: "text-green-600",
    },
    {
      label: "In Progress",
      value: stats.inProgress.toString(),
      color: "text-orange-600",
    },
  ];

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#111827" : "#f9fafb"}
      />

      {/* Header */}
      <View
        className={`${isDark ? "bg-gray-800" : "bg-white"} pt-12 pb-6 px-6 shadow-sm`}
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text
              className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}
            >
              Welcome Back
              {user?.user_metadata?.full_name || user?.firstName
                ? `, ${user?.user_metadata?.full_name || user?.firstName}`
                : ""}
              ! 👋
            </Text>
            <Text
              className={`${isDark ? "text-gray-300" : "text-gray-600"} mt-1`}
            >
              Ready to make a difference?
            </Text>
          </View>
          <View className="flex-row">
            <TouchableOpacity
              className={`mr-4 p-2 ${isDark ? "bg-gray-700" : "bg-gray-100"} rounded-full w-10 h-10 items-center justify-center`}
              onPress={() => {
                // Test notification functionality
                testNotification();
              }}
            >
              <AppIcon
                icon="notification"
                size={20}
                color={isDark ? "#9ca3af" : "#6b7280"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              className={`p-1 ${isDark ? "bg-blue-900" : "bg-blue-100"} rounded-full w-10 h-10 items-center justify-center overflow-hidden border-2 ${isDark ? "border-blue-700" : "border-blue-200"}`}
              onPress={() => router.push("./profile")}
            >
              {profileImage ? (
                <Image
                  source={{
                    uri: profileImage,
                  }}
                  className="w-full h-full rounded-full"
                  resizeMode="cover"
                  onError={() => {
                    console.log("❌ Dashboard profile image failed to load");
                    // Image will fallback automatically through the context
                  }}
                />
              ) : (
                <AppIcon
                  icon="profile"
                  size={20}
                  color={isDark ? "#60a5fa" : "#2563eb"}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Quick Stats */}
        <View
          className={`mx-6 mt-6 ${isDark ? "bg-gray-800" : "bg-white"} rounded-2xl p-6 shadow-sm`}
        >
          <Text
            className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-800"} mb-4`}
          >
            Quick Overview
          </Text>
          <View className="flex-row justify-around">
            {quickStats.map((stat, index) => (
              <View key={index} className="items-center">
                <Text className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </Text>
                <Text
                  className={`${isDark ? "text-gray-300" : "text-gray-600"} text-sm mt-1`}
                >
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Main Action Cards */}
        <View className="px-6 mt-6">
          <Text
            className={`text-xl font-semibold ${isDark ? "text-white" : "text-gray-800"} mb-4`}
          >
            What would you like to do?
          </Text>

          {mainActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-2xl p-6 mb-4 shadow-sm flex-row items-center`}
              onPress={() => {
                if (action.action) {
                  action.action(); // Call the action function
                } else if (action.route === "/report") router.push("/report");
                else if (action.route === "/tracking") router.push("/tracking");
                else if (action.route === "/map") router.push("/map");
                else if (action.route === "/nearby-issues")
                  router.push("/nearby-issues");
              }}
            >
              <View
                className={`w-16 h-16 ${action.color} rounded-2xl items-center justify-center mr-4`}
              >
                <AppIcon icon={action.iconName} size={32} />
              </View>
              <View className="flex-1">
                <Text
                  className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-800"}`}
                >
                  {action.title}
                </Text>
                <Text
                  className={`${isDark ? "text-gray-300" : "text-gray-600"} mt-1`}
                >
                  {action.subtitle}
                </Text>
              </View>
              <Text
                className={`${isDark ? "text-gray-500" : "text-gray-400"} text-xl`}
              >
                ›
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Activity */}
        <View
          className={`mx-6 mt-6 mb-8 ${isDark ? "bg-gray-800" : "bg-white"} rounded-2xl p-6 shadow-sm`}
        >
          <Text
            className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-800"} mb-4`}
          >
            Recent Activity
          </Text>

          <View className="space-y-4">
            <View className="flex-row items-center">
              <View className="w-3 h-3 bg-green-500 rounded-full mr-3"></View>
              <View className="flex-1">
                <Text
                  className={`${isDark ? "text-white" : "text-gray-800"} font-medium`}
                >
                  Pothole Complaint Resolved
                </Text>
                <Text
                  className={`${isDark ? "text-gray-400" : "text-gray-500"} text-sm`}
                >
                  Main Street - 2 hours ago
                </Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <View className="w-3 h-3 bg-orange-500 rounded-full mr-3"></View>
              <View className="flex-1">
                <Text
                  className={`${isDark ? "text-white" : "text-gray-800"} font-medium`}
                >
                  Streetlight Issue Updated
                </Text>
                <Text
                  className={`${isDark ? "text-gray-400" : "text-gray-500"} text-sm`}
                >
                  Park Avenue - 1 day ago
                </Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <View className="w-3 h-3 bg-blue-500 rounded-full mr-3"></View>
              <View className="flex-1">
                <Text
                  className={`${isDark ? "text-white" : "text-gray-800"} font-medium`}
                >
                  New Complaint Submitted
                </Text>
                <Text
                  className={`${isDark ? "text-gray-400" : "text-gray-500"} text-sm`}
                >
                  Waste Management - 3 days ago
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View
        className={`${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border-t py-3 pb-4 mb-12`}
      >
        <View className="flex-row justify-around items-center">
          <TouchableOpacity
            className="items-center py-2 px-4"
            onPress={() => router.push("/")}
          >
            <AppIcon icon="home" size={28} color="#2563eb" />
            <Text className="text-blue-600 font-medium text-xs mt-1">Home</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="items-center py-2 px-4"
            onPress={() => router.push("./my-complaints")}
          >
            <AppIcon
              icon="reports"
              size={28}
              color={isDark ? "#9ca3af" : "#6b7280"}
            />
            <Text
              className={`${isDark ? "text-gray-400" : "text-gray-600"} text-xs mt-1`}
            >
              My Reports
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="items-center py-2 px-4"
            onPress={() => router.push("./nearby-issues")}
          >
            <AppIcon
              icon="map"
              size={28}
              color={isDark ? "#9ca3af" : "#6b7280"}
            />
            <Text
              className={`${isDark ? "text-gray-400" : "text-gray-600"} text-xs mt-1`}
            >
              Nearby
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="items-center py-2 px-4"
            onPress={() => router.push("./profile")}
          >
            <AppIcon
              icon="profile"
              size={28}
              color={isDark ? "#9ca3af" : "#6b7280"}
            />
            <Text
              className={`${isDark ? "text-gray-400" : "text-gray-600"} text-xs mt-1`}
            >
              Profile
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Dashboard;
