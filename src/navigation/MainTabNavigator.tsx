import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Search, Users, Video, User } from 'lucide-react-native';
import HomeScreen from '../app/home/HomeScreen';
import PeopleScreen from '../app/people/PeopleScreen';
import SearchScreen from '../app/search/SearchScreen';
import WatchPartyScreen from '../app/watch-party/WatchPartyScreen';
import ProfileStackNavigator from './ProfileStackNavigator';
import { Platform } from 'react-native';

const Tab = createBottomTabNavigator();

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
        name="Home" 
        component={HomeScreen} 
        options={{
            tabBarLabel: 'Trang chủ',
            tabBarIcon: ({ color }) => <Home color={color} size={24} />
        }}
      />
      <Tab.Screen 
        name="People" 
        component={PeopleScreen} 
        options={{
            tabBarLabel: 'Nghệ sĩ',
            tabBarIcon: ({ color }) => <Users color={color} size={24} />
        }}
      />
      <Tab.Screen 
        name="Search" 
        component={SearchScreen} 
        options={{
            tabBarLabel: 'Tìm kiếm',
            tabBarIcon: ({ color }) => <Search color={color} size={24} />
        }}
      />
      <Tab.Screen 
        name="WatchParty" 
        component={WatchPartyScreen} 
        options={{
            tabBarLabel: 'Xem chung',
            tabBarIcon: ({ color }) => <Video color={color} size={24} />
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStackNavigator} 
        options={{
            tabBarLabel: 'Cá nhân',
            tabBarIcon: ({ color }) => <User color={color} size={24} />
        }}
      />
    </Tab.Navigator>
  );
}