// src/app/movie/MovieDetailScreen.tsx
import React from "react";
import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { ArrowLeft, Play, Star, Calendar, Clock } from "lucide-react-native";
import { RootStackParamList } from "../../types/navigation";

type MovieDetailRouteProp = RouteProp<RootStackParamList, "MovieDetail">;

export default function MovieDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<MovieDetailRouteProp>();
  const { movie } = route.params;
  
  const getImageUrl = (path: string) => 
    path.startsWith('http') ? path : `https://image.tmdb.org/t/p/original${path}`;

  return (
    <View className="flex-1 bg-black">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Backdrop Image */}
        <View className="w-full h-96 relative">
          <Image
            source={{ uri: getImageUrl(movie.poster_path) }}
            className="w-full h-full"
            resizeMode="cover"
          />
          {/* Gradient Overlay */}
          <View className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          
          {/* Back Button */}
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="absolute top-12 left-4 w-10 h-10 bg-black/50 rounded-full items-center justify-center backdrop-blur-md"
          >
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View className="px-5 -mt-20">
            <Text className="text-white text-3xl font-bold mb-2 shadow-sm">{movie.title}</Text>
            
            <View className="flex-row items-center space-x-4 mb-6">
                <View className="flex-row items-center bg-zinc-800/80 px-2 py-1 rounded-md">
                    <Star size={16} color="#fbbf24" fill="#fbbf24" />
                    <Text className="text-white ml-1 font-bold">{movie.vote_average.toFixed(1)}</Text>
                </View>
                <View className="flex-row items-center">
                    <Calendar size={16} color="#a1a1aa" />
                    <Text className="text-zinc-400 ml-1">{movie.release_date.split('-')[0]}</Text>
                </View>
                 <View className="flex-row items-center">
                    <Clock size={16} color="#a1a1aa" />
                    <Text className="text-zinc-400 ml-1">120 min</Text>
                </View>
            </View>

            {/* Action Buttons */}
            <TouchableOpacity className="w-full bg-red-600 py-4 rounded-xl flex-row justify-center items-center mb-4 active:bg-red-700">
                <Play color="white" fill="white" size={20} />
                <Text className="text-white font-bold text-lg ml-2">Xem ngay</Text>
            </TouchableOpacity>

            <TouchableOpacity className="w-full bg-zinc-800 py-4 rounded-xl flex-row justify-center items-center mb-8 active:bg-zinc-700">
                <Text className="text-white font-bold text-lg">Thêm vào danh sách</Text>
            </TouchableOpacity>

            {/* Overview */}
            <View>
                <Text className="text-white text-xl font-bold mb-3">Nội dung</Text>
                <Text className="text-zinc-400 text-base leading-6">
                    {movie.overview || "Chưa có mô tả cho phim này. Một bộ phim hấp dẫn đang chờ bạn khám phá..."}
                </Text>
            </View>
        </View>
      </ScrollView>
    </View>
  );
}