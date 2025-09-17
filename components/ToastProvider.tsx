import React from "react";
import Toast, {
  BaseToast,
  ErrorToast,
  InfoToast,
} from "react-native-toast-message";
import { View, Text } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { getThemeColors } from "../constants/Colors";

export const ToastProvider = () => {
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);

  const toastConfig = {
    // Success Toast
    success: (props: any) => (
      <BaseToast
        {...props}
        style={{
          borderLeftColor: "#10B981",
          backgroundColor: colors.card,
          borderRadius: 12,
          marginHorizontal: 16,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
        }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
        text1Style={{
          fontSize: 16,
          fontWeight: "600",
          color: colors.text,
        }}
        text2Style={{
          fontSize: 14,
          color: colors.textSecondary,
          marginTop: 2,
        }}
        renderLeadingIcon={() => (
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: "#10B981",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
              alignSelf: "center",
            }}
          >
            <Text style={{ color: "white", fontSize: 16 }}>✓</Text>
          </View>
        )}
      />
    ),

    // Error Toast
    error: (props: any) => (
      <ErrorToast
        {...props}
        style={{
          borderLeftColor: "#EF4444",
          backgroundColor: colors.card,
          borderRadius: 12,
          marginHorizontal: 16,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
        }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
        text1Style={{
          fontSize: 16,
          fontWeight: "600",
          color: colors.text,
        }}
        text2Style={{
          fontSize: 14,
          color: colors.textSecondary,
          marginTop: 2,
        }}
        renderLeadingIcon={() => (
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: "#EF4444",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
              alignSelf: "center",
            }}
          >
            <Text style={{ color: "white", fontSize: 16 }}>✕</Text>
          </View>
        )}
      />
    ),

    // Info Toast
    info: (props: any) => (
      <InfoToast
        {...props}
        style={{
          borderLeftColor: "#3B82F6",
          backgroundColor: colors.card,
          borderRadius: 12,
          marginHorizontal: 16,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
        }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
        text1Style={{
          fontSize: 16,
          fontWeight: "600",
          color: colors.text,
        }}
        text2Style={{
          fontSize: 14,
          color: colors.textSecondary,
          marginTop: 2,
        }}
        renderLeadingIcon={() => (
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: "#3B82F6",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
              alignSelf: "center",
            }}
          >
            <Text style={{ color: "white", fontSize: 16 }}>i</Text>
          </View>
        )}
      />
    ),

    // Warning Toast
    warning: (props: any) => (
      <BaseToast
        {...props}
        style={{
          borderLeftColor: "#F59E0B",
          backgroundColor: colors.card,
          borderRadius: 12,
          marginHorizontal: 16,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
        }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
        text1Style={{
          fontSize: 16,
          fontWeight: "600",
          color: colors.text,
        }}
        text2Style={{
          fontSize: 14,
          color: colors.textSecondary,
          marginTop: 2,
        }}
        renderLeadingIcon={() => (
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: "#F59E0B",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
              alignSelf: "center",
            }}
          >
            <Text style={{ color: "white", fontSize: 16 }}>⚠</Text>
          </View>
        )}
      />
    ),

    // Loading Toast
    loading: (props: any) => (
      <BaseToast
        {...props}
        style={{
          borderLeftColor: "#6B7280",
          backgroundColor: colors.card,
          borderRadius: 12,
          marginHorizontal: 16,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
        }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
        text1Style={{
          fontSize: 16,
          fontWeight: "600",
          color: colors.text,
        }}
        text2Style={{
          fontSize: 14,
          color: colors.textSecondary,
          marginTop: 2,
        }}
        renderLeadingIcon={() => (
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: "#6B7280",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
              alignSelf: "center",
            }}
          >
            <Text style={{ color: "white", fontSize: 16 }}>⟳</Text>
          </View>
        )}
      />
    ),
  };

  return <Toast config={toastConfig} />;
};
