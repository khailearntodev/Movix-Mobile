import React from "react";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from "expo-status-bar";
import "./global.css";
import LoginPage from "./src/app/(auth)/login/page";
import RegisterPage from "./src/app/(auth)/register/page";
import ForgotPasswordPage from "./src/app/(auth)/forgot-password/page";
import ResetPasswordPage from "./src/app/(auth)/reset-password/page";
import RemoteScreen from "./src/app/remote/RemoteScreen";
import WelcomePage from "./src/app/welcome/page";

import FilterPage from "./src/app/search/filter";
import SearchPage from "./src/app/search/page";
import WatchPartyScreen from "./src/app/watch-party/page";
import MainTabNavigator from "./src/navigation/MainTabNavigator";
import MovieDetailScreen from "./src/app/movie/MovieDetailScreen";
import PlaylistScreen from "./src/app/account/PlaylistScreen";
import FavoritesScreen from "./src/app/account/FavoritesScreen";
import HistoryScreen from "./src/app/account/HistoryScreen";
import EditProfileScreen from "./src/app/account/EditProfileScreen";
import NotificationsScreen from "./src/app/account/NotificationsScreen";
import SubscriptionScreen from "./src/app/account/SubscriptionScreen";
import { RootStackParamList } from "./src/types/navigation";

import WatchMovieScreen from "./src/app/movie/WatchMovieScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomePage} />
        {/* Auth Group */}
        <Stack.Screen name="Login" component={LoginPage} />
        <Stack.Screen name="Register" component={RegisterPage} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordPage} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordPage} />

        {/* Main App Group */}
        <Stack.Screen name="Main" component={MainTabNavigator} />
        <Stack.Screen name="MovieDetail" component={MovieDetailScreen} />
        <Stack.Screen name="WatchMovie" component={WatchMovieScreen} />
        <Stack.Screen name="Remote" component={RemoteScreen} />
        <Stack.Screen name="Search" component={SearchPage} />
        <Stack.Screen name="WatchParty" component={WatchPartyScreen} />

        {/* Account Group */}
        <Stack.Screen name="Playlist" component={PlaylistScreen} />
        <Stack.Screen name="Favorites" component={FavoritesScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Subscription" component={SubscriptionScreen} />

        <Stack.Screen
          name="Filter"
          component={FilterPage}
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
      </Stack.Navigator>
      <StatusBar style="light" />
    </NavigationContainer>
  );
}