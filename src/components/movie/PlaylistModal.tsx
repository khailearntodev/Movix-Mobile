import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, TextInput, FlatList, KeyboardAvoidingView, Platform, TouchableWithoutFeedback } from "react-native";
import { X, Check, Plus, Play } from "lucide-react-native";

export interface Playlist {
  id: string;
  name: string;
  count: number;
}

interface PlaylistModalProps {
  visible: boolean;
  onClose: () => void;
  playlists: Playlist[];
  onAddPlaylist: (name: string) => void;
  selectedPlaylists: string[];
  onToggleSelection: (id: string) => void;
}

export const PlaylistModal: React.FC<PlaylistModalProps> = ({
  visible,
  onClose,
  playlists,
  onAddPlaylist,
  selectedPlaylists,
  onToggleSelection
}) => {
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  const handleCreate = () => {
    if (newPlaylistName.trim()) {
      onAddPlaylist(newPlaylistName);
      setNewPlaylistName("");
      setIsCreatingPlaylist(false);
    }
  };

  const cancelCreate = () => {
    setIsCreatingPlaylist(false);
    setNewPlaylistName("");
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={onClose}
          className="flex-1 justify-end bg-black/80"
        >
          <TouchableWithoutFeedback>
            <View className="bg-zinc-900 rounded-t-3xl p-6 h-[70%]">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-white text-xl font-bold">Thêm vào danh sách</Text>
                <TouchableOpacity onPress={onClose}>
                  <X color="#a1a1aa" size={24} />
                </TouchableOpacity>
              </View>

              {isCreatingPlaylist ? (
                <View className="mb-4">
                  <Text className="text-zinc-400 mb-2">Tên danh sách mới</Text>
                  <View className="flex-row items-center space-x-2">
                    <TextInput
                      value={newPlaylistName}
                      onChangeText={setNewPlaylistName}
                      placeholder="Nhập tên danh sách..."
                      placeholderTextColor="#71717a"
                      className="flex-1 bg-zinc-800 text-white p-3 rounded-xl border border-zinc-700 focus:border-red-500"
                      autoFocus
                    />
                    <TouchableOpacity 
                      onPress={handleCreate}
                      className="bg-red-600 p-3 rounded-xl"
                    >
                      <Check color="white" size={24} />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity onPress={cancelCreate} className="mt-2">
                    <Text className="text-zinc-500 text-center">Hủy tạo</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                 <TouchableOpacity 
                  onPress={() => setIsCreatingPlaylist(true)}
                  className="flex-row items-center space-x-3 mb-6 bg-zinc-800/50 p-3 rounded-xl border border-dashed border-zinc-700"
                >
                  <View className="w-10 h-10 bg-zinc-800 rounded-full items-center justify-center">
                    <Plus color="white" size={20} />
                  </View>
                  <Text className="text-white font-medium">Tạo danh sách mới</Text>
                </TouchableOpacity>
              )}

              <FlatList
                data={playlists}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    onPress={() => onToggleSelection(item.id)}
                    className="flex-row items-center justify-between py-4 border-b border-zinc-800"
                  >
                    <View className="flex-row items-center">
                      <View className="w-12 h-12 bg-zinc-800 rounded-lg items-center justify-center">
                        <Play size={20} color="#a1a1aa" fill="#a1a1aa" />
                      </View>
                      <View className="ml-3">
                        <Text className="text-white font-bold text-base">{item.name}</Text>
                        <Text className="text-zinc-500 text-xs">{item.count} phim</Text>
                      </View>
                    </View>
                    <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${selectedPlaylists.includes(item.id) ? 'bg-red-600 border-red-600' : 'border-zinc-600'}`}>
                      {selectedPlaylists.includes(item.id) && <Check size={14} color="white" strokeWidth={3} />}
                    </View>
                  </TouchableOpacity>
                )}
              />
              
              <TouchableOpacity 
                onPress={onClose}
                className="bg-red-600 py-4 rounded-xl items-center mt-4 shadow-lg shadow-red-900/20"
              >
                <Text className="text-white font-bold text-lg">Xong</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};
