import React, { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer, DarkTheme, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { ThemeProvider, useTheme } from "./src/theme/ThemeContext";
import { UserProvider } from "./src/state/UserContext";
import { SocialProvider } from "./src/state/SocialContext";
import TopBar from "./src/components/TopBar";
import TabBar from "./src/components/TabBar";
import CosmicSplash from "./src/screens/CosmicSplash";
import HomeScreen from "./src/screens/HomeScreen";
import { makeWebSection, WebLinkScreen } from "./src/screens/WebSectionScreen";
import ShareScreen from "./src/screens/ShareScreen";
import ChatScreen from "./src/screens/ChatScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import AccountScreen from "./src/screens/AccountScreen";
import SettingsPageScreen from "./src/screens/SettingsPageScreen";
import ChatInfoScreen from "./src/screens/ChatInfoScreen";
import NewChatScreen from "./src/screens/NewChatScreen";
import SearchScreen from "./src/screens/SearchScreen";
import PostScreen from "./src/screens/PostScreen";
import { useUser } from "./src/state/UserContext";
import { useSocial } from "./src/state/SocialContext";
import ReelsScreen from "./src/screens/ReelsScreen";
import { Poppins_300Light, Poppins_300Light_Italic, Poppins_400Regular } from "@expo-google-fonts/poppins";
import { fonts } from "./src/theme/colors";

SplashScreen.preventAutoHideAsync().catch(() => {});

const ExploreScreen = makeWebSection("Explore");
const LearnScreen = makeWebSection("Learn");
const NewsScreen = makeWebSection("News");

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Tabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={({ navigation, route }) => ({
        header: () => (
          <TopBar
            title={route.name}
            onViewProfile={() => navigation.navigate("Profile")}
            onMyAccount={() => navigation.navigate("Account")}
            onSearch={() => navigation.navigate("Search")}
          />
        ),
        // Smooth slide-and-fade between tabs.
        animation: "shift",
        // Mount every tab at launch so Explore/Learn/News start loading their
        // website pages in the background and are ready when opened.
        lazy: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Learn" component={LearnScreen} />
      <Tab.Screen name="News" component={NewsScreen} />
      <Tab.Screen name="Share" component={ShareScreen} />
    </Tab.Navigator>
  );
}

function Root() {
  const { colors, isDark, ready } = useTheme();
  const [splashDone, setSplashDone] = useState(false);
  const { user } = useUser();
  const { setBlocked } = useSocial();
  useEffect(() => setBlocked(user.blocked), [user.blocked]);

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme : DefaultTheme).colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.background,
      text: colors.text,
      border: colors.hairline,
      notification: colors.primary,
    },
    fonts: Object.fromEntries(
      Object.entries((isDark ? DarkTheme : DefaultTheme).fonts).map(([k, v]) => [k, { ...v, fontFamily: fonts.medium, fontWeight: "normal" }])
    ),
  };

  const stackHeader = {
    headerShown: true,
    headerStyle: { backgroundColor: colors.background },
    headerTintColor: colors.text,
    headerTitleStyle: { fontFamily: fonts.title, color: colors.text },
    headerShadowVisible: false,
    animation: "slide_from_right",
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark || !splashDone ? "light" : "dark"} />
      {ready && (
        <NavigationContainer theme={navTheme}>
          <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
            <Stack.Screen name="Main" component={Tabs} />
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ ...stackHeader, title: "Profile" }} />
            <Stack.Screen name="Account" component={AccountScreen} options={{ ...stackHeader, title: "Settings", headerTitleAlign: "center" }} />
            <Stack.Screen name="SettingsPage" component={SettingsPageScreen} options={{ ...stackHeader, headerTitleAlign: "center" }} />
            <Stack.Screen name="Reels" component={ReelsScreen} options={{ headerShown: false, animation: "slide_from_bottom" }} />
            <Stack.Screen name="Chat" component={ChatScreen} options={stackHeader} />
            <Stack.Screen name="ChatInfo" component={ChatInfoScreen} options={{ ...stackHeader, headerTitleAlign: "center" }} />
            <Stack.Screen name="NewChat" component={NewChatScreen} options={{ ...stackHeader, headerTitleAlign: "center" }} />
            <Stack.Screen name="Search" component={SearchScreen} options={{ headerShown: false, animation: "fade" }} />
            <Stack.Screen name="Post" component={PostScreen} options={{ ...stackHeader, title: "Post", headerTitleAlign: "center" }} />
            <Stack.Screen name="Website" component={WebLinkScreen} options={({ route }) => ({ ...stackHeader, title: route.params?.title || "Anveshya" })} />
          </Stack.Navigator>
        </NavigationContainer>
      )}
      {!splashDone && <CosmicSplash onDone={() => setSplashDone(true)} />}
    </View>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    [fonts.title]: require("./assets/fonts/Anallop.ttf"),
    [fonts.titleItalic]: require("./assets/fonts/Anallop-Italic.ttf"),
    [fonts.body]: Poppins_300Light,
    [fonts.bodyItalic]: Poppins_300Light_Italic,
    [fonts.medium]: Poppins_400Regular,
  });

  const ready = fontsLoaded || fontError;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <UserProvider>
          <SocialProvider>
            <Root />
          </SocialProvider>
        </UserProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
