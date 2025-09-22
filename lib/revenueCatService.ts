import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL, PurchasesPackage } from 'react-native-purchases';
import { ADS_CONFIG } from './adsConfig';

export interface PurchaseInfo {
  isPremium: boolean;
  entitlements: string[];
  activeSubscriptions: string[];
}

class RevenueCatService {
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      
      // Configure RevenueCat based on platform
      if (Platform.OS === 'ios') {
        Purchases.configure({ apiKey: ADS_CONFIG.REVENUECAT.API_KEY.ios });
      } else {
        Purchases.configure({ apiKey: ADS_CONFIG.REVENUECAT.API_KEY.android });
      }

      this.isInitialized = true;
      console.log('RevenueCat initialized successfully');
    } catch (error) {
      console.error('Error initializing RevenueCat:', error);
    }
  }

  async getPurchaseInfo(): Promise<PurchaseInfo> {
    try {
      await this.initialize();
      
      const customerInfo = await Purchases.getCustomerInfo();
      
      return {
        isPremium: customerInfo.entitlements.active[ADS_CONFIG.REVENUECAT.ENTITLEMENT_ID] !== undefined,
        entitlements: Object.keys(customerInfo.entitlements.active),
        activeSubscriptions: customerInfo.activeSubscriptions,
      };
    } catch (error) {
      console.error('Error getting purchase info:', error);
      return {
        isPremium: false,
        entitlements: [],
        activeSubscriptions: [],
      };
    }
  }

  async getAvailablePackages(): Promise<PurchasesPackage[]> {
    try {
      await this.initialize();
      
      const offerings = await Purchases.getOfferings();
      const currentOffering = offerings.current;
      
      if (currentOffering) {
        return currentOffering.availablePackages;
      }
      
      return [];
    } catch (error) {
      console.error('Error getting available packages:', error);
      return [];
    }
  }

  async purchasePackage(packageToPurchase: PurchasesPackage): Promise<boolean> {
    try {
      await this.initialize();
      
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      
      return customerInfo.entitlements.active[ADS_CONFIG.REVENUECAT.ENTITLEMENT_ID] !== undefined;
    } catch (error: any) {
      if (error.userCancelled) {
        console.log('User cancelled purchase');
      } else {
        console.error('Error purchasing package:', error);
      }
      return false;
    }
  }

  async restorePurchases(): Promise<boolean> {
    try {
      await this.initialize();
      
      const customerInfo = await Purchases.restorePurchases();
      
      return customerInfo.entitlements.active[ADS_CONFIG.REVENUECAT.ENTITLEMENT_ID] !== undefined;
    } catch (error) {
      console.error('Error restoring purchases:', error);
      return false;
    }
  }

  // Simple listener for purchase changes
  setupPurchaseListener(callback: (purchaseInfo: PurchaseInfo) => void): void {
    Purchases.addCustomerInfoUpdateListener(async () => {
      const purchaseInfo = await this.getPurchaseInfo();
      callback(purchaseInfo);
    });
  }
}

export const revenueCatService = new RevenueCatService();