import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Dimensions, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp, NavigationProp } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { RootStackParamList } from '../../types/navigation';
import { Person, PersonCredit } from '../../types/person';
import { peopleService } from '../../services/people.service';
import { ArrowLeft, User, Calendar, MapPin, Briefcase } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const PersonDetailScreen = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const route = useRoute<RouteProp<RootStackParamList, 'PersonDetail'>>();
    const { personId } = route.params;

    const [person, setPerson] = useState<Person | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchPersonDetail = async () => {
            try {
                const data = await peopleService.getDetail(personId);
                setPerson(data);
            } catch (error) {
                console.error("Failed to fetch person details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPersonDetail();
    }, [personId]);

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-neutral-900 justify-center items-center">
                <ActivityIndicator size="large" color="#ef4444" />
            </SafeAreaView>
        );
    }

    if (!person) {
        return (
            <SafeAreaView className="flex-1 bg-neutral-900 justify-center items-center">
                <Text className="text-white">Không tìm thấy thông tin nghệ sĩ.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4 bg-neutral-800 px-4 py-2 rounded-lg">
                    <Text className="text-white">Quay lại</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const getImageUrl = (path: string | null) =>
        path ? path : 'https://via.placeholder.com/500x750?text=No+Image';

    // Helper for rendering credit items horizontally
    const renderCreditItem = ({ item }: { item: PersonCredit }) => (
        <TouchableOpacity
            className="mr-4 space-y-2 w-32"
            onPress={() => {
                // @ts-ignore - Bypass tạm vì type Movie truyền vào có thể chưa match hoàn toàn với require của MovieDetail
                navigation.navigate('MovieDetail', { movie: item.movie });
            }}
        >
            <View className="w-32 h-48 bg-neutral-800 rounded-lg overflow-hidden relative">
                <Image
                    source={{ uri: getImageUrl(item.movie.poster_url) }}
                    className="w-full h-full bg-neutral-700"
                    resizeMode="cover"
                />
            </View>
            <Text className="text-white text-xs font-semibold mt-2" numberOfLines={2}>{item.movie.title}</Text>
            {item.character && (
                <Text className="text-neutral-400 text-[10px]" numberOfLines={1}>{item.character}</Text>
            )}
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-neutral-900">
            <StatusBar style="light" />
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }} bounces={false}>
                {/* Header Image */}
                <View className="relative w-full bg-neutral-800 shadow-2xl shadow-neutral-900" style={{ height: width * 1.3 }}>
                    <Image
                        source={{ uri: getImageUrl(person.avatar_url) }}
                        style={{ width, height: width * 1.3 }}
                        resizeMode="cover"
                    />
                    <View className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-neutral-900 to-transparent" />

                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="absolute top-12 left-4 bg-black/40 p-2 rounded-full"
                    >
                        <ArrowLeft color="white" size={24} />
                    </TouchableOpacity>

                    <View className="absolute bottom-6 left-4 right-4">
                        <Text className="text-white text-3xl font-bold font-sans shadow-black shadow-lg">{person.name}</Text>
                        <Text className="text-neutral-300 text-base font-semibold mt-1">{person.role_type}</Text>
                    </View>
                </View>

                {/* Personal Info Grid */}
                <View className="flex-row justify-around bg-neutral-800/50 mx-4 mt-6 p-4 rounded-xl border border-neutral-800">
                    <View className="items-center flex-1">
                        <Briefcase color="#ef4444" size={20} style={{ marginBottom: 4 }} />
                        <Text className="text-white font-bold text-xs mt-1" numberOfLines={1}>{person.role_type || 'N/A'}</Text>
                        <Text className="text-neutral-400 text-[10px] uppercase mt-1">Nghề nghiệp</Text>
                    </View>
                    <View className="w-[1px] bg-neutral-700 mx-2" />
                    <View className="items-center flex-1">
                        <User color="#ef4444" size={20} style={{ marginBottom: 4 }} />
                        <Text className="text-white font-bold text-xs mt-1">
                            {person.gender === 2 ? 'Nam' : person.gender === 1 ? 'Nữ' : 'Khác'}
                        </Text>
                        <Text className="text-neutral-400 text-[10px] uppercase mt-1">Giới tính</Text>
                    </View>
                    <View className="w-[1px] bg-neutral-700 mx-2" />
                    <View className="items-center flex-1">
                        <Calendar color="#ef4444" size={20} style={{ marginBottom: 4 }} />
                        <Text className="text-white font-bold text-xs mt-1">
                            {person.birthday ? new Date(person.birthday).toLocaleDateString('vi-VN') : 'N/A'}
                        </Text>
                        <Text className="text-neutral-400 text-[10px] uppercase mt-1">Ngày sinh</Text>
                    </View>
                </View>

                {/* Biography */}
                {person.biography ? (
                    <View className="px-4 mt-8 space-y-3">
                        <Text className="text-white text-lg font-bold border-l-4 border-red-600 pl-3 mb-3">Tiểu sử</Text>
                        <Text className="text-neutral-400 text-sm leading-6 tracking-wide">
                            {person.biography}
                        </Text>
                    </View>
                ) : null}

                {/* Known For / Movie People */}
                {person.movie_people && person.movie_people.length > 0 && (
                    <View className="mt-8">
                        <Text className="text-white text-lg font-bold px-4 mb-4 border-l-4 border-red-600 ml-4 pl-3">Các phim đã tham gia</Text>
                        <FlatList
                            data={person.movie_people}
                            renderItem={renderCreditItem}
                            keyExtractor={(item) => item.id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 16 }}
                        />
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

export default PersonDetailScreen;
