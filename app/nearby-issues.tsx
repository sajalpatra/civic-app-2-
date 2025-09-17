import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../contexts/ThemeContext";
import { DatabaseService } from "../lib/database";
import { Report } from "../lib/supabase";
import { UserAvatar } from "../components/UserAvatar";

const NearbyIssues = () => {
  const router = useRouter();
  const { isDark } = useTheme();
  const [viewMode, setViewMode] = useState("list");
  const [nearbyIssues, setNearbyIssues] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNearbyIssues();
  }, []);

  const loadNearbyIssues = async () => {
    try {
      setLoading(true);
      // For now, we'll load all reports as "nearby"
      // In a real app, you'd filter by location/distance
      const nearbyReports = await DatabaseService.getNearbyReports(0, 0, 50); // 50km radius
      setNearbyIssues(nearbyReports);
    } catch (error) {
      console.error("Error loading nearby issues:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "traffic":
        return "🚦";
      case "waste":
        return "🗑️";
      case "infrastructure":
        return "🚧";
      case "water":
        return "💧";
      case "safety":
        return "🚨";
      case "environmental":
        return "🌱";
      default:
        return "📝";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-500";
      case "in_progress":
        return "bg-orange-500";
      case "submitted":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "resolved":
        return "Resolved";
      case "in_progress":
        return "In Progress";
      case "submitted":
        return "Reported";
      default:
        return "Unknown";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    } else {
      return "Recently";
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"} justify-center items-center`}
      >
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className={`${isDark ? "text-gray-300" : "text-gray-600"} mt-4`}>
          Loading nearby issues...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#111827" : "#f9fafb"}
      />

      {/* Header */}
      <View
        className={`${isDark ? "bg-gray-800" : "bg-white"} pb-6 px-6 shadow-sm`}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className={`mr-4 p-2 rounded-full ${isDark ? "bg-gray-700" : "bg-gray-100"}`}
            >
              <Text className="text-xl">←</Text>
            </TouchableOpacity>
            <View>
              <Text
                className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}
              >
                Community Issues
              </Text>
              <Text
                className={`${isDark ? "text-gray-300" : "text-gray-600"} mt-1`}
              >
                {nearbyIssues.length} issues reported
              </Text>
            </View>
          </View>

          {/* Profile and View Mode Toggle */}
          <View className="flex-row items-center">
            <UserAvatar size={35} className="mr-3" />
            {/* View Mode Toggle */}
            <TouchableOpacity
              onPress={() => setViewMode("list")}
              className={`p-2 rounded-l-lg ${
                viewMode === "list"
                  ? isDark
                    ? "bg-blue-500"
                    : "bg-blue-600"
                  : isDark
                    ? "bg-gray-700"
                    : "bg-gray-200"
              }`}
            >
              <Text
                className={
                  viewMode === "list"
                    ? "text-white"
                    : isDark
                      ? "text-gray-300"
                      : "text-gray-600"
                }
              >
                📋
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setViewMode("map")}
              className={`p-2 rounded-r-lg ${
                viewMode === "map"
                  ? isDark
                    ? "bg-blue-500"
                    : "bg-blue-600"
                  : isDark
                    ? "bg-gray-700"
                    : "bg-gray-200"
              }`}
            >
              <Text
                className={
                  viewMode === "map"
                    ? "text-white"
                    : isDark
                      ? "text-gray-300"
                      : "text-gray-600"
                }
              >
                🗺️
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Issues List */}
      <ScrollView
        className="flex-1 px-6 mt-4"
        showsVerticalScrollIndicator={false}
      >
        {nearbyIssues.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-6xl mb-4">🌍</Text>
            <Text
              className={`text-xl font-semibold ${isDark ? "text-white" : "text-gray-800"} mb-2`}
            >
              No Issues Yet
            </Text>
            <Text
              className={`${isDark ? "text-gray-300" : "text-gray-600"} text-center mb-6`}
            >
              Be the first to report an issue in your community!
            </Text>
            <TouchableOpacity
              onPress={() => router.push("./report")}
              className="bg-blue-600 px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-medium">Report First Issue</Text>
            </TouchableOpacity>
          </View>
        ) : (
          nearbyIssues.map((issue) => (
            <TouchableOpacity
              key={issue.id}
              onPress={() => router.push(`./complaint-details?id=${issue.id}`)}
              className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-2xl p-4 mb-4 shadow-sm`}
            >
              <View className="flex-row">
                {/* Issue Photo */}
                {issue.photos.length > 0 ? (
                  <Image
                    source={{
                      uri: issue.photos[0].startsWith("data:")
                        ? issue.photos[0]
                        : issue.photos[0].startsWith("file://")
                          ? "https://via.placeholder.com/80x80/f0f0f0/999999?text=No+Image"
                          : issue.photos[0],
                    }}
                    style={{ width: 80, height: 80 }}
                    className="rounded-xl mr-4"
                    onError={() =>
                      console.log("Failed to load image:", issue.photos[0])
                    }
                  />
                ) : (
                  <View className="w-20 h-20 bg-gray-200 rounded-xl mr-4 items-center justify-center">
                    <Text className="text-2xl">
                      {getCategoryIcon(issue.category || "general")}
                    </Text>
                  </View>
                )}

                {/* Issue Info */}
                <View className="flex-1">
                  <View className="flex-row items-start justify-between mb-2">
                    <View className="flex-1 mr-2">
                      <Text
                        className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-800"}`}
                      >
                        {issue.title}
                      </Text>
                      <Text
                        className={`${isDark ? "text-gray-400" : "text-gray-600"} text-sm`}
                      >
                        {getCategoryIcon(issue.category || "general")}{" "}
                        {issue.category || "General"}
                      </Text>
                    </View>
                    <View
                      className={`${getStatusColor(issue.status)} px-3 py-1 rounded-full`}
                    >
                      <Text className="text-white text-xs font-medium">
                        {getStatusText(issue.status)}
                      </Text>
                    </View>
                  </View>

                  <Text
                    className={`${isDark ? "text-gray-300" : "text-gray-600"} text-sm mb-2`}
                    numberOfLines={2}
                  >
                    {issue.description}
                  </Text>

                  <View className="flex-row items-center justify-between">
                    <Text
                      className={`${isDark ? "text-gray-400" : "text-gray-500"} text-sm`}
                    >
                      📍 {issue.address}
                    </Text>
                    <Text
                      className={`${isDark ? "text-gray-400" : "text-gray-500"} text-sm`}
                    >
                      {formatTimeAgo(issue.created_at)}
                    </Text>
                  </View>

                  {/* Interaction Bar */}
                  <View className="flex-row items-center mt-3 pt-3 border-t border-gray-200">
                    <TouchableOpacity className="flex-row items-center mr-4">
                      <Text className="text-blue-500 mr-1">👍</Text>
                      <Text
                        className={`${isDark ? "text-gray-400" : "text-gray-600"} text-sm`}
                      >
                        Support
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-row items-center mr-4">
                      <Text className="text-orange-500 mr-1">💬</Text>
                      <Text
                        className={`${isDark ? "text-gray-400" : "text-gray-600"} text-sm`}
                      >
                        Comment
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-row items-center">
                      <Text className="text-green-500 mr-1">📍</Text>
                      <Text
                        className={`${isDark ? "text-gray-400" : "text-gray-600"} text-sm`}
                      >
                        Directions
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View
        className={`${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border-t py-3`}
      >
        <View className="flex-row justify-around items-center">
          <TouchableOpacity
            className="items-center py-2 px-4"
            onPress={() => router.push("./dashboard")}
          >
            <Text className="text-2xl mb-1">🏠</Text>
            <Text
              className={`${isDark ? "text-gray-400" : "text-gray-600"} text-xs`}
            >
              Home
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="items-center py-2 px-4"
            onPress={() => router.push("./my-complaints")}
          >
            <Text className="text-2xl mb-1">📋</Text>
            <Text
              className={`${isDark ? "text-gray-400" : "text-gray-600"} text-xs`}
            >
              My Reports
            </Text>
          </TouchableOpacity>
          <TouchableOpacity className="items-center py-2 px-4">
            <Text className="text-2xl mb-1">🌍</Text>
            <Text className="text-blue-600 font-medium text-xs">Community</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="items-center py-2 px-4"
            onPress={() => router.push("./profile")}
          >
            <Text className="text-2xl mb-1">👤</Text>
            <Text
              className={`${isDark ? "text-gray-400" : "text-gray-600"} text-xs`}
            >
              Profile
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={() => router.push("./report")}
        className={`absolute bottom-20 right-6 ${isDark ? "bg-blue-500" : "bg-blue-600"} w-14 h-14 rounded-full items-center justify-center shadow-lg`}
      >
        <Text className="text-white text-2xl">+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default NearbyIssues;
