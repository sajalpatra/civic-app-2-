import { useRouter } from "expo-router";
import React from "react";
import { StatusBar, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getThemeColors } from "../constants/Colors";
import { useTheme } from "../contexts/ThemeContext";
import { ThemeToggle } from "./ThemeToggle";

interface ThemedLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  showThemeToggle?: boolean;
  headerStyle?: "default" | "minimal";
}

export const ThemedLayout: React.FC<ThemedLayoutProps> = ({
  children,
  title,
  showBackButton = true,
  showThemeToggle = false,
  headerStyle = "default",
}) => {
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);
  const router = useRouter();

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-gray-800" : "bg-gray-50"}`}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.header}
        translucent={false}
      />

      {/* Header */}
      {title && (
        <View
          className={`${isDark ? "bg-gray-800" : "bg-white"} ${headerStyle === "minimal" ? "pb-4" : "pb-6"} px-6 shadow-md`}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              {showBackButton && (
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
              )}
              <Text
                className={`${headerStyle === "minimal" ? "text-xl" : "text-2xl"} font-bold ${isDark ? "text-white" : "text-gray-800"}`}
              >
                {title}
              </Text>
            </View>

            {showThemeToggle && <ThemeToggle size={20} />}
          </View>
        </View>
      )}

      {children}
    </SafeAreaView>
  );
};

// Themed Card Component
interface ThemedCardProps {
  children: React.ReactNode;
  style?: object;
  padding?: "sm" | "md" | "lg";
}

export const ThemedCard: React.FC<ThemedCardProps> = ({
  children,
  style = {},
  padding = "md",
}) => {
  const { isDark } = useTheme();

  const paddingClass = {
    sm: "p-3",
    md: "p-6",
    lg: "p-8",
  }[padding];

  return (
    <View
      className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-2xl ${paddingClass} shadow-md`}
      style={style}
    >
      {children}
    </View>
  );
};

// Themed Text Components
interface ThemedTextProps {
  children: React.ReactNode;
  variant?: "title" | "subtitle" | "body" | "caption" | "muted";
  style?: object;
  className?: string;
}

export const ThemedText: React.FC<ThemedTextProps> = ({
  children,
  variant = "body",
  style = {},
  className = "",
}) => {
  const { isDark } = useTheme();

  const getTextClasses = () => {
    const baseColor = isDark ? "text-white" : "text-gray-800";
    const secondaryColor = isDark ? "text-gray-300" : "text-gray-600";
    const mutedColor = isDark ? "text-gray-400" : "text-gray-500";

    switch (variant) {
      case "title":
        return `text-2xl font-bold ${baseColor}`;
      case "subtitle":
        return `text-lg font-semibold ${baseColor}`;
      case "body":
        return `text-base ${baseColor}`;
      case "caption":
        return `text-sm ${secondaryColor}`;
      case "muted":
        return `text-sm ${mutedColor}`;
      default:
        return `text-base ${baseColor}`;
    }
  };

  return (
    <Text className={`${getTextClasses()} ${className}`} style={style}>
      {children}
    </Text>
  );
};

// Themed Button Component
interface ThemedButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: "primary" | "secondary" | "success" | "warning" | "error";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
}

export const ThemedButton: React.FC<ThemedButtonProps> = ({
  children,
  onPress,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
}) => {
  const { isDark } = useTheme();

  const getButtonClasses = () => {
    const sizeClasses = {
      sm: "py-2 px-4 text-sm",
      md: "py-3 px-5 text-base",
      lg: "py-4 px-6 text-lg",
    };

    const variantClasses = {
      primary: "bg-blue-600 text-white",
      secondary: isDark
        ? "bg-gray-700 text-white"
        : "bg-gray-200 text-gray-800",
      success: "bg-green-600 text-white",
      warning: "bg-yellow-500 text-white",
      error: "bg-red-600 text-white",
    };

    const baseClasses = "rounded-xl items-center justify-center font-semibold";
    const disabledClass = disabled ? "opacity-60" : "";

    return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabledClass}`;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`${getButtonClasses()} ${className}`}
    >
      <Text
        className="font-semibold"
        style={{
          color: variant === "secondary" && !isDark ? "#1f2937" : "white",
        }}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
};
