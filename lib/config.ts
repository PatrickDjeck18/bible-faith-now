import Constants from 'expo-constants';

// Environment configuration
export const config = {
  firebase: {
    apiKey: Constants.expoConfig?.extra?.firebaseApiKey || 'AIzaSyDbcPSejp8kJKEJBomRtAvPsWCAz9HSCCg',
    authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain || 'daily-bread-88f42.firebaseapp.com',
    projectId: Constants.expoConfig?.extra?.firebaseProjectId || 'daily-bread-88f42',
    storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket || 'daily-bread-88f42.firebasestorage.app',
    messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId || '354959331079',
    appId: Constants.expoConfig?.extra?.firebaseAppId || '1:354959331079:android:7484ecb8076d9ee686ffa2',
    databaseURL: Constants.expoConfig?.extra?.firebaseDatabaseUrl || 'https://daily-bread-88f42.firebaseio.com',
  },
  google: {
    clientId: Constants.expoConfig?.extra?.googleClientId || process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '354959331079-faisqnjq2nd81nrhnikm2t0clfc49kle.apps.googleusercontent.com',
    webClientId: '354959331079-faisqnjq2nd81nrhnikm2t0clfc49kle.apps.googleusercontent.com',
  },
  app: {
    scheme: typeof Constants.expoConfig?.scheme === 'string' ? Constants.expoConfig.scheme : 'daily-bread',
    name: Constants.expoConfig?.name || 'Daily Bread',
  },
};