import { ActivityIndicator, View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useContext } from "react";
import { colors } from "../constants/colors";
import GlobalState, { MoneyContext } from "../contexts/GlobalState";
import { globalStyles } from "../styles/globalStyles";
import LoginScreen from "../components/LoginScreen";

function AppNavigator() {
  const { user, authLoading } = useContext(MoneyContext);

  if (authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GlobalState>
      <StatusBar backgroundColor={colors.primary} style="light" />
      <AppNavigator />
    </GlobalState>
  );
}