import React from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { Copy, Facebook, Instagram, Twitter } from "lucide-react-native";

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ visible, onClose }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        activeOpacity={1} 
        onPress={onClose}
        className="flex-1 justify-end bg-black/80"
      >
        <View className="bg-zinc-900 rounded-t-3xl p-6 pb-10">
          <View className="w-12 h-1 bg-zinc-700 rounded-full self-center mb-6" />
          <Text className="text-white text-xl font-bold mb-6 text-center">Chia sẻ với bạn bè</Text>
          
          <View className="flex-row justify-between px-4 mb-8">
            <TouchableOpacity className="items-center">
              <View className="w-14 h-14 bg-[#1877F2] rounded-full items-center justify-center mb-2">
                <Facebook color="white" size={24} />
              </View>
              <Text className="text-white text-xs">Facebook</Text>
            </TouchableOpacity>
            

            <TouchableOpacity className="items-center">
              <View className="w-14 h-14 bg-black border border-zinc-700 rounded-full items-center justify-center mb-2">
                <Twitter color="white" size={24} />
              </View>
              <Text className="text-white text-xs">X</Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center">
              <View className="w-14 h-14 bg-zinc-700 rounded-full items-center justify-center mb-2">
                <Copy color="white" size={24} />
              </View>
              <Text className="text-white text-xs">Sao chép</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            onPress={onClose}
            className="bg-zinc-800 py-4 rounded-xl items-center"
          >
            <Text className="text-white font-bold">Đóng</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};
