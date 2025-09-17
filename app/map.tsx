import { useRouter } from "expo-router";
import React, { useState, useRef, useEffect } from "react";
import {
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { AppIcon } from "../components/IconComponent";
import { UserAvatar } from "../components/UserAvatar";
import { getThemeColors } from "../constants/Colors";
import { useClerkAuth } from "../contexts/ClerkAuthContext";
import { useTheme } from "../contexts/ThemeContext";
import ToastService from "../services/ToastService";

// Platform-specific imports
let MapView: any, Marker: any, PROVIDER_GOOGLE: any, MapViewClustering: any;

if (Platform.OS !== "web") {
  try {
    MapView = require("react-native-maps").default;
    Marker = require("react-native-maps").Marker;
    PROVIDER_GOOGLE = require("react-native-maps").PROVIDER_GOOGLE;
    MapViewClustering = require("react-native-map-clustering").default;
  } catch (error) {
    console.warn("Map components not available:", error);
    ToastService.warning({
      title: "Map Unavailable",
      message: "Map components could not be loaded. Showing list view instead.",
    });
  }
}

const MapScreen = () => {
  const router = useRouter();
  const { isDark } = useTheme();
  const { user } = useClerkAuth();
  const colors = getThemeColors(isDark);
  const mapRef = useRef<any>(null);
  const [userLocation, setUserLocation] = useState<any>(null);
  const [showMap, setShowMap] = useState(false);
  const [isWeb] = useState(Platform.OS === "web");

  // Sample civic issues data with coordinates
  const [issues] = useState([
    {
      id: "1",
      title: "Pothole on Main Street",
      category: "Roads",
      status: "in_progress",
      location: "Main Street & 1st Ave",
      distance: "0.2 miles",
      coordinate: {
        latitude: 37.78825,
        longitude: -122.4324,
      },
      description: "Large pothole causing traffic issues",
    },
    {
      id: "2",
      title: "Broken Street Light",
      category: "Infrastructure",
      status: "submitted",
      location: "Park Avenue",
      distance: "0.5 miles",
      coordinate: {
        latitude: 37.78925,
        longitude: -122.4334,
      },
      description: "Street light not working since last week",
    },
    {
      id: "3",
      title: "Illegal Dumping",
      category: "Environment",
      status: "resolved",
      location: "Industrial District",
      distance: "1.2 miles",
      coordinate: {
        latitude: 37.79025,
        longitude: -122.4344,
      },
      description: "Waste dumped near residential area",
    },
    {
      id: "4",
      title: "Water Leak",
      category: "Water",
      status: "submitted",
      location: "Oak Street",
      distance: "0.8 miles",
      coordinate: {
        latitude: 37.78725,
        longitude: -122.4314,
      },
      description: "Water pipe burst on sidewalk",
    },
    {
      id: "5",
      title: "Graffiti Removal",
      category: "Maintenance",
      status: "in_progress",
      location: "Community Center",
      distance: "1.5 miles",
      coordinate: {
        latitude: 37.79125,
        longitude: -122.4354,
      },
      description: "Graffiti on public building walls",
    },
    // Adding more markers for clustering demonstration
    {
      id: "6",
      title: "Damaged Sidewalk",
      category: "Infrastructure",
      status: "submitted",
      location: "Elm Street",
      distance: "0.3 miles",
      coordinate: {
        latitude: 37.7885,
        longitude: -122.432,
      },
      description: "Cracked sidewalk creating safety hazard",
    },
    {
      id: "7",
      title: "Noise Complaint",
      category: "Public Safety",
      status: "resolved",
      location: "Downtown Area",
      distance: "0.6 miles",
      coordinate: {
        latitude: 37.7895,
        longitude: -122.433,
      },
      description: "Excessive noise from construction",
    },
    {
      id: "8",
      title: "Trash Overflow",
      category: "Sanitation",
      status: "submitted",
      location: "City Park",
      distance: "1.0 miles",
      coordinate: {
        latitude: 37.7905,
        longitude: -122.434,
      },
      description: "Public trash bin overflowing",
    },
  ]);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      ToastService.showLoading("Getting your location...");

      if (Platform.OS === "web") {
        // For web, set a default location
        setUserLocation({
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        setShowMap(true);
        ToastService.hideLoading();
        ToastService.info({
          title: "Location Set",
          message: "Using default location for web platform.",
        });
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        ToastService.hideLoading();
        ToastService.permissionError(
          "Location permission is required to show your position on the map."
        );
        // Set default location anyway
        setUserLocation({
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        setShowMap(true);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      setShowMap(true);
      ToastService.hideLoading();
      ToastService.success({
        title: "Location Found!",
        message: "Your location has been detected successfully.",
        duration: 2000,
      });
    } catch (error) {
      console.error("Error getting location:", error);
      ToastService.hideLoading();

      // Set default location (San Francisco) if location access fails
      setUserLocation({
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      setShowMap(true);

      ToastService.warning({
        title: "Location Error",
        message: "Could not get your location. Using default location.",
        duration: 4000,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "#3B82F6"; // Blue
      case "in_progress":
        return "#F59E0B"; // Yellow
      case "resolved":
        return "#10B981"; // Green
      default:
        return "#6B7280"; // Gray
    }
  };

  const getCategoryIconName = (category: string) => {
    switch (category.toLowerCase()) {
      case "roads":
        return "pothole";
      case "infrastructure":
        return "general";
      case "environment":
        return "general";
      case "water":
        return "water";
      case "maintenance":
        return "general";
      case "public safety":
        return "warning";
      case "sanitation":
        return "waste";
      default:
        return "location";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "roads":
        return "🛣️";
      case "infrastructure":
        return "🏗️";
      case "environment":
        return "🌱";
      case "water":
        return "💧";
      case "maintenance":
        return "🔧";
      case "public safety":
        return "🚨";
      case "sanitation":
        return "🗑️";
      default:
        return "📍";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "submitted":
        return "Submitted";
      case "in_progress":
        return "In Progress";
      case "resolved":
        return "Resolved";
      default:
        return "Unknown";
    }
  };

  const onMarkerPress = (issue: any) => {
    ToastService.info({
      title: `${getCategoryIcon(issue.category)} ${issue.title}`,
      message: `Status: ${getStatusText(issue.status)}\nLocation: ${issue.location}\n${issue.description}`,
      duration: 6000,
      onPress: () => {
        // Navigate to issue details or handle as needed
        ToastService.info({
          title: "Navigation",
          message: "Opening issue details...",
          duration: 2000,
        });
        console.log("Navigate to issue details:", issue.id);
      },
    });
  };

  const focusOnUserLocation = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion(userLocation, 1000);
      ToastService.success({
        title: "Location Centered",
        message: "Map centered on your location.",
        duration: 2000,
      });
    } else {
      ToastService.warning({
        title: "Location Unavailable",
        message: "Your location is not available yet.",
        duration: 3000,
      });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.secondary }}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.header}
      />

      {/* Header */}
      <View
        style={{
          backgroundColor: colors.header,
          paddingVertical: 16,
          paddingHorizontal: 24,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.accent + "20",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: colors.accent, fontSize: 18 }}>←</Text>
          </TouchableOpacity>

          <Text
            style={{
              fontSize: 20,
              fontWeight: "600",
              color: colors.headerText,
            }}
          >
            Issues Map
          </Text>

          <UserAvatar size={35} />
        </View>
      </View>

      {/* Map Container */}
      <View style={{ flex: 1 }}>
        {showMap && userLocation ? (
          <>
            {!isWeb && MapViewClustering ? (
              <>
                {/* Native Map View with Clustering */}
                <MapViewClustering
                  ref={mapRef}
                  style={{
                    flex: 1,
                    width: Dimensions.get("window").width,
                    height: Dimensions.get("window").height - 100,
                  }}
                  provider={PROVIDER_GOOGLE}
                  initialRegion={userLocation}
                  showsUserLocation={true}
                  showsMyLocationButton={false}
                  clusterColor={colors.accent}
                  clusterTextColor="#FFFFFF"
                  clusterFontFamily="System"
                  radius={50}
                  extent={512}
                  nodeSize={64}
                  animationEnabled={true}
                  layoutAnimationConf={{
                    duration: 300,
                  }}
                  edgePadding={{
                    top: 50,
                    left: 50,
                    bottom: 50,
                    right: 50,
                  }}
                >
                  {/* User Location Marker */}
                  {userLocation && (
                    <Marker
                      coordinate={userLocation}
                      title="Your Location"
                      description="You are here"
                      pinColor="blue"
                    />
                  )}

                  {/* Issue Markers */}
                  {issues.map((issue) => (
                    <Marker
                      key={issue.id}
                      coordinate={issue.coordinate}
                      title={issue.title}
                      description={`${issue.category} - ${getStatusText(issue.status)}`}
                      onPress={() => onMarkerPress(issue)}
                      pinColor={getStatusColor(issue.status)}
                    />
                  ))}
                </MapViewClustering>

                {/* Floating Action Buttons */}
                <View
                  style={{
                    position: "absolute",
                    bottom: 30,
                    right: 20,
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  {/* My Location Button */}
                  <TouchableOpacity
                    onPress={focusOnUserLocation}
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 25,
                      backgroundColor: colors.accent,
                      alignItems: "center",
                      justifyContent: "center",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.25,
                      shadowRadius: 4,
                      elevation: 5,
                    }}
                  >
                    <Text style={{ color: "white", fontSize: 18 }}>📍</Text>
                  </TouchableOpacity>

                  {/* Report Issue Button */}
                  <TouchableOpacity
                    onPress={() => router.push("/new-complaint")}
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 25,
                      backgroundColor: "#10B981",
                      alignItems: "center",
                      justifyContent: "center",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.25,
                      shadowRadius: 4,
                      elevation: 5,
                    }}
                  >
                    <Text style={{ color: "white", fontSize: 18 }}>+</Text>
                  </TouchableOpacity>
                </View>

                {/* Legend */}
                <View
                  style={{
                    position: "absolute",
                    top: 20,
                    left: 20,
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    borderRadius: 12,
                    padding: 12,
                    minWidth: 150,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.15,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: "#1F2937",
                      marginBottom: 8,
                    }}
                  >
                    Issue Status
                  </Text>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 4,
                    }}
                  >
                    <View
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: "#3B82F6",
                        marginRight: 8,
                      }}
                    />
                    <Text style={{ fontSize: 12, color: "#6B7280" }}>
                      Submitted
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 4,
                    }}
                  >
                    <View
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: "#F59E0B",
                        marginRight: 8,
                      }}
                    />
                    <Text style={{ fontSize: 12, color: "#6B7280" }}>
                      In Progress
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: "#10B981",
                        marginRight: 8,
                      }}
                    />
                    <Text style={{ fontSize: 12, color: "#6B7280" }}>
                      Resolved
                    </Text>
                  </View>
                </View>
              </>
            ) : (
              // Web Fallback - Interactive Issues List
              <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 20 }}
              >
                {/* Map Placeholder for Web */}
                <View
                  style={{
                    height: 300,
                    backgroundColor: colors.card,
                    borderRadius: 16,
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 20,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <AppIcon icon="map" size={48} />
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "600",
                      color: colors.text,
                      marginBottom: 8,
                    }}
                  >
                    Interactive Map
                  </Text>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      textAlign: "center",
                      paddingHorizontal: 32,
                    }}
                  >
                    Native map features available on mobile devices.{"\n"}
                    Viewing issue list on web platform.
                  </Text>
                </View>

                {/* Web Statistics Grid */}
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                    marginBottom: 20,
                  }}
                >
                  <View
                    style={{
                      width: "48%",
                      backgroundColor: "#3B82F6" + "20",
                      padding: 16,
                      borderRadius: 12,
                      marginBottom: 12,
                    }}
                  >
                    <Text
                      style={{
                        color: "#3B82F6",
                        fontSize: 24,
                        fontWeight: "bold",
                      }}
                    >
                      {issues.filter((i) => i.status === "submitted").length}
                    </Text>
                    <Text style={{ color: colors.text, fontSize: 14 }}>
                      Submitted
                    </Text>
                  </View>

                  <View
                    style={{
                      width: "48%",
                      backgroundColor: "#F59E0B" + "20",
                      padding: 16,
                      borderRadius: 12,
                      marginBottom: 12,
                    }}
                  >
                    <Text
                      style={{
                        color: "#F59E0B",
                        fontSize: 24,
                        fontWeight: "bold",
                      }}
                    >
                      {issues.filter((i) => i.status === "in_progress").length}
                    </Text>
                    <Text style={{ color: colors.text, fontSize: 14 }}>
                      In Progress
                    </Text>
                  </View>

                  <View
                    style={{
                      width: "48%",
                      backgroundColor: "#10B981" + "20",
                      padding: 16,
                      borderRadius: 12,
                    }}
                  >
                    <Text
                      style={{
                        color: "#10B981",
                        fontSize: 24,
                        fontWeight: "bold",
                      }}
                    >
                      {issues.filter((i) => i.status === "resolved").length}
                    </Text>
                    <Text style={{ color: colors.text, fontSize: 14 }}>
                      Resolved
                    </Text>
                  </View>

                  <View
                    style={{
                      width: "48%",
                      backgroundColor: colors.accent + "20",
                      padding: 16,
                      borderRadius: 12,
                    }}
                  >
                    <Text
                      style={{
                        color: colors.accent,
                        fontSize: 24,
                        fontWeight: "bold",
                      }}
                    >
                      {issues.length}
                    </Text>
                    <Text style={{ color: colors.text, fontSize: 14 }}>
                      Total Issues
                    </Text>
                  </View>
                </View>

                {/* Issues List for Web */}
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "600",
                    color: colors.text,
                    marginBottom: 16,
                  }}
                >
                  All Issues
                </Text>

                {issues.map((issue) => (
                  <TouchableOpacity
                    key={issue.id}
                    style={{
                      backgroundColor: colors.card,
                      borderRadius: 16,
                      padding: 16,
                      marginBottom: 12,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 2,
                    }}
                    onPress={() => onMarkerPress(issue)}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "600",
                          color: colors.text,
                          flex: 1,
                          marginRight: 12,
                        }}
                      >
                        {getCategoryIcon(issue.category)} {issue.title}
                      </Text>
                      <View
                        style={{
                          backgroundColor: getStatusColor(issue.status),
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 12,
                        }}
                      >
                        <Text
                          style={{
                            color: "white",
                            fontSize: 12,
                            fontWeight: "600",
                          }}
                        >
                          {getStatusText(issue.status)}
                        </Text>
                      </View>
                    </View>

                    <Text
                      style={{
                        color: colors.accent,
                        fontSize: 14,
                        fontWeight: "500",
                        marginBottom: 4,
                      }}
                    >
                      📍 {issue.location}
                    </Text>

                    <Text
                      style={{
                        color: colors.textSecondary,
                        fontSize: 12,
                      }}
                    >
                      {issue.description}
                    </Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  style={{
                    backgroundColor: colors.accent,
                    paddingVertical: 16,
                    borderRadius: 12,
                    marginTop: 16,
                    alignItems: "center",
                  }}
                  onPress={() => router.push("/new-complaint")}
                >
                  <Text
                    style={{
                      color: "white",
                      fontSize: 16,
                      fontWeight: "600",
                    }}
                  >
                    Report New Issue
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </>
        ) : (
          // Loading state
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: colors.secondary,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                color: colors.text,
                marginBottom: 10,
              }}
            >
              {isWeb ? "Loading Issue List..." : "Loading Map..."}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: colors.textSecondary,
                textAlign: "center",
                paddingHorizontal: 40,
              }}
            >
              {isWeb
                ? "Web platform shows issue list view"
                : "Please allow location access to see nearby civic issues"}
            </Text>
          </View>
        )}
      </View>

      {/* Bottom Issue Summary - Only for Native platforms */}
      {!isWeb && (
        <View
          style={{
            backgroundColor: colors.header,
            paddingVertical: 12,
            paddingHorizontal: 20,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View
                style={{
                  backgroundColor: colors.accent + "20",
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: colors.accent,
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                >
                  Total: {issues.length}
                </Text>
              </View>

              <View
                style={{
                  backgroundColor: "#3B82F6" + "20",
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ color: "#3B82F6", fontSize: 12, fontWeight: "600" }}
                >
                  Submitted:{" "}
                  {issues.filter((i) => i.status === "submitted").length}
                </Text>
              </View>

              <View
                style={{
                  backgroundColor: "#F59E0B" + "20",
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ color: "#F59E0B", fontSize: 12, fontWeight: "600" }}
                >
                  In Progress:{" "}
                  {issues.filter((i) => i.status === "in_progress").length}
                </Text>
              </View>

              <View
                style={{
                  backgroundColor: "#10B981" + "20",
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ color: "#10B981", fontSize: 12, fontWeight: "600" }}
                >
                  Resolved:{" "}
                  {issues.filter((i) => i.status === "resolved").length}
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
};

export default MapScreen;
