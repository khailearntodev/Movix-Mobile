import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Platform, ActivityIndicator, Image, Alert, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { X, Image as ImageIcon, Search, Film } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { blogService } from '../../services/blog.service';
import { search as searchMovies } from '../../services/movie.service';
import type { Movie } from '../../types/movie';

export default function CreateBlogScreen() {
  const navigation = useNavigation<any>();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [movieQuery, setMovieQuery] = useState('');
  const [movieResults, setMovieResults] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isSearchingMovies, setIsSearchingMovies] = useState(false);

  useEffect(() => {
    const query = movieQuery.trim();

    if (!query || selectedMovie) {
      setMovieResults([]);
      setIsSearchingMovies(false);
      return;
    }

    setIsSearchingMovies(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchMovies(query);
        setMovieResults(results.movies);
      } catch (error) {
        console.error('Error searching movies for blog:', error);
        setMovieResults([]);
      } finally {
        setIsSearchingMovies(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [movieQuery, selectedMovie]);

  const handleSelectMovie = (movie: Movie) => {
    setSelectedMovie(movie);
    setMovieQuery(movie.title);
    setMovieResults([]);
  };

  const clearSelectedMovie = () => {
    setSelectedMovie(null);
    setMovieQuery('');
    setMovieResults([]);
  };

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

      if (selectedMovie) {
        formData.append('movieId', selectedMovie.id);
      }
      
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
      <KeyboardAvoidingView 
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
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

      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
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

        <View className="mb-4">
          <Text className="text-zinc-300 font-semibold mb-2">Phim đang review</Text>
          <View className="bg-zinc-900 border border-zinc-800 rounded-xl flex-row items-center px-3">
            <Search color="#71717a" size={18} />
            <TextInput
              placeholder="Tìm phim để gắn vào bài viết..."
              placeholderTextColor="#71717a"
              className="flex-1 text-white py-3 px-2"
              value={movieQuery}
              onChangeText={(text) => {
                setMovieQuery(text);
                if (selectedMovie) {
                  setSelectedMovie(null);
                }
              }}
            />
            {isSearchingMovies ? (
              <ActivityIndicator size="small" color="#ef4444" />
            ) : selectedMovie ? (
              <TouchableOpacity onPress={clearSelectedMovie} className="p-1">
                <X color="#a1a1aa" size={18} />
              </TouchableOpacity>
            ) : null}
          </View>

          {movieResults.length > 0 && !selectedMovie && (
            <View className="mt-2 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              {movieResults.slice(0, 6).map((movie) => (
                <TouchableOpacity
                  key={movie.id}
                  className="flex-row items-center p-3 border-b border-zinc-800"
                  onPress={() => handleSelectMovie(movie)}
                >
                  {movie.posterUrl ? (
                    <Image
                      source={{ uri: movie.posterUrl }}
                      className="w-10 h-14 rounded-md bg-zinc-800"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-10 h-14 rounded-md bg-zinc-800 items-center justify-center">
                      <Film color="#71717a" size={18} />
                    </View>
                  )}
                  <View className="flex-1 ml-3">
                    <Text className="text-white font-semibold" numberOfLines={1}>
                      {movie.title}
                    </Text>
                    <Text className="text-zinc-500 text-xs mt-0.5">
                      {movie.type === 'TV' ? 'Series' : 'Movie'} • {movie.releaseYear || 'N/A'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {selectedMovie && (
            <View className="mt-3 flex-row items-center bg-red-600/10 border border-red-600/30 rounded-xl p-3">
              {selectedMovie.posterUrl ? (
                <Image
                  source={{ uri: selectedMovie.posterUrl }}
                  className="w-12 h-16 rounded-md bg-zinc-800"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-12 h-16 rounded-md bg-zinc-800 items-center justify-center">
                  <Film color="#ef4444" size={20} />
                </View>
              )}
              <View className="flex-1 ml-3">
                <Text className="text-red-400 text-xs font-semibold mb-1">Đang review</Text>
                <Text className="text-white font-bold" numberOfLines={1}>
                  {selectedMovie.title}
                </Text>
                <Text className="text-zinc-400 text-xs mt-0.5">
                  {selectedMovie.type === 'TV' ? 'Series' : 'Movie'} • {selectedMovie.releaseYear || 'N/A'}
                </Text>
              </View>
              <TouchableOpacity onPress={clearSelectedMovie} className="p-2">
                <X color="#fff" size={18} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {!imageUri && (
          <TouchableOpacity 
            onPress={pickImage} 
            className="flex-row items-center justify-center p-4 mt-2 mb-8 rounded-xl bg-zinc-900 border border-zinc-800 border-dashed"
          >
            <ImageIcon color="#10b981" size={24} />
            <Text className="text-zinc-300 ml-2 font-medium">Thêm ảnh/video</Text>
          </TouchableOpacity>
        )}

        {imageUri && (
          <View className="mt-4 mb-8 relative">
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
      </ScrollView>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
