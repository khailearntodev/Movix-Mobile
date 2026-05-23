
import React, { useState, useEffect } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { ArrowLeft, Play, Star, Calendar, Clock, Plus, Share2, Heart, MessageCircle, Send, AlertTriangle, MessageSquare, X } from "lucide-react-native";
import { RootStackParamList } from "../../types/navigation";
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ShareModal } from "../../components/common/ShareModal";
import { FavoriteToast } from "../../components/common/FavoriteToast";
import { ToastMessage, ToastType } from "../../components/common/ToastMessage";
import { PlaylistModal, Playlist } from "../../components/movie/PlaylistModal";
import { CommentList } from "../../components/movie/comments/CommentList";
import { CommentInput } from "../../components/movie/comments/CommentInput";
import { useComments } from "../../hooks/useComments";
import { getMovie } from "../../services/movie.service";
import { 
    checkFavoriteStatus, 
    toggleFavorite as toggleFavoriteApi,
    getPlaylists,
    createPlaylist,
    addMovieToPlaylist,
    removeMovieFromPlaylist
} from '../../services/interaction.service';
import { Movie } from "../../types/movie";

type MovieDetailRouteProp = RouteProp<RootStackParamList, "MovieDetail">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function MovieDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<MovieDetailRouteProp>();
  const { movie } = route.params;

  const [movieData, setMovieData] = useState<Movie>(movie);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const fetchMovieDetail = async () => {
      if (!movie.slug && !movie.id) return;
      setIsLoading(true);
      try {
        const slugOrId = movie?.slug || movie?.id?.toString();
        if (!slugOrId) return;
        const data = await getMovie(slugOrId);
        setMovieData(data);
      } catch (error) {
        console.error("Failed to fetch movie details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieDetail();
  }, [movie]);

  const [isShareVisible, setShareVisible] = useState(false);
  const [isPlaylistVisible, setPlaylistVisible] = useState(false);
  const [isFavoriteVisible, setFavoriteVisible] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylists, setSelectedPlaylists] = useState<string[]>([]);
  
  // Load interaction status
  useEffect(() => {
        if (!movieData.id) return;

        const loadData = async () => {
            try {
                // Check favorite status
                const favData = await checkFavoriteStatus(movieData.id.toString());
                if (favData && typeof favData.isFavorite !== 'undefined') {
                    setIsFavorite(favData.isFavorite);
                }

                // Load playlists
                const playlistsData = await getPlaylists();
                if (Array.isArray(playlistsData)) {
                     // Check format from service
                     const formatted = playlistsData.map((p: any) => ({
                        id: p.id,
                        name: p.name,
                        count: p._count?.playlist_movies || 0
                    }));
                    setPlaylists(formatted);
                }
            } catch (error) {
                console.error("Failed to load interaction data:", error);
            }
        };
        
        loadData();
    }, [movieData.id]);
  
  // Toast State
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<ToastType>("success");

  const showToast = (message: string, type: ToastType = "success") => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const {
    comments,
    isLoadingComments,
    newComment,
    setNewComment,
    isPostingComment,
    handlePostComment,
    isSpoiler,
    setIsSpoiler,
    replyingTo,
    setReplyingTo
  } = useComments({ movieId: movieData?.id?.toString() || "" }, showToast);

  const getImageUrl = (path: string | null | undefined) => {
    if (!path) return 'https://via.placeholder.com/500x750?text=No+Image';
    return path.startsWith('http') ? path : `https://image.tmdb.org/t/p/original${path}`;
  };

  const handleWatch = () => {
    navigation.navigate("WatchMovie", { movie: movieData });
  };

  const toggleFavorite = async () => {
    if (!movieData.id) return;
    try {
        const newStatus = !isFavorite;
        setIsFavorite(newStatus);
        await toggleFavoriteApi(movieData.id.toString());
        
        if (newStatus) {
            setFavoriteVisible(true);
            setTimeout(() => setFavoriteVisible(false), 2000); 
        }
    } catch (error) {
        console.error("Failed to toggle favorite:", error);
        setIsFavorite(!isFavorite); // Revert
    }
  };

  const handleCreatePlaylist = async (name: string) => {
    try {
        const newPlaylist = await createPlaylist(name);
        const p: Playlist = {
            id: newPlaylist.id,
            name: newPlaylist.name,
            count: 0
        };
        setPlaylists([...playlists, p]);
        // Auto add to new playlist
        await togglePlaylistSelection(p.id);
    } catch (error) {
        console.error("Failed to create playlist:", error);
    }
  };

  const togglePlaylistSelection = async (id: string) => {
    if (!movieData.id) return;
    const isSelected = selectedPlaylists.includes(id);
    
    try {
        // Optimistic update
        if (isSelected) {
            setSelectedPlaylists(prev => prev.filter(pid => pid !== id));
            setPlaylists(prev => prev.map(p => 
                p.id === id ? { ...p, count: Math.max(0, p.count - 1) } : p
            ));
            await removeMovieFromPlaylist(id, movieData.id.toString());
        } else {
            setSelectedPlaylists(prev => [...prev, id]);
            setPlaylists(prev => prev.map(p => 
                p.id === id ? { ...p, count: p.count + 1 } : p
            ));
            await addMovieToPlaylist(id, movieData.id.toString());
        }
    } catch (error) {
        console.error("Failed to update playlist:", error);
        // Revert
        if (isSelected) {
            setSelectedPlaylists(prev => [...prev, id]);
            setPlaylists(prev => prev.map(p => 
                p.id === id ? { ...p, count: p.count + 1 } : p
            ));
        } else {
            setSelectedPlaylists(prev => prev.filter(pid => pid !== id));
            setPlaylists(prev => prev.map(p => 
                p.id === id ? { ...p, count: Math.max(0, p.count - 1) } : p
            ));
        }
    }
  };

  return (
    <View className="flex-1 bg-black">
      {/* Header Actions - Fixed at top with high Z-Index */}
      <SafeAreaView className="absolute top-0 left-0 right-0 z-50 pointer-events-box-none">
        <View className="px-4 pt-4 flex-row justify-between items-center bg-transparent">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 bg-black/40 rounded-full items-center justify-center backdrop-blur-md"
          >
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
          
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={toggleFavorite}
              className={`w-10 h-10 rounded-full items-center justify-center backdrop-blur-md mr-3 ${isFavorite ? 'bg-red-500/80' : 'bg-black/40'}`}
            >
              <Heart color="white" fill={isFavorite ? "white" : "transparent"} size={20} />
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => setShareVisible(true)}
              className="w-10 h-10 bg-black/40 rounded-full items-center justify-center backdrop-blur-md"
            >
              <Share2 color="white" size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        style={{ flex: 1 }}
      >
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false} keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled">

          {/* Hero Section */}
        <View className="w-full h-[450px] relative">
          <Image
            source={{ uri: getImageUrl(movieData.posterUrl) }}
            className="w-full h-full"
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)', '#000000']}
            className="absolute inset-0"
            locations={[0.4, 0.8, 1]}
          />

          {/* Movie Title & Meta on Image */}
          <View className="absolute bottom-4 left-4 right-4">
            <Text className="text-white text-4xl font-black mb-2 shadow-sm tracking-tighter text-center">{movieData.title}</Text>

            <View className="flex-row justify-center items-center space-x-4 mb-4">
              <Text className="text-zinc-300 font-medium bg-zinc-800/80 px-2 py-0.5 rounded text-xs">{movieData.releaseYear || 'N/A'}</Text>
              <Text className="text-zinc-300 font-medium bg-zinc-800/80 px-2 py-0.5 rounded text-xs">{movieData.tags?.[0] || 'Phim'}</Text>
              <Text className="text-zinc-300 font-medium bg-zinc-800/80 px-2 py-0.5 rounded text-xs">{movieData.type === 'TV' ? 'TV Series' : 'Movie'}</Text>
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

          <TouchableOpacity 
            onPress={() => setPlaylistVisible(true)}
            className="flex-1 bg-zinc-800 py-3 rounded-lg flex-row justify-center items-center active:bg-zinc-700"
          >
            <Plus color="white" size={20} />
            <Text className="text-white font-bold text-lg ml-2">Danh sách</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View className="px-5 mt-6">
          <Text className="text-zinc-400 text-sm leading-6 mb-6">
            {movieData.description || "Chưa có mô tả cho phim này. Một bộ phim hấp dẫn đang chờ bạn khám phá..."}
          </Text>

          {/* Meta Stats */}
          <View className="flex-row justify-between mb-8 bg-zinc-900/50 p-4 rounded-xl">
            <View className="items-center">
              <Star size={20} color="#fbbf24" fill="#fbbf24" style={{ marginBottom: 4 }} />
              <Text className="text-white font-bold text-lg">{(movieData.vote_average || movieData.rating || 0).toFixed(1)}<Text className="text-xs text-zinc-500">/10</Text></Text>
              <Text className="text-zinc-500 text-xs">IMDb</Text>
            </View>
            <View className="items-center">
              <Clock size={20} color="#a1a1aa" style={{ marginBottom: 4 }} />
              <Text className="text-white font-bold text-base">{movieData.duration || '?'}</Text>
              <Text className="text-zinc-500 text-xs">Thời lượng</Text>
            </View>
            <View className="items-center">
              <Calendar size={20} color="#a1a1aa" style={{ marginBottom: 4 }} />
              <Text className="text-white font-bold text-lg">{movieData.releaseYear || 'N/A'}</Text>
              <Text className="text-zinc-500 text-xs">Năm</Text>
            </View>
          </View>

          {/* Cast Section */}
          <View className="mb-8">
            <Text className="text-white text-lg font-bold mb-4">Diễn viên hàng đầu</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {(movieData.cast || []).length > 0 ? (
                movieData.cast!.map((actor) => (
                  <TouchableOpacity 
                    key={actor.id} 
                    className="mr-4 items-center w-20"
                    onPress={() => navigation.navigate("PersonDetail", { personId: actor.id.toString() })}
                  >
                    <Image
                      source={{ uri: getImageUrl(actor.avatar_url || actor.profileUrl) }}
                      className="w-16 h-16 rounded-full mb-2 bg-zinc-800"
                    />
                    <Text className="text-white text-xs text-center font-medium" numberOfLines={1}>{actor.name}</Text>
                    <Text className="text-zinc-500 text-[10px] text-center" numberOfLines={1}>{actor.character}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text className="text-zinc-500 text-sm italic ml-2">Đang cập nhật diễn viên...</Text>
              )}
            </ScrollView>
          </View>

          {/* Comments Section */}
          <CommentList 
            comments={comments}
            isLoading={isLoadingComments}
            onReply={setReplyingTo}
          />

        </View>
      </ScrollView>

      {/* Fixed Comment Input */}
      <CommentInput 
        newComment={newComment}
        setNewComment={setNewComment}
        handlePostComment={handlePostComment}
        isPostingComment={isPostingComment}
        replyingTo={replyingTo}
        setReplyingTo={setReplyingTo}
        isSpoiler={isSpoiler}
        setIsSpoiler={setIsSpoiler}
      />
      </KeyboardAvoidingView>

      {/* Components */}
      <ShareModal 
        visible={isShareVisible} 
        onClose={() => setShareVisible(false)} 
      />

      <PlaylistModal 
        visible={isPlaylistVisible}
        onClose={() => setPlaylistVisible(false)}
        playlists={playlists}
        onAddPlaylist={handleCreatePlaylist}
        selectedPlaylists={selectedPlaylists}
        onToggleSelection={togglePlaylistSelection}
      />

      <FavoriteToast visible={isFavoriteVisible} />
      
      <ToastMessage 
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />

    </View>
  );
}

