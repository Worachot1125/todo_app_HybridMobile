import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/login";
import ClassmatesScreen from "../screens/listClassmate";
import FeedScreen from "../screens/feedClass";

export type RootStackParamList = {
  Login: undefined;
  Classmates: undefined;
  Feed: undefined;
};
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Classmates" component={ClassmatesScreen} />
        <Stack.Screen name="Feed" component={FeedScreen} />
      </Stack.Navigator>
      <Stack.Screen
        name="Classmates"
        component={ClassmatesScreen}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="Feed"
        component={FeedScreen}
        options={{ headerShown: true }}
      />
    </NavigationContainer>
  );
}
