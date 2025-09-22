import { useCallback } from 'react';
import { AdManager } from '../lib/adMobService';
import { ADS_CONFIG } from '../lib/adsConfig';
import { useAds } from './useAds';

export const useRewardAds = (page: string) => {
  const { showAds } = useAds();

  const showRewardAd = useCallback(async () => {
    if (!showAds) {
      // If user is premium, return success immediately
      return { success: true, reward: { type: 'premium', amount: 1 } };
    }

    try {
      const rewarded = AdManager.getRewarded(ADS_CONFIG.ADMOB.REWARDED_ID);
      return await rewarded.showAd();
    } catch (error) {
      console.error(`Error showing reward ad for ${page}:`, error);
      return { success: false };
    }
  }, [showAds, page]);

  return {
    showRewardAd,
  };
};