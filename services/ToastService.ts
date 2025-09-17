import Toast from "react-native-toast-message";

export interface ToastOptions {
  title: string;
  message?: string;
  duration?: number;
  position?: "top" | "bottom";
  onPress?: () => void;
  onHide?: () => void;
}

class ToastService {
  // Success notifications
  static success(options: ToastOptions) {
    Toast.show({
      type: "success",
      text1: options.title,
      text2: options.message,
      position: options.position || "top",
      visibilityTime: options.duration || 4000,
      autoHide: true,
      topOffset: 60,
      bottomOffset: 40,
      onPress: options.onPress,
      onHide: options.onHide,
    });
  }

  // Error notifications
  static error(options: ToastOptions) {
    Toast.show({
      type: "error",
      text1: options.title,
      text2: options.message,
      position: options.position || "top",
      visibilityTime: options.duration || 5000,
      autoHide: true,
      topOffset: 60,
      bottomOffset: 40,
      onPress: options.onPress,
      onHide: options.onHide,
    });
  }

  // Info notifications
  static info(options: ToastOptions) {
    Toast.show({
      type: "info",
      text1: options.title,
      text2: options.message,
      position: options.position || "top",
      visibilityTime: options.duration || 4000,
      autoHide: true,
      topOffset: 60,
      bottomOffset: 40,
      onPress: options.onPress,
      onHide: options.onHide,
    });
  }

  // Warning notifications
  static warning(options: ToastOptions) {
    Toast.show({
      type: "warning",
      text1: options.title,
      text2: options.message,
      position: options.position || "top",
      visibilityTime: options.duration || 4000,
      autoHide: true,
      topOffset: 60,
      bottomOffset: 40,
      onPress: options.onPress,
      onHide: options.onHide,
    });
  }

  // Loading notifications
  static loading(options: ToastOptions) {
    Toast.show({
      type: "loading",
      text1: options.title,
      text2: options.message,
      position: options.position || "top",
      visibilityTime: options.duration || 0, // 0 means it won't auto-hide
      autoHide: false,
      topOffset: 60,
      bottomOffset: 40,
      onPress: options.onPress,
      onHide: options.onHide,
    });
  }

  // Hide all toasts
  static hide() {
    Toast.hide();
  }

  // Specific error handling methods
  static networkError(message?: string) {
    this.error({
      title: "Network Error",
      message:
        message || "Please check your internet connection and try again.",
      duration: 5000,
    });
  }

  static authError(message?: string) {
    this.error({
      title: "Authentication Error",
      message: message || "Please log in again to continue.",
      duration: 5000,
    });
  }

  static validationError(message: string) {
    this.warning({
      title: "Validation Error",
      message: message,
      duration: 4000,
    });
  }

  static permissionError(message?: string) {
    this.warning({
      title: "Permission Required",
      message: message || "This feature requires additional permissions.",
      duration: 5000,
    });
  }

  static apiError(error: any) {
    let message = "An unexpected error occurred.";

    if (typeof error === "string") {
      message = error;
    } else if (error?.message) {
      message = error.message;
    } else if (error?.response?.data?.message) {
      message = error.response.data.message;
    } else if (error?.response?.statusText) {
      message = error.response.statusText;
    }

    this.error({
      title: "API Error",
      message: message,
      duration: 5000,
    });
  }

  // Success shortcuts
  static reportSubmitted() {
    this.success({
      title: "Report Submitted!",
      message: "Your civic report has been successfully submitted.",
      duration: 4000,
    });
  }

  static profileUpdated() {
    this.success({
      title: "Profile Updated",
      message: "Your profile information has been saved.",
      duration: 3000,
    });
  }

  static loginSuccess() {
    this.success({
      title: "Welcome Back!",
      message: "You have successfully logged in.",
      duration: 3000,
    });
  }

  static logoutSuccess() {
    this.info({
      title: "Logged Out",
      message: "You have been successfully logged out.",
      duration: 3000,
    });
  }

  // Loading states
  static showLoading(message: string = "Loading...") {
    this.loading({
      title: message,
      message: "Please wait",
    });
  }

  static hideLoading() {
    this.hide();
  }

  // Complex operations with loading
  static async withLoading<T>(
    operation: () => Promise<T>,
    loadingMessage: string = "Processing...",
    successMessage?: string,
    errorMessage?: string
  ): Promise<T> {
    try {
      this.showLoading(loadingMessage);
      const result = await operation();
      this.hideLoading();

      if (successMessage) {
        this.success({
          title: "Success",
          message: successMessage,
        });
      }

      return result;
    } catch (error) {
      this.hideLoading();

      if (errorMessage) {
        this.error({
          title: "Error",
          message: errorMessage,
        });
      } else {
        this.apiError(error);
      }

      throw error;
    }
  }
}

export default ToastService;
