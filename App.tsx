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

import { RootStackParamList } from "./src/types/navigation";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginPage} />
        <Stack.Screen name="Register" component={RegisterPage} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordPage} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordPage} />
        <Stack.Screen name="Remote" component={RemoteScreen} />
      </Stack.Navigator>
      <StatusBar style="light" />
    </NavigationContainer>
  );
}
