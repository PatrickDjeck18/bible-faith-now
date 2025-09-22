import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Menu,
  User,
  Bell,
  Settings,
  Search,
  MoreVertical
} from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/DesignTokens';

const { width: screenWidth } = Dimensions.get('window');

// Responsive breakpoints
const isSmallScreen = screenWidth < 375;
const isMediumScreen = screenWidth >= 375 && screenWidth < 414;
const isLargeScreen = screenWidth >= 414;

// Responsive spacing function
const getResponsiveSpacing = (small: number, medium: number, large: number) => {
  if (isSmallScreen) return small;
  if (isMediumScreen) return medium;
  return large;
};

interface ModernHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  variant?: 'default' | 'simple' | 'compact' | 'transparent';
  showProfileButton?: boolean;
  showNotificationButton?: boolean;
  showSearchButton?: boolean;
  showMenuButton?: boolean;
  onProfilePress?: () => void;
  onNotificationPress?: () => void;
  onSearchPress?: () => void;
  onMenuPress?: () => void;
  gradientColors?: readonly [string, string, ...string[]];
  badgeCount?: number;
  transparent?: boolean;
  sticky?: boolean;
}

export const ModernHeader: React.FC<ModernHeaderProps> = ({
  title,
  subtitle,
  showBackButton = false,
  onBackPress,
  variant = 'default',
  showProfileButton = false,
  showNotificationButton = false,
  showSearchButton = false,
  showMenuButton = false,
  onProfilePress,
  onNotificationPress,
  onSearchPress,
  onMenuPress,
  gradientColors = Colors.gradients.spiritualLight || ['#fdfcfb', '#e2d1c3', '#c9d6ff'],
  badgeCount,
  transparent = false,
  sticky = false,
}) => {
  const renderDefaultHeader = () => (
    <View style={[styles.hero, sticky && styles.stickyHeader]}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroGradient}
      >
        <View style={styles.heroContent}>
          {/* Back button */}
          {showBackButton && (
            <TouchableOpacity
              style={styles.heroActionButton}
              onPress={onBackPress}
            >
              <ArrowLeft size={20} color={Colors.primary[600]} />
            </TouchableOpacity>
          )}

          <View style={styles.heroTextBlock}>
            <Text style={styles.heroTitle}>{title}</Text>
            {subtitle && <Text style={styles.heroSubtitle}>{subtitle}</Text>}
          </View>

          <View style={styles.heroActions}>
            {showSearchButton && (
              <TouchableOpacity
                style={styles.heroActionButton}
                onPress={onSearchPress}
              >
                <Search size={20} color={Colors.primary[600]} />
              </TouchableOpacity>
            )}
            {showNotificationButton && (
              <TouchableOpacity
                style={styles.heroActionButton}
                onPress={onNotificationPress}
              >
                <Bell size={20} color={Colors.primary[600]} />
                {badgeCount !== undefined && badgeCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{badgeCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
            {showProfileButton && (
              <TouchableOpacity
                style={styles.heroActionButton}
                onPress={onProfilePress}
              >
                <User size={20} color={Colors.primary[600]} />
              </TouchableOpacity>
            )}
            {showMenuButton && (
              <TouchableOpacity
                style={styles.heroActionButton}
                onPress={onMenuPress}
              >
                <MoreVertical size={20} color={Colors.primary[600]} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  const renderSimpleHeader = () => (
    <View style={[styles.simpleHeader, sticky && styles.stickyHeader, transparent && styles.transparentHeader]}>
      <View style={styles.simpleHeaderContent}>
        <View style={styles.simpleHeaderLeft}>
          {showBackButton && (
            <TouchableOpacity
              style={styles.simpleBackButton}
              onPress={onBackPress}
            >
              <ArrowLeft size={20} color={Colors.primary[600]} />
            </TouchableOpacity>
          )}
          <View>
            <Text style={styles.simpleHeaderTitle}>{title}</Text>
            {subtitle && <Text style={styles.simpleHeaderSubtitle}>{subtitle}</Text>}
          </View>
        </View>
        <View style={styles.simpleHeaderActions}>
          {showSearchButton && (
            <TouchableOpacity
              style={styles.simpleActionButton}
              onPress={onSearchPress}
            >
              <Search size={20} color={Colors.neutral[600]} />
            </TouchableOpacity>
          )}
          {showNotificationButton && (
            <TouchableOpacity
              style={styles.simpleActionButton}
              onPress={onNotificationPress}
            >
              <Bell size={20} color={Colors.neutral[600]} />
              {badgeCount !== undefined && badgeCount > 0 && (
                <View style={styles.simpleBadge}>
                  <Text style={styles.simpleBadgeText}>{badgeCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          {showProfileButton && (
            <TouchableOpacity
              style={styles.simpleActionButton}
              onPress={onProfilePress}
            >
              <User size={20} color={Colors.neutral[600]} />
            </TouchableOpacity>
          )}
          {showMenuButton && (
            <TouchableOpacity
              style={styles.simpleActionButton}
              onPress={onMenuPress}
            >
              <Menu size={20} color={Colors.neutral[600]} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  const renderCompactHeader = () => (
    <View style={[styles.compactHeader, sticky && styles.stickyHeader, transparent && styles.transparentHeader]}>
      <View style={styles.compactHeaderContent}>
        <Text style={styles.compactHeaderTitle}>{title}</Text>
        {showBackButton && (
          <TouchableOpacity
            style={styles.compactBackButton}
            onPress={onBackPress}
          >
            <ArrowLeft size={18} color={Colors.primary[600]} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderTransparentHeader = () => (
    <View style={[styles.transparentHeader, sticky && styles.stickyHeader]}>
      <View style={styles.transparentHeaderContent}>
        <View style={styles.transparentHeaderLeft}>
          {showBackButton && (
            <TouchableOpacity
              style={styles.transparentBackButton}
              onPress={onBackPress}
            >
              <ArrowLeft size={20} color={Colors.white} />
            </TouchableOpacity>
          )}
          <Text style={styles.transparentHeaderTitle}>{title}</Text>
        </View>
        <View style={styles.transparentHeaderActions}>
          {showSearchButton && (
            <TouchableOpacity
              style={styles.transparentActionButton}
              onPress={onSearchPress}
            >
              <Search size={20} color={Colors.white} />
            </TouchableOpacity>
          )}
          {showNotificationButton && (
            <TouchableOpacity
              style={styles.transparentActionButton}
              onPress={onNotificationPress}
            >
              <Bell size={20} color={Colors.white} />
              {badgeCount !== undefined && badgeCount > 0 && (
                <View style={styles.transparentBadge}>
                  <Text style={styles.transparentBadgeText}>{badgeCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  switch (variant) {
    case 'simple':
      return renderSimpleHeader();
    case 'compact':
      return renderCompactHeader();
    case 'transparent':
      return renderTransparentHeader();
    default:
      return renderDefaultHeader();
  }
};

const styles = StyleSheet.create({
  // Default hero header styles
  hero: {
    paddingTop: (Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0) + getResponsiveSpacing(Spacing['3xl'], Spacing['4xl'], Spacing['5xl']),
    paddingBottom: getResponsiveSpacing(Spacing.sm, Spacing.md, Spacing.lg),
  },
  heroGradient: {
    paddingHorizontal: getResponsiveSpacing(Spacing.md, Spacing.lg, Spacing.xl),
    paddingVertical: getResponsiveSpacing(Spacing.sm, Spacing.md, Spacing.lg),
    borderRadius: BorderRadius.lg,
    marginHorizontal: getResponsiveSpacing(2, 4, 6),
    ...Shadows.md,
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroTextBlock: {
    flex: 1,
  },
  heroTitle: {
    fontSize: getResponsiveSpacing(Typography.sizes['2xl'], Typography.sizes['3xl'], Typography.sizes['4xl']),
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[800],
    marginBottom: 2,
  },
  heroSubtitle: {
    fontSize: getResponsiveSpacing(Typography.sizes.sm, Typography.sizes.base, Typography.sizes.lg),
    color: Colors.neutral[600],
    lineHeight: Typography.lineHeights.base,
  },
  heroActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
  },
  heroActionButton: {
    padding: getResponsiveSpacing(Spacing.xs, Spacing.sm, Spacing.md),
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.md,
    minWidth: getResponsiveSpacing(36, 40, 44),
    minHeight: getResponsiveSpacing(36, 40, 44),
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.error[500],
    borderRadius: BorderRadius.full,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: 'white',
  },

  // Simple header styles
  simpleHeader: {
    paddingTop: (Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0) + getResponsiveSpacing(Spacing.lg, Spacing.xl, Spacing['2xl']),
    paddingBottom: getResponsiveSpacing(Spacing.sm, Spacing.md, Spacing.lg),
    backgroundColor: 'transparent',
  },
  simpleHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: getResponsiveSpacing(Spacing.md, Spacing.lg, Spacing.xl),
  },
  simpleHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing(Spacing.sm, Spacing.md, Spacing.lg),
  },
  simpleBackButton: {
    padding: getResponsiveSpacing(Spacing.xs, Spacing.sm, Spacing.md),
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  simpleHeaderTitle: {
    fontSize: getResponsiveSpacing(Typography.sizes['2xl'], Typography.sizes['3xl'], Typography.sizes['4xl']),
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[800],
  },
  simpleHeaderSubtitle: {
    fontSize: getResponsiveSpacing(Typography.sizes.sm, Typography.sizes.base, Typography.sizes.lg),
    color: Colors.neutral[700],
    marginTop: 2,
  },
  simpleHeaderActions: {
    flexDirection: 'row',
    gap: getResponsiveSpacing(Spacing.xs, Spacing.sm, Spacing.md),
    alignItems: 'center',
  },
  simpleActionButton: {
    padding: getResponsiveSpacing(Spacing.xs, Spacing.sm, Spacing.md),
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  simpleBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.error[500],
    borderRadius: BorderRadius.full,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  simpleBadgeText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: 'white',
  },

  // Compact header styles
  compactHeader: {
    paddingTop: (Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0) + getResponsiveSpacing(Spacing.md, Spacing.lg, Spacing.xl),
    paddingBottom: getResponsiveSpacing(Spacing.xs, Spacing.sm, Spacing.md),
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  compactHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: getResponsiveSpacing(Spacing.md, Spacing.lg, Spacing.xl),
  },
  compactHeaderTitle: {
    fontSize: getResponsiveSpacing(Typography.sizes.lg, Typography.sizes.xl, Typography.sizes['2xl']),
    fontWeight: Typography.weights.semiBold,
    color: Colors.neutral[800],
  },
  compactBackButton: {
    padding: getResponsiveSpacing(Spacing.xs, Spacing.sm, Spacing.md),
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Transparent header styles
  transparentHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: (Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0) + getResponsiveSpacing(Spacing.lg, Spacing.xl, Spacing['2xl']),
    paddingBottom: getResponsiveSpacing(Spacing.sm, Spacing.md, Spacing.lg),
    backgroundColor: 'transparent',
  },
  transparentHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: getResponsiveSpacing(Spacing.md, Spacing.lg, Spacing.xl),
  },
  transparentHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing(Spacing.sm, Spacing.md, Spacing.lg),
  },
  transparentBackButton: {
    padding: getResponsiveSpacing(Spacing.xs, Spacing.sm, Spacing.md),
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  transparentHeaderTitle: {
    fontSize: getResponsiveSpacing(Typography.sizes['2xl'], Typography.sizes['3xl'], Typography.sizes['4xl']),
    fontWeight: Typography.weights.bold,
    color: Colors.white,
  },
  transparentHeaderActions: {
    flexDirection: 'row',
    gap: getResponsiveSpacing(Spacing.xs, Spacing.sm, Spacing.md),
    alignItems: 'center',
  },
  transparentActionButton: {
    padding: getResponsiveSpacing(Spacing.xs, Spacing.sm, Spacing.md),
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  transparentBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.error[500],
    borderRadius: BorderRadius.full,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  transparentBadgeText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: 'white',
  },

  // Sticky header styles
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
});