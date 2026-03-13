import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, SafeAreaView, StatusBar as RNStatusBar } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Person } from '../../types/person';
import { ArrowLeft } from 'lucide-react-native';
import { RootStackParamList } from '../../types/navigation';
import { mockPeople } from '../../data/mockPeople';

const PeopleScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const getImageUrl = (path: string | null) => 
    path ? `https://image.tmdb.org/t/p/w500${path}` : 'https://via.placeholder.com/150';

  const renderItem = ({ item }: { item: Person }) => (
    <TouchableOpacity 
      className="flex-1 m-2 bg-neutral-800 rounded-lg overflow-hidden"
      onPress={() => navigation.navigate('PersonDetail', { personId: item.id })}
    >
      <Image 
        source={{ uri: getImageUrl(item.profilePath) }} 
        className="w-full h-64"
        resizeMode="cover"
      />
      <View className="p-3">
        <Text className="text-white font-bold text-base" numberOfLines={1}>{item.name}</Text>
        <Text className="text-gray-400 text-sm" numberOfLines={1}>{item.role}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-neutral-900" style={{ paddingTop: RNStatusBar.currentHeight }}>
      <StatusBar style="light" />
      <View className="flex-row items-center px-4 py-3 border-b border-neutral-800">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <ArrowLeft color="white" size={24} />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold">Nghệ sĩ</Text>
      </View>

      <FlatList
        data={mockPeople}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={{ padding: 8 }}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default PeopleScreen;
