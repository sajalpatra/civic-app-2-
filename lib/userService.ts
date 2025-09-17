import { supabase, supabaseAdmin } from "./supabase";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  profile_image?: string; // Base64 encoded image data
}

export class UserService {
  // Create user profile in users table after signup
  static async createUserProfile(
    userId: string,
    email: string,
    fullName: string,
    phone?: string
  ): Promise<{ data?: UserProfile; error?: string }> {
    try {
      console.log("📝 Inserting user data into Supabase database...");
      console.log("User data:", {
        userId,
        email,
        fullName,
        phone: phone || "N/A",
      });

      // Use regular supabase client (RLS should be disabled for users table)
      const { data, error } = await supabase
        .from("users")
        .insert([
          {
            id: userId,
            email,
            full_name: fullName,
            phone: phone || null,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("❌ Error creating user profile in database:", error);
        return { error: error.message };
      }

      console.log("✅ User profile successfully saved to database:", data);
      return { data };
    } catch (error) {
      console.error("❌ UserService createUserProfile error:", error);
      return { error: "Failed to create user profile" };
    }
  }

  // Get user profile from users table
  static async getUserProfile(
    userId: string
  ): Promise<{ data?: UserProfile; error?: string }> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error getting user profile:", error);
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      console.error("UserService getUserProfile error:", error);
      return { error: "Failed to get user profile" };
    }
  }

  // Update user profile
  static async updateUserProfile(
    userId: string,
    updates: Partial<Omit<UserProfile, "id">>
  ): Promise<{ data?: UserProfile; error?: string }> {
    try {
      const { data, error } = await supabase
        .from("users")
        .update(updates)
        .eq("id", userId)
        .select()
        .single();

      if (error) {
        console.error("Error updating user profile:", error);
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      console.error("UserService updateUserProfile error:", error);
      return { error: "Failed to update user profile" };
    }
  }

  // Update user profile image
  static async updateProfileImage(
    userId: string,
    imageData: string
  ): Promise<{ data?: UserProfile; error?: string }> {
    try {
      console.log("🖼️ Updating profile image for user:", userId);

      const { data, error } = await supabase
        .from("users")
        .update({ profile_image: imageData })
        .eq("id", userId)
        .select()
        .single();

      if (error) {
        console.error("❌ Error updating profile image:", error);
        return { error: error.message };
      }

      console.log("✅ Profile image updated successfully");
      return { data };
    } catch (error) {
      console.error("❌ UserService updateProfileImage error:", error);
      return { error: "Failed to update profile image" };
    }
  }

  // Get user profile image
  static async getProfileImage(
    userId: string
  ): Promise<{ data?: string; error?: string }> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("profile_image")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("❌ Error getting profile image:", error);
        return { error: error.message };
      }

      return { data: data?.profile_image || null };
    } catch (error) {
      console.error("❌ UserService getProfileImage error:", error);
      return { error: "Failed to get profile image" };
    }
  }

  // Remove user profile image
  static async removeProfileImage(userId: string): Promise<{ error?: string }> {
    try {
      console.log("🗑️ Removing profile image for user:", userId);

      const { error } = await supabase
        .from("users")
        .update({ profile_image: null })
        .eq("id", userId);

      if (error) {
        console.error("❌ Error removing profile image:", error);
        return { error: error.message };
      }

      console.log("✅ Profile image removed successfully");
      return {};
    } catch (error) {
      console.error("❌ UserService removeProfileImage error:", error);
      return { error: "Failed to remove profile image" };
    }
  }

  // Delete user profile
  static async deleteUserProfile(userId: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.from("users").delete().eq("id", userId);

      if (error) {
        console.error("Error deleting user profile:", error);
        return { error: error.message };
      }

      return {};
    } catch (error) {
      console.error("UserService deleteUserProfile error:", error);
      return { error: "Failed to delete user profile" };
    }
  }

  // Validation functions
  static validateEmail(email: string): { isValid: boolean; message?: string } {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      return { isValid: false, message: "Email is required" };
    }

    if (!emailRegex.test(email)) {
      return { isValid: false, message: "Please enter a valid email address" };
    }

    return { isValid: true };
  }

  static validatePassword(password: string): {
    isValid: boolean;
    message?: string;
  } {
    if (!password) {
      return { isValid: false, message: "Password is required" };
    }

    if (password.length < 6) {
      return {
        isValid: false,
        message: "Password must be at least 6 characters long",
      };
    }

    // Check for at least one letter and one number
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!hasLetter || !hasNumber) {
      return {
        isValid: false,
        message: "Password must contain at least one letter and one number",
      };
    }

    return { isValid: true };
  }

  static validateFullName(name: string): {
    isValid: boolean;
    message?: string;
  } {
    if (!name || name.trim().length === 0) {
      return { isValid: false, message: "Full name is required" };
    }

    if (name.trim().length < 2) {
      return {
        isValid: false,
        message: "Full name must be at least 2 characters long",
      };
    }

    // Check for valid characters (letters, spaces, hyphens, apostrophes)
    const nameRegex = /^[a-zA-Z\s\-']+$/;
    if (!nameRegex.test(name)) {
      return {
        isValid: false,
        message:
          "Full name can only contain letters, spaces, hyphens, and apostrophes",
      };
    }

    return { isValid: true };
  }

  static validatePhone(phone: string): { isValid: boolean; message?: string } {
    if (!phone) {
      return { isValid: false, message: "Phone number is required" };
    }

    // Remove any non-digit characters for validation
    const digitsOnly = phone.replace(/\D/g, "");

    if (digitsOnly.length !== 10) {
      return {
        isValid: false,
        message: "Phone number must be exactly 10 digits",
      };
    }

    // Check if it starts with a valid digit (not 0 or 1)
    if (digitsOnly[0] === "0" || digitsOnly[0] === "1") {
      return {
        isValid: false,
        message: "Phone number cannot start with 0 or 1",
      };
    }

    return { isValid: true };
  }

  // Comprehensive validation for signup
  static validateSignupData(
    email: string,
    password: string,
    fullName: string,
    phone?: string
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    const emailValidation = this.validateEmail(email);
    if (!emailValidation.isValid) {
      errors.push(emailValidation.message!);
    }

    const passwordValidation = this.validatePassword(password);
    if (!passwordValidation.isValid) {
      errors.push(passwordValidation.message!);
    }

    const nameValidation = this.validateFullName(fullName);
    if (!nameValidation.isValid) {
      errors.push(nameValidation.message!);
    }

    if (phone) {
      const phoneValidation = this.validatePhone(phone);
      if (!phoneValidation.isValid) {
        errors.push(phoneValidation.message!);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Comprehensive validation for login
  static validateLoginData(
    email: string,
    password: string
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!email) {
      errors.push("Email is required");
    } else {
      const emailValidation = this.validateEmail(email);
      if (!emailValidation.isValid) {
        errors.push(emailValidation.message!);
      }
    }

    if (!password) {
      errors.push("Password is required");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
