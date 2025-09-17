import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppIcon } from "../components/IconComponent";
import { UserAvatar } from "../components/UserAvatar";
import { getThemeColors } from "../constants/Colors";
import { useClerkAuth } from "../contexts/ClerkAuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { DatabaseService } from "../lib/database";
import { Report } from "../lib/supabase";

const TrackingScreen = () => {
  const router = useRouter();
  const { isDark } = useTheme();
  const { user, isAuthenticated } = useClerkAuth();
  const colors = getThemeColors(isDark);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserReports();
    } else if (!isAuthenticated) {
      setLoading(false); // Stop loading if not authenticated
    }
  }, [isAuthenticated, user]);

  const loadUserReports = async () => {
    if (!user) {
      console.log("❌ No user found in tracking screen");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("🔍 Loading user reports for tracking, user ID:", user.id);
      const userReports = await DatabaseService.getUserReports(user.id);
      console.log(
        "✅ Loaded reports for tracking:",
        userReports.length,
        "reports"
      );
      console.log("Reports data:", userReports);
      setReports(userReports);
    } catch (error) {
      console.error("❌ Error loading reports in tracking:", error);
    } finally {
      setLoading(false);
    }
  };

  // Test function to fetch all reports (for debugging)
  const testFetchAllReports = async () => {
    try {
      console.log("🧪 Testing fetch all reports...");
      const allReports = await DatabaseService.getUserReports(); // No user ID = all reports
      console.log("🧪 All reports in database:", allReports.length);
      console.log("🧪 All reports data:", allReports);

      if (allReports.length > 0) {
        alert(
          `Found ${allReports.length} total reports in database. Check console for details.`
        );
      } else {
        alert("No reports found in database at all.");
      }
    } catch (error) {
      console.error("🧪 Test fetch all reports error:", error);
      alert("Error fetching reports. Check console.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "bg-blue-500";
      case "in_progress":
        return "bg-yellow-500";
      case "resolved":
        return "bg-green-500";
      case "closed":
        return "bg-gray-500";
      default:
        return "bg-gray-400";
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
      case "closed":
        return "Closed";
      default:
        return "Draft";
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.secondary }}>
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor={colors.header}
        />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={{ color: colors.text, marginTop: 16 }}>
            Loading your reports...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
            Track Reports
          </Text>

          <UserAvatar size={35} />
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: 24 }}>
          {/* Debug Info */}
          {__DEV__ && (
            <View
              style={{
                backgroundColor: colors.card,
                padding: 12,
                borderRadius: 8,
                marginBottom: 16,
              }}
            >
              <Text style={{ color: colors.text, fontSize: 12 }}>
                DEBUG: User ID: {user?.id || "No user"} | Reports:{" "}
                {reports.length} | Loading: {loading.toString()}
              </Text>
            </View>
          )}

          {reports.length === 0 ? (
            <View className="items-center justify-center py-16">
              <AppIcon icon="reports" size={64} />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: colors.text,
                  marginBottom: 8,
                }}
              >
                No Reports Yet
              </Text>
              <Text
                style={{
                  color: colors.textSecondary,
                  textAlign: "center",
                  marginBottom: 24,
                }}
              >
                You haven't submitted any reports yet.{"\n"}
                Start by reporting an issue in your community.
              </Text>

              {/* Refresh Button */}
              <TouchableOpacity
                style={{
                  backgroundColor: colors.secondary,
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderRadius: 12,
                  marginBottom: 12,
                }}
                onPress={loadUserReports}
                disabled={loading}
              >
                <Text style={{ color: colors.text, fontWeight: "600" }}>
                  {loading ? "Refreshing..." : "🔄 Refresh"}
                </Text>
              </TouchableOpacity>

              {/* Debug: Test All Reports Button */}
              {__DEV__ && (
                <TouchableOpacity
                  style={{
                    backgroundColor: colors.warning,
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                    borderRadius: 12,
                    marginBottom: 12,
                  }}
                  onPress={testFetchAllReports}
                >
                  <Text style={{ color: "white", fontWeight: "600" }}>
                    🧪 Test: Fetch All Reports
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={{
                  backgroundColor: colors.accent,
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderRadius: 12,
                }}
                onPress={() => router.push("./report")}
              >
                <Text style={{ color: "white", fontWeight: "600" }}>
                  Create Report
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: colors.text,
                  marginBottom: 16,
                }}
              >
                Your Reports ({reports.length})
              </Text>

              {reports.map((report) => (
                <TouchableOpacity
                  key={report.id}
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 16,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                  onPress={() =>
                    router.push({
                      pathname: "./complaint-details",
                      params: { id: report.id },
                    })
                  }
                >
                  <View className="flex-row items-start justify-between mb-2">
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: colors.text,
                        flex: 1,
                        marginRight: 12,
                      }}
                    >
                      {report.title}
                    </Text>
                    <View
                      className={`${getStatusColor(report.status)} px-3 py-1 rounded-full`}
                    >
                      <Text className="text-white text-xs font-medium">
                        {getStatusText(report.status)}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 14,
                      marginBottom: 8,
                    }}
                    numberOfLines={2}
                  >
                    {report.description}
                  </Text>

                  <View className="flex-row items-center justify-between">
                    <Text
                      style={{
                        color: colors.accent,
                        fontSize: 12,
                        fontWeight: "500",
                      }}
                    >
                      {report.category}
                    </Text>
                    <Text
                      style={{
                        color: colors.textSecondary,
                        fontSize: 12,
                      }}
                    >
                      {report.created_at
                        ? new Date(report.created_at).toLocaleDateString()
                        : "Unknown date"}
                    </Text>
                  </View>

                  {report.address && (
                    <Text
                      style={{
                        color: colors.textSecondary,
                        fontSize: 12,
                        marginTop: 4,
                      }}
                    >
                      📍 {report.address}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TrackingScreen;
