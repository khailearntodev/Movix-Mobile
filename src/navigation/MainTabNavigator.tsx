import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Search, Users, Video, User, Bell } from 'lucide-react-native';
import HomeScreen from '../app/home/HomeScreen';
import PeopleScreen from '../app/people/PeopleScreen';
import SearchPage from '../app/search/page';
import WatchPartyScreen from '../app/watch-party/page';
import AccountScreen from '@/app/account/AccountScreen';
import NotificationsScreen from '@/app/account/NotificationsScreen';
import { View, Text, Platform } from 'react-native';

const Tab = createBottomTabNavigator();

// Placeholder Profile Screen
const ProfileScreen = () => (
    <View className="flex-1 bg-black justify-center items-center">
        <Text className="text-white text-xl">Profile Screen</Text>
    </View>
);

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#09090b', // zinc-950
          borderTopColor: '#27272a', // zinc-800
          height: Platform.OS === 'ios' ? 88 : 60,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#dc2626', // red-600
        tabBarInactiveTintColor: '#71717a', // zinc-500
        tabBarLabelStyle: { fontSize: 12, fontWeight: '500' },
      }}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen} 
        options={{
            tabBarLabel: 'Trang chủ',
            tabBarIcon: ({ color }) => <Home color={color} size={24} />
        }}
      />
      <Tab.Screen 
        name="PeopleTab" 
        component={PeopleScreen} 
        options={{
            tabBarLabel: 'Nghệ sĩ',
            tabBarIcon: ({ color }) => <Users color={color} size={24} />
        }}
      />
      <Tab.Screen 
        name="SearchTab" 
        component={SearchPage} 
        options={{
            tabBarLabel: 'Tìm kiếm',
            tabBarIcon: ({ color }) => <Search color={color} size={24} />
        }}
      />
      <Tab.Screen 
        name="WatchPartyTab" 
        component={WatchPartyScreen} 
        options={{
            tabBarLabel: 'Xem chung',
            tabBarIcon: ({ color }) => <Video color={color} size={24} />
        }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={AccountScreen} 
        options={{
            tabBarLabel: 'Cá nhân',
            tabBarIcon: ({ color }) => <User color={color} size={24} />
        }}
      />
    </Tab.Navigator>
  );
}