// src/app/home/HomeScreen.tsx
import React from "react";
import { View, Text, ScrollView, SafeAreaView, StatusBar, Image, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/navigation";
import { MovieCard } from "../../components/movie/MovieCard";
import { Movie } from "../../types/movie";
import HeroBanner from "../../components/home/HeroBanner";
import GenreList from "../../components/home/GenreList";
import { Search, MessageCircle } from "lucide-react-native";

const MOCK_MOVIES: Movie[] = [
  { id: 1, title: "Dune: Part Two", poster_path: "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg", backdrop_path: "", vote_average: 8.5, release_date: "2024-02-27", overview: "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.", media_type: "movie" },
  { id: 2, title: "Kung Fu Panda 4", poster_path: "/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg", backdrop_path: "", vote_average: 7.8, release_date: "2024-03-02", overview: "Po is gearing up to become the Spiritual Leader of his Valley of Peace, but also needs someone to take his place as Dragon Warrior.", media_type: "movie" },
  { id: 3, title: "Godzilla x Kong: The New Empire", poster_path: "/tM26baWgQO785S1iZM32kJ9uJ7q.jpg", backdrop_path: "", vote_average: 7.2, release_date: "2024-03-27", overview: "Following their explosive showdown, Godzilla and Kong must reunite against a colossal undiscovered threat hidden within our world.", media_type: "movie" },
  { id: 4, title: "Civil War", poster_path: "/sh7Rg8Er3tFcN9AdeGSJDXZ7lnf.jpg", backdrop_path: "", vote_average: 7.5, release_date: "2024-04-12", overview: "A journey across a dystopian future America, following a team of military-embedded journalists as they race against time to reach DC before rebel factions descend upon the White House.", media_type: "movie" },
  { id: 5, title: "The Fall Guy", poster_path: "/tSz1qsmSJon0rqjHBxXZmrotuse.jpg", backdrop_path: "", vote_average: 7.3, release_date: "2024-05-03", overview: "He's a stuntman, and like everyone in the stunt community, he gets blown up, shot, crashed, thrown through windows and dropped from the highest of heights, all for our entertainment.", media_type: "movie" },
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
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <SafeAreaView className="flex-1">

        {/* Header */}
        <View className="px-4 py-2 flex-row justify-between items-center bg-black/80 z-50">
          <View className="flex-row items-center gap-2">
            <Image
              source={require('../../../assets/images/logo.png')}
              className="w-10 h-10"
              resizeMode="contain"
            />
            <Text className="text-red-500 text-2xl font-black tracking-wider">MOVIX</Text>
          </View>
          <TouchableOpacity
            className="w-10 h-10 bg-zinc-900 rounded-full items-center justify-center border border-zinc-800"
            onPress={() => navigation.navigate("Search")}
          >
            <Search size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>

          {/* Hero Banner (Featured Movies) */}
          <HeroBanner movies={MOCK_MOVIES.slice(0, 5)} onPress={handleMoviePress} />

          {/* Genre List */}
          <GenreList onGenrePress={(id) => console.log('Genre pressed:', id)} />

          {/* Movie Sections */}
          {renderSection("Đang thịnh hành", MOCK_MOVIES)}
          {renderSection("Phim chiếu rạp", MOCK_MOVIES)}
          {renderSection("Đánh giá cao", MOCK_MOVIES)}
          {renderSection("Dành riêng cho bạn", MOCK_MOVIES.slice(2, 5))}


        </ScrollView>
        <TouchableOpacity
          className="absolute bottom-6 right-6 w-14 h-14 bg-red-600 rounded-full items-center justify-center shadow-lg shadow-red-900/50 z-50 pointer-events-auto"
          onPress={() => navigation.navigate("AIChat")}
        >
          <MessageCircle size={28} color="white" />
          <View className="absolute top-1 right-1 w-3 h-3 bg-green-500 rounded-full border border-black" />
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}
