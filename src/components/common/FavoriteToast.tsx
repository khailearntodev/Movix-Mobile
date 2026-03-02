import React from "react";
import { View, Text } from "react-native";
import { Heart } from "lucide-react-native";

interface FavoriteToastProps {
  visible: boolean;
}

export const FavoriteToast: React.FC<FavoriteToastProps> = ({ visible }) => {
  if (!visible) return null;

  return (
    <View className="absolute top-1/2 left-1/2 -ml-24 -mt-16 w-48 h-32 bg-black/80 backdrop-blur-xl rounded-2xl items-center justify-center z-50">
      <Heart color="#ef4444" fill="#ef4444" size={48} className="mb-2" />
      <Text className="text-white font-bold text-center">Đã thêm vào{"\n"}Yêu thích</Text>
    </View>
  );
};
