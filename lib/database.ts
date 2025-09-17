import AsyncStorage from "@react-native-async-storage/async-storage";
import { Report, supabase } from "./supabase";

// Extended type for local storage
interface LocalReport extends Report {
  sync_status?: "pending" | "synced";
}

export class DatabaseService {
  // Create a new report
  static async createReport(
    reportData: Omit<Report, "id" | "created_at" | "updated_at">
  ): Promise<Report | null> {
    try {
      console.log("🚀 Creating report in Supabase:", {
        user_id: reportData.user_id,
        title: reportData.title,
        category: reportData.category,
        status: reportData.status,
      });

      const { data, error } = await supabase
        .from("reports")
        .insert([
          {
            ...reportData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("❌ Error creating report:", error);
        // Fallback to local storage if database fails
        await this.saveReportLocally(reportData);
        return null;
      }

      console.log("✅ Report created successfully:", data);
      return data;
    } catch (error) {
      console.error("❌ Database connection error:", error);
      // Fallback to local storage
      await this.saveReportLocally(reportData);
      return null;
    }
  }

  // Get all reports for a user
  static async getUserReports(userId?: string): Promise<Report[]> {
    try {
      console.log(
        "🔍 DatabaseService.getUserReports called with userId:",
        userId
      );

      let query = supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (userId) {
        console.log("🔽 Filtering reports by user_id:", userId);
        query = query.eq("user_id", userId);
      } else {
        console.log("📄 Fetching all reports (no userId filter)");
      }

      const { data, error } = await query;

      if (error) {
        console.error("❌ Error fetching reports from Supabase:", error);
        // Fallback to local storage
        const localReports = await this.getLocalReports();
        console.log("📱 Falling back to local reports:", localReports.length);
        return localReports;
      }

      console.log(
        "✅ Successfully fetched reports from Supabase:",
        data?.length || 0
      );
      console.log("📊 Reports data preview:", data?.slice(0, 2)); // Show first 2 reports for debugging

      // Images are now stored as base64 data URIs in the database
      return data || [];
    } catch (error) {
      console.error("❌ Database connection error:", error);
      // Fallback to local storage
      const localReports = await this.getLocalReports();
      console.log(
        "📱 Falling back to local reports due to connection error:",
        localReports.length
      );
      return localReports;
    }
  }

  // Get reports by location (nearby issues)
  static async getNearbyReports(
    latitude: number,
    longitude: number,
    radiusKm: number = 5
  ): Promise<Report[]> {
    try {
      // Using Supabase PostGIS extension for location queries
      const { data, error } = await supabase.rpc("get_nearby_reports", {
        lat: latitude,
        lng: longitude,
        radius_km: radiusKm,
      });

      if (error) {
        console.error("Error fetching nearby reports:", error);
        return await this.getLocalReports();
      }

      // Images are now stored as base64 data URIs in the database
      return data || [];
    } catch (error) {
      console.error("Database connection error:", error);
      return await this.getLocalReports();
    }
  }

  // Update report status
  static async updateReportStatus(
    reportId: string,
    status: Report["status"]
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("reports")
        .update({
          status,
          updated_at: new Date().toISOString(),
          ...(status === "resolved"
            ? { resolved_at: new Date().toISOString() }
            : {}),
        })
        .eq("id", reportId);

      if (error) {
        console.error("Error updating report status:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Database connection error:", error);
      return false;
    }
  }

  // Upload photo to Supabase Storage
  static async uploadPhoto(
    file: File | Blob,
    fileName: string
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase.storage
        .from("report-photos")
        .upload(`${Date.now()}-${fileName}`, file);

      if (error) {
        console.error("Error uploading photo:", error);
        return null;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("report-photos")
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error("Storage connection error:", error);
      return null;
    }
  }

  // Fallback: Save report to local storage
  private static async saveReportLocally(reportData: any): Promise<void> {
    try {
      const localReports = await this.getLocalReports();
      const newReport = {
        ...reportData,
        id: `local-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sync_status: "pending", // Mark for later sync
      };

      localReports.push(newReport);
      await AsyncStorage.setItem("local_reports", JSON.stringify(localReports));
      console.log("Report saved locally for later sync");
    } catch (error) {
      console.error("Error saving to local storage:", error);
    }
  }

  // Get reports from local storage
  private static async getLocalReports(): Promise<LocalReport[]> {
    try {
      const localData = await AsyncStorage.getItem("local_reports");
      return localData ? JSON.parse(localData) : [];
    } catch (error) {
      console.error("Error reading local reports:", error);
      return [];
    }
  }

  // Sync local reports to database when connection is restored
  static async syncLocalReports(): Promise<void> {
    try {
      const localReports = await this.getLocalReports();
      const pendingReports = localReports.filter(
        (report) => report.sync_status === "pending"
      );

      for (const report of pendingReports) {
        const { sync_status, ...reportData } = report;
        await this.createReport(reportData);
      }

      // Remove synced reports from local storage
      const remainingReports = localReports.filter(
        (report) => report.sync_status !== "pending"
      );
      await AsyncStorage.setItem(
        "local_reports",
        JSON.stringify(remainingReports)
      );

      console.log(`Synced ${pendingReports.length} local reports to database`);
    } catch (error) {
      console.error("Error syncing local reports:", error);
    }
  }

  // Get statistics
  static async getReportStats(): Promise<{
    total: number;
    resolved: number;
    pending: number;
    inProgress: number;
  }> {
    try {
      const { data, error } = await supabase.from("reports").select("status");

      if (error) {
        console.error("Error fetching stats:", error);
        // Fallback to local stats
        const localReports = await this.getLocalReports();
        return this.calculateStatsFromReports(localReports);
      }

      // Convert the data to match our Report type
      const reports =
        data?.map((item: any) => ({
          ...item,
          status: item.status as Report["status"],
        })) || [];
      return this.calculateStatsFromReports(reports as Report[]);
    } catch (error) {
      console.error("Database connection error:", error);
      const localReports = await this.getLocalReports();
      return this.calculateStatsFromReports(localReports);
    }
  }

  // Get user-specific statistics
  static async getUserStats(userId: string): Promise<{
    reportsSubmitted: number;
    issuesResolved: number;
    communityPoints: number;
    upvotesReceived: number;
    memberSince: string;
  }> {
    try {
      console.log("📊 Fetching user stats for:", userId);

      // Get user's reports
      const userReports = await this.getUserReports(userId);

      const reportsSubmitted = userReports.length;
      const issuesResolved = userReports.filter(
        (r) => r.status === "resolved"
      ).length;

      // Calculate community points (simple algorithm)
      // 10 points per submitted report, 25 points per resolved issue
      const communityPoints = reportsSubmitted * 10 + issuesResolved * 25;

      // For now, we'll use a simple calculation for upvotes
      // In a real app, you'd have a separate upvotes table
      const upvotesReceived = Math.floor(
        reportsSubmitted * 1.5 + issuesResolved * 3
      );

      // Get member since date (from first report or current date if no reports)
      const memberSince =
        userReports.length > 0
          ? userReports[userReports.length - 1].created_at
          : new Date().toISOString();

      const stats = {
        reportsSubmitted,
        issuesResolved,
        communityPoints,
        upvotesReceived,
        memberSince,
      };

      console.log("✅ User stats calculated:", stats);
      return stats;
    } catch (error) {
      console.error("❌ Error fetching user stats:", error);
      // Return default stats on error
      return {
        reportsSubmitted: 0,
        issuesResolved: 0,
        communityPoints: 0,
        upvotesReceived: 0,
        memberSince: new Date().toISOString(),
      };
    }
  }

  private static calculateStatsFromReports(reports: Report[]): {
    total: number;
    resolved: number;
    pending: number;
    inProgress: number;
  } {
    return {
      total: reports.length,
      resolved: reports.filter((r) => r.status === "resolved").length,
      pending: reports.filter(
        (r) => r.status === "submitted" || r.status === "draft"
      ).length,
      inProgress: reports.filter((r) => r.status === "in_progress").length,
    };
  }
}
