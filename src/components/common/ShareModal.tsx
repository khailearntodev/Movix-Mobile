import React from "react";
import { View, Text, TouchableOpacity, Modal, Share, Clipboard, Linking } from "react-native";
import { Copy, Facebook, Share2, Twitter } from "lucide-react-native";

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  url?: string;
  title?: string;
  message?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  visible,
  onClose,
  url,
  title,
  message,
}) => {
  const shareUrl = url || "https://movix-fe.vercel.app";
  const shareMessage = message || `${title ? `${title}\n` : ""}${shareUrl}`;

  const handleNativeShare = async () => {
    try {
      await Share.share({
        title,
        message: shareMessage,
        url: shareUrl,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleCopy = () => {
    Clipboard.setString(shareUrl);
    onClose();
  };

  const openShareUrl = async (target: "facebook" | "x") => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(title || "Movix");
    const nextUrl =
      target === "facebook"
        ? `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
        : `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;

    try {
      await Linking.openURL(nextUrl);
    } catch (error) {
      console.error("Error opening share URL:", error);
    }
  };

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
          <Text className="text-white text-xl font-bold mb-3 text-center">Chia sẻ với bạn bè</Text>
          <Text className="text-zinc-400 text-sm text-center mb-6" numberOfLines={1}>
            {shareUrl}
          </Text>

          <View className="flex-row justify-between mb-8">
            <TouchableOpacity className="items-center flex-1" onPress={() => openShareUrl("facebook")}>
              <View className="w-14 h-14 bg-[#1877F2] rounded-full items-center justify-center mb-2">
                <Facebook color="white" size={24} />
              </View>
              <Text className="text-white text-xs">Facebook</Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center flex-1" onPress={() => openShareUrl("x")}>
              <View className="w-14 h-14 bg-black border border-zinc-700 rounded-full items-center justify-center mb-2">
                <Twitter color="white" size={24} />
              </View>
              <Text className="text-white text-xs">X</Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center flex-1" onPress={handleNativeShare}>
              <View className="w-14 h-14 bg-red-600 rounded-full items-center justify-center mb-2">
                <Share2 color="white" size={24} />
              </View>
              <Text className="text-white text-xs">Chia sẻ</Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center flex-1" onPress={handleCopy}>
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
