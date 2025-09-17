import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
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
import ToastService from "../services/ToastService";
import { DatabaseService } from "../lib/database";

interface ReportData {
  id: string;
  description: string;
  location: Location.LocationObject | null;
  address: string;
  photos: string[];
  audioUri: string | null;
  timestamp: number;
  status: "draft" | "uploading" | "submitted" | "confirmed";
  category: string;
}

const ReportScreen = () => {
  const router = useRouter();
  const { isDark } = useTheme();
  const { user, isAuthenticated } = useClerkAuth();
  const colors = getThemeColors(isDark);

  const [description, setDescription] = useState("");
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [address, setAddress] = useState("Getting location...");
  const [manualAddress, setManualAddress] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [recording, setRecording] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const [category, setCategory] = useState("General");

  const categories = [
    "Potholes",
    "Streetlights",
    "Waste Management",
    "Water Issues",
    "Traffic",
    "Public Safety",
    "Parks",
    "General",
  ];

  // Get user location on component mount
  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    try {
      setLocationLoading(true);
      setAddress("Getting location...");

      // Simple permission request
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setAddress("Location permission denied");
        setLocationLoading(false);

        ToastService.warning({
          title: "Location Access Needed",
          message:
            "Please enable location permission in settings, or enter your address manually below.",
        });
        return;
      }

      // Get location with basic accuracy
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      // Try to get address
      try {
        let geocode = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (geocode[0]) {
          let addr = geocode[0];
          let addressStr = [addr.streetNumber, addr.street, addr.city]
            .filter(Boolean)
            .join(" ");
          setAddress(
            addressStr ||
              `${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`
          );
        } else {
          setAddress(
            `${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`
          );
        }
      } catch (geocodeError) {
        setAddress(
          `${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`
        );
      }
    } catch (error: any) {
      console.log("Location error:", error);
      setAddress("Could not get location");

      ToastService.error({
        title: "Location Error",
        message: "Cannot access location. Please enter your address manually.",
      });
      setAddress("Enter your address manually");
    } finally {
      setLocationLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      // Request permission
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        ToastService.error({
          title: "Permission Required",
          message: "Camera roll permissions needed to select images!",
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotos([...photos, result.assets[0].uri]);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      ToastService.error({
        title: "Image Selection Failed",
        message: "Failed to pick image. Please try again.",
      });
    }
  };

  const takePhoto = async () => {
    try {
      // Request camera permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== "granted") {
        ToastService.error({
          title: "Permission Required",
          message: "Camera permissions needed to take photos!",
        });
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotos([...photos, result.assets[0].uri]);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      ToastService.error({
        title: "Camera Error",
        message: "Failed to take photo. Please try again.",
      });
    }
  };

  const startRecording = async () => {
    try {
      // Audio recording temporarily disabled - replace with expo-audio implementation
      ToastService.info({
        title: "Audio Recording",
        message: "Voice recording feature will be available in the next update",
      });
    } catch (error) {
      ToastService.error({
        title: "Recording Error",
        message: "Failed to start recording",
      });
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      // Audio recording temporarily disabled
      setIsRecording(false);
      setRecording(null);
    } catch (error) {
      ToastService.error({
        title: "Recording Error",
        message: "Failed to stop recording",
      });
    }
  };

  const saveOffline = async (reportData: ReportData) => {
    try {
      const existingQueue = await AsyncStorage.getItem("offline_reports");
      const queue = existingQueue ? JSON.parse(existingQueue) : [];
      queue.push(reportData);
      await AsyncStorage.setItem("offline_reports", JSON.stringify(queue));
    } catch (error) {
      console.error("Error saving offline:", error);
    }
  };

  const uploadToSecureStorage = async (uri: string): Promise<string> => {
    // Simulate secure upload with presigned URLs
    // In production, you'd get a presigned URL from your backend
    try {
      // Mock upload process
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Store in secure store (simulation)
      const secureId = `upload_${Date.now()}_${Math.random()}`;
      await SecureStore.setItemAsync(secureId, uri);

      return `https://your-secure-bucket.com/${secureId}`;
    } catch (error) {
      throw new Error("Upload failed");
    }
  };

  const submitReport = async () => {
    if (!description.trim()) {
      ToastService.error({
        title: "Description Required",
        message: "Please add a description for your report",
      });
      return;
    }

    if (!address.trim()) {
      ToastService.error({
        title: "Location Required",
        message: "Please add your location (GPS detected or manually entered)",
      });
      return;
    }

    if (!isAuthenticated || !user) {
      ToastService.warning({
        title: "Authentication Required",
        message: "Please log in to submit a report. Tap to go to login.",
        duration: 5000,
        onPress: () => router.push("./clerk-login"),
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Debug: Log user information
      console.log("📝 SUBMIT REPORT DEBUG:");
      console.log("🔐 isAuthenticated:", isAuthenticated);
      console.log("👤 user object:", user);
      console.log("🆔 user.id:", user?.id);
      console.log("📧 user.emailAddresses:", user?.emailAddresses);

      // Ensure we have a valid user ID
      if (!user?.id) {
        console.error("❌ No user ID available during submission!");
        ToastService.error({
          title: "Authentication Error",
          message:
            "User ID not found. Please log out and log back in. Tap to go to login.",
          onPress: () => router.push("./clerk-login"),
        });
        return;
      }

      // Prepare report data for database
      const reportData = {
        user_id: user.id, // Add the authenticated user's ID
        title: `${category} Issue`, // Generate title from category
        description: description.trim(),
        category,
        location_latitude: location?.coords?.latitude,
        location_longitude: location?.coords?.longitude,
        location_accuracy: location?.coords?.accuracy || undefined,
        address: address.trim(),
        photos, // Will be uploaded to Supabase storage
        audio_uri: audioUri || undefined,
        status: "submitted" as const,
        priority: "medium" as const, // Default priority
      };

      console.log("📊 Report data being submitted:", reportData);

      // Submit to database (Supabase)
      const savedReport = await DatabaseService.createReport(reportData);

      if (savedReport) {
        ToastService.reportSubmitted();

        // Show tracking option
        setTimeout(() => {
          ToastService.info({
            title: "Track Your Report",
            message: `Report ID: ${savedReport.id.slice(-8)}. Tap to track status.`,
            duration: 6000,
            onPress: () => router.push("./tracking"),
          });
        }, 2000);

        // Reset form
        setDescription("");
        setPhotos([]);
        setAudioUri(null);
        setCategory("General");
        setManualAddress("");
        getLocation(); // Refresh location for new report

        // Try to sync any pending local reports
        await DatabaseService.syncLocalReports();
      } else {
        // If database save failed, data was saved locally
        ToastService.warning({
          title: "Saved Locally",
          message:
            "Your report has been saved and will be uploaded when connection is restored.",
        });

        // Reset form
        setDescription("");
        setPhotos([]);
        setAudioUri(null);
        setCategory("General");
        setManualAddress("");
        getLocation();
      }
    } catch (error) {
      console.error("Submit error:", error);
      ToastService.error({
        title: "Submission Failed",
        message: "Failed to submit report. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View
          className={`${isDark ? "bg-gray-800" : "bg-blue-600"} pb-6 px-6 pt-2`}
        >
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-white text-2xl mr-4">←</Text>
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">
              Report an Issue
            </Text>
          </View>
        </View>

        <View className="p-6">
          {/* Location Section */}
          <View
            className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-xl p-4 mb-6 shadow-sm`}
          >
            <Text
              className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-800"} mb-2`}
            >
              📍 Location
            </Text>
            {locationLoading ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color="#3B82F6" />
                <Text
                  className={`${isDark ? "text-gray-300" : "text-gray-600"} ml-2`}
                >
                  Getting your location...
                </Text>
              </View>
            ) : (
              <View>
                <Text
                  className={`${isDark ? "text-gray-300" : "text-gray-600"} mb-2`}
                >
                  {address}
                </Text>
                {location && (
                  <Text
                    className={`${isDark ? "text-gray-400" : "text-gray-500"} text-sm`}
                  >
                    Accuracy: ±{Math.round(location.coords.accuracy || 0)}m
                  </Text>
                )}
              </View>
            )}
            <View className="flex-row mt-3 flex-wrap">
              <TouchableOpacity
                onPress={getLocation}
                className="bg-blue-600 px-4 py-2 rounded-lg mr-3 mb-3 flex-row items-center"
                disabled={locationLoading}
              >
                <Text className="text-white font-medium">
                  📍 Update Location
                </Text>
              </TouchableOpacity>
              {location && (
                <TouchableOpacity
                  onPress={() => {
                    // Pass location data to map screen
                    router.push({
                      pathname: "./map",
                      params: {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        address: address,
                      },
                    });
                  }}
                  className="bg-green-600 px-4 py-2 rounded-lg mb-3 flex-row items-center"
                >
                  <AppIcon icon="map" size={16} color="white" />
                  <Text className="text-white font-medium ml-2">
                    View on Map
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Manual Address Input - Always visible as alternative */}
            <View className="mt-4 pt-4 border-t border-gray-200">
              <Text
                className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"} mb-2`}
              >
                Or enter your location manually:
              </Text>
              <TextInput
                className={`${isDark ? "bg-gray-700 text-white border-gray-600" : "bg-gray-50 text-gray-800 border-gray-300"} border rounded-lg px-3 py-2`}
                placeholder="Enter street address, city, or landmark"
                placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                value={manualAddress}
                onChangeText={(text) => {
                  setManualAddress(text);
                  if (text.trim()) {
                    setAddress(text);
                    // Clear GPS location when manually entering address
                    setLocation(null);
                  }
                }}
                multiline={true}
                numberOfLines={2}
              />
              <Text
                className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"} mt-1`}
              >
                Example: "123 Main St, City" or "Near City Hall"
              </Text>
            </View>
          </View>

          {/* Category Selection */}
          <View
            className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-xl p-4 mb-6 shadow-sm`}
          >
            <Text
              className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-800"} mb-3`}
            >
              🗂 Category
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  className={`mr-3 px-4 py-2 rounded-full ${
                    category === cat
                      ? isDark
                        ? "bg-blue-500"
                        : "bg-blue-600"
                      : isDark
                        ? "bg-gray-700"
                        : "bg-gray-200"
                  }`}
                >
                  <Text
                    className={`${
                      category === cat
                        ? "text-white"
                        : isDark
                          ? "text-gray-300"
                          : "text-gray-700"
                    } font-medium`}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Description */}
          <View
            className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-xl p-4 mb-6 shadow-sm`}
          >
            <Text
              className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-800"} mb-3`}
            >
              📝 Describe the Issue
            </Text>
            <TextInput
              className={`border ${isDark ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white text-gray-800"} rounded-lg p-3 h-24`}
              placeholder="What's the problem? Be specific about what you observed..."
              placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
              multiline
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* Photos Section */}
          <View
            className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-xl p-4 mb-6 shadow-sm`}
          >
            <View className="flex-row items-center mb-3">
              <AppIcon icon="camera" size={20} />
              <Text
                className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-800"} ml-2`}
              >
                Add Photos
              </Text>
            </View>

            <View className="flex-row mb-4">
              <TouchableOpacity
                onPress={takePhoto}
                className={`${isDark ? "bg-blue-500" : "bg-blue-600"} flex-1 mr-2 p-3 rounded-lg items-center`}
              >
                <AppIcon icon="camera" size={16} color="white" />
                <Text className="text-white font-medium ml-2">Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={pickImage}
                className={`${isDark ? "bg-gray-600" : "bg-gray-600"} flex-1 ml-2 p-3 rounded-lg items-center`}
              >
                <Text className="text-white font-medium">🖼 Choose Photo</Text>
              </TouchableOpacity>
            </View>

            {photos.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {photos.map((photo, index) => (
                  <View key={index} className="mr-3 relative">
                    <Image
                      source={{ uri: photo }}
                      className="w-20 h-20 rounded-lg"
                    />
                    <TouchableOpacity
                      onPress={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 bg-red-500 w-6 h-6 rounded-full items-center justify-center"
                    >
                      <Text className="text-white text-xs">×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Voice Note Section */}
          <View
            className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-xl p-4 mb-6 shadow-sm`}
          >
            <View className="flex-row items-center mb-3">
              <AppIcon icon="microphone" size={20} />
              <Text
                className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-800"} ml-2`}
              >
                Voice Note (Optional)
              </Text>
            </View>

            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={isRecording ? stopRecording : startRecording}
                className={`${
                  isRecording
                    ? isDark
                      ? "bg-red-500"
                      : "bg-red-600"
                    : isDark
                      ? "bg-green-500"
                      : "bg-green-600"
                } flex-1 p-3 rounded-lg items-center mr-3`}
              >
                <View className="flex-row items-center">
                  <AppIcon
                    icon={isRecording ? "stop" : "microphone"}
                    size={16}
                    color="white"
                  />
                  <Text className="text-white font-medium ml-2">
                    {isRecording ? "Stop Recording" : "Start Recording"}
                  </Text>
                </View>
              </TouchableOpacity>

              {audioUri && (
                <TouchableOpacity
                  onPress={() => setAudioUri(null)}
                  className={`${isDark ? "bg-gray-600" : "bg-gray-600"} p-3 rounded-lg`}
                >
                  <Text className="text-white">🗑</Text>
                </TouchableOpacity>
              )}
            </View>

            {audioUri && (
              <Text
                className={`${isDark ? "text-green-400" : "text-green-600"} mt-2 text-center`}
              >
                ✅ Voice note recorded
              </Text>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={submitReport}
            disabled={isSubmitting || locationLoading}
            className={`${
              isSubmitting || locationLoading
                ? isDark
                  ? "bg-gray-600"
                  : "bg-gray-400"
                : isDark
                  ? "bg-blue-500"
                  : "bg-blue-600"
            } p-4 rounded-xl items-center shadow-md`}
          >
            {isSubmitting ? (
              <View className="flex-row items-center">
                <ActivityIndicator color="white" size="small" />
                <Text className="text-white font-bold text-lg ml-2">
                  Submitting...
                </Text>
              </View>
            ) : (
              <Text className="text-white font-bold text-lg">
                📤 Submit Report
              </Text>
            )}
          </TouchableOpacity>

          <Text
            className={`${isDark ? "text-gray-400" : "text-gray-500"} text-center mt-4 text-sm`}
          >
            Your report will be reviewed and assigned to the relevant department
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ReportScreen;
