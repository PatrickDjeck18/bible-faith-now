import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/DesignTokens';
import {
  Brain,
  Play,
  Trophy,
  Target,
  RefreshCw
} from 'lucide-react-native';
import { useQuizDatabase } from '@/hooks/useQuizDatabase';
import BackgroundGradient from '@/components/BackgroundGradient';
import BannerAd from '@/components/BannerAd';
import { useInterstitialAds } from '@/hooks/useInterstitialAds';

const { width } = Dimensions.get('window');

export default function QuizTabScreen() {
  const { stats, refreshStats } = useQuizDatabase();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const { showInterstitialAd } = useInterstitialAds('quiz');

  useFocusEffect(
    useCallback(() => {
      refreshStats();
    }, [])
  );

  useEffect(() => {
    StatusBar.setBarStyle('dark-content');
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleStartQuiz = () => {
    router.push('/bible-quiz');
  };

  const handleStartEnhancedQuiz = () => {
    router.push('/bible-quiz-enhanced');
  };

  const renderHeader = () => (
    <View>
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View>
          <Text style={styles.headerTitle}>Bible Quiz</Text>
          <Text style={styles.headerSubtitle}>Test your knowledge</Text>
        </View>
        <View style={styles.headerIcon}>
          <Brain size={32} color={Colors.primary[600]} />
        </View>
      </Animated.View>
      
      {/* Banner Ad below header */}
      <BannerAd placement="quiz" />
    </View>
  );

  const renderStartQuizCard = () => (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <TouchableOpacity
        style={styles.startQuizCard}
        onPress={handleStartQuiz}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={Colors.gradients.primary}
          style={styles.startQuizGradient}
        >
          <View style={styles.startQuizContent}>
            <View style={styles.startQuizIcon}>
              <Play size={32} color="white" />
            </View>
            <View>
              <Text style={styles.startQuizTitle}>Start a New Quiz</Text>
              <Text style={styles.startQuizDescription}>200 questions from the Bible</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderEnhancedQuizCard = () => (
    <Animated.View style={{
      opacity: fadeAnim,
      transform: [{ translateY: slideAnim }],
      marginTop: Spacing.lg
    }}>
      <TouchableOpacity
        style={styles.enhancedQuizCard}
        onPress={handleStartEnhancedQuiz}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={Colors.gradients.success}
          style={styles.enhancedQuizGradient}
        >
          <View style={styles.enhancedQuizContent}>
            <View style={styles.enhancedQuizIcon}>
              <Brain size={32} color="white" />
            </View>
            <View>
              <Text style={styles.enhancedQuizTitle}>Enhanced Quiz</Text>
              <Text style={styles.enhancedQuizDescription}>
                Smart randomization prevents question repetition
              </Text>
              <View style={styles.featureList}>
                <Text style={styles.featureItem}>✓ No repeating questions</Text>
                <Text style={styles.featureItem}>✓ Learning optimized</Text>
                <Text style={styles.featureItem}>✓ Level-based progression</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <BackgroundGradient>
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {renderHeader()}
          {renderStartQuizCard()}
          {renderEnhancedQuizCard()}
        </ScrollView>
      </BackgroundGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  background: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: Spacing['3xl'],
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 20 : 10, // Add top padding for status bar
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: (Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0) + Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  headerTitle: {
    fontSize: Typography.sizes['4xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[800],
  },
  headerSubtitle: {
    fontSize: Typography.sizes.lg,
    color: Colors.neutral[600],
  },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.full,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  startQuizCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  startQuizGradient: {
    padding: Spacing.xl,
  },
  startQuizContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  startQuizIcon: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.lg,
  },
  startQuizTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: 'white',
  },
  startQuizDescription: {
    fontSize: Typography.sizes.base,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: Spacing.xs,
  },
  enhancedQuizCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  enhancedQuizGradient: {
    padding: Spacing.xl,
  },
  enhancedQuizContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  enhancedQuizIcon: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.lg,
  },
  enhancedQuizTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: 'white',
  },
  enhancedQuizDescription: {
    fontSize: Typography.sizes.base,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: Spacing.xs,
    lineHeight: Typography.lineHeights.relaxed,
  },
  featureList: {
    marginTop: Spacing.sm,
  },
  featureItem: {
    fontSize: Typography.sizes.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: Spacing.xs,
  },
});
