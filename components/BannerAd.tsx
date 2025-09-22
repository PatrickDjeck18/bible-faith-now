import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { ADS_CONFIG } from '../lib/adsConfig';
import { useAds } from '../hooks/useAds';

interface BannerAdComponentProps {
  placement: 'home' | 'bible' | 'prayer' | 'mood' | 'quiz' | 'dream' | 'notes';
  size?: BannerAdSize;
}

const BannerAdComponent: React.FC<BannerAdComponentProps> = ({ 
  placement, 
  size = BannerAdSize.ANCHORED_ADAPTIVE_BANNER 
}) => {
  const { showAds } = useAds();
  const [adUnitId, setAdUnitId] = useState(TestIds.BANNER);

  useEffect(() => {
    // Use test ID in development, real ID in production
    setAdUnitId(__DEV__ ? TestIds.BANNER : ADS_CONFIG.ADMOB.BANNER_ID);
  }, []);

  // Don't show ads if user is premium
  if (!showAds) {
    return null;
  }

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={adUnitId}
        size={size}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
          keywords: ['bible', 'prayer', 'christian', 'faith', 'religion'],
        }}
        onAdLoaded={() => console.log(`Banner ad loaded for ${placement}`)}
        onAdFailedToLoad={(error) => console.error(`Banner ad failed for ${placement}:`, error)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 8,
  },
});

export default BannerAdComponent;