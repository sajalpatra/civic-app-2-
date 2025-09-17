import React from "react";
import { Animated, TouchableOpacity, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import "../global.css";
interface ThemeToggleProps {
  size?: number;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ size = 24 }) => {
  const { isDark, toggleTheme } = useTheme();
  const animatedValue = React.useRef(
    new Animated.Value(isDark ? 1 : 0)
  ).current;

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isDark ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isDark, animatedValue]);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["#3b82f6", "#1f2937"],
  });

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, size - 2],
  });

  return (
    <TouchableOpacity onPress={toggleTheme} activeOpacity={0.8}>
      <Animated.View
        className="justify-center shadow-lg"
        style={{
          backgroundColor,
          width: size * 2,
          height: size,
          borderRadius: size / 2,
        }}
      >
        <Animated.View
          className="bg-white absolute justify-center items-center shadow-md"
          style={{
            width: size - 4,
            height: size - 4,
            borderRadius: (size - 4) / 2,
            transform: [{ translateX }],
          }}
        >
          <View className="w-full h-full justify-center items-center">
            {isDark ? (
              <View className="w-3 h-3 rounded-full bg-gray-200 relative">
                <View className="absolute w-0.5 h-0.5 rounded-full bg-gray-300 top-0.5 left-0.5" />
                <View className="absolute w-0.5 h-0.5 rounded-full bg-gray-300 bottom-0.5 right-0.5" />
              </View>
            ) : (
              <View className="w-3 h-3 justify-center items-center">
                {[...Array(8)].map((_, i) => (
                  <View
                    key={i}
                    className="absolute w-0.5 h-0.5 bg-amber-400"
                    style={{
                      transform: [{ rotate: `${i * 45}deg` }],
                      top: -1,
                    }}
                  />
                ))}
                <View className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              </View>
            )}
          </View>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
};
