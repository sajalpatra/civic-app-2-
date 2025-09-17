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
import { AppIcon } from "../components/IconComponent";
import { UserAvatar } from "../components/UserAvatar";
import { useClerkAuth } from "../contexts/ClerkAuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { DatabaseService } from "../lib/database";
import { Report } from "../lib/supabase";

const MyComplaints = () => {
  const router = useRouter();
  const { isDark } = useTheme();
  const { user, isAuthenticated } = useClerkAuth();

  const [complaints, setComplaints] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  // Load user's reports from database
  useEffect(() => {
    if (isAuthenticated && user) {
      loadComplaints();
    }
  }, [isAuthenticated, user]);

  const loadComplaints = async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log("🔍 Loading user reports from database for user:", user.id);
      const userReports = await DatabaseService.getUserReports(user.id);
      console.log("✅ Loaded reports:", userReports.length, "reports");
      setComplaints(userReports);
    } catch (error) {
      console.error("❌ Error loading complaints:", error);
    } finally {
      setLoading(false);
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
        return "Submitted";
      case "draft":
        return "Draft";
      default:
        return "Unknown";
    }
  };

  const getStatusIconName = (status: string) => {
    switch (status) {
      case "resolved":
        return "success";
      case "in_progress":
        return "pending";
      case "submitted":
        return "document";
      default:
        return "document";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return "✅";
      case "in_progress":
        return "🔄";
      case "submitted":
        return "📤";
      default:
        return "📝";
    }
  };

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
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className={`mr-4 p-2 rounded-full ${isDark ? "bg-gray-700" : "bg-gray-100"}`}
          >
            <Text className="text-xl text-gray-400">←</Text>
          </TouchableOpacity>
          <View className="flex-1">
            <Text
              className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}
            >
              My Reports
            </Text>
            <Text
              className={`${isDark ? "text-gray-300" : "text-gray-600"} mt-1`}
            >
              Track your submitted issues
            </Text>
          </View>
          <UserAvatar size={35} className="mr-2" />
          <TouchableOpacity
            onPress={loadComplaints}
            className={`p-2 rounded-full ${isDark ? "bg-gray-700" : "bg-gray-100"}`}
          >
            <Text className="text-xl">🔄</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Summary Stats */}
      <View className="px-6 mt-4">
        <View className="flex-row justify-around">
          <View className="items-center">
            <Text
              className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}
            >
              {complaints.length}
            </Text>
            <Text
              className={`${isDark ? "text-gray-400" : "text-gray-600"} text-sm`}
            >
              Total
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-green-600">
              {complaints.filter((c) => c.status === "resolved").length}
            </Text>
            <Text
              className={`${isDark ? "text-gray-400" : "text-gray-600"} text-sm`}
            >
              Resolved
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-orange-600">
              {complaints.filter((c) => c.status === "in_progress").length}
            </Text>
            <Text
              className={`${isDark ? "text-gray-400" : "text-gray-600"} text-sm`}
            >
              In Progress
            </Text>
          </View>
        </View>
      </View>

      {/* Complaints List */}
      <ScrollView
        className="flex-1 px-6 mt-6"
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View className="flex-1 justify-center items-center py-20">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text
              className={`${isDark ? "text-gray-300" : "text-gray-600"} mt-4`}
            >
              Loading your reports...
            </Text>
          </View>
        ) : complaints.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <AppIcon icon="reports" size={64} />
            <Text
              className={`text-xl font-semibold ${isDark ? "text-white" : "text-gray-800"} mb-2`}
            >
              No Reports Yet
            </Text>
            <Text
              className={`${isDark ? "text-gray-300" : "text-gray-600"} text-center mb-6`}
            >
              You haven't submitted any reports yet. Tap the button below to
              create your first report.
            </Text>
            <TouchableOpacity
              className="bg-blue-600 px-6 py-3 rounded-lg"
              onPress={() => router.push("./report")}
            >
              <Text className="text-white font-medium">
                Create First Report
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          complaints.map((complaint) => (
            <TouchableOpacity
              key={complaint.id}
              className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-2xl p-4 mb-4 shadow-sm`}
              onPress={() =>
                router.push(`./complaint-details?id=${complaint.id}`)
              }
            >
              <View className="flex-row">
                {/* Complaint Photo */}
                {complaint.photos && complaint.photos.length > 0 ? (
                  <Image
                    source={{
                      uri: complaint.photos[0].startsWith("data:")
                        ? complaint.photos[0]
                        : complaint.photos[0].startsWith("file://")
                          ? "https://via.placeholder.com/80x80/f0f0f0/999999?text=No+Image"
                          : complaint.photos[0],
                    }}
                    style={{ width: 80, height: 80 }}
                    className="rounded-xl mr-4"
                    onError={() => {
                      console.log("Failed to load image:", complaint.photos[0]);
                      console.log(
                        "Image type:",
                        complaint.photos[0].startsWith("data:")
                          ? "Base64"
                          : complaint.photos[0].startsWith("file://")
                            ? "File URI"
                            : "Other"
                      );
                    }}
                  />
                ) : (
                  <View className="w-20 h-20 bg-gray-200 rounded-xl mr-4 items-center justify-center">
                    <AppIcon icon="camera" size={24} />
                  </View>
                )}

                {/* Complaint Info */}
                <View className="flex-1">
                  <View className="flex-row items-start justify-between mb-2">
                    <Text
                      className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-800"} flex-1 mr-2`}
                    >
                      {complaint.title}
                    </Text>
                    <View
                      className={`${getStatusColor(complaint.status)} px-3 py-1 rounded-full`}
                    >
                      <Text className="text-white text-xs font-medium">
                        {getStatusText(complaint.status)}
                      </Text>
                    </View>
                  </View>

                  <Text
                    className={`${isDark ? "text-gray-300" : "text-gray-600"} text-sm mb-2`}
                  >
                    {complaint.description && complaint.description.length > 60
                      ? complaint.description.substring(0, 60) + "..."
                      : complaint.description}
                  </Text>

                  <View className="flex-row items-center mb-1">
                    <AppIcon icon="location" size={14} />
                    <Text
                      className={`${isDark ? "text-gray-300" : "text-gray-600"} text-sm ml-1`}
                    >
                      {complaint.address || "No address"}
                    </Text>
                  </View>

                  <View className="flex-row items-center justify-between">
                    <Text
                      className={`${isDark ? "text-gray-400" : "text-gray-500"} text-sm`}
                    >
                      {new Date(complaint.created_at).toLocaleDateString()}
                    </Text>
                    <View className="flex-row items-center">
                      <View className="mr-1">
                        <AppIcon
                          icon={getStatusIconName(complaint.status)}
                          size={16}
                        />
                      </View>
                      <Text
                        className={`${isDark ? "text-blue-400" : "text-blue-600"} text-sm`}
                      >
                        View Details
                      </Text>
                    </View>
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
          <TouchableOpacity className="items-center py-2 px-4">
            <AppIcon icon="reports" size={24} />
            <Text className="text-blue-600 font-medium text-xs">
              My Reports
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="items-center py-2 px-4"
            onPress={() => router.push("./nearby-issues")}
          >
            <AppIcon icon="map" size={24} />
            <Text
              className={`${isDark ? "text-gray-400" : "text-gray-600"} text-xs`}
            >
              Nearby
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="items-center py-2 px-4"
            onPress={() => router.push("./profile")}
          >
            <AppIcon icon="profile" size={24} />
            <Text
              className={`${isDark ? "text-gray-400" : "text-gray-600"} text-xs`}
            >
              Profile
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default MyComplaints;
