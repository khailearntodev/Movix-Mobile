// src/app/home/HomeScreen.tsx
import React from "react";
import { View, Text, ScrollView, SafeAreaView, StatusBar, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/navigation";
import { MovieCard } from "../../components/movie/MovieCard";
import { Movie } from "../../types/movie";

// Mock Data (Dữ liệu giả lập để test UI)
const MOCK_MOVIES: Movie[] = [
    { id: 1, title: "Dune: Part Two", poster_path: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg", backdrop_path: "", vote_average: 8.5, release_date: "2024-02-27", overview: "Follow the mythic journey of Paul Atreides..." },
    { id: 2, title: "Kung Fu Panda 4", poster_path: "https://image.tmdb.org/t/p/w500/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg", backdrop_path: "", vote_average: 7.8, release_date: "2024-03-02", overview: "Po is gearing up to become the Spiritual Leader..." },
    { id: 3, title: "Godzilla x Kong", poster_path: "https://image.tmdb.org/t/p/w500/tM26baWgQO785S1iZM32kJ9uJ7q.jpg", backdrop_path: "", vote_average: 7.2, release_date: "2024-03-27", overview: "The new installment in the Monsterverse..." },
];

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleMoviePress = (movie: Movie) => {
    navigation.navigate("MovieDetail", { movie });
  };

  const renderSection = (title: string, movies: Movie[]) => (
    <View className="mb-8">
      <Text className="text-white text-lg font-bold mb-4 px-4">{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} onPress={handleMoviePress} />
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="px-4 py-4 flex-row justify-between items-center">
            <View>
                <Text className="text-red-600 text-2xl font-black tracking-wider">MOVIX</Text>
            </View>
            <View className="w-10 h-10 bg-zinc-800 rounded-full border border-zinc-700" /> 
        </View>

        <ScrollView className="flex-1 mt-2">
          {/* Featured Banner (Optional) */}
          <View className="w-full h-48 mb-6 mx-4 w-[92%] rounded-2xl bg-zinc-900 overflow-hidden relative justify-end p-4 border border-zinc-800">
             <Image 
                source={{ uri: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg" }} 
                className="absolute inset-0 opacity-60" 
                resizeMode="cover" 
             />
             <View className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
             <Text className="text-white text-xl font-bold z-10">Dune: Part Two</Text>
             <Text className="text-zinc-300 text-xs z-10">Action • Sci-Fi • Adventure</Text>
          </View>

          {renderSection("Đang thịnh hành", MOCK_MOVIES)}
          {renderSection("Phim chiếu rạp", MOCK_MOVIES)}
          {renderSection("Đánh giá cao", MOCK_MOVIES)}
          
          <View className="h-20" /> 
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}