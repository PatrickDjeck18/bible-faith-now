// 1. Polyfill the crypto module at the very top of the file
import 'react-native-get-random-values';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { initializeAdMob } from '../lib/adMobService';

export default function RootLayout() {
  useEffect(() => {
    // Initialize AdMob service
    const initializeServices = async () => {
      try {
        await initializeAdMob();
        console.log('AdMob service initialized successfully');
      } catch (error) {
        console.error('Failed to initialize ad service:', error);
      }
    };

    initializeServices();
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="add-prayer" />
        <Stack.Screen name="edit-prayer" />
        <Stack.Screen name="prayer-journal" />
        <Stack.Screen name="ai-bible-chat" />
        <Stack.Screen name="bible-study-ai" />
        <Stack.Screen name="note-taker" />
        <Stack.Screen name="dream-interpretation" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}