import "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Text } from "react-native";
import ReaderScreen from "./src/screens/ReaderScreen";

const Tab = createBottomTabNavigator();

function Placeholder({ title }: { title: string }) {
  return <Text style={{ padding: 16 }}>{title}</Text>;
}

export default function App() {
  // Keep it simple for now (system theme can be added later).
  const theme = DefaultTheme;

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={theme}>
        <StatusBar style="dark" />
        <Tab.Navigator screenOptions={{ headerShown: false }}>
          <Tab.Screen name="Home" children={() => <Placeholder title="Home (mobile) — coming next" />} />
          <Tab.Screen name="Read" component={ReaderScreen} />
          <Tab.Screen name="Stats" children={() => <Placeholder title="Stats (mobile) — coming next" />} />
          <Tab.Screen name="Profile" children={() => <Placeholder title="Profile (mobile) — coming next" />} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
