import { useClerkAuth } from "../contexts/ClerkAuthContext";

/**
 * Custom hook to access cached profile image from auth context
 */
export const useProfileImage = () => {
  const { profileImage, refreshProfileImage } = useClerkAuth();

  return {
    profileImage,
    isLoading: false, // Image is pre-loaded in context
    refreshProfileImage,
    setProfileImage: () => {}, // No direct setting, use refreshProfileImage instead
  };
};
