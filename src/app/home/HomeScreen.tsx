import React from "react";
import { View, Text, ScrollView, SafeAreaView, StatusBar, Image, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/navigation";
import { MovieCard } from "../../components/movie/MovieCard";
import { Movie } from "../../types/movie";
import { Banner } from "../../types/banner";
import { bannerService } from "../../services/banner.service";
import HeroBanner from "../../components/home/HeroBanner";
import GenreList from "../../components/home/GenreList";
import { Search, MessageCircle } from "lucide-react-native";

const MOCK_MOVIES: Movie[] = [
  { 
    id: "1", 
    slug: "dune-part-two",
    title: "Dune: Part Two", 
    subTitle: "Part Two",
    posterUrl: "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg", 
    backdropUrl: "", 
    trailerUrl: null,
    videoUrl: null,
    tags: ["Action", "Sci-Fi"],
    vote_average: 8.5, 
    releaseYear: 2024, 
    description: "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.", 
    type: "MOVIE" 
  },
  { 
    id: "2", 
    slug: "kung-fu-panda-4",
    title: "Kung Fu Panda 4", 
    subTitle: "",
    posterUrl: "/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg", 
    backdropUrl: "", 
    trailerUrl: null,
    videoUrl: null,
    tags: ["Animation", "Action"],
    vote_average: 7.8, 
    releaseYear: 2024, 
    description: "Po is gearing up to become the Spiritual Leader of his Valley of Peace, but also needs someone to take his place as Dragon Warrior.", 
    type: "MOVIE" 
  },
  { 
    id: "3", 
    slug: "godzilla-x-kong",
    title: "Godzilla x Kong: The New Empire", 
    subTitle: "The New Empire",
    posterUrl: "/tM26baWgQO785S1iZM32kJ9uJ7q.jpg", 
    backdropUrl: "", 
    trailerUrl: null,
    videoUrl: null,
    tags: ["Action", "Sci-Fi", "Monster"],
    vote_average: 7.2, 
    releaseYear: 2024, 
    description: "Following their explosive showdown, Godzilla and Kong must reunite against a colossal undiscovered threat hidden within our world.", 
    type: "MOVIE" 
  },
  { 
    id: "4", 
    slug: "civil-war",
    title: "Civil War", 
    subTitle: "",
    posterUrl: "/sh7Rg8Er3tFcN9AdeGSJDXZ7lnf.jpg", 
    backdropUrl: "", 
    trailerUrl: null,
    videoUrl: null,
    tags: ["Action", "Thriller"],
    vote_average: 7.5, 
    releaseYear: 2024, 
    description: "A journey across a dystopian future America, following a team of military-embedded journalists as they race against time to reach DC before rebel factions descend upon the White House.", 
    type: "MOVIE" 
  },
  { 
    id: "5", 
    slug: "the-fall-guy",
    title: "The Fall Guy", 
    subTitle: "",
    posterUrl: "/tSz1qsmSJon0rqjHBxXZmrotuse.jpg", 
    backdropUrl: "", 
    trailerUrl: null,
    videoUrl: null,
    tags: ["Action", "Comedy"],
    vote_average: 7.3, 
    releaseYear: 2024, 
    description: "He's a stuntman, and like everyone in the stunt community, he gets blown up, shot, crashed, thrown through windows and dropped from the highest of heights, all for our entertainment.", 
    type: "MOVIE" 
  },
];

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [banners, setBanners] = React.useState<Banner[]>([]);

  React.useEffect(() => {
    const fetchBanners = async () => {
      try {
        const data = await bannerService.getBanners();
        setBanners(data);
      } catch (error) {
        console.error("Failed to fetch banners", error);
      }
    };
    fetchBanners();
  }, []);

  const handleMoviePress = (movie: Movie) => {
    navigation.navigate("MovieDetail", { movie });
  };
  
  const handleBannerPress = (banner: Banner) => {
    if (banner.movie) {
      navigation.navigate("MovieDetail", { movie: banner.movie });
    } else {
        console.log("Banner pressed without movie:", banner.title);
    }
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
          <HeroBanner banners={banners} onPress={handleBannerPress} />

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
