import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, StatusBar, Image, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/navigation";
import { MovieCard } from "../../components/movie/MovieCard";
import { Movie } from "../../types/movie";
import { Banner } from "../../types/banner";
import { bannerService } from "../../services/banner.service";
import { getDynamicSections, getForYouMovies, MovieSection } from "../../services/movie.service";
import HeroBanner from "../../components/home/HeroBanner";
import GenreList from "../../components/home/GenreList";
import { Search, MessageCircle } from "lucide-react-native";
import { AIChatButton } from "../../components/common/AIChatButton";
import { FilterValues } from "../../components/search/FilterForm";

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [sections, setSections] = useState<MovieSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [bannersData, sectionsData, forYouData] = await Promise.all([
        bannerService.getBanners(),
        getDynamicSections(),
        getForYouMovies()
      ]);
      setBanners(bannersData);
      
      let allSections = sectionsData;
      if (forYouData && forYouData.length > 0) {
        allSections = [
          { id: "for-you", title: "Dành cho bạn", movies: forYouData },
          ...sectionsData
        ];
      }
      setSections(allSections);
    } catch (error) {
      console.error("Home data fetch error:", error);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
    };
    init();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

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

  const handleGenrePress = (genreName: string) => {
    const appliedFilters: FilterValues = {
      with_genres: [genreName],
      region: "Tất cả",
      year: "Tất cả",
      type: "all",
      rating: "Tất cả",
    };

    navigation.navigate("Search", { appliedFilters });
  };

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>

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

        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ paddingBottom: 24 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="red" />}
        >

          {/* Hero Banner (Featured Movies) */}
          <HeroBanner banners={banners} onPress={handleBannerPress} />

          {/* Genre List */}
          <GenreList onGenrePress={(genre) => handleGenrePress(genre.name)} />


   {loading ? (
      <View className="items-center justify-center p-10">
        <ActivityIndicator size="large" color="red" />
      </View>
    ) : (
      sections.map((section) => (
        <View key={section.id} className="mb-6">
          <View className="flex-row items-center justify-between px-4 mb-4">
            <Text className="text-white text-lg font-bold">{section.title}</Text>
            <TouchableOpacity onPress={() => console.log('View All', section.title)}>
              <Text className="text-red-500 font-semibold text-xs">Xem thêm</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {section.movies.map((movie) => (
              <View key={movie.id} className="mr-3">
                <MovieCard 
                  movie={movie} 
                  onPress={(m) => navigation.navigate("MovieDetail", { movie: m })}
                />
              </View>
            ))}
          </ScrollView>
        </View>
      ))
    )}


        </ScrollView>
        <AIChatButton />
      </SafeAreaView>
    </View>
  );
}
