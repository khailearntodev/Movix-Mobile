import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Check, ChevronRight, ChevronLeft } from "lucide-react-native";
import Toast from "react-native-toast-message";

import { RootStackParamList } from "../../types/navigation";
import { getOnboardingData, submitOnboarding, OnboardingData, OnboardingPayload } from "../../services/onboarding.service";
import { useAuth } from "../../contexts/AuthContext";
import apiClient from "../../services/api.service";

export default function OnboardingScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [data, setData] = useState<OnboardingData | null>(null);

    const [step, setStep] = useState(1);

    // Selections
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [selectedMovies, setSelectedMovies] = useState<string[]>([]);
    const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
    const [selectedCharacterTypes, setSelectedCharacterTypes] = useState<string[]>([]);
    const [selectedContentToAvoid, setSelectedContentToAvoid] = useState<string[]>([]);
    const [explorationLevel, setExplorationLevel] = useState<number>(50);

    useEffect(() => {
        if (user?.preferences?.onboarded_at) {
            navigation.replace("Main");
        }
    }, [user, navigation]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getOnboardingData();
                setData(result);
            } catch (error) {
                Toast.show({ type: "error", text1: "Lỗi", text2: "Không thể tải dữ liệu." });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleNext = () => setStep((s) => Math.min(s + 1, 4));
    const handlePrev = () => setStep((s) => Math.max(s - 1, 1));

    const toggleSelection = (item: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
        if (list.includes(item)) {
            setList(list.filter((i) => i !== item));
        } else {
            setList([...list, item]);
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const payload: OnboardingPayload = {
                fav_genres: selectedGenres,
                seed_movie_ids: selectedMovies,
                vibes: selectedVibes,
                favorite_character_types: selectedCharacterTypes,
                content_to_avoid: selectedContentToAvoid,
                exploration_level: explorationLevel,
            };

            const response = await submitOnboarding(payload);
            Toast.show({ type: "success", text1: "Thành công", text2: response.message || "Đã lưu sở thích của bạn!" });
            
            // Force fetch me
            apiClient.get('/profile/me').catch(() => {});

            navigation.replace("Main");
        } catch (error: any) {
            Toast.show({ type: "error", text1: "Lỗi", text2: error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại." });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || !data) {
        return (
            <SafeAreaView className="flex-1 bg-black justify-center items-center">
                <ActivityIndicator size="large" color="#e50914" />
                <Text className="text-zinc-400 mt-4">Đang chuẩn bị trải nghiệm cho bạn...</Text>
            </SafeAreaView>
        );
    }

    const renderStepIndicators = () => (
        <View className="flex-row gap-2 justify-center mt-2 mb-6">
            {[1, 2, 3, 4].map((i) => (
                <View
                    key={i}
                    className={`h-2 rounded-full ${i === step ? "w-8 bg-red-600" : i < step ? "w-4 bg-red-600/50" : "w-4 bg-zinc-800"}`}
                />
            ))}
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-black px-4">
            {renderStepIndicators()}

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {step === 1 && (
                    <View className="pb-8">
                        <Text className="text-3xl font-bold text-white mb-2">Thể loại yêu thích?</Text>
                        <Text className="text-zinc-400 mb-6">Chọn các thể loại để Movix gợi ý phim chuẩn gu nhé.</Text>
                        <View className="flex-row flex-wrap gap-3">
                            {data.genres.map((genre) => {
                                const isSelected = selectedGenres.includes(genre.id);
                                return (
                                    <TouchableOpacity
                                        key={genre.id}
                                        onPress={() => toggleSelection(genre.id, selectedGenres, setSelectedGenres)}
                                        className={`px-5 py-3 rounded-full border flex-row items-center gap-2 ${isSelected ? "bg-red-600 border-red-600" : "bg-zinc-900 border-zinc-700"}`}
                                    >
                                        <Text className={`font-medium ${isSelected ? "text-white" : "text-zinc-300"}`}>{genre.name}</Text>
                                        {isSelected && <Check size={16} color="white" />}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                )}

                {step === 2 && (
                    <View className="pb-8">
                        <Text className="text-3xl font-bold text-white mb-2">Phim bạn từng thích?</Text>
                        <Text className="text-zinc-400 mb-6">Giúp chúng tôi hiểu rõ hơn về gu phim của bạn.</Text>
                        <View className="flex-row flex-wrap justify-between gap-y-4">
                            {data.seed_movies.map((movie) => {
                                const isSelected = selectedMovies.includes(movie.id);
                                return (
                                    <TouchableOpacity
                                        key={movie.id}
                                        onPress={() => toggleSelection(movie.id, selectedMovies, setSelectedMovies)}
                                        className="w-[31%] aspect-[2/3] rounded-lg overflow-hidden relative"
                                    >
                                        <Image
                                            source={{ uri: movie.poster_url || "https://via.placeholder.com/150" }}
                                            className="w-full h-full"
                                            resizeMode="cover"
                                        />
                                        <View className={`absolute inset-0 ${isSelected ? "bg-red-600/40" : "bg-black/20"}`} />
                                        {isSelected && (
                                            <View className="absolute inset-0 flex items-center justify-center bg-black/60">
                                                <View className="bg-red-600 p-2 rounded-full">
                                                    <Check size={20} color="white" />
                                                </View>
                                            </View>
                                        )}
                                        <View className="absolute bottom-0 inset-x-0 p-1 bg-black/70">
                                            <Text className="text-white text-xs text-center" numberOfLines={1}>{movie.title}</Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                )}

                {step === 3 && (
                    <View className="pb-8 space-y-8">
                        <View>
                            <Text className="text-3xl font-bold text-white mb-2">Cảm xúc & Nhân vật</Text>
                            <Text className="text-zinc-400 mb-6">Vibe phim và kiểu nhân vật bạn dễ bị thu hút?</Text>
                        </View>

                        <View>
                            <Text className="text-xl font-bold text-white mb-4">✨ Vibe mong muốn</Text>
                            <View className="flex-row flex-wrap gap-3">
                                {data.predefined_vibes.map((vibe) => {
                                    const isSelected = selectedVibes.includes(vibe);
                                    return (
                                        <TouchableOpacity
                                            key={vibe}
                                            onPress={() => toggleSelection(vibe, selectedVibes, setSelectedVibes)}
                                            className={`px-4 py-2 rounded-full border ${isSelected ? "bg-red-600 border-red-600" : "bg-zinc-900 border-zinc-700"}`}
                                        >
                                            <Text className={isSelected ? "text-white" : "text-zinc-300"}>{vibe}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        <View className="mt-8">
                            <Text className="text-xl font-bold text-yellow-500 mb-4">🎭 Kiểu nhân vật</Text>
                            <View className="flex-row flex-wrap gap-3">
                                {data.predefined_character_types.map((char) => {
                                    const isSelected = selectedCharacterTypes.includes(char);
                                    return (
                                        <TouchableOpacity
                                            key={char}
                                            onPress={() => toggleSelection(char, selectedCharacterTypes, setSelectedCharacterTypes)}
                                            className={`px-4 py-2 rounded-full border ${isSelected ? "bg-red-600 border-red-600" : "bg-zinc-900 border-zinc-700"}`}
                                        >
                                            <Text className={isSelected ? "text-white" : "text-zinc-300"}>{char}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    </View>
                )}

                {step === 4 && (
                    <View className="pb-8 space-y-8">
                        <View>
                            <Text className="text-3xl font-bold text-white mb-2">Chi tiết cuối cùng</Text>
                            <Text className="text-zinc-400 mb-6">Giúp chúng tôi hoàn thiện gợi ý của bạn.</Text>
                        </View>

                        <View>
                            <Text className="text-xl font-bold text-red-400 mb-4">🚫 Nội dung tránh (Tuỳ chọn)</Text>
                            <View className="flex-row flex-wrap gap-3">
                                {data.predefined_content_to_avoid.map((item) => {
                                    const isSelected = selectedContentToAvoid.includes(item);
                                    return (
                                        <TouchableOpacity
                                            key={item}
                                            onPress={() => toggleSelection(item, selectedContentToAvoid, setSelectedContentToAvoid)}
                                            className={`px-4 py-2 rounded-full border ${isSelected ? "bg-red-900/40 border-red-600" : "bg-zinc-900 border-zinc-700"}`}
                                        >
                                            <Text className={isSelected ? "text-red-400" : "text-zinc-300"}>{item}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        <View className="mt-8 bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
                            <Text className="text-xl font-bold text-white mb-2">Mức độ khám phá</Text>
                            <Text className="text-zinc-400 text-sm mb-6">Sẵn sàng khám phá thể loại mới?</Text>
                            
                            <View className="flex-row justify-between mb-4">
                                {[25, 50, 75, 100].map((level) => (
                                    <TouchableOpacity
                                        key={level}
                                        onPress={() => setExplorationLevel(level)}
                                        className={`px-3 py-2 rounded-lg ${explorationLevel === level ? "bg-red-600" : "bg-zinc-800"}`}
                                    >
                                        <Text className={explorationLevel === level ? "text-white font-bold" : "text-zinc-400"}>{level}%</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Bottom Actions */}
            <View className="flex-row justify-between items-center py-4 border-t border-zinc-900">
                {step > 1 ? (
                    <TouchableOpacity
                        onPress={handlePrev}
                        disabled={submitting}
                        className="w-12 h-12 rounded-full bg-zinc-800 items-center justify-center"
                    >
                        <ChevronLeft color="white" size={24} />
                    </TouchableOpacity>
                ) : <View className="w-12 h-12" />}

                {step < 4 ? (
                    <TouchableOpacity
                        onPress={handleNext}
                        className="w-12 h-12 rounded-full bg-red-600 items-center justify-center shadow-lg shadow-red-900/50"
                    >
                        <ChevronRight color="white" size={24} />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={submitting}
                        className="bg-red-600 px-8 py-3 rounded-full flex-row items-center shadow-lg shadow-red-900/50"
                    >
                        {submitting ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold text-lg">Hoàn tất</Text>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
}
