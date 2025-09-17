import React from "react";
import { TouchableOpacity, Text, Image, View } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../contexts/ThemeContext";
import { useClerkAuth } from "../contexts/ClerkAuthContext";
import { AppIcon } from "./IconComponent";

interface UserAvatarProps {
  size?: number;
  onPress?: () => void;
  showName?: boolean;
  className?: string;
}

/**
 * Reusable user avatar component with profile image from context
 */
export const UserAvatar: React.FC<UserAvatarProps> = ({
  size = 40,
  onPress,
  showName = false,
  className = "",
}) => {
  const { isDark } = useTheme();
  const { user, profileImage } = useClerkAuth();
  const router = useRouter();

  const handlePress = onPress || (() => router.push("/profile"));

  const avatarStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  const userName =
    user?.unsafeMetadata?.full_name ||
    (user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : "") ||
    user?.firstName ||
    "User";

  return (
    <TouchableOpacity
      onPress={handlePress}
      className={`items-center ${className}`}
    >
      <View
        style={avatarStyle}
        className={`${isDark ? "bg-blue-900 border-blue-700" : "bg-blue-100 border-blue-200"} border-2 overflow-hidden items-center justify-center`}
      >
        {profileImage ? (
          <Image
            source={{ uri: profileImage }}
            style={avatarStyle}
            resizeMode="cover"
            onError={() => {
              console.log("❌ UserAvatar: Profile image failed to load");
            }}
          />
        ) : (
          <AppIcon
            icon="profile"
            size={size * 0.5}
            color={isDark ? "#60a5fa" : "#2563eb"}
          />
        )}
      </View>
      {showName && (
        <Text
          className={`text-sm mt-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}
        >
          {userName}
        </Text>
      )}
    </TouchableOpacity>
  );
};
