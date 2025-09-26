// AdMob Configuration
export const ADS_CONFIG = {
  // AdMob Test IDs (replace with real IDs for production)
  ADMOB: {
    BANNER_ID: 'ca-app-pub-3940256099942544/6300978111', // Test banner ID
    INTERSTITIAL_ID: 'ca-app-pub-3940256099942544/1033173712', // Test interstitial ID
    REWARDED_ID: 'ca-app-pub-3940256099942544/5224354917', // Test rewarded ID
    APP_ID: 'ca-app-pub-3940256099942544~3347511713', // Test app ID
    IOS_APP_ID: 'ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy', // Add your iOS app ID here
  },
};

// Ad placement configuration
export const AD_PLACEMENTS = {
  BANNER: {
    HOME: 'home_banner',
    BIBLE: 'bible_banner',
    PRAYER: 'prayer_banner',
    MOOD: 'mood_banner',
    QUIZ: 'quiz_banner',
    DREAM: 'dream_banner',
    NOTES: 'notes_banner',
  },
  INTERSTITIAL: {
    HOME: 'home_interstitial',
    BIBLE: 'bible_interstitial',
    PRAYER: 'prayer_interstitial',
    MOOD: 'mood_interstitial',
    QUIZ: 'quiz_interstitial',
    DREAM: 'dream_interstitial',
    NOTES: 'notes_interstitial',
  },
  REWARDED: {
    BIBLE_CHAT: 'bible_chat_rewarded',
    QUIZ: 'quiz_rewarded',
    DREAM: 'dream_rewarded',
  },
};