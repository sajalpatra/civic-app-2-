import * as Notifications from "expo-notifications";
import { Platform, Alert } from "react-native";
import * as Device from "expo-device";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationData {
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: boolean;
  priority?: "default" | "low" | "high" | "max";
  categoryId?: string;
}

export interface ScheduledNotificationData extends NotificationData {
  trigger: {
    seconds?: number;
    date?: Date;
    repeats?: boolean;
    hour?: number;
    minute?: number;
    weekday?: number;
  };
}

class NotificationService {
  private expoPushToken: string | null = null;

  /**
   * Initialize notification service
   * Call this in your app startup (App.tsx or _layout.tsx)
   */
  async initialize(): Promise<void> {
    try {
      // For development in Expo Go, we only use local notifications
      // Remote push notifications require a development build (EAS Build)
      if (Device.isDevice) {
        await this.registerForPushNotificationsAsync();
      }
      await this.setupNotificationChannels();
      console.log(
        "✅ Notification service initialized successfully (local notifications ready)"
      );
    } catch (error) {
      console.error("❌ Failed to initialize notifications:", error);
      // Don't throw - allow app to continue without notifications
    }
  }

  /**
   * Request permission and get push token
   */
  async registerForPushNotificationsAsync(): Promise<string | null> {
    let token;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please enable notifications to receive important updates about your complaints and civic issues.",
          [{ text: "OK" }]
        );
        return null;
      }

      // Local notifications are fully supported
      // Remote push notifications require EAS Development Build
      // For Expo Go development, we focus on local notifications
      console.log(
        "Notification permissions granted - local notifications ready"
      );

      // Note: Remote push notifications are disabled in Expo Go (SDK 53+)
      // To enable remote push notifications:
      // 1. Set up EAS Build: npx eas build:configure
      // 2. Create development build: npx eas build --profile development
      // 3. Install development build on device
      // 4. Uncomment the code below and add your Expo project ID

      /*
      try {
        token = (await Notifications.getExpoPushTokenAsync({
          projectId: 'your-expo-project-id', // Replace with your actual project ID
        })).data;
        this.expoPushToken = token;
        console.log('Push token acquired:', token);
      } catch (error) {
        console.log('Push token not available:', error);
      }
      */
    } else {
      console.log("Using simulator - local notifications only");
    }

    return token || null;
  }

  /**
   * Set up notification channels (Android)
   */
  async setupNotificationChannels(): Promise<void> {
    if (Platform.OS === "android") {
      // Complaint Updates Channel
      await Notifications.setNotificationChannelAsync("complaint-updates", {
        name: "Complaint Updates",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#2196F3",
        description: "Updates on your submitted complaints",
      });

      // Reminders Channel
      await Notifications.setNotificationChannelAsync("reminders", {
        name: "Reminders",
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250],
        lightColor: "#FFC107",
        description: "Reminder notifications",
      });

      // Emergency Alerts Channel
      await Notifications.setNotificationChannelAsync("emergency", {
        name: "Emergency Alerts",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 250, 500],
        lightColor: "#F44336",
        description: "Emergency civic alerts",
      });

      // General Channel
      await Notifications.setNotificationChannelAsync("general", {
        name: "General Notifications",
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250],
        lightColor: "#4CAF50",
        description: "General app notifications",
      });
    }
  }

  /**
   * Show immediate notification
   */
  async showNotification(notificationData: NotificationData): Promise<string> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        console.warn("Notification permission not granted");
        return "";
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notificationData.title,
          body: notificationData.body,
          data: notificationData.data || {},
          sound: notificationData.sound !== false,
          priority: this.mapPriority(notificationData.priority),
          categoryIdentifier: notificationData.categoryId,
        },
        trigger: null, // Show immediately
      });

      return notificationId;
    } catch (error) {
      console.error("Error showing notification:", error);
      return "";
    }
  }

  /**
   * Schedule a future notification
   */
  async scheduleNotification(
    notificationData: ScheduledNotificationData
  ): Promise<string> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        console.warn("Notification permission not granted");
        return "";
      }

      let trigger: any = null;

      if (notificationData.trigger.seconds) {
        trigger = {
          seconds: notificationData.trigger.seconds,
          repeats: notificationData.trigger.repeats || false,
        };
      } else if (notificationData.trigger.date) {
        trigger = {
          date: notificationData.trigger.date,
          repeats: notificationData.trigger.repeats || false,
        };
      } else if (
        notificationData.trigger.hour !== undefined &&
        notificationData.trigger.minute !== undefined
      ) {
        trigger = {
          hour: notificationData.trigger.hour,
          minute: notificationData.trigger.minute,
          repeats: notificationData.trigger.repeats || false,
        };

        if (notificationData.trigger.weekday !== undefined) {
          trigger.weekday = notificationData.trigger.weekday;
        }
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notificationData.title,
          body: notificationData.body,
          data: notificationData.data || {},
          sound: notificationData.sound !== false,
          priority: this.mapPriority(notificationData.priority),
          categoryIdentifier: notificationData.categoryId,
        },
        trigger,
      });

      return notificationId;
    } catch (error) {
      console.error("Error scheduling notification:", error);
      return "";
    }
  }

  /**
   * Cancel a specific notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error("Error canceling notification:", error);
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error("Error canceling all notifications:", error);
    }
  }

  /**
   * Get all scheduled notifications
   */
  async getScheduledNotifications(): Promise<
    Notifications.NotificationRequest[]
  > {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error("Error getting scheduled notifications:", error);
      return [];
    }
  }

  /**
   * Check notification permissions
   */
  async getPermissionStatus(): Promise<string> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status;
    } catch (error) {
      console.error("Error getting permission status:", error);
      return "undetermined";
    }
  }

  /**
   * Get the push token
   */
  getPushToken(): string | null {
    return this.expoPushToken;
  }

  /**
   * Enable push notifications with a valid project ID
   * Call this method when you have your actual Expo project ID
   */
  async enablePushNotifications(projectId: string): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        console.log("Push notifications require a physical device");
        return null;
      }

      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        console.log("Notification permissions not granted");
        return null;
      }

      const token = (
        await Notifications.getExpoPushTokenAsync({
          projectId: projectId,
        })
      ).data;

      console.log("✅ Push notification token obtained:", token);
      this.expoPushToken = token;
      return token;
    } catch (error) {
      console.error("❌ Error enabling push notifications:", error);
      return null;
    }
  }

  /**
   * Map priority to platform-specific values
   */
  private mapPriority(
    priority?: string
  ): Notifications.AndroidNotificationPriority {
    switch (priority) {
      case "low":
        return Notifications.AndroidNotificationPriority.LOW;
      case "high":
        return Notifications.AndroidNotificationPriority.HIGH;
      case "max":
        return Notifications.AndroidNotificationPriority.MAX;
      default:
        return Notifications.AndroidNotificationPriority.DEFAULT;
    }
  }

  // Convenience methods for common notification types

  /**
   * Send complaint status update notification
   */
  async notifyComplaintUpdate(
    complaintId: string,
    status: string,
    details?: string
  ): Promise<string> {
    return this.showNotification({
      title: "📋 Complaint Update",
      body: `Your complaint #${complaintId} status: ${status}${details ? `. ${details}` : ""}`,
      data: { type: "complaint_update", complaintId, status },
      categoryId: "complaint-updates",
      priority: "high",
    });
  }

  /**
   * Send reminder notification
   */
  async notifyReminder(
    title: string,
    message: string,
    data?: Record<string, any>
  ): Promise<string> {
    return this.showNotification({
      title: `⏰ ${title}`,
      body: message,
      data: { type: "reminder", ...data },
      categoryId: "reminders",
      priority: "default",
    });
  }

  /**
   * Send emergency alert
   */
  async notifyEmergency(
    title: string,
    message: string,
    data?: Record<string, any>
  ): Promise<string> {
    return this.showNotification({
      title: `🚨 ${title}`,
      body: message,
      data: { type: "emergency", ...data },
      categoryId: "emergency",
      priority: "max",
    });
  }

  /**
   * Send general notification
   */
  async notifyGeneral(
    title: string,
    message: string,
    data?: Record<string, any>
  ): Promise<string> {
    return this.showNotification({
      title,
      body: message,
      data: { type: "general", ...data },
      categoryId: "general",
      priority: "default",
    });
  }

  /**
   * Schedule daily reminder
   */
  async scheduleDailyReminder(
    hour: number,
    minute: number,
    title: string,
    message: string
  ): Promise<string> {
    return this.scheduleNotification({
      title,
      body: message,
      data: { type: "daily_reminder" },
      categoryId: "reminders",
      trigger: {
        hour,
        minute,
        repeats: true,
      },
    });
  }

  /**
   * Schedule complaint follow-up reminder
   */
  async scheduleComplaintFollowUp(
    complaintId: string,
    daysFromNow: number
  ): Promise<string> {
    const followUpDate = new Date();
    followUpDate.setDate(followUpDate.getDate() + daysFromNow);

    return this.scheduleNotification({
      title: "📋 Complaint Follow-up",
      body: `Check the status of your complaint #${complaintId}`,
      data: { type: "complaint_followup", complaintId },
      categoryId: "reminders",
      trigger: {
        date: followUpDate,
      },
    });
  }

  /**
   * Test notification functionality
   */
  async testNotification(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        console.warn("Notification permission not granted for test");
        return false;
      }

      await this.showNotification({
        title: "🔔 Test Notification",
        body: "This is a test notification from Civic Reports app!",
        data: { type: "test", timestamp: Date.now() },
        categoryId: "general",
      });

      console.log("✅ Test notification sent successfully");
      return true;
    } catch (error) {
      console.error("❌ Test notification failed:", error);
      return false;
    }
  }

  /**
   * Send status update notification for complaint
   */
  async sendComplaintStatusUpdate(
    complaintId: string,
    status: string,
    title: string
  ): Promise<void> {
    const statusEmojis: { [key: string]: string } = {
      submitted: "📝",
      verified: "✅",
      in_progress: "🔧",
      resolved: "🎉",
      closed: "📋",
    };

    const emoji = statusEmojis[status] || "📄";

    await this.showNotification({
      title: `${emoji} Complaint Update`,
      body: `Your complaint "${title}" status: ${status.replace("_", " ").toUpperCase()}`,
      data: {
        type: "status_update",
        complaintId,
        status,
        title,
      },
      categoryId: "complaint-updates",
      priority: "high",
    });
  }
}

// Export singleton instance
export const NotificationManager = new NotificationService();

// Export notification event listeners for handling received notifications
export const addNotificationReceivedListener = (
  listener: (notification: Notifications.Notification) => void
) => {
  return Notifications.addNotificationReceivedListener(listener);
};

export const addNotificationResponseReceivedListener = (
  listener: (response: Notifications.NotificationResponse) => void
) => {
  return Notifications.addNotificationResponseReceivedListener(listener);
};

export default NotificationManager;
