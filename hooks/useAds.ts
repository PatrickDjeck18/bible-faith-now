import { useState, useEffect, useCallback } from 'react';
import { ADS_CONFIG, AD_PLACEMENTS } from '../lib/adsConfig';
import { AdManager } from '../lib/adMobService';
import { revenueCatService, PurchaseInfo } from '../lib/revenueCatService';
import { PurchasesPackage } from 'react-native-purchases';

export interface AdsState {
  isPremium: boolean;
  showAds: boolean;
  purchaseInfo: PurchaseInfo;
  isLoading: boolean;
}

export const useAds = () => {
  const [adsState, setAdsState] = useState<AdsState>({
    isPremium: false,
    showAds: true,
    purchaseInfo: {
      isPremium: false,
      entitlements: [],
      activeSubscriptions: [],
    },
    isLoading: true,
  });

  // Load purchase info and determine if ads should be shown
  const loadPurchaseInfo = useCallback(async () => {
    try {
      setAdsState(prev => ({ ...prev, isLoading: true }));
      
      const purchaseInfo = await revenueCatService.getPurchaseInfo();
      const showAds = !purchaseInfo.isPremium;

      setAdsState({
        isPremium: purchaseInfo.isPremium,
        showAds,
        purchaseInfo,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error loading purchase info:', error);
      setAdsState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Initialize and set up listeners
  useEffect(() => {
    loadPurchaseInfo();

    // Set up purchase listener
    revenueCatService.setupPurchaseListener((purchaseInfo) => {
      const showAds = !purchaseInfo.isPremium;
      setAdsState({
        isPremium: purchaseInfo.isPremium,
        showAds,
        purchaseInfo,
        isLoading: false,
      });
    });
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

  // Purchase premium to remove ads
  const purchasePremium = useCallback(async (packageToPurchase: PurchasesPackage) => {
    try {
      const success = await revenueCatService.purchasePackage(packageToPurchase);
      if (success) {
        await loadPurchaseInfo();
      }
      return success;
    } catch (error) {
      console.error('Error purchasing premium:', error);
      return false;
    }
  }, [loadPurchaseInfo]);

  // Restore purchases
  const restorePurchases = useCallback(async () => {
    try {
      const success = await revenueCatService.restorePurchases();
      if (success) {
        await loadPurchaseInfo();
      }
      return success;
    } catch (error) {
      console.error('Error restoring purchases:', error);
      return false;
    }
  }, [loadPurchaseInfo]);

  return {
    ...adsState,
    showInterstitialAd,
    showRewardedAd,
    purchasePremium,
    restorePurchases,
    reloadPurchaseInfo: loadPurchaseInfo,
  };
};