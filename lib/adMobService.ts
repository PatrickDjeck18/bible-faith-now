import { MobileAds, AdEventType, TestIds, InterstitialAd, RewardedAd } from 'react-native-google-mobile-ads';
import { ADS_CONFIG } from './adsConfig';

// Initialize AdMob
export const initializeAdMob = async () => {
  try {
    await MobileAds().initialize();
    console.log('AdMob initialized successfully');
  } catch (error) {
    console.error('Error initializing AdMob:', error);
  }
};

// Banner Ad Component Props
export interface BannerAdProps {
  unitId: string;
  size?: string;
  onAdLoaded?: () => void;
  onAdFailedToLoad?: (error: any) => void;
}

// Interstitial Ad Service
export class InterstitialAdService {
  private interstitial: any = null;

  constructor(private unitId: string) {
    this.loadInterstitial();
  }

  private async loadInterstitial() {
    try {
      this.interstitial = InterstitialAd.createForAdRequest(
        __DEV__ ? TestIds.INTERSTITIAL : this.unitId,
        {
          requestNonPersonalizedAdsOnly: true,
          keywords: ['bible', 'prayer', 'christian', 'faith', 'religion'],
        }
      );

      // Preload the ad
      this.interstitial.load();
    } catch (error) {
      console.error('Error loading interstitial ad:', error);
    }
  }

  async showAd(): Promise<boolean> {
    if (!this.interstitial) {
      await this.loadInterstitial();
      return false;
    }

    return new Promise((resolve) => {
      const unsubscribeLoaded = this.interstitial.addAdEventListener(
        AdEventType.LOADED,
        () => {
          this.interstitial.show();
          unsubscribeLoaded();
          resolve(true);
        }
      );

      const unsubscribeError = this.interstitial.addAdEventListener(
        AdEventType.ERROR,
        (error: any) => {
          console.error('Interstitial ad error:', error);
          unsubscribeError();
          resolve(false);
        }
      );

      // If ad is already loaded, show it immediately
      if (this.interstitial.loaded) {
        this.interstitial.show();
        resolve(true);
      } else {
        // Load the ad if not loaded
        this.interstitial.load();
      }

      // Timeout after 5 seconds
      setTimeout(() => {
        unsubscribeLoaded();
        unsubscribeError();
        resolve(false);
      }, 5000);
    });
  }
}

// Rewarded Ad Service
export class RewardedAdService {
  private rewarded: any = null;

  constructor(private unitId: string) {
    this.loadRewarded();
  }

  private async loadRewarded() {
    try {
      this.rewarded = RewardedAd.createForAdRequest(
        __DEV__ ? TestIds.REWARDED : this.unitId,
        {
          requestNonPersonalizedAdsOnly: true,
          keywords: ['bible', 'prayer', 'christian', 'faith', 'religion'],
        }
      );

      // Preload the ad
      this.rewarded.load();
    } catch (error) {
      console.error('Error loading rewarded ad:', error);
    }
  }

  async showAd(): Promise<{ success: boolean; reward?: any }> {
    if (!this.rewarded) {
      await this.loadRewarded();
      return { success: false };
    }

    return new Promise((resolve) => {
      let rewardEarned = false;

      const unsubscribeLoaded = this.rewarded.addAdEventListener(
        AdEventType.LOADED,
        () => {
          this.rewarded.show();
          unsubscribeLoaded();
        }
      );

      // Use the correct event type for rewarded ads
      const unsubscribeRewarded = this.rewarded.addAdEventListener(
        'rewarded',
        (reward: any) => {
          rewardEarned = true;
          unsubscribeRewarded();
        }
      );

      const unsubscribeClosed = this.rewarded.addAdEventListener(
        AdEventType.CLOSED,
        () => {
          unsubscribeLoaded();
          unsubscribeRewarded();
          unsubscribeClosed();
          resolve({ success: rewardEarned, reward: rewardEarned ? { type: 'reward', amount: 1 } : undefined });
        }
      );

      const unsubscribeError = this.rewarded.addAdEventListener(
        AdEventType.ERROR,
        (error: any) => {
          console.error('Rewarded ad error:', error);
          unsubscribeLoaded();
          unsubscribeRewarded();
          unsubscribeClosed();
          unsubscribeError();
          resolve({ success: false });
        }
      );

      // If ad is already loaded, show it immediately
      if (this.rewarded.loaded) {
        this.rewarded.show();
      } else {
        // Load the ad if not loaded
        this.rewarded.load();
      }

      // Timeout after 10 seconds
      setTimeout(() => {
        unsubscribeLoaded();
        unsubscribeRewarded();
        unsubscribeClosed();
        unsubscribeError();
        resolve({ success: false });
      }, 10000);
    });
  }
}

// Ad Manager for handling different ad types
export class AdManager {
  private static instances: Map<string, InterstitialAdService | RewardedAdService> = new Map();

  static getInterstitial(unitId: string): InterstitialAdService {
    const key = `interstitial_${unitId}`;
    if (!this.instances.has(key)) {
      this.instances.set(key, new InterstitialAdService(unitId));
    }
    return this.instances.get(key) as InterstitialAdService;
  }

  static getRewarded(unitId: string): RewardedAdService {
    const key = `rewarded_${unitId}`;
    if (!this.instances.has(key)) {
      this.instances.set(key, new RewardedAdService(unitId));
    }
    return this.instances.get(key) as RewardedAdService;
  }
}