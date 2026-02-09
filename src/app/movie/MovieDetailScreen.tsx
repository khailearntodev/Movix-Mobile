// src/app/movie/MovieDetailScreen.tsx
import React from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { ArrowLeft, Play, Star, Calendar, Clock, Plus, Share2 } from "lucide-react-native";
import { RootStackParamList } from "../../types/navigation";
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type MovieDetailRouteProp = RouteProp<RootStackParamList, "MovieDetail">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Mock Cast Data
const MOCK_CAST = [
  { id: 1, name: "Timothée Chalamet", character: "Paul Atreides", image: "https://image.tmdb.org/t/p/w200/BE2sdjpgEHrPSjUI8AXDvZwysX.jpg" },
  { id: 2, name: "Zendaya", character: "Chani", image: "https://image.tmdb.org/t/p/w200/cbCibOABS58y2dP7yT4AJAgqZ3.jpg" },
  { id: 3, name: "Rebecca Ferguson", character: "Lady Jessica", image: "https://image.tmdb.org/t/p/w200/lJloTOheuQSirSLXNA3JHsrMNfH.jpg" },
  { id: 4, name: "Josh Brolin", character: "Gurney Halleck", image: "https://image.tmdb.org/t/p/w200/sX2etBbIkxRaCsATyw5ZpOVVJ6I.jpg" },
];

export default function MovieDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<MovieDetailRouteProp>();
  const { movie } = route.params;

  const getImageUrl = (path: string) =>
    path?.startsWith('http') ? path : `https://image.tmdb.org/t/p/original${path}`;

  const handleWatch = () => {
    navigation.navigate("WatchMovie", { movie });
  };

  return (
    <View className="flex-1 bg-black">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* Hero Section */}
        <View className="w-full h-[450px] relative">
          <Image
            source={{ uri: getImageUrl(movie.poster_path) }}
            className="w-full h-full"
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)', '#000000']}
            className="absolute inset-0"
            locations={[0.4, 0.8, 1]}
          />

          {/* Header Actions */}
          <View className="absolute top-12 left-4 z-10 w-full flex-row justify-between pr-8">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-10 h-10 bg-black/40 rounded-full items-center justify-center backdrop-blur-md"
            >
              <ArrowLeft color="white" size={24} />
            </TouchableOpacity>
            <TouchableOpacity
              className="w-10 h-10 bg-black/40 rounded-full items-center justify-center backdrop-blur-md"
            >
              <Share2 color="white" size={20} />
            </TouchableOpacity>
          </View>

          {/* Movie Title & Meta on Image */}
          <View className="absolute bottom-4 left-4 right-4">
            <Text className="text-white text-4xl font-black mb-2 shadow-sm tracking-tighter text-center">{movie.title}</Text>

            <View className="flex-row justify-center items-center space-x-4 mb-4">
              <Text className="text-zinc-300 font-medium bg-zinc-800/80 px-2 py-0.5 rounded text-xs">2024</Text>
              <Text className="text-zinc-300 font-medium bg-zinc-800/80 px-2 py-0.5 rounded text-xs">Phim Hành Động</Text>
              <Text className="text-zinc-300 font-medium bg-zinc-800/80 px-2 py-0.5 rounded text-xs">13+</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="px-5 mt-4 flex-row space-x-3">
          <TouchableOpacity
            onPress={handleWatch}
            className="flex-1 bg-white py-3 rounded-lg flex-row justify-center items-center active:bg-zinc-200"
          >
            <Play color="black" fill="black" size={20} />
            <Text className="text-black font-bold text-lg ml-2">Phát</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-1 bg-zinc-800 py-3 rounded-lg flex-row justify-center items-center active:bg-zinc-700">
            <Plus color="white" size={20} />
            <Text className="text-white font-bold text-lg ml-2">Danh sách</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View className="px-5 mt-6">
          <Text className="text-zinc-400 text-sm leading-6 mb-6">
            {movie.overview || "Chưa có mô tả cho phim này. Một bộ phim hấp dẫn đang chờ bạn khám phá..."}
          </Text>

          {/* Meta Stats */}
          <View className="flex-row justify-between mb-8 bg-zinc-900/50 p-4 rounded-xl">
            <View className="items-center">
              <Star size={20} color="#fbbf24" fill="#fbbf24" style={{ marginBottom: 4 }} />
              <Text className="text-white font-bold text-lg">{movie.vote_average.toFixed(1)}<Text className="text-xs text-zinc-500">/10</Text></Text>
              <Text className="text-zinc-500 text-xs">IMDb</Text>
            </View>
            <View className="items-center">
              <Clock size={20} color="#a1a1aa" style={{ marginBottom: 4 }} />
              <Text className="text-white font-bold text-lg">120</Text>
              <Text className="text-zinc-500 text-xs">Phút</Text>
            </View>
            <View className="items-center">
              <Calendar size={20} color="#a1a1aa" style={{ marginBottom: 4 }} />
              <Text className="text-white font-bold text-lg">{movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}</Text>
              <Text className="text-zinc-500 text-xs">Năm</Text>
            </View>
          </View>

          {/* Cast Section */}
          <View className="mb-8">
            <Text className="text-white text-lg font-bold mb-4">Diễn viên hàng đầu</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {MOCK_CAST.map((actor) => (
                <View key={actor.id} className="mr-4 items-center w-20">
                  <Image
                    source={{ uri: actor.image }}
                    className="w-16 h-16 rounded-full mb-2 bg-zinc-800"
                  />
                  <Text className="text-white text-xs text-center font-medium" numberOfLines={1}>{actor.name}</Text>
                  <Text className="text-zinc-500 text-[10px] text-center" numberOfLines={1}>{actor.character}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}