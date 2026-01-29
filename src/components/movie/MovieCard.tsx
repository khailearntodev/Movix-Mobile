// src/components/movie/MovieCard.tsx
import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Star } from "lucide-react-native";
import { Movie } from "../../types/movie";

interface MovieCardProps {
  movie: Movie;
  onPress: (movie: Movie) => void;
}

export const MovieCard = ({ movie, onPress }: MovieCardProps) => {
  const getImageUrl = (path: string) => 
    path.startsWith('http') ? path : `https://image.tmdb.org/t/p/w500${path}`;

  return (
    <TouchableOpacity 
      className="mr-4 w-36 space-y-2" 
      onPress={() => onPress(movie)}
    >
      <View className="relative w-36 h-52 rounded-xl overflow-hidden bg-zinc-800 shadow-sm border border-zinc-800">
        <Image
          source={{ uri: getImageUrl(movie.poster_path) }}
          className="w-full h-full"
          resizeMode="cover"
        />
        <View className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded-md flex-row items-center space-x-1">
            <Star size={12} color="#fbbf24" fill="#fbbf24" />
            <Text className="text-white text-xs font-bold">{movie.vote_average.toFixed(1)}</Text>
        </View>
      </View>
      <Text className="text-zinc-200 font-medium text-sm truncate" numberOfLines={1}>
        {movie.title}
      </Text>
    </TouchableOpacity>
  );
};