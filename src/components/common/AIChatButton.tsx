import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { MessageCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

export const AIChatButton = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <TouchableOpacity
      className="absolute bottom-6 right-6 w-14 h-14 bg-red-600 rounded-full items-center justify-center shadow-lg shadow-red-900/50 z-50 pointer-events-auto"
      onPress={() => navigation.navigate("AIChat")}
      activeOpacity={0.8}
    >
      <MessageCircle size={28} color="white" />
      <View className="absolute top-1 right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-red-600" />
    </TouchableOpacity>
  );
};
