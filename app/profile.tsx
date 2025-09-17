import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppIcon } from "../components/IconComponent";
import { getThemeColors } from "../constants/Colors";
import { useClerkAuth } from "../contexts/ClerkAuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useProfileImage } from "../hooks/useProfileImage";
import { DatabaseService } from "../lib/database";
import { UserService } from "../lib/userService";
import NotificationManager from "../lib/NotificationService";
import ToastService from "../services/ToastService";

interface UserStats {
  reportsSubmitted: number;
  issuesResolved: number;
  communityPoints: number;
  upvotesReceived: number;
  memberSince: string;
}

interface EditProfileData {
  fullName: string;
  email: string;
  phone: string;
  bio: string;
  profileImage: string;
}

const Profile = () => {
  const router = useRouter();
  const { isDark } = useTheme();
  const { user, signOut } = useClerkAuth();
  const colors = getThemeColors(isDark);
  const { profileImage: hookProfileImage, refreshProfileImage } =
    useProfileImage();

  const [userStats, setUserStats] = useState<UserStats>({
    reportsSubmitted: 0,
    issuesResolved: 0,
    communityPoints: 0,
    upvotesReceived: 0,
    memberSince: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState<EditProfileData>({
    fullName: "",
    email: "",
    phone: "",
    bio: "",
    profileImage: "",
  });
  const [saving, setSaving] = useState(false);

  // Fetch user statistics from database
  useEffect(() => {
    fetchUserStats();
    loadUserProfileData();
  }, [user?.id]);

  const loadUserProfileData = async () => {
    if (user) {
      console.log("🔄 Loading user profile data");
      console.log(
        "User metadata profile_image:",
        user.user_metadata?.profile_image
          ? `${user.user_metadata.profile_image.substring(0, 50)}... (${user.user_metadata.profile_image.length} chars)`
          : "Not available"
      );

      console.log(
        "User imageUrl:",
        user.imageUrl
          ? `${user.imageUrl.substring(0, 50)}... (${user.imageUrl.length} chars)`
          : "Not available"
      );
      console.log(
        "Current editData profileImage:",
        editData.profileImage
          ? `${editData.profileImage.substring(0, 50)}... (${editData.profileImage.length} chars)`
          : "Not available"
      );
      // console.log(
      //   "User metadata profile_image:",
      //   user.user_metadata?.profile_image
      // );
      // console.log("User imageUrl:", user.imageUrl);
      // console.log("Current editData profileImage:", editData.//profileImage);

      // Load profile image from database
      let profileImageUrl =
        user.user_metadata?.profile_image || user.imageUrl || "";

      try {
        const { data: dbImage } = await UserService.getProfileImage(user.id);
        if (dbImage) {
          profileImageUrl = dbImage;
          console.log("✅ Loaded profile image from database");
        }
      } catch (error) {
        console.log("ℹ️ No profile image in database, using default");
      }

      setEditData({
        fullName:
          user.user_metadata?.full_name ||
          user.firstName + " " + user.lastName ||
          "",
        email: user.emailAddresses?.[0]?.emailAddress || user.email || "",
        phone: user.phoneNumbers?.[0]?.phoneNumber || "",
        bio: user.user_metadata?.bio || "",
        profileImage: profileImageUrl,
      });

      console.log("✅ Profile data loaded");
    }
  };

  const fetchUserStats = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      console.log("🔄 Fetching profile stats for user:", user.id);
      const stats = await DatabaseService.getUserStats(user.id);
      setUserStats(stats);
      console.log("✅ Profile stats loaded:", stats);
    } catch (error) {
      console.error("❌ Error loading profile stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshStats = async () => {
    setLoading(true);
    await fetchUserStats();
  };

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleTestNotification = async () => {
    try {
      ToastService.info({
        title: "Testing Notification",
        message: "Sending test notification...",
      });

      const success = await NotificationManager.testNotification();

      if (success) {
        ToastService.success({
          title: "✅ Test Sent",
          message:
            "Check your notifications! The test notification should appear shortly.",
        });
      } else {
        ToastService.error({
          title: "❌ Test Failed",
          message:
            "Notification permission may not be granted. Check your device settings.",
        });
      }
    } catch (error) {
      console.error("Test notification error:", error);
      ToastService.error({
        title: "❌ Error",
        message: "Failed to send test notification",
      });
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      console.log("💾 Saving profile data:", {
        fullName: editData.fullName,
        bio: editData.bio,
        phone: editData.phone,
        hasImage: !!editData.profileImage,
      });

      // Update user metadata through Clerk (excluding profile_image which is stored in database)
      // Note: firstName and lastName are not directly updatable via update()
      // We'll store the full name in metadata instead
      await user?.update({
        unsafeMetadata: {
          full_name: editData.fullName,
          bio: editData.bio,
          phone: editData.phone,
        },
      });

      console.log("✅ Profile saved successfully");

      ToastService.success({
        title: "Profile Updated",
        message: "Your profile has been updated successfully!",
      });
      setShowEditModal(false);

      // Reload user data from Clerk to reflect changes
      try {
        await user?.reload();
        loadUserProfileData();
      } catch (error) {
        console.log("Error reloading user:", error);
        // Fallback to just reloading profile data
        setTimeout(() => {
          loadUserProfileData();
        }, 500);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      ToastService.error({
        title: "Update Failed",
        message: "Failed to update profile. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePhoto = async () => {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      ToastService.error({
        title: "Permission Required",
        message:
          "Camera roll permissions are needed to change your profile photo.",
      });
      return;
    }

    // Show options to user
    ToastService.info({
      title: "Change Profile Photo",
      message: "Use the camera or choose from photo library",
    });

    // For now, just open image picker - can be enhanced with action sheet
    openImagePicker();
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      ToastService.error({
        title: "Permission Required",
        message: "Camera permissions are needed to take a photo.",
      });
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5, // Reduced quality for better performance
      base64: true, // Get base64 version
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      console.log(
        "📷 Camera image selected:",
        asset.uri.substring(0, 50) + "..."
      );

      // Convert to base64 for persistent storage
      const base64Image = asset.base64
        ? `data:image/jpeg;base64,${asset.base64}`
        : asset.uri;
      console.log(
        "📷 Using base64 image:",
        base64Image.substring(0, 50) + `... (${base64Image.length} chars)`
      );

      // Update local state
      setEditData({ ...editData, profileImage: base64Image });

      // Save to database immediately
      if (user?.id) {
        try {
          ToastService.info({
            title: "Saving Image",
            message: "Uploading your profile picture...",
          });

          await UserService.updateProfileImage(user.id, base64Image);

          // Refresh the profile image across all screens
          await refreshProfileImage();

          ToastService.success({
            title: "Image Saved",
            message: "Profile picture updated successfully!",
          });
        } catch (error) {
          console.error("❌ Error saving profile image:", error);
          ToastService.error({
            title: "Save Failed",
            message: "Failed to save profile picture. Please try again.",
          });
        }
      }
    }
  };

  const openImagePicker = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5, // Reduced quality for better performance
      base64: true, // Get base64 version
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      console.log(
        "🖼️ Gallery image selected:",
        asset.uri.substring(0, 50) + "..."
      );
      // Convert base64 to data URI for persistent storage
      const imageUri = asset.base64
        ? `data:image/jpeg;base64,${asset.base64}`
        : asset.uri;

      // Update local state
      setEditData({ ...editData, profileImage: imageUri });

      // Save to database immediately
      if (user?.id) {
        try {
          ToastService.info({
            title: "Saving Image",
            message: "Uploading your profile picture...",
          });

          await UserService.updateProfileImage(user.id, imageUri);

          // Refresh the profile image across all screens
          await refreshProfileImage();

          ToastService.success({
            title: "Image Saved",
            message: "Profile picture updated successfully!",
          });
        } catch (error) {
          console.error("❌ Error saving profile image:", error);
          ToastService.error({
            title: "Save Failed",
            message: "Failed to save profile picture. Please try again.",
          });
        }
      }
    }
  };

  const handleCancelEdit = () => {
    // Reset form data
    loadUserProfileData();
    setShowEditModal(false);
  };

  const handleLogout = () => {
    ToastService.warning({
      title: "Logout Confirmation",
      message: "Are you sure you want to logout? Tap this message to confirm.",
      duration: 5000,
      onPress: async () => {
        ToastService.info({
          title: "Logging out...",
          message: "Please wait",
        });
        await signOut();
        router.push("./");
      },
    });
  };

  const profileStats = [
    {
      label: "Reports Submitted",
      value: loading ? "..." : userStats.reportsSubmitted.toString(),
      iconName: "document" as const,
    },
    {
      label: "Issues Resolved",
      value: loading ? "..." : userStats.issuesResolved.toString(),
      iconName: "success" as const,
    },
    {
      label: "Community Points",
      value: loading ? "..." : userStats.communityPoints.toString(),
      iconName: "star" as const,
    },
    {
      label: "Upvotes Received",
      value: loading ? "..." : userStats.upvotesReceived.toString(),
      iconName: "like" as const,
    },
  ];

  const menuItems = [
    {
      title: "Edit Profile",
      iconName: "edit" as const,
      action: handleEditProfile,
    },
    {
      title: "Notification Settings",
      iconName: "notification" as const,
      action: () => {
        // For now, we'll trigger a test notification
        handleTestNotification();
      },
    },
    { title: "Privacy Settings", iconName: "lock" as const, action: () => {} },
    { title: "Help & Support", iconName: "help" as const, action: () => {} },
    { title: "About", iconName: "about" as const, action: () => {} },
    {
      title: "Logout",
      iconName: "logout" as const,
      action: handleLogout,
      color: "text-red-600",
    },
  ];

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-gray-800" : "bg-gray-50"}`}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.header}
      />

      {/* Header */}
      <View
        className={`${isDark ? "bg-gray-800" : "bg-white"} pb-6 px-6 shadow-md`}
      >
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className={`mr-4 p-2 rounded-full ${isDark ? "bg-gray-700" : "bg-gray-100"}`}
          >
            <Text
              className={`text-xl ${isDark ? "text-white" : "text-gray-800"}`}
            >
              ←
            </Text>
          </TouchableOpacity>
          <Text
            className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}
          >
            Profile
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View
          className={`${isDark ? "bg-gray-800" : "bg-white"} mx-6 mt-6 rounded-2xl p-6 shadow-md items-center`}
        >
          <TouchableOpacity
            onPress={handleChangePhoto}
            className={`w-20 h-20 ${isDark ? "bg-blue-900" : "bg-blue-100"} rounded-full items-center justify-center mb-4 overflow-hidden`}
          >
            {editData.profileImage ||
            user?.user_metadata?.profile_image ||
            user?.imageUrl ? (
              <Image
                source={{
                  uri:
                    editData.profileImage ||
                    user?.user_metadata?.profile_image ||
                    user?.imageUrl,
                }}
                className="w-full h-full"
                resizeMode="cover"
                onError={(error) => {
                  console.log(
                    "❌ Profile image failed to load:",
                    error.nativeEvent.error
                  );
                  setEditData({ ...editData, profileImage: "" });
                }}
                onLoad={() => {
                  console.log("✅ Profile image loaded successfully");
                }}
              />
            ) : (
              <AppIcon
                icon="profile"
                size={40}
                color={isDark ? "#60a5fa" : "#2563eb"}
              />
            )}
          </TouchableOpacity>
          <Text
            className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-800"} mb-1`}
          >
            {editData.fullName ||
              user?.firstName + " " + user?.lastName ||
              user?.user_metadata?.full_name ||
              user?.email?.split("@")[0] ||
              "User"}
          </Text>
          <Text
            className={`${isDark ? "text-gray-300" : "text-gray-600"} mb-2`}
          >
            {editData.email ||
              user?.email ||
              user?.emailAddresses?.[0]?.emailAddress ||
              "No email"}
          </Text>
          <Text
            className={`${isDark ? "text-gray-400" : "text-gray-500"} text-sm`}
          >
            Member since{" "}
            {loading
              ? "..."
              : userStats.memberSince
                ? new Date(userStats.memberSince).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })
                : user?.created_at
                  ? new Date(user.created_at).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })
                  : "Unknown"}
          </Text>

          <TouchableOpacity
            className="mt-4 bg-blue-600 px-6 py-2 rounded-xl"
            onPress={handleEditProfile}
          >
            <Text className="text-white font-medium">Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Stats */}
        <View
          className={`mx-6 mt-6 ${isDark ? "bg-gray-800" : "bg-white"} rounded-2xl p-6 shadow-md`}
        >
          <View className="flex-row justify-between items-center mb-4">
            <Text
              className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-800"}`}
            >
              Your Impact
            </Text>
            <TouchableOpacity
              onPress={handleRefreshStats}
              disabled={loading}
              className={`px-3 py-1 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-100"}`}
            >
              <Text
                className={`text-sm ${loading ? (isDark ? "text-gray-500" : "text-gray-400") : isDark ? "text-blue-400" : "text-blue-600"}`}
              >
                {loading ? "Updating..." : "🔄 Refresh"}
              </Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row flex-wrap">
            {profileStats.map((stat, index) => (
              <View key={index} className="w-1/2 items-center mb-4">
                <AppIcon icon={stat.iconName} size={28} color={colors.accent} />
                <Text
                  className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}
                >
                  {stat.value}
                </Text>
                <Text
                  className={`${isDark ? "text-gray-300" : "text-gray-600"} text-sm text-center`}
                >
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Debug Info - Remove in production */}
        {__DEV__ && (
          <View
            className={`mx-6 mt-6 ${isDark ? "bg-gray-800" : "bg-white"} rounded-2xl p-6 shadow-md`}
          >
            <View className="flex-row items-center mb-4">
              <AppIcon icon="settings" size={20} color={colors.text} />
              <Text
                className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-800"} ml-2`}
              >
                Debug Information
              </Text>
            </View>

            {/* User Info */}
            <View
              className={`${isDark ? "bg-gray-700" : "bg-gray-50"} rounded-lg p-4 mb-4`}
            >
              <View className="flex-row items-center mb-2">
                <AppIcon
                  icon="profile"
                  size={16}
                  color={isDark ? "#60a5fa" : "#2563eb"}
                />
                <Text
                  className={`font-semibold ${isDark ? "text-blue-400" : "text-blue-600"} ml-2`}
                >
                  User Details
                </Text>
              </View>
              <View className="flex-row justify-between items-center mb-1">
                <Text
                  className={`${isDark ? "text-gray-300" : "text-gray-600"} text-sm`}
                >
                  User ID:
                </Text>
                <Text
                  className={`${isDark ? "text-white" : "text-gray-800"} text-sm font-mono`}
                >
                  {user?.id || "Not available"}
                </Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text
                  className={`${isDark ? "text-gray-300" : "text-gray-600"} text-sm`}
                >
                  Loading State:
                </Text>
                <Text
                  className={`${loading ? "text-yellow-500" : "text-green-500"} text-sm font-semibold`}
                >
                  {loading ? "🔄 Loading..." : "✅ Loaded"}
                </Text>
              </View>
            </View>

            {/* Stats Breakdown */}
            <View
              className={`${isDark ? "bg-gray-700" : "bg-gray-50"} rounded-lg p-4`}
            >
              <View className="flex-row items-center mb-3">
                <AppIcon
                  icon="analytics"
                  size={16}
                  color={isDark ? "#4ade80" : "#16a34a"}
                />
                <Text
                  className={`font-semibold ${isDark ? "text-green-400" : "text-green-600"} ml-2`}
                >
                  Statistics Breakdown
                </Text>
              </View>

              <View className="space-y-3">
                <View className="flex-row justify-between items-center">
                  <Text
                    className={`${isDark ? "text-gray-300" : "text-gray-600"} text-sm`}
                  >
                    📝 Reports Submitted:
                  </Text>
                  <Text
                    className={`${isDark ? "text-white" : "text-gray-800"} font-bold`}
                  >
                    {userStats.reportsSubmitted}
                  </Text>
                </View>

                <View className="flex-row justify-between items-center">
                  <Text
                    className={`${isDark ? "text-gray-300" : "text-gray-600"} text-sm`}
                  >
                    ✅ Issues Resolved:
                  </Text>
                  <Text
                    className={`${isDark ? "text-white" : "text-gray-800"} font-bold`}
                  >
                    {userStats.issuesResolved}
                  </Text>
                </View>

                <View className="flex-row justify-between items-center">
                  <Text
                    className={`${isDark ? "text-gray-300" : "text-gray-600"} text-sm`}
                  >
                    ⭐ Community Points:
                  </Text>
                  <Text
                    className={`${isDark ? "text-white" : "text-gray-800"} font-bold`}
                  >
                    {userStats.communityPoints}
                  </Text>
                </View>

                <View className="flex-row justify-between items-center">
                  <Text
                    className={`${isDark ? "text-gray-300" : "text-gray-600"} text-sm`}
                  >
                    👍 Upvotes Received:
                  </Text>
                  <Text
                    className={`${isDark ? "text-white" : "text-gray-800"} font-bold`}
                  >
                    {userStats.upvotesReceived}
                  </Text>
                </View>

                <View className="flex-row justify-between items-center">
                  <Text
                    className={`${isDark ? "text-gray-300" : "text-gray-600"} text-sm`}
                  >
                    📅 Member Since:
                  </Text>
                  <Text
                    className={`${isDark ? "text-white" : "text-gray-800"} text-sm font-mono`}
                  >
                    {new Date(userStats.memberSince).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              {/* Points Calculation */}
              <View
                className={`mt-4 pt-3 border-t ${isDark ? "border-gray-600" : "border-gray-200"}`}
              >
                <Text
                  className={`font-semibold ${isDark ? "text-purple-400" : "text-purple-600"} mb-2 text-sm`}
                >
                  🧮 Points Calculation:
                </Text>
                <Text
                  className={`${isDark ? "text-gray-300" : "text-gray-600"} text-xs`}
                >
                  Reports: {userStats.reportsSubmitted} × 10 ={" "}
                  {userStats.reportsSubmitted * 10}
                </Text>
                <Text
                  className={`${isDark ? "text-gray-300" : "text-gray-600"} text-xs`}
                >
                  Resolved: {userStats.issuesResolved} × 25 ={" "}
                  {userStats.issuesResolved * 25}
                </Text>
                <Text
                  className={`${isDark ? "text-white" : "text-gray-800"} text-xs font-semibold mt-1`}
                >
                  Total: {userStats.communityPoints} points
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Achievement Badge */}
        {userStats.issuesResolved > 0 && (
          <View className="mx-6 mt-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 shadow-md">
            <View className="flex-row items-center">
              <View className="mr-4">
                <AppIcon
                  icon={
                    userStats.issuesResolved >= 10
                      ? "trophy"
                      : userStats.issuesResolved >= 5
                        ? "trophy"
                        : userStats.issuesResolved >= 1
                          ? "trophy"
                          : "star"
                  }
                  size={32}
                  color="white"
                />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-lg">
                  {userStats.issuesResolved >= 10
                    ? "Community Champion"
                    : userStats.issuesResolved >= 5
                      ? "Problem Solver"
                      : userStats.issuesResolved >= 1
                        ? "Community Helper"
                        : "Getting Started"}
                </Text>
                <Text className="text-yellow-100 text-sm">
                  {userStats.issuesResolved >= 10
                    ? `Amazing! You've helped resolve ${userStats.issuesResolved} issues in your community!`
                    : userStats.issuesResolved >= 5
                      ? `Great work! You've resolved ${userStats.issuesResolved} issues so far.`
                      : userStats.issuesResolved >= 1
                        ? `Good start! You've helped resolve ${userStats.issuesResolved} issue${userStats.issuesResolved > 1 ? "s" : ""}.`
                        : "Submit your first report to start making a difference!"}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Menu Items */}
        <View
          className={`mx-6 mt-6 ${isDark ? "bg-gray-800" : "bg-white"} rounded-2xl shadow-md overflow-hidden`}
        >
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              className={`p-4 flex-row items-center ${
                index < menuItems.length - 1
                  ? `border-b ${isDark ? "border-gray-700" : "border-gray-100"}`
                  : ""
              }`}
              onPress={item.action}
            >
              <View className="mr-4">
                <AppIcon icon={item.iconName} size={24} color={colors.text} />
              </View>
              <Text
                className={`flex-1 font-medium ${
                  item.color || (isDark ? "text-white" : "text-gray-800")
                }`}
              >
                {item.title}
              </Text>
              <Text
                className={`text-xl ${isDark ? "text-gray-400" : "text-gray-400"}`}
              >
                ›
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* App Info */}
        <View
          className={`mx-6 mt-6 mb-8 ${isDark ? "bg-gray-800" : "bg-white"} rounded-2xl p-6 shadow-md`}
        >
          <Text
            className={`text-center ${isDark ? "text-gray-400" : "text-gray-500"} text-sm mb-2`}
          >
            Citizen Connect v1.0.0
          </Text>
          <Text
            className={`text-center ${isDark ? "text-gray-500" : "text-gray-400"} text-xs`}
          >
            Making communities better, one report at a time
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View
        className={`${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border-t py-3`}
      >
        <View className="flex-row justify-around items-center">
          <TouchableOpacity
            className="items-center py-2 px-4"
            onPress={() => router.push("/dashboard")}
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
            onPress={() => router.push("/my-complaints")}
          >
            <AppIcon icon="reports" size={24} color={colors.accent} />
            <Text
              className={`${isDark ? "text-gray-400" : "text-gray-600"} text-xs`}
            >
              My Reports
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="items-center py-2 px-4"
            onPress={() => router.push("/nearby-issues")}
          >
            <AppIcon icon="map" size={24} color={colors.accent} />
            <Text
              className={`${isDark ? "text-gray-400" : "text-gray-600"} text-xs`}
            >
              Nearby
            </Text>
          </TouchableOpacity>
          <TouchableOpacity className="items-center py-2 px-4">
            <Text className="text-2xl mb-1">👤</Text>
            <Text className="text-blue-600 font-medium text-xs">Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCancelEdit}
      >
        <SafeAreaView
          className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
        >
          <StatusBar
            barStyle={isDark ? "light-content" : "dark-content"}
            backgroundColor={colors.header}
          />

          {/* Modal Header */}
          <View
            className={`${isDark ? "bg-gray-800" : "bg-white"} pb-6 px-6 shadow-md`}
          >
            <View className="flex-row items-center justify-between">
              <TouchableOpacity
                onPress={handleCancelEdit}
                className={`p-2 rounded-full ${isDark ? "bg-gray-700" : "bg-gray-100"}`}
              >
                <Text
                  className={`text-xl ${isDark ? "text-white" : "text-gray-800"}`}
                >
                  ✕
                </Text>
              </TouchableOpacity>
              <Text
                className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}
              >
                Edit Profile
              </Text>
              <TouchableOpacity
                onPress={handleSaveProfile}
                disabled={saving}
                className={`px-4 py-2 rounded-lg ${saving ? (isDark ? "bg-gray-700" : "bg-gray-200") : "bg-blue-600"}`}
              >
                <Text
                  className={`font-semibold ${saving ? (isDark ? "text-gray-400" : "text-gray-500") : "text-white"}`}
                >
                  {saving ? "Saving..." : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            className="flex-1 px-6"
            showsVerticalScrollIndicator={false}
          >
            {/* Profile Picture Section */}
            <View
              className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-2xl p-6 shadow-md mt-6 items-center`}
            >
              <TouchableOpacity
                onPress={handleChangePhoto}
                className={`w-24 h-24 ${isDark ? "bg-blue-900" : "bg-blue-100"} rounded-full items-center justify-center mb-4 overflow-hidden`}
              >
                {editData.profileImage ? (
                  <Image
                    source={{ uri: editData.profileImage }}
                    className="w-full h-full"
                    resizeMode="cover"
                    onError={(error) => {
                      console.log(
                        "❌ Modal profile image failed to load:",
                        error.nativeEvent.error
                      );
                      setEditData({ ...editData, profileImage: "" });
                    }}
                    onLoad={() => {
                      console.log("✅ Modal profile image loaded successfully");
                    }}
                  />
                ) : (
                  <AppIcon
                    icon="profile"
                    size={48}
                    color={isDark ? "#60a5fa" : "#2563eb"}
                  />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-blue-600 px-4 py-2 rounded-lg"
                onPress={handleChangePhoto}
              >
                <Text className="text-white text-sm font-medium">
                  Change Photo
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form Fields */}
            <View
              className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-2xl p-6 shadow-md mt-6`}
            >
              <Text
                className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-800"} mb-4`}
              >
                Personal Information
              </Text>

              {/* Full Name */}
              <View className="mb-4">
                <Text
                  className={`${isDark ? "text-gray-300" : "text-gray-600"} text-sm mb-2`}
                >
                  Full Name
                </Text>
                <TextInput
                  value={editData.fullName}
                  onChangeText={(text) =>
                    setEditData({ ...editData, fullName: text })
                  }
                  className={`${isDark ? "bg-gray-700 text-white border-gray-600" : "bg-gray-50 text-gray-800 border-gray-200"} border rounded-lg px-4 py-3`}
                  placeholder="Enter your full name"
                  placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                />
              </View>

              {/* Email */}
              <View className="mb-4">
                <Text
                  className={`${isDark ? "text-gray-300" : "text-gray-600"} text-sm mb-2`}
                >
                  Email Address
                </Text>
                <TextInput
                  value={editData.email}
                  onChangeText={(text) =>
                    setEditData({ ...editData, email: text })
                  }
                  className={`${isDark ? "bg-gray-700 text-white border-gray-600" : "bg-gray-50 text-gray-800 border-gray-200"} border rounded-lg px-4 py-3`}
                  placeholder="Enter your email"
                  placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Phone */}
              <View className="mb-4">
                <Text
                  className={`${isDark ? "text-gray-300" : "text-gray-600"} text-sm mb-2`}
                >
                  Phone Number
                </Text>
                <TextInput
                  value={editData.phone}
                  onChangeText={(text) =>
                    setEditData({ ...editData, phone: text })
                  }
                  className={`${isDark ? "bg-gray-700 text-white border-gray-600" : "bg-gray-50 text-gray-800 border-gray-200"} border rounded-lg px-4 py-3`}
                  placeholder="Enter your phone number"
                  placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                  keyboardType="phone-pad"
                />
              </View>

              {/* Bio */}
              <View className="mb-4">
                <Text
                  className={`${isDark ? "text-gray-300" : "text-gray-600"} text-sm mb-2`}
                >
                  Bio
                </Text>
                <TextInput
                  value={editData.bio}
                  onChangeText={(text) =>
                    setEditData({ ...editData, bio: text })
                  }
                  className={`${isDark ? "bg-gray-700 text-white border-gray-600" : "bg-gray-50 text-gray-800 border-gray-200"} border rounded-lg px-4 py-3`}
                  placeholder="Tell us about yourself..."
                  placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Account Settings */}
            <View
              className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-2xl p-6 shadow-md mt-6 mb-8`}
            >
              <Text
                className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-800"} mb-4`}
              >
                Account Settings
              </Text>

              <TouchableOpacity className="flex-row justify-between items-center py-3">
                <Text
                  className={`${isDark ? "text-gray-300" : "text-gray-600"}`}
                >
                  Change Password
                </Text>
                <Text
                  className={`${isDark ? "text-blue-400" : "text-blue-600"}`}
                >
                  ›
                </Text>
              </TouchableOpacity>

              <TouchableOpacity className="flex-row justify-between items-center py-3">
                <Text
                  className={`${isDark ? "text-gray-300" : "text-gray-600"}`}
                >
                  Two-Factor Authentication
                </Text>
                <Text
                  className={`${isDark ? "text-blue-400" : "text-blue-600"}`}
                >
                  ›
                </Text>
              </TouchableOpacity>

              <TouchableOpacity className="flex-row justify-between items-center py-3">
                <Text className="text-red-600">Delete Account</Text>
                <Text className="text-red-600">›</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default Profile;
