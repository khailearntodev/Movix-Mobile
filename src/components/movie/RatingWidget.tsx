import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Star } from 'lucide-react-native';
import { getRatingStats, getMyRating, rateMovie, deleteRating, RatingStats, UserRating } from '../../services/interaction.service';

interface RatingWidgetProps {
  movieId: string;
}

export function RatingWidget({ movieId }: RatingWidgetProps) {
  const [stats, setStats] = useState<RatingStats>({ average: 0, count: 0 });
  const [userRating, setUserRating] = useState<UserRating>({ hasRated: false, rating: null });
  const [isLoading, setIsLoading] = useState(true);
  const [isRating, setIsRating] = useState(false);

  useEffect(() => {
    loadRatings();
  }, [movieId]);

  const loadRatings = async () => {
    try {
      setIsLoading(true);
      const [statsData, myRatingData] = await Promise.all([
        getRatingStats(movieId),
        getMyRating(movieId)
      ]);
      setStats(statsData);
      setUserRating(myRatingData);
    } catch (error) {
      console.error("Failed to load ratings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRate = async (ratingVal: number) => {
    try {
      setIsRating(true);
      setUserRating({ hasRated: true, rating: ratingVal });
      await rateMovie(movieId, ratingVal);
      const statsData = await getRatingStats(movieId);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to rate movie:", error);
      await loadRatings();
    } finally {
      setIsRating(false);
    }
  };

  const handleDeleteRating = async () => {
    try {
      setIsRating(true);
      setUserRating({ hasRated: false, rating: null });
      await deleteRating(movieId);
      const statsData = await getRatingStats(movieId);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to delete rating:", error);
      await loadRatings();
    } finally {
      setIsRating(false);
    }
  };

  if (isLoading && stats.count === 0) {
    return (
      <View className="py-4 items-center justify-center">
        <ActivityIndicator size="small" color="#fbbf24" />
      </View>
    );
  }

  // Generate 10 stars (1 to 10)
  const stars = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <View className="mb-8 bg-zinc-900/40 rounded-xl p-4">
      <Text className="text-white text-lg font-bold mb-4">Đánh giá phim</Text>
      
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-end">
          <Text className="text-4xl font-black text-amber-400">
            {stats.average > 0 ? stats.average.toFixed(1) : '-'}
          </Text>
          <Text className="text-zinc-500 text-sm font-medium mb-1 ml-1">/10</Text>
        </View>
        <View className="items-end">
          <Text className="text-zinc-400 text-sm">{stats.count} lượt đánh giá</Text>
          {userRating.hasRated && (
            <TouchableOpacity onPress={handleDeleteRating} disabled={isRating}>
              <Text className="text-red-400 text-xs mt-1">Xóa đánh giá của tôi</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View className="items-center mt-2">
        <Text className="text-zinc-300 text-sm mb-3">
          {userRating.hasRated ? `Bạn đã đánh giá ${userRating.rating} điểm` : 'Chạm để đánh giá:'}
        </Text>
        <View className="flex-row items-center justify-between w-full">
          {stars.map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => handleRate(star)}
              disabled={isRating}
              className="p-1"
            >
              <Star
                size={22}
                color={userRating.rating && userRating.rating >= star ? '#fbbf24' : '#52525b'}
                fill={userRating.rating && userRating.rating >= star ? '#fbbf24' : 'transparent'}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}
