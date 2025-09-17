import { useAuth, useUser } from "@clerk/clerk-expo";
import React from "react";
import { Text } from "react-native";

interface SecureDisplayProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Secure component that prevents accidental display of sensitive auth data
 */
export const SecureDisplay: React.FC<SecureDisplayProps> = ({
  children,
  fallback = <Text>Loading...</Text>,
}) => {
  const { isLoaded, isSignedIn } = useAuth();

  // Don't render anything if auth is not loaded or user is not signed in
  if (!isLoaded || !isSignedIn) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * Hook to safely get user display data without exposing tokens
 */
export const useSafeUserData = () => {
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  if (!isSignedIn || !user) {
    return {
      displayName: "Guest",
      email: "",
      imageUrl: null,
      isAuthenticated: false,
    };
  }

  return {
    displayName: user.fullName || user.firstName || "User",
    email: user.primaryEmailAddress?.emailAddress || "",
    imageUrl: user.imageUrl,
    isAuthenticated: true,
  };
};

/**
 * Sanitize any data to prevent token leakage
 */
export const sanitizeDisplayData = (data: any) => {
  if (typeof data === "string" && data.length > 100) {
    // If it's a very long string (possibly a token), truncate it
    return `${data.substring(0, 20)}...`;
  }

  if (typeof data === "object" && data !== null) {
    // Remove known sensitive fields
    const sanitized = { ...data };
    delete sanitized.accessToken;
    delete sanitized.sessionToken;
    delete sanitized.refreshToken;
    delete sanitized.token;
    delete sanitized.jwt;
    return sanitized;
  }

  return data;
};
