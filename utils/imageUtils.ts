/**
 * Utility functions for handling image URIs in the app
 */

/**
 * Gets a safe image URI that handles both base64 data URIs and file URIs
 * @param imageUri - The original image URI (could be base64 data URI or file URI)
 * @param fallbackSize - Size for placeholder image (e.g., "80x80" or "400x250")
 * @returns A safe URI that will always load something
 */
export const getSafeImageUri = (
  imageUri: string,
  fallbackSize: string = "80x80"
): string => {
  // If it's already a base64 data URI, return as-is
  if (imageUri.startsWith("data:")) {
    return imageUri;
  }

  // If it's a file URI (from old data or cache), return placeholder
  if (imageUri.startsWith("file://")) {
    return `https://via.placeholder.com/${fallbackSize}/f0f0f0/999999?text=No+Image`;
  }

  // For any other URI (http/https), return as-is
  return imageUri;
};

/**
 * Checks if an image URI is a valid base64 data URI
 */
export const isBase64Image = (uri: string): boolean => {
  return uri.startsWith("data:image/") && uri.includes("base64,");
};

/**
 * Gets the file size of a base64 image in KB
 */
export const getBase64ImageSize = (base64Uri: string): number => {
  return Math.round(base64Uri.length / 1024);
};
