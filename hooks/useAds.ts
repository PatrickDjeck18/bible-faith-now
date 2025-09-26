import { useState, useEffect, useCallback } from 'react';
import { ADS_CONFIG, AD_PLACEMENTS } from '../lib/adsConfig';
import { AdManager } from '../lib/adMobService';

export interface AdsState {
  isPremium: boolean;
  showAds: boolean;
  isLoading: boolean;
}

export const useAds = () => {
  const [adsState, setAdsState] = useState<AdsState>({
    isPremium: false,
    showAds: true,
    isLoading: false,
  });

  // Load purchase info and determine if ads should be shown
  const loadPurchaseInfo = useCallback(async () => {
    try {
      setAdsState(prev => ({ ...prev, isLoading: true }));
      
      // Since RevenueCat is removed, all users will see ads
      const showAds = true;
      const isPremium = false;

      setAdsState({
        isPremium,
        showAds,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error loading purchase info:', error);
      setAdsState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Initialize
  useEffect(() => {
    loadPurchaseInfo();
  }, [loadPurchaseInfo]);

  // Show interstitial ad if user is not premium
  const showInterstitialAd = useCallback(async (placement: keyof typeof AD_PLACEMENTS.INTERSTITIAL) => {
    if (adsState.isPremium) return true;

    try {
      const interstitial = AdManager.getInterstitial(ADS_CONFIG.ADMOB.INTERSTITIAL_ID);
      return await interstitial.showAd();
    } catch (error) {
      console.error('Error showing interstitial ad:', error);
      return false;
    }
  }, [adsState.isPremium]);

  // Show rewarded ad if user is not premium
  const showRewardedAd = useCallback(async (placement: keyof typeof AD_PLACEMENTS.REWARDED) => {
    if (adsState.isPremium) return { success: true, reward: { type: 'premium', amount: 1 } };

    try {
      const rewarded = AdManager.getRewarded(ADS_CONFIG.ADMOB.REWARDED_ID);
      return await rewarded.showAd();
    } catch (error) {
      console.error('Error showing rewarded ad:', error);
      return { success: false };
    }
  }, [adsState.isPremium]);

  // Purchase premium to remove ads (disabled since RevenueCat is removed)
  const purchasePremium = useCallback(async () => {
    console.log('Premium purchases are not available');
    return false;
  }, []);

  // Restore purchases (disabled since RevenueCat is removed)
  const restorePurchases = useCallback(async () => {
    console.log('Purchase restoration is not available');
    return false;
  }, []);

  return {
    ...adsState,
    showInterstitialAd,
    showRewardedAd,
    purchasePremium,
    restorePurchases,
    reloadPurchaseInfo: loadPurchaseInfo,
  };
};