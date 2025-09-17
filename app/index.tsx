import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppIcon } from "../components/IconComponent";
import { ThemeToggle } from "../components/ThemeToggle";
import { getThemeColors } from "../constants/Colors";
import { useClerkAuth } from "../contexts/ClerkAuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useProfileImage } from "../hooks/useProfileImage";
import NotificationManager from "../lib/NotificationService";
import "../global.css";

const { width, height } = Dimensions.get("window");

const HomeScreen = () => {
  const router = useRouter();
  const { isDark } = useTheme();
  const { isAuthenticated, user, setPendingRoute } = useClerkAuth();
  const colors = getThemeColors(isDark);
  const { profileImage, refreshProfileImage } = useProfileImage();

  const [featuredImages] = useState([
    {
      id: 1,
      url: "https://picsum.photos/id/1016/600/400", // Road/Transportation
      title: "Roads & Transport",
      description: "Traffic, road damage, parking issues",
      icon: "🚗",
    },
    {
      id: 2,
      url: "https://picsum.photos/id/1015/600/400", // Infrastructure
      title: "Infrastructure",
      description: "Buildings, bridges, public facilities",
      icon: "🏗️",
    },
    {
      id: 3,
      url: "https://picsum.photos/id/1019/600/400", // Environment
      title: "Environment",
      description: "Pollution, waste, green spaces",
      icon: "🌱",
    },
    {
      id: 4,
      url: "https://picsum.photos/id/1074/600/400", // Water & Utilities
      title: "Water & Utilities",
      description: "Water supply, sewage, electricity",
      icon: "💧",
    },
    {
      id: 5,
      url: "https://picsum.photos/id/1036/600/400", // Public Safety
      title: "Public Safety",
      description: "Street lights, security, emergency",
      icon: "🚨",
    },
    {
      id: 6,
      url: "https://picsum.photos/id/1043/600/400", // Housing & Buildings
      title: "Housing & Buildings",
      description: "Property issues, illegal construction",
      icon: "🏠",
    },
    {
      id: 7,
      url: "https://picsum.photos/id/1052/600/400", // Parks & Recreation
      title: "Parks & Recreation",
      description: "Playgrounds, sports facilities, maintenance",
      icon: "🏞️",
    },
    {
      id: 8,
      url: "https://picsum.photos/id/1067/600/400", // Health & Sanitation
      title: "Health & Sanitation",
      description: "Public health, cleanliness, pest control",
      icon: "🏥",
    },
    {
      id: 9,
      url: "https://picsum.photos/id/1059/600/400", // Street & Sidewalks
      title: "Streets & Sidewalks",
      description: "Pavement, walkways, accessibility",
      icon: "🚶",
    },
    {
      id: 10,
      url: "https://picsum.photos/id/1041/600/400", // Noise & Nuisance
      title: "Noise & Nuisance",
      description: "Noise complaints, disturbances",
      icon: "🔊",
    },
  ]);

  const quickActions = [
    { id: 1, title: "Dashboard", icon: "🏠", color: "bg-blue-600" },
    { id: 2, title: "Report Issue", icon: "📝", color: "bg-red-500" },
    { id: 3, title: "Track Status", icon: "📊", color: "bg-green-500" },
    { id: 4, title: "Nearby Issues", icon: "🏘️", color: "bg-orange-500" },
    { id: 5, title: "Issues Map", icon: "🗺️", color: "bg-blue-500" },
    { id: 6, title: "Profile", icon: "👤", color: "bg-purple-500" },
  ];

  const handleQuickAction = (title: string) => {
    // Check if user is authenticated first
    if (!isAuthenticated) {
      // Store the intended destination and navigate to login
      switch (title) {
        case "Dashboard":
          setPendingRoute("./dashboard");
          break;
        case "Report Issue":
          setPendingRoute("./report");
          break;
        case "Track Status":
          setPendingRoute("./tracking");
          break;
        case "Nearby Issues":
          setPendingRoute("./nearby-issues");
          break;
        case "Issues Map":
          setPendingRoute("./map");
          break;
        case "Profile":
          setPendingRoute("./profile");
          break;
      }
      router.push("./clerk-login");
      return;
    }

    // User is authenticated, navigate directly
    switch (title) {
      case "Dashboard":
        router.push("./dashboard");
        break;
      case "Report Issue":
        router.push("./report");
        break;
      case "Track Status":
        router.push("./tracking");
        break;
      case "Nearby Issues":
        router.push("./nearby-issues");
        break;
      case "Issues Map":
        router.push("./map");
        break;
      case "Profile":
        router.push("./profile");
        break;
      default:
        break;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.secondary }}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.header}
        translucent={false}
      />

      {/* Header Section */}
      <View
        style={{
          backgroundColor: colors.header,
          paddingBottom: 8,
          paddingTop: 8,
          paddingHorizontal: 24,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text
              style={{
                fontSize: 28,
                fontWeight: "bold",
                color: colors.headerText,
              }}
            >
              Good Day
              {isAuthenticated &&
              (user?.user_metadata?.full_name || user?.firstName)
                ? `, ${user?.user_metadata?.full_name || user?.firstName}`
                : ""}
              ! 👋
            </Text>
            <Text style={{ color: colors.textSecondary, marginTop: 4 }}>
              Your civic companion
            </Text>
          </View>
          <View className="flex-row items-center">
            {/* <View
              style={{
                width: 48,
                height: 48,
                backgroundColor: colors.accent + "20",
                borderRadius: 24,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <AppIcon icon="home" size={24} color={colors.accent} />
            </View> */}
            <ThemeToggle size={20} />
            {/* {isAuthenticated && (
              <TouchableOpacity
                style={{
                  width: 40,
                  height: 40,
                  backgroundColor: colors.accent + "15",
                  borderRadius: 20,
                  marginLeft: 12,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={async () => {
                  await NotificationManager.notifyGeneral(
                    "🏠 Home Notification",
                    "This notification was triggered from the home page!"
                  );
                }}
              >
                <AppIcon icon="notification" size={20} color={colors.accent} />
              </TouchableOpacity>
            )} */}
            {isAuthenticated ? (
              <TouchableOpacity
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  marginLeft: 12,
                  borderWidth: 2,
                  borderColor: colors.accent,
                  overflow: "hidden",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: colors.accent + "20",
                }}
                onPress={() => router.push("./profile")}
              >
                {profileImage ? (
                  <Image
                    source={{
                      uri: profileImage,
                    }}
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: 18,
                    }}
                    resizeMode="cover"
                    onError={() => {
                      console.log("❌ Home page profile image failed to load");
                      // Image will fallback automatically through the context
                    }}
                  />
                ) : (
                  <AppIcon icon="profile" size={20} color={colors.accent} />
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={{
                  backgroundColor: colors.accent,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 12,
                  marginLeft: 12,
                }}
                onPress={() => router.push("./clerk-login")}
              >
                <Text style={{ color: "white", fontWeight: "600" }}>Login</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Quick Actions Grid */}
        <View style={{ paddingHorizontal: 24, marginTop: 24 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "600",
              color: colors.text,
              marginBottom: 16,
            }}
          >
            Quick Actions
          </Text>

          {!isAuthenticated && (
            <View
              style={{
                marginBottom: 16,
                padding: 16,
                backgroundColor: colors.accent + "10",
                borderRadius: 12,
              }}
            >
              <Text
                style={{
                  color: colors.accent,
                  textAlign: "center",
                  fontWeight: "600",
                }}
              >
                🔐 Please login to access all features
              </Text>
            </View>
          )}

          <View className="flex-row flex-wrap justify-between">
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                className={`${action.color} w-[48%] p-4 rounded-2xl mb-4 items-center shadow-md`}
                onPress={() => handleQuickAction(action.title)}
              >
                <Text className="text-3xl mb-2">{action.icon}</Text>
                <Text className="text-white font-semibold text-center">
                  {action.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Featured Section */}
        <View style={{ paddingHorizontal: 24, marginTop: 16 }}>
          <View className="flex-row justify-between items-center mb-4">
            <Text
              style={{
                fontSize: 20,
                fontWeight: "600",
                color: colors.text,
              }}
            >
              Featured Categories
            </Text>
            <TouchableOpacity
              onPress={() => handleQuickAction("Report Issue")}
              className="bg-blue-600 px-3 py-1 rounded-lg"
            >
              <Text className="text-white text-sm font-medium">View All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 24 }}
          >
            {featuredImages.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={{
                  marginRight: 16,
                  borderRadius: 16,
                  overflow: "hidden",
                  backgroundColor: colors.card,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 4,
                  width: 220,
                }}
                onPress={() => handleQuickAction("Report Issue")}
              >
                <View style={{ position: "relative" }}>
                  <Image
                    source={{ uri: item.url }}
                    style={{ width: "100%", height: 130 }}
                    resizeMode="cover"
                  />
                  <View
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      borderRadius: 20,
                      padding: 6,
                    }}
                  >
                    <Text style={{ fontSize: 16 }}>{item.icon}</Text>
                  </View>
                </View>
                <View style={{ padding: 16 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: colors.text,
                      marginBottom: 4,
                    }}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.textSecondary,
                      lineHeight: 16,
                    }}
                  >
                    {item.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recent Updates */}
        <View style={{ paddingHorizontal: 24, marginTop: 24 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "600",
              color: colors.text,
              marginBottom: 16,
            }}
          >
            Recent Updates
          </Text>
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <Text style={{ color: colors.text, fontSize: 16, marginBottom: 8 }}>
              New Traffic Signal Installed
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
              The new traffic signal at Main Street intersection is now
              operational, improving traffic flow and safety.
            </Text>
            <Text
              style={{
                color: colors.accent,
                fontSize: 12,
                marginTop: 8,
                fontWeight: "500",
              }}
            >
              2 hours ago
            </Text>
          </View>

          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              padding: 16,
              marginBottom: 24,
            }}
          >
            <Text style={{ color: colors.text, fontSize: 16, marginBottom: 8 }}>
              Park Renovation Complete
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
              Central Park renovation has been completed with new playground
              equipment and walking paths.
            </Text>
            <Text
              style={{
                color: colors.accent,
                fontSize: 12,
                marginTop: 8,
                fontWeight: "500",
              }}
            >
              1 day ago
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
