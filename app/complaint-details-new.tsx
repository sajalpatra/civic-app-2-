import { useLocalSearchParams, useRouter } from "expo-router";
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
import { UserAvatar } from "../components/UserAvatar";
import { useTheme } from "../contexts/ThemeContext";
import { DatabaseService } from "../lib/database";
import { Report } from "../lib/supabase";

const ComplaintDetails = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { isDark } = useTheme();
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [complaint, setComplaint] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  // Load complaint data when component mounts
  useEffect(() => {
    if (id) {
      loadComplaintDetails();
    }
  }, [id]);

  const loadComplaintDetails = async () => {
    try {
      setLoading(true);
      console.log("🔍 Loading complaint details for ID:", id);
      // For now, we'll get all reports and find the one with matching ID
      const allReports = await DatabaseService.getUserReports();
      const foundComplaint = allReports.find((report) => report.id === id);

      if (foundComplaint) {
        console.log("✅ Found complaint:", foundComplaint);
        setComplaint(foundComplaint);
      } else {
        console.log("❌ Complaint not found with ID:", id);
      }
    } catch (error) {
      console.error("❌ Error loading complaint details:", error);
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

  const handleUpvote = () => {
    setIsUpvoted(!isUpvoted);
  };

  return (
    <View className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#111827" : "#f9fafb"}
      />

      {/* Header */}
      <View
        className={`${isDark ? "bg-gray-800" : "bg-white"} pt-12 pb-6 px-6 shadow-sm`}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className={`mr-4 p-2 rounded-full ${isDark ? "bg-gray-700" : "bg-gray-100"}`}
            >
              <Text className="text-xl">←</Text>
            </TouchableOpacity>
            <Text
              className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}
            >
              Complaint Details
            </Text>
          </View>
          <UserAvatar size={35} />
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {loading ? (
          <View className="flex-1 justify-center items-center py-20">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text
              className={`${isDark ? "text-gray-300" : "text-gray-600"} mt-4`}
            >
              Loading complaint details...
            </Text>
          </View>
        ) : !complaint ? (
          <View className="flex-1 justify-center items-center py-20">
            <Text className="text-6xl mb-4">❌</Text>
            <Text
              className={`text-xl font-semibold ${isDark ? "text-white" : "text-gray-800"} mb-2`}
            >
              Complaint Not Found
            </Text>
            <Text
              className={`${isDark ? "text-gray-300" : "text-gray-600"} text-center mb-6`}
            >
              The complaint you're looking for could not be found.
            </Text>
            <TouchableOpacity
              className="bg-blue-600 px-6 py-3 rounded-lg"
              onPress={() => router.back()}
            >
              <Text className="text-white font-medium">Go Back</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Complaint Image */}
            <View className="relative">
              {complaint.photos &&
              complaint.photos.length > 0 &&
              !imageError ? (
                <>
                  <Image
                    source={{ uri: complaint.photos[0] }}
                    style={{ height: 250 }}
                    className="w-full"
                    resizeMode="cover"
                    onLoad={() => setImageLoading(false)}
                    onError={() => {
                      setImageError(true);
                      setImageLoading(false);
                    }}
                  />
                  {imageLoading && (
                    <View className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                      <ActivityIndicator size="large" color="#3B82F6" />
                      <Text
                        className={`mt-2 text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}
                      >
                        Loading image...
                      </Text>
                    </View>
                  )}
                </>
              ) : (
                <View
                  className={`h-60 flex items-center justify-center ${isDark ? "bg-gray-700" : "bg-gray-200"}`}
                >
                  <Text className="text-6xl mb-2">📷</Text>
                  <Text
                    className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}
                  >
                    {complaint.photos && complaint.photos.length > 0
                      ? "Image not available"
                      : "No image provided"}
                  </Text>
                </View>
              )}

              {/* Image overlay with category badge */}
              <View className="absolute top-4 left-4">
                <View className="bg-black/50 px-3 py-1 rounded-full">
                  <Text className="text-white text-sm font-medium">
                    {complaint.category}
                  </Text>
                </View>
              </View>
            </View>

            {/* Complaint Info */}
            <View className={`${isDark ? "bg-gray-800" : "bg-white"} p-6`}>
              <View className="flex-row items-start justify-between mb-4">
                <Text
                  className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-800"} flex-1 mr-4`}
                >
                  {complaint.title}
                </Text>
                <View
                  className={`${getStatusColor(complaint.status)} px-3 py-1 rounded-full`}
                >
                  <Text className="text-white text-sm font-medium">
                    {getStatusText(complaint.status)}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center mb-3">
                <Text className="text-xl mr-2">🏷️</Text>
                <Text
                  className={`${isDark ? "text-gray-300" : "text-gray-700"} font-medium`}
                >
                  {complaint.category}
                </Text>
              </View>

              <View className="flex-row items-center mb-4">
                <Text className="text-xl mr-2">📍</Text>
                <Text
                  className={`${isDark ? "text-gray-300" : "text-gray-700"}`}
                >
                  {complaint.address || "No address provided"}
                </Text>
              </View>

              <Text
                className={`${isDark ? "text-gray-200" : "text-gray-800"} leading-6 mb-6`}
              >
                {complaint.description}
              </Text>

              {/* Action Buttons */}
              <View className="flex-row justify-between mb-6">
                <TouchableOpacity
                  className={`flex-row items-center px-6 py-3 rounded-xl border ${
                    isUpvoted
                      ? isDark
                        ? "border-blue-400 bg-blue-900"
                        : "border-blue-500 bg-blue-50"
                      : isDark
                        ? "border-gray-600 bg-gray-700"
                        : "border-gray-300 bg-white"
                  }`}
                  onPress={handleUpvote}
                >
                  <Text className={`text-xl mr-2`}>
                    {isUpvoted ? "👍" : "👍"}
                  </Text>
                  <Text
                    className={`font-medium ${isUpvoted ? (isDark ? "text-blue-400" : "text-blue-600") : isDark ? "text-gray-300" : "text-gray-700"}`}
                  >
                    {0 + (isUpvoted ? 1 : 0)} Upvotes
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`flex-row items-center px-6 py-3 rounded-xl border ${isDark ? "border-gray-600 bg-gray-700" : "border-gray-300 bg-white"}`}
                >
                  <Text className="text-xl mr-2">📤</Text>
                  <Text
                    className={`${isDark ? "text-gray-300" : "text-gray-700"} font-medium`}
                  >
                    Share
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Report Information */}
            <View
              className={`${isDark ? "bg-gray-800" : "bg-white"} mx-6 rounded-2xl p-6 mb-6 shadow-sm`}
            >
              <Text
                className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-800"} mb-4`}
              >
                Report Information
              </Text>

              <View className="space-y-3">
                <View className="flex-row justify-between py-2">
                  <Text
                    className={`${isDark ? "text-gray-300" : "text-gray-600"}`}
                  >
                    Status:
                  </Text>
                  <Text
                    className={`font-medium ${isDark ? "text-white" : "text-gray-800"}`}
                  >
                    {getStatusText(complaint.status)}
                  </Text>
                </View>

                <View className="flex-row justify-between py-2">
                  <Text
                    className={`${isDark ? "text-gray-300" : "text-gray-600"}`}
                  >
                    Priority:
                  </Text>
                  <Text
                    className={`font-medium ${isDark ? "text-white" : "text-gray-800"} capitalize`}
                  >
                    {complaint.priority}
                  </Text>
                </View>

                <View className="flex-row justify-between py-2">
                  <Text
                    className={`${isDark ? "text-gray-300" : "text-gray-600"}`}
                  >
                    Submitted:
                  </Text>
                  <Text
                    className={`font-medium ${isDark ? "text-white" : "text-gray-800"}`}
                  >
                    {new Date(complaint.created_at).toLocaleDateString()}
                  </Text>
                </View>

                <View className="flex-row justify-between py-2">
                  <Text
                    className={`${isDark ? "text-gray-300" : "text-gray-600"}`}
                  >
                    Last Updated:
                  </Text>
                  <Text
                    className={`font-medium ${isDark ? "text-white" : "text-gray-800"}`}
                  >
                    {new Date(complaint.updated_at).toLocaleDateString()}
                  </Text>
                </View>

                {complaint.resolved_at && (
                  <View className="flex-row justify-between py-2">
                    <Text
                      className={`${isDark ? "text-gray-300" : "text-gray-600"}`}
                    >
                      Resolved:
                    </Text>
                    <Text
                      className={`font-medium ${isDark ? "text-white" : "text-gray-800"}`}
                    >
                      {new Date(complaint.resolved_at).toLocaleDateString()}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default ComplaintDetails;
