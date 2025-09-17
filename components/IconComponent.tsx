import React from "react";
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
  FontAwesome5,
  Feather,
  AntDesign,
} from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { getThemeColors } from "../constants/Colors";

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  type?:
    | "ionicons"
    | "material"
    | "material-community"
    | "fontawesome5"
    | "feather"
    | "antdesign";
  style?: any;
}

export const IconComponent: React.FC<IconProps> = ({
  name,
  size = 24,
  color,
  type = "ionicons",
  style,
}) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme === "dark");
  const iconColor = color || colors.text;

  const renderIcon = () => {
    switch (type) {
      case "material":
        return (
          <MaterialIcons
            name={name as any}
            size={size}
            color={iconColor}
            style={style}
          />
        );
      case "material-community":
        return (
          <MaterialCommunityIcons
            name={name as any}
            size={size}
            color={iconColor}
            style={style}
          />
        );
      case "fontawesome5":
        return (
          <FontAwesome5
            name={name as any}
            size={size}
            color={iconColor}
            style={style}
          />
        );
      case "feather":
        return (
          <Feather
            name={name as any}
            size={size}
            color={iconColor}
            style={style}
          />
        );
      case "antdesign":
        return (
          <AntDesign
            name={name as any}
            size={size}
            color={iconColor}
            style={style}
          />
        );
      case "ionicons":
      default:
        return (
          <Ionicons
            name={name as any}
            size={size}
            color={iconColor}
            style={style}
          />
        );
    }
  };

  return renderIcon();
};

// Predefined icon sets for consistency across the app
export const AppIcons = {
  // Navigation
  home: { name: "home", type: "ionicons" as const },
  map: { name: "map", type: "ionicons" as const },
  add: { name: "add-circle", type: "ionicons" as const },
  profile: { name: "person-circle", type: "ionicons" as const },
  reports: { name: "list-circle", type: "ionicons" as const },

  // Actions
  camera: { name: "camera", type: "ionicons" as const },
  gallery: { name: "images", type: "ionicons" as const },
  location: { name: "location", type: "ionicons" as const },
  microphone: { name: "mic", type: "ionicons" as const },
  send: { name: "send", type: "ionicons" as const },
  search: { name: "search", type: "ionicons" as const },
  filter: { name: "filter", type: "ionicons" as const },

  // Status
  success: { name: "checkmark-circle", type: "ionicons" as const },
  error: { name: "alert-circle", type: "ionicons" as const },
  warning: { name: "warning", type: "ionicons" as const },
  info: { name: "information-circle", type: "ionicons" as const },
  pending: { name: "time", type: "ionicons" as const },

  // Categories
  pothole: { name: "road-variant", type: "material-community" as const },
  streetlight: { name: "lightbulb", type: "ionicons" as const },
  waste: { name: "trash", type: "ionicons" as const },
  water: { name: "water", type: "ionicons" as const },
  traffic: { name: "car", type: "ionicons" as const },
  noise: { name: "volume-high", type: "ionicons" as const },
  general: { name: "document-text", type: "ionicons" as const },

  // UI Elements
  close: { name: "close", type: "ionicons" as const },
  back: { name: "arrow-back", type: "ionicons" as const },
  forward: { name: "arrow-forward", type: "ionicons" as const },
  up: { name: "chevron-up", type: "ionicons" as const },
  down: { name: "chevron-down", type: "ionicons" as const },
  edit: { name: "pencil", type: "ionicons" as const },
  delete: { name: "trash", type: "ionicons" as const },
  save: { name: "save", type: "ionicons" as const },

  // Social
  like: { name: "thumbs-up", type: "ionicons" as const },
  dislike: { name: "thumbs-down", type: "ionicons" as const },
  share: { name: "share-social", type: "ionicons" as const },
  comment: { name: "chatbubble", type: "ionicons" as const },

  // Settings
  settings: { name: "settings", type: "ionicons" as const },
  logout: { name: "log-out", type: "ionicons" as const },
  theme: { name: "color-palette", type: "ionicons" as const },
  notification: { name: "notifications", type: "ionicons" as const },

  // Auth
  google: { name: "logo-google", type: "ionicons" as const },
  facebook: { name: "logo-facebook", type: "ionicons" as const },
  email: { name: "mail", type: "ionicons" as const },
  phone: { name: "call", type: "ionicons" as const },

  // Dashboard
  analytics: { name: "analytics", type: "ionicons" as const },
  chart: { name: "bar-chart", type: "ionicons" as const },
  stats: { name: "stats-chart", type: "ionicons" as const },
  progress: { name: "trending-up", type: "ionicons" as const },

  // Profile Stats
  document: { name: "document-text", type: "ionicons" as const },
  star: { name: "star", type: "ionicons" as const },
  trophy: { name: "trophy", type: "ionicons" as const },
  lock: { name: "lock-closed", type: "ionicons" as const },
  help: { name: "help-circle", type: "ionicons" as const },
  about: { name: "information-circle", type: "ionicons" as const },
  stop: { name: "stop", type: "ionicons" as const },
};

// Convenience component for predefined icons
interface AppIconProps {
  icon: keyof typeof AppIcons;
  size?: number;
  color?: string;
  style?: any;
}

export const AppIcon: React.FC<AppIconProps> = ({
  icon,
  size,
  color,
  style,
}) => {
  const iconConfig = AppIcons[icon];
  return (
    <IconComponent
      name={iconConfig.name}
      type={iconConfig.type}
      size={size}
      color={color}
      style={style}
    />
  );
};
