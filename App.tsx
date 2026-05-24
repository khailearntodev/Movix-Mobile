import React from "react";
import { LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from './src/contexts/AuthContext';
import { NotificationProvider } from './src/contexts/NotificationContext';
import "./global.css";
import LoginPage from "./src/app/(auth)/login/LoginScreen";
import RegisterPage from "./src/app/(auth)/register/RegisterScreen";
import ForgotPasswordPage from "./src/app/(auth)/forgot-password/ForgotPasswordScreen";
import ResetPasswordPage from "./src/app/(auth)/reset-password/ResetPasswordScreen";
import RemoteScreen from "./src/app/remote/RemoteScreen";
import WelcomePage from "./src/app/welcome/WelcomeScreen";

import FilterPage from "./src/app/search/FilterScreen";
import SearchPage from "./src/app/search/SearchScreen";
import WatchPartyScreen from "./src/app/watch-party/WatchPartyScreen";
import WatchPartyRoom from "./src/app/watch-party/WatchPartyRoom";
import MainTabNavigator from "./src/navigation/MainTabNavigator";
import MovieDetailScreen from "./src/app/movie/MovieDetailScreen";
import PlaylistScreen from "./src/app/account/PlaylistScreen";
import FavoritesScreen from "./src/app/account/FavoritesScreen";
import HistoryScreen from "./src/app/account/HistoryScreen";
import EditProfileScreen from "./src/app/account/EditProfileScreen";
import NotificationsScreen from "./src/app/account/NotificationsScreen";
import SubscriptionScreen from "./src/app/account/SubscriptionScreen";
import TransactionsScreen from "./src/app/account/TransactionsScreen";
import { RootStackParamList } from "./src/types/navigation";

import WatchMovieScreen from "./src/app/movie/WatchMovieScreen";
import AIChatScreen from "./src/app/ai/AIChatScreen";
import PeopleScreen from "./src/app/people/PeopleScreen";
import PersonDetailScreen from "./src/app/people/PersonDetailScreen";
import BlogDetailScreen from "./src/app/blog/BlogDetailScreen";
import CreateBlogScreen from "./src/app/blog/CreateBlogScreen";
import BlogSearchScreen from "./src/app/blog/BlogSearchScreen";
import Toast from "react-native-toast-message";

LogBox.ignoreLogs([
  "SafeAreaView has been deprecated and will be removed in a future release.",
]);

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <AuthProvider>
        <NavigationContainer>
        <NotificationProvider >
            <Stack.Navigator
                initialRouteName="Welcome"
                screenOptions={{ headerShown: false }}
            >
                <Stack.Screen name="Welcome" component={WelcomePage} />
                
                {/* Auth Group */}
                <Stack.Screen name="Login" component={LoginPage} />
                <Stack.Screen name="Register" component={RegisterPage} />
                <Stack.Screen name="ForgotPassword" component={ForgotPasswordPage} />
                <Stack.Screen name="ResetPassword" component={ResetPasswordPage} />

            {/* Main App Group */}
            <Stack.Screen
              name="Main"
              component={MainTabNavigator}
              options={{ gestureEnabled: false }} 
            />
            <Stack.Screen name="MovieDetail" component={MovieDetailScreen} />
            <Stack.Screen name="WatchMovie" component={WatchMovieScreen} />
            <Stack.Screen name="Remote" component={RemoteScreen} />
            <Stack.Screen name="Search" component={SearchPage} />
            <Stack.Screen name="WatchParty" component={WatchPartyScreen} />
            <Stack.Screen name="WatchPartyRoom" component={WatchPartyRoom} />
            <Stack.Screen name="AIChat" component={AIChatScreen} />
            <Stack.Screen name="People" component={PeopleScreen} />
            <Stack.Screen name="PersonDetail" component={PersonDetailScreen} />
            <Stack.Screen name="BlogDetail" component={BlogDetailScreen} />
            <Stack.Screen 
              name="CreateBlog" 
              component={CreateBlogScreen} 
              options={{ presentation: "modal", animation: "slide_from_bottom" }} 
            />
            <Stack.Screen 
              name="BlogSearch" 
              component={BlogSearchScreen} 
              options={{ animation: "fade" }} 
            />

            {/* Account Group */}
            <Stack.Screen name="Playlist" component={PlaylistScreen} />
            <Stack.Screen name="Favorites" component={FavoritesScreen} />
            <Stack.Screen name="History" component={HistoryScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Subscription" component={SubscriptionScreen} />
            <Stack.Screen name="Transactions" component={TransactionsScreen} />

            <Stack.Screen
              name="Filter"
              component={FilterPage}
              options={{ presentation: "modal", animation: "slide_from_bottom" }}
            />
          </Stack.Navigator>
        </NotificationProvider>
        <Toast />
      <StatusBar style="light" />
    </NavigationContainer>
    </AuthProvider>
  );
}