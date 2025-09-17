import { useAuth, useUser } from "@clerk/clerk-expo";
import React, { createContext, useContext, useEffect, useState } from "react";
import { UserProfile, UserService } from "../lib/userService";

interface ClerkAuthContextType {
  isAuthenticated: boolean;
  user: any; // Clerk user object
  userProfile: UserProfile | null;
  profileImage: string | null; // Cached profile image
  refreshProfileImage: () => Promise<void>; // Function to refresh profile image
  signup: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone?: string
  ) => Promise<{ error?: string; success?: boolean }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error?: string; success?: boolean }>;
  signOut: () => Promise<void>;
  loading: boolean;
  pendingRoute: string | null;
  setPendingRoute: (route: string | null) => void;
}

const ClerkAuthContext = createContext<ClerkAuthContextType | undefined>(
  undefined
);

export const ClerkAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      setLoading(false);

      // Load user profile from Supabase when user signs in
      if (isSignedIn && user) {
        console.log("✅ User authenticated successfully");
        loadUserProfile(user.id);
        loadProfileImage(user.id); // Also load profile image in background
      } else {
        console.log("❌ User not authenticated");
        setUserProfile(null);
        setProfileImage(null);
      }
    }
  }, [isLoaded, isSignedIn, user]);

  const loadUserProfile = async (userId: string) => {
    try {
      console.log("🔍 Loading user profile from Supabase for user:", userId);
      const { data: profile, error } = await UserService.getUserProfile(userId);
      if (!error && profile) {
        setUserProfile(profile);
        console.log("✅ User profile loaded:", profile);
      } else {
        console.log("⚠️ No user profile found, creating one...");
        // Create profile if it doesn't exist
        await createUserProfileFromClerk(user);
      }
    } catch (error) {
      console.error("❌ Error loading user profile:", error);
    }
  };

  const loadProfileImage = async (userId: string) => {
    try {
      console.log("🖼️ Loading profile image from database for user:", userId);
      const { data: imageData } = await UserService.getProfileImage(userId);

      if (imageData) {
        setProfileImage(imageData);
        console.log("✅ Profile image loaded from database");
      } else {
        // Fallback to Clerk user metadata or imageUrl
        const fallbackImage =
          (user?.unsafeMetadata?.profile_image as string) ||
          user?.imageUrl ||
          null;
        setProfileImage(fallbackImage);
        console.log("ℹ️ Using fallback profile image");
      }
    } catch (error) {
      console.log("ℹ️ No profile image in database, using fallback");
      const fallbackImage =
        (user?.unsafeMetadata?.profile_image as string) ||
        user?.imageUrl ||
        null;
      setProfileImage(fallbackImage);
    }
  };

  const refreshProfileImage = async () => {
    if (user?.id) {
      await loadProfileImage(user.id);
    }
  };

  const createUserProfileFromClerk = async (clerkUser: any) => {
    if (!clerkUser) return;

    try {
      const { data: profile, error } = await UserService.createUserProfile(
        clerkUser.id,
        clerkUser.primaryEmailAddress?.emailAddress || "",
        `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
        clerkUser.primaryPhoneNumber?.phoneNumber
      );

      if (!error && profile) {
        setUserProfile(profile);
        console.log("✅ User profile created from Clerk data:", profile);
      }
    } catch (error) {
      console.error("❌ Error creating user profile from Clerk:", error);
    }
  };

  const signup = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone?: string
  ) => {
    try {
      // We'll implement Clerk signup here
      // For now, return success to maintain compatibility
      return { success: true };
    } catch (error) {
      console.error("Signup error:", error);
      return { error: "An error occurred during signup" };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // We'll implement Clerk sign in here
      // For now, return success to maintain compatibility
      return { success: true };
    } catch (error) {
      console.error("Sign in error:", error);
      return { error: "An error occurred during sign in" };
    }
  };

  const signOut = async () => {
    try {
      // Clerk handles sign out automatically
      setUserProfile(null);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <ClerkAuthContext.Provider
      value={{
        isAuthenticated: !!isSignedIn,
        user,
        userProfile,
        profileImage,
        refreshProfileImage,
        signup,
        signIn,
        signOut,
        loading,
        pendingRoute,
        setPendingRoute,
      }}
    >
      {children}
    </ClerkAuthContext.Provider>
  );
};

export const useClerkAuth = () => {
  const context = useContext(ClerkAuthContext);
  if (context === undefined) {
    throw new Error("useClerkAuth must be used within a ClerkAuthProvider");
  }
  return context;
};
