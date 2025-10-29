import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
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
import { UserAvatar } from "../components/UserAvatar";
import ToastService from "../services/ToastService";
import NotificationManager from "../lib/NotificationService";
import { DatabaseService } from "../lib/database";
import { useClerkAuth } from "../contexts/ClerkAuthContext";
import MapPicker from "./MapPicker";

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

const NewComplaint = () => {
  const router = useRouter();
  const { user } = useClerkAuth();
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [address, setAddress] = useState("Getting location...");
  const [photos, setPhotos] = useState<string[]>([]);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [recording, setRecording] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const [category, setCategory] = useState("Potholes");
  const [priority, setPriority] = useState("Medium");
  const [showMapPicker, setShowMapPicker] = useState(false);

  const categories = [
    "Potholes",
    "Streetlights",
    "Waste Management",
    "Water Issues",
    "Traffic Signals",
    "Public Safety",
    "Parks & Recreation",
    "Noise Complaints",
    "Other",
  ];

  const priorities = ["Low", "Medium", "High", "Urgent"];

  // Get user location on component mount
  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    try {
      setLocationLoading(true);
      ToastService.showLoading("Getting your location...");

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setAddress("Location permission denied");
        setLocationLoading(false);
        ToastService.hideLoading();
        ToastService.permissionError(
          "Location permission is required to submit a civic report."
        );
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation(currentLocation);

      // Reverse geocoding to get human-readable address
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const addr = reverseGeocode[0];
        const fullAddress =
          `${addr.street || ""} ${addr.streetNumber || ""}, ${addr.city || ""}, ${addr.region || ""}`.trim();
        setAddress(fullAddress);
      }

      ToastService.hideLoading();
      ToastService.success({
        title: "Location Found!",
        message: "Your location has been detected successfully.",
        duration: 2000,
      });
    } catch (error) {
      console.error("Error getting location:", error);
      setAddress("Unable to get location");
      ToastService.hideLoading();
      ToastService.error({
        title: "Location Error",
        message: "Failed to get your location. You can enter it manually.",
        duration: 4000,
      });
    } finally {
      setLocationLoading(false);
    }
  };

  const handleMapLocationSelected = (selectedLocation: {
    latitude: number;
    longitude: number;
    address?: string;
  }) => {
    // Create a Location object from the selected coordinates
    const newLocation: Location.LocationObject = {
      coords: {
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        altitude: null,
        accuracy: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    };

    setLocation(newLocation);
    setAddress(selectedLocation.address || "Selected location");
    setLocationLoading(false);

    ToastService.success({
      title: "Location Selected",
      message: "Location has been set from map.",
      duration: 2000,
    });
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotos([...photos, result.assets[0].uri]);
        ToastService.success({
          title: "Image Added",
          message: "Photo has been added to your report.",
          duration: 2000,
        });
      }
    } catch (error) {
      ToastService.error({
        title: "Image Error",
        message: "Failed to pick image from gallery.",
        duration: 3000,
      });
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotos([...photos, result.assets[0].uri]);
        ToastService.success({
          title: "Photo Taken",
          message: "Photo has been captured and added to your report.",
          duration: 2000,
        });
      }
    } catch (error) {
      ToastService.error({
        title: "Camera Error",
        message: "Failed to take photo. Please check camera permissions.",
        duration: 3000,
      });
    }
  };

  const startRecording = async () => {
    try {
      // Audio recording temporarily disabled - replace with expo-audio implementation
      ToastService.info({
        title: "Audio Recording",
        message:
          "Voice recording feature will be available in the next update.",
        duration: 4000,
      });
    } catch (error) {
      ToastService.error({
        title: "Recording Error",
        message: "Failed to start audio recording.",
        duration: 3000,
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
    // Convert image to base64 for database storage
    try {
      console.log("📷 Converting image to base64:", uri);

      // Read the image file as base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Create data URI with proper MIME type
      const mimeType = uri.toLowerCase().includes(".png")
        ? "image/png"
        : "image/jpeg";
      const dataUri = `data:${mimeType};base64,${base64}`;

      console.log(
        "✅ Image converted to base64, size:",
        Math.round(dataUri.length / 1024),
        "KB"
      );

      // Return the base64 data URI for database storage
      return dataUri;
    } catch (error) {
      console.error("❌ Error converting image to base64:", error);
      throw new Error("Failed to process image");
    }
  };

  const submitComplaint = async () => {
    if (!description.trim()) {
      ToastService.validationError("Please add a description of the issue");
      return;
    }

    if (!location) {
      ToastService.validationError("Please wait for location to be detected");
      return;
    }

    try {
      setIsSubmitting(true);

      const reportId = `complaint_${Date.now()}`;

      // Show upload progress
      ToastService.showLoading("Uploading your report...");

      // Upload photos securely
      const uploadedPhotos = [];
      for (const photo of photos) {
        const secureUrl = await uploadToSecureStorage(photo);
        uploadedPhotos.push(secureUrl);
      }

      // Convert audio to base64 if exists
      let uploadedAudio = null;
      if (audioUri) {
        uploadedAudio = await uploadToSecureStorage(audioUri);
      }

      // Prepare report data for database
      const reportData = {
        user_id: user?.id || "anonymous",
        title: `${category}: ${description.substring(0, 100)}${description.length > 100 ? "..." : ""}`,
        description: description.trim(),
        category: category.toLowerCase(),
        location_latitude: location.coords.latitude,
        location_longitude: location.coords.longitude,
        location_accuracy: location.coords.accuracy || 0,
        address,
        photos: uploadedPhotos,
        audio_uri: uploadedAudio || undefined,
        status: "submitted" as const,
        priority: priority.toLowerCase() as
          | "low"
          | "medium"
          | "high"
          | "urgent",
      };

      console.log("🚀 Saving report to database...");
      console.log(
        "📸 Photos being saved:",
        uploadedPhotos.map((photo) =>
          photo.startsWith("data:")
            ? `Base64 image (${Math.round(photo.length / 1024)}KB)`
            : photo
        )
      );

      // Save to database
      const savedReport = await DatabaseService.createReport(reportData);

      if (savedReport) {
        console.log("✅ Report saved to database:", savedReport.id);

        ToastService.hideLoading();
        ToastService.reportSubmitted();

        // Send confirmation notification
        await NotificationManager.notifyGeneral(
          "📋 Complaint Submitted Successfully",
          `Your complaint "${description.substring(0, 50)}..." has been submitted and assigned ID: ${savedReport.id}`
        );

        // Schedule follow-up reminder in 3 days
        await NotificationManager.scheduleComplaintFollowUp(savedReport.id, 3);
      } else {
        // Fallback to local storage if database save failed
        console.log("⚠️ Database save failed, saving locally...");
        const localReportData: ReportData = {
          id: `complaint_${Date.now()}`,
          description: description.trim(),
          location,
          address,
          photos: uploadedPhotos,
          audioUri: uploadedAudio,
          timestamp: Date.now(),
          status: "submitted",
          category,
        };

        const existingReports = await AsyncStorage.getItem("user_reports");
        const reports = existingReports ? JSON.parse(existingReports) : [];
        reports.push(localReportData);
        await AsyncStorage.setItem("user_reports", JSON.stringify(reports));

        ToastService.hideLoading();
        ToastService.warning({
          title: "Saved Locally",
          message:
            "Report saved offline. Will sync when connection is restored.",
        });
      }

      // Show success options
      setTimeout(() => {
        ToastService.info({
          title: "What's Next?",
          message: "Tap here to track your complaint progress",
          duration: 6000,
          onPress: () => router.push("/my-complaints"),
        });
      }, 2000);

      // Reset form
      setDescription("");
      setPhotos([]);
      setAudioUri(null);
      setCategory("Potholes");
      setPriority("Medium");
    } catch (error) {
      ToastService.hideLoading();

      // Save offline if upload fails
      const offlineReport: ReportData = {
        id: `offline_${Date.now()}`,
        description: description.trim(),
        location,
        address,
        photos,
        audioUri,
        timestamp: Date.now(),
        status: "draft",
        category,
      };

      await saveOffline(offlineReport);

      ToastService.warning({
        title: "Saved Offline",
        message:
          "No internet connection. Your complaint has been saved and will be submitted when connection is restored.",
        duration: 6000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    submitComplaint();
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-blue-600 pt-12 pb-6 px-6">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <TouchableOpacity onPress={() => router.back()}>
                <Text className="text-white text-2xl mr-4">←</Text>
              </TouchableOpacity>
              <Text className="text-white text-xl font-bold">
                Submit Complaint
              </Text>
            </View>
            <UserAvatar size={35} />
          </View>
        </View>

        <View className="p-6">
          {/* Location Section */}
          <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
            <Text className="text-lg font-semibold text-gray-800 mb-2">
              📍 Location
            </Text>
            {locationLoading ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color="#3B82F6" />
                <Text className="text-gray-600 ml-2">
                  Getting your location...
                </Text>
              </View>
            ) : (
              <Text className="text-gray-600">{address}</Text>
            )}
            <View className="flex-row mt-3 space-x-2">
              <TouchableOpacity
                onPress={getLocation}
                className="flex-1 bg-blue-50 px-4 py-2 rounded-lg mr-2"
              >
                <Text className="text-blue-600 font-medium text-center">
                  📍 Current Location
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowMapPicker(true)}
                className="flex-1 bg-green-50 px-4 py-2 rounded-lg"
              >
                <Text className="text-green-600 font-medium text-center">
                  🗺️ Select on Map
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Category Selection */}
          <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
            <Text className="text-lg font-semibold text-gray-800 mb-3">
              🗂 Category
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  className={`mr-3 px-4 py-2 rounded-full ${
                    category === cat ? "bg-blue-600" : "bg-gray-200"
                  }`}
                >
                  <Text
                    className={`${
                      category === cat ? "text-white" : "text-gray-700"
                    } font-medium`}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Priority Selection */}
          <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
            <Text className="text-lg font-semibold text-gray-800 mb-3">
              ⚡ Priority Level
            </Text>
            <View className="flex-row">
              {priorities.map((pri) => (
                <TouchableOpacity
                  key={pri}
                  onPress={() => setPriority(pri)}
                  className={`mr-3 px-4 py-2 rounded-lg ${
                    priority === pri ? "bg-red-600" : "bg-gray-200"
                  }`}
                >
                  <Text
                    className={`${
                      priority === pri ? "text-white" : "text-gray-700"
                    } font-medium`}
                  >
                    {pri}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Description */}
          <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
            <Text className="text-lg font-semibold text-gray-800 mb-3">
              📝 Describe the Issue
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 h-32"
              placeholder="Please provide detailed information about the issue, including when you noticed it and any relevant details..."
              multiline
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* Photos Section */}
          <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
            <Text className="text-lg font-semibold text-gray-800 mb-3">
              📷 Add Photos
            </Text>

            <View className="flex-row mb-4">
              <TouchableOpacity
                onPress={takePhoto}
                className="bg-blue-600 flex-1 mr-2 p-3 rounded-lg items-center"
              >
                <Text className="text-white font-medium">📷 Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={pickImage}
                className="bg-gray-600 flex-1 ml-2 p-3 rounded-lg items-center"
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
          <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
            <Text className="text-lg font-semibold text-gray-800 mb-3">
              🎤 Voice Note (Optional)
            </Text>

            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={isRecording ? stopRecording : startRecording}
                className={`${
                  isRecording ? "bg-red-600" : "bg-green-600"
                } flex-1 p-3 rounded-lg items-center mr-3`}
              >
                <Text className="text-white font-medium">
                  {isRecording ? "🛑 Stop Recording" : "🎤 Start Recording"}
                </Text>
              </TouchableOpacity>

              {audioUri && (
                <TouchableOpacity
                  onPress={() => setAudioUri(null)}
                  className="bg-gray-600 p-3 rounded-lg"
                >
                  <Text className="text-white">🗑</Text>
                </TouchableOpacity>
              )}
            </View>

            {audioUri && (
              <Text className="text-green-600 mt-2 text-center">
                ✅ Voice note recorded
              </Text>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={submitComplaint}
            disabled={isSubmitting || locationLoading}
            className={`${
              isSubmitting || locationLoading ? "bg-gray-400" : "bg-blue-600"
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
                📤 Submit Complaint
              </Text>
            )}
          </TouchableOpacity>

          <Text className="text-gray-500 text-center mt-4 text-sm">
            Your complaint will be reviewed and forwarded to the appropriate
            department
          </Text>
        </View>
      </ScrollView>

      {/* Map Picker Modal */}
      <MapPicker
        visible={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        onLocationSelected={handleMapLocationSelected}
        initialLocation={
          location
            ? {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }
            : undefined
        }
      />
    </View>
  );
};

export default NewComplaint;
