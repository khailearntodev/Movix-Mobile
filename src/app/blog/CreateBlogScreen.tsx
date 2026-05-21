import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Platform, ActivityIndicator, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { X, Image as ImageIcon } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { blogService } from '../../services/blog.service';

export default function CreateBlogScreen() {
  const navigation = useNavigation<any>();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handlePost = async () => {
    if (!content.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập nội dung bài viết');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      
      if (imageUri) {
        const filename = imageUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : `image`;
        
        formData.append('thumbnail', {
          uri: imageUri,
          name: filename,
          type,
        } as any);
      }

      await blogService.createBlogPost(formData);
      navigation.goBack();
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Lỗi', 'Không thể tạo bài viết');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-950" style={{ paddingTop: Platform.OS === 'android' ? 24 : 0 }}>
      <View className="flex-row items-center justify-between px-4 py-4 border-b border-zinc-800">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full bg-zinc-900/50">
          <X color="#fff" size={24} />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold">Tạo bài viết</Text>
        <TouchableOpacity 
          onPress={handlePost} 
          disabled={loading || !content.trim()}
          className={`px-5 py-2 rounded-full ${content.trim() ? "bg-red-600" : "bg-zinc-800"}`}
        >
          {loading ? (
             <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className={`font-semibold ${content.trim() ? "text-white" : "text-zinc-500"}`}>Đăng</Text>
          )}
        </TouchableOpacity>
      </View>

      <View className="flex-1 p-4">
        <TextInput 
          placeholder="Tiêu đề bài viết (không bắt buộc)"
          placeholderTextColor="#71717a"
          className="text-white text-xl font-bold mb-4"
          value={title}
          onChangeText={setTitle}
        />
        
        <TextInput 
          placeholder="Bạn đang nghĩ gì?"
          placeholderTextColor="#71717a"
          className="text-white text-lg"
          multiline
          textAlignVertical="top"
          value={content}
          onChangeText={setContent}
          style={{ minHeight: 150 }}
        />

        {imageUri && (
          <View className="mt-4 relative">
            <Image 
              source={{ uri: imageUri }} 
              className="w-full h-48 rounded-xl bg-zinc-800" 
              resizeMode="cover"
            />
            <TouchableOpacity 
              className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full"
              onPress={() => setImageUri(null)}
            >
              <X color="#fff" size={20} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View className="flex-row items-center px-4 py-4 border-t border-zinc-900">
        <TouchableOpacity onPress={pickImage} className="flex-row items-center p-2 rounded-full bg-zinc-900">
          <ImageIcon color="#10b981" size={24} />
          <Text className="text-zinc-300 ml-2 font-medium">Thêm ảnh/video</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}