import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, SafeAreaView, Dimensions, FlatList } from 'react-native';
import { useNavigation, useRoute, RouteProp, NavigationProp } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { RootStackParamList } from '../../types/navigation';
import { mockPeople } from '../../data/mockPeople';
import { ArrowLeft, User, Calendar, MapPin, Briefcase } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const PersonDetailScreen = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const route = useRoute<RouteProp<RootStackParamList, 'PersonDetail'>>();
    const { personId } = route.params;

    const person = mockPeople.find(p => p.id === personId);

    if (!person) {
        return (
            <SafeAreaView className="flex-1 bg-neutral-900 justify-center items-center">
                <Text className="text-white">Không tìm thấy thông tin nghệ sĩ.</Text>
            </SafeAreaView>
        );
    }

    const getImageUrl = (path: string | null) => 
        path ? `https://image.tmdb.org/t/p/original${path}` : 'https://via.placeholder.com/300';
    
    // Helper for rendering credit items horizontally
    const renderCreditItem = ({ item }: { item: any }) => (
        <TouchableOpacity className="mr-4 space-y-2 w-32">
            <View className="w-32 h-48 bg-neutral-800 rounded-lg overflow-hidden relative">
                <Image 
                    source={{ uri: `https://image.tmdb.org/t/p/w200${item.posterPath}` }} 
                    className="w-full h-full"
                    resizeMode="cover"
                />
                 {item.voteAverage && (
                    <View className="absolute top-1 right-1 bg-black/60 px-1 rounded-md">
                        <Text className="text-yellow-500 text-xs font-bold">★ {item.voteAverage}</Text>
                    </View>
                )}
            </View>
            <Text className="text-white text-xs font-semibold" numberOfLines={2}>{item.title}</Text>
            <Text className="text-neutral-400 text-[10px]" numberOfLines={1}>{item.character}</Text>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-neutral-900">
            <StatusBar style="light" />
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                {/* Header Image */}
                <View className="relative w-full shadow-2xl shadow-neutral-900">
                    <Image 
                        source={{ uri: getImageUrl(person.profilePath) }} 
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
                        <Text className="text-neutral-300 text-base font-semibold">{person.role}</Text>
                    </View>
                </View>

                {/* Personal Info Grid */}
                <View className="flex-row justify-around bg-neutral-800/50 mx-4 mt-4 p-4 rounded-xl border border-neutral-800">
                    <View className="items-center">
                        <Briefcase color="#ef4444" size={20} style={{ marginBottom: 4 }} />
                        <Text className="text-white font-bold text-xs">{person.role || 'N/A'}</Text>
                        <Text className="text-neutral-400 text-[10px] uppercase">Nghề nghiệp</Text>
                    </View>
                    <View className="w-[1px] bg-neutral-700 mx-2" />
                    <View className="items-center">
                        <User color="#ef4444" size={20} style={{ marginBottom: 4 }} />
                        <Text className="text-white font-bold text-xs">{person.gender === 2 ? 'Nam' : person.gender === 1 ? 'Nữ' : 'N/A'}</Text>
                        <Text className="text-neutral-400 text-[10px] uppercase">Giới tính</Text>
                    </View>
                    <View className="w-[1px] bg-neutral-700 mx-2" />
                     <View className="items-center">
                        <Calendar color="#ef4444" size={20} style={{ marginBottom: 4 }} />
                        <Text className="text-white font-bold text-xs">{person.birthday || 'N/A'}</Text>
                        <Text className="text-neutral-400 text-[10px] uppercase">Ngày sinh</Text>
                    </View>
                </View>

                {/* Biography */}
                {person.biography && (
                    <View className="px-4 mt-6 space-y-3">
                        <Text className="text-white text-lg font-bold border-l-4 border-red-600 pl-2">Tiểu sử</Text>
                        <Text className="text-neutral-400 text-sm leading-6 tracking-wide">
                            {person.biography}
                        </Text>
                    </View>
                )}

                {/* Known For */}
                {person.credits && person.credits.length > 0 && (
                     <View className="mt-8">
                        <Text className="text-white text-lg font-bold px-4 mb-4 border-l-4 border-red-600 ml-4 pl-2">Các phim đã tham gia</Text>
                        <FlatList
                            data={person.credits}
                            renderItem={renderCreditItem}
                            keyExtractor={(item) => item.id.toString()}
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
