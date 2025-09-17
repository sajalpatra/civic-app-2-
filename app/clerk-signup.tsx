import { useOAuth, useSignUp } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../contexts/ThemeContext";
import NotificationManager from "../lib/NotificationService";
import { UserService } from "../lib/userService";
import ToastService from "../services/ToastService";

const ClerkSignup = () => {
  const router = useRouter();
  const { isDark } = useTheme();
  const { signUp, isLoaded } = useSignUp();
  const { startOAuthFlow: startGoogleOAuth } = useOAuth({
    strategy: "oauth_google",
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);

  const handleGoogleSignup = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      console.log(`🔐 Attempting Google sign up...`);

      const { createdSessionId, setActive } = await startGoogleOAuth();

      if (createdSessionId) {
        await setActive!({ session: createdSessionId });
        console.log("✅ Google sign up successful!");

        // Send welcome notification for new user
        setTimeout(async () => {
          await NotificationManager.notifyGeneral(
            "🎉 Welcome to Civic Connect!",
            "Your account has been created successfully. Start reporting civic issues and help improve your community!"
          );
        }, 2000);

        // Navigate to dashboard after successful OAuth signup
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error(`❌ Google sign up error:`, error);
      ToastService.error({
        title: "Google Sign Up Failed",
        message:
          error.message ||
          "An error occurred during Google sign up. Please try email/password signup instead.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async () => {
    if (!isLoaded || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Basic validation
      if (!firstName.trim()) {
        ToastService.error({
          title: "First Name Required",
          message: "Please enter your first name",
        });
        return;
      }

      if (!lastName.trim()) {
        ToastService.error({
          title: "Last Name Required",
          message: "Please enter your last name",
        });
        return;
      }

      if (!email.trim()) {
        ToastService.error({
          title: "Email Required",
          message: "Please enter your email address",
        });
        return;
      }

      if (!password) {
        ToastService.error({
          title: "Password Required",
          message: "Please enter a password",
        });
        return;
      }

      if (password !== confirmPassword) {
        ToastService.error({
          title: "Password Mismatch",
          message: "Passwords do not match",
        });
        return;
      }

      console.log("🔐 Creating account with Clerk...");

      const signUpAttempt = await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
      });

      if (signUpAttempt.status === "missing_requirements") {
        console.log("📧 Email verification required");
        await signUpAttempt.prepareEmailAddressVerification({
          strategy: "email_code",
        });
        setPendingVerification(true);

        ToastService.info({
          title: "Verification Required",
          message: "Please check your email for a verification code.",
        });
      }
    } catch (error: any) {
      console.error("❌ Sign up error:", error);
      ToastService.error({
        title: "Sign Up Failed",
        message: error.message || "An error occurred during sign up",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerification = async () => {
    if (!isLoaded || isSubmitting) return;

    setIsSubmitting(true);

    try {
      console.log("✅ Verifying email with code:", verificationCode);

      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (completeSignUp.status === "complete") {
        console.log("🎉 Account verified successfully!");

        // Create user profile in Supabase
        if (completeSignUp.createdUserId) {
          console.log("💾 Creating user profile in Supabase...");

          const { data: profile, error } = await UserService.createUserProfile(
            completeSignUp.createdUserId,
            email,
            `${firstName} ${lastName}`.trim(),
            phone || undefined
          );

          if (error) {
            console.error("❌ Error creating user profile:", error);
            ToastService.warning({
              title: "Profile Warning",
              message:
                "Account created but failed to save profile. Please contact support.",
            });
          } else {
            console.log("✅ User profile created successfully:", profile);
          }
        }

        ToastService.success({
          title: "Account Created Successfully! 🎉",
          message: `Welcome ${firstName}! Your account has been created and verified. Tap to sign in.`,
          onPress: () => router.push("./clerk-login"),
        });

        // Send welcome notification for new user
        setTimeout(async () => {
          await NotificationManager.notifyGeneral(
            "🎉 Welcome to Civic Connect!",
            `Hi ${firstName}! Your account has been created successfully. Start reporting civic issues and help improve your community!`
          );
        }, 3000);
      }
    } catch (error: any) {
      console.error("❌ Verification error:", error);
      ToastService.error({
        title: "Verification Failed",
        message: error.message || "Invalid verification code",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (pendingVerification) {
    return (
      <SafeAreaView className={`flex-1 ${isDark ? "bg-gray-900" : "bg-white"}`}>
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor={isDark ? "#111827" : "#ffffff"}
        />

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {/* Header */}
          <View className="items-center pt-16 pb-8">
            <View
              className={`w-20 h-20 ${isDark ? "bg-blue-900" : "bg-blue-100"} rounded-full items-center justify-center mb-4`}
            >
              <Text
                className={`${isDark ? "text-blue-400" : "text-blue-600"} text-3xl`}
              >
                📧
              </Text>
            </View>

            <Text
              className={`${isDark ? "text-white" : "text-gray-800"} text-2xl font-bold mb-2`}
            >
              Verify Your Email
            </Text>
            <Text
              className={`${isDark ? "text-gray-400" : "text-gray-500"} text-center text-base px-8`}
            >
              Enter the verification code sent to {email}
            </Text>
          </View>

          {/* Verification Form */}
          <View className="px-6 flex-1">
            <View className="mb-6">
              <Text
                className={`${isDark ? "text-gray-300" : "text-gray-700"} text-base font-medium mb-2`}
              >
                Verification Code
              </Text>
              <TextInput
                className={`border ${isDark ? "border-gray-600 bg-gray-800 text-white" : "border-gray-300 bg-white text-gray-800"} rounded-xl px-4 py-3`}
                placeholder="Enter 6-digit code"
                placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                value={verificationCode}
                onChangeText={setVerificationCode}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>

            <TouchableOpacity
              className={`${
                isSubmitting
                  ? isDark
                    ? "bg-gray-600"
                    : "bg-gray-400"
                  : isDark
                    ? "bg-blue-500"
                    : "bg-blue-600"
              } py-4 rounded-xl shadow-lg mb-6`}
              onPress={handleVerification}
              disabled={isSubmitting}
            >
              <Text className="text-white text-center font-semibold text-lg">
                {isSubmitting ? "Verifying..." : "Verify Email"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setPendingVerification(false)}>
              <Text
                className={`${isDark ? "text-blue-400" : "text-blue-600"} text-center`}
              >
                Back to Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-gray-900" : "bg-white"}`}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#111827" : "#ffffff"}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* Header */}
        <View className="items-center pt-16 pb-8">
          <TouchableOpacity
            className="absolute left-6 top-16 p-2"
            onPress={() => router.back()}
          >
            <Text
              className={`${isDark ? "text-blue-400" : "text-blue-600"} text-2xl`}
            >
              ←
            </Text>
          </TouchableOpacity>

          <View
            className={`w-20 h-20 ${isDark ? "bg-blue-900" : "bg-blue-100"} rounded-full items-center justify-center mb-4`}
          >
            <Text
              className={`${isDark ? "text-blue-400" : "text-blue-600"} text-3xl`}
            >
              🏛️
            </Text>
          </View>

          <Text
            className={`${isDark ? "text-white" : "text-gray-800"} text-2xl font-bold mb-2`}
          >
            Create Account
          </Text>
          <Text
            className={`${isDark ? "text-gray-400" : "text-gray-500"} text-center text-base px-8`}
          >
            Join CivicApp with secure Clerk authentication
          </Text>
        </View>

        {/* Form */}
        <View className="px-6 flex-1">
          {/* Name Inputs */}
          <View className="flex-row mb-4">
            <View className="flex-1 mr-2">
              <Text
                className={`${isDark ? "text-gray-300" : "text-gray-700"} text-base font-medium mb-2`}
              >
                First Name
              </Text>
              <TextInput
                className={`border ${isDark ? "border-gray-600 bg-gray-800 text-white" : "border-gray-300 bg-white text-gray-800"} rounded-xl px-4 py-3`}
                placeholder="First name"
                placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
              />
            </View>
            <View className="flex-1 ml-2">
              <Text
                className={`${isDark ? "text-gray-300" : "text-gray-700"} text-base font-medium mb-2`}
              >
                Last Name
              </Text>
              <TextInput
                className={`border ${isDark ? "border-gray-600 bg-gray-800 text-white" : "border-gray-300 bg-white text-gray-800"} rounded-xl px-4 py-3`}
                placeholder="Last name"
                placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Email Input */}
          <View className="mb-4">
            <Text
              className={`${isDark ? "text-gray-300" : "text-gray-700"} text-base font-medium mb-2`}
            >
              Email Address
            </Text>
            <TextInput
              className={`border ${isDark ? "border-gray-600 bg-gray-800 text-white" : "border-gray-300 bg-white text-gray-800"} rounded-xl px-4 py-3`}
              placeholder="Enter your email"
              placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Phone Input (Optional) */}
          <View className="mb-4">
            <Text
              className={`${isDark ? "text-gray-300" : "text-gray-700"} text-base font-medium mb-2`}
            >
              Phone Number (Optional)
            </Text>
            <TextInput
              className={`border ${isDark ? "border-gray-600 bg-gray-800 text-white" : "border-gray-300 bg-white text-gray-800"} rounded-xl px-4 py-3`}
              placeholder="Enter your phone number"
              placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          {/* Password Inputs */}
          <View className="mb-4">
            <Text
              className={`${isDark ? "text-gray-300" : "text-gray-700"} text-base font-medium mb-2`}
            >
              Password
            </Text>
            <TextInput
              className={`border ${isDark ? "border-gray-600 bg-gray-800 text-white" : "border-gray-300 bg-white text-gray-800"} rounded-xl px-4 py-3`}
              placeholder="Create a password"
              placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <View className="mb-6">
            <Text
              className={`${isDark ? "text-gray-300" : "text-gray-700"} text-base font-medium mb-2`}
            >
              Confirm Password
            </Text>
            <TextInput
              className={`border ${isDark ? "border-gray-600 bg-gray-800 text-white" : "border-gray-300 bg-white text-gray-800"} rounded-xl px-4 py-3`}
              placeholder="Confirm your password"
              placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            className={`${
              isSubmitting
                ? isDark
                  ? "bg-gray-600"
                  : "bg-gray-400"
                : isDark
                  ? "bg-blue-500"
                  : "bg-blue-600"
            } py-4 rounded-xl shadow-lg mb-4`}
            onPress={handleSignup}
            disabled={isSubmitting}
          >
            <Text className="text-white text-center font-semibold text-lg">
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center mb-4">
            <View
              className={`flex-1 h-px ${isDark ? "bg-gray-600" : "bg-gray-300"}`}
            />
            <Text
              className={`${isDark ? "text-gray-400" : "text-gray-500"} mx-4`}
            >
              or
            </Text>
            <View
              className={`flex-1 h-px ${isDark ? "bg-gray-600" : "bg-gray-300"}`}
            />
          </View>

          {/* Social Signup Button */}
          <TouchableOpacity
            className={`${isDark ? "bg-green-600" : "bg-green-500"} py-4 rounded-xl mb-6 flex-row items-center justify-center`}
            onPress={handleGoogleSignup}
            disabled={isSubmitting}
          >
            <Text className="text-white text-center font-semibold text-lg mr-2">
              📧
            </Text>
            <Text className="text-white text-center font-semibold text-lg">
              Sign up with Google
            </Text>
          </TouchableOpacity>

          {/* Sign In Link */}
          <View className="flex-row justify-center items-center">
            <Text
              className={`${isDark ? "text-gray-400" : "text-gray-500"} text-base`}
            >
              Already have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("./clerk-login")}>
              <Text
                className={`${isDark ? "text-blue-400" : "text-blue-600"} font-semibold`}
              >
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View className="mt-auto pb-8 px-6">
          <Text
            className={`${isDark ? "text-gray-400" : "text-gray-500"} text-center text-sm`}
          >
            Powered by Clerk Authentication & Supabase Database
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ClerkSignup;
