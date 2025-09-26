import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  TextInput,
  Modal,
  StatusBar,
  Animated,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Plus, 
  Trash2, 
  Smile, 
  X, 
  Clock,
  ArrowLeft,
  TrendingUp,
} from 'lucide-react-native';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit, 
  doc, 
  deleteDoc, 
  getDoc,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/DesignTokens';
import { useAuth } from '../../hooks/useAuth';
import BackgroundGradient from '@/components/BackgroundGradient';
import { router } from 'expo-router';
import { useUnifiedMoodTracker } from '../../hooks/useUnifiedMoodTracker';
import { emitMoodEntrySaved } from '../../lib/eventEmitter';
import BannerAd from '@/components/BannerAd';
import { useInterstitialAds } from '@/hooks/useInterstitialAds';
import AuthGuard from '@/components/auth/AuthGuard';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Enhanced responsive breakpoints
const isSmallScreen = screenWidth < 375;
const isMediumScreen = screenWidth >= 375 && screenWidth < 414;
const isLargeScreen = screenWidth >= 414;

// Responsive spacing and sizing
const getResponsiveSpacing = (small: number, medium: number, large: number) => {
  if (isSmallScreen) return small;
  if (isMediumScreen) return medium;
  return large;
};

const getResponsiveFontSize = (small: number, medium: number, large: number) => {
  if (isSmallScreen) return small;
  if (isMediumScreen) return medium;
  return large;
};

// Helper function to ensure emoji visibility
const getEmojiStyle = (baseSize: number) => ({
  fontSize: getResponsiveFontSize(baseSize - 2, baseSize, baseSize + 2),
  fontFamily: Platform.OS === 'ios' ? 'System' : 'Noto Color Emoji',
  textAlign: 'center' as const,
  includeFontPadding: false,
  textAlignVertical: 'center' as const,
  minHeight: getResponsiveFontSize(baseSize - 2, baseSize, baseSize + 2) + 4,
  minWidth: getResponsiveFontSize(baseSize - 2, baseSize, baseSize + 2) + 4,
  lineHeight: getResponsiveFontSize(baseSize - 2, baseSize, baseSize + 2) + 4,
});

// Helper function to get responsive grid columns based on screen size and mood count
const getGridColumns = (moodCount: number) => {
  if (isSmallScreen) {
    return moodCount > 6 ? 2 : 3;
  } else if (isMediumScreen) {
    return moodCount > 6 ? 3 : 4;
  } else {
    return moodCount > 6 ? 4 : 5;
  }
};

// Enhanced mood data with better categorization and colors
const moodCategories = {
  positive: {
    title: 'Positive',
    icon: '✨',
    moods: [
      { id: 'positive_001_blessed', label: '🙏 Blessed', color: '#FFD700', gradient: ['#FFD700', '#FFA500', '#FF8C00'] as const },
      { id: 'positive_002_happy', label: '😊 Happy', color: '#10B981', gradient: ['#10B981', '#059669', '#047857'] as const },
      { id: 'positive_003_joyful', label: '😄 Joyful', color: '#22C55E', gradient: ['#22C55E', '#16A34A', '#15803D'] as const },
      { id: 'positive_004_grateful', label: '🙏 Grateful', color: '#84CC16', gradient: ['#84CC16', '#65A30D', '#4D7C0F'] as const },
      { id: 'positive_005_excited', label: '🤩 Excited', color: '#F59E0B', gradient: ['#F59E0B', '#D97706', '#B45309'] as const },
      { id: 'positive_006_loved', label: '💕 Loved', color: '#EC4899', gradient: ['#EC4899', '#DB2777', '#BE185D'] as const },
      { id: 'positive_007_proud', label: '🏆 Proud', color: '#10B981', gradient: ['#10B981', '#059669', '#047857'] as const },
    ]
  },
  calm: {
    title: 'Calm',
    icon: '🧘',
    moods: [
      { id: 'calm_001_peaceful', label: '😇 Peaceful', color: '#06B6D4', gradient: ['#06B6D4', '#0891B2', '#0E7490'] as const },
      { id: 'calm_002_calm', label: '😌 Calm', color: '#3B82F6', gradient: ['#3B82F6', '#2563EB', '#1D4ED8'] as const },
      { id: 'calm_003_content', label: '😊 Content', color: '#8B5CF6', gradient: ['#8B5CF6', '#7C3AED', '#6D28D9'] as const },
      { id: 'calm_004_prayerful', label: '🙏 Prayerful', color: '#8B5CF6', gradient: ['#8B5CF6', '#7C3AED', '#6D28D9'] as const },
    ]
  },
  energetic: {
    title: 'Energetic',
    icon: '⚡',
    moods: [
      { id: 'energetic_001_motivated', label: '💪 Motivated', color: '#10B981', gradient: ['#10B981', '#059669', '#047857'] as const },
      { id: 'energetic_002_focused', label: '🎯 Focused', color: '#3B82F6', gradient: ['#3B82F6', '#2563EB', '#1D4ED8'] as const },
      { id: 'energetic_003_creative', label: '🎨 Creative', color: '#8B5CF6', gradient: ['#8B5CF6', '#7C3AED', '#6D28D9'] as const },
      { id: 'energetic_004_inspired', label: '✨ Inspired', color: '#EC4899', gradient: ['#EC4899', '#DB2777', '#BE185D'] as const },
      { id: 'energetic_005_accomplished', label: '🎉 Accomplished', color: '#22C55E', gradient: ['#22C55E', '#16A34A', '#15803D'] as const },
    ]
  },
  challenging: {
    title: 'Challenging',
    icon: '💭',
    moods: [
      { id: 'challenging_001_sad', label: '😔 Sad', color: '#6B7280', gradient: ['#6B7280', '#4B5563', '#374151'] as const },
      { id: 'challenging_002_anxious', label: '😰 Anxious', color: '#8B5CF6', gradient: ['#8B5CF6', '#7C3AED', '#6D28D9'] as const },
      { id: 'challenging_003_stressed', label: '😓 Stressed', color: '#EC4899', gradient: ['#EC4899', '#DB2777', '#BE185D'] as const },
      { id: 'challenging_004_angry', label: '😠 Angry', color: '#EF4444', gradient: ['#EF4444', '#DC2626', '#B91C1C'] as const },
      { id: 'challenging_005_frustrated', label: '😤 Frustrated', color: '#F97316', gradient: ['#F97316', '#EA580C', '#C2410C'] as const },
      { id: 'challenging_006_tired', label: '😴 Tired', color: '#A855F7', gradient: ['#A855F7', '#9333EA', '#7C3AED'] as const },
      { id: 'challenging_007_lonely', label: '🥺 Lonely', color: '#6B7280', gradient: ['#6B7280', '#4B5563', '#374151'] as const },
      { id: 'challenging_008_confused', label: '😕 Confused', color: '#F59E0B', gradient: ['#F59E0B', '#D97706', '#B45309'] as const },
      { id: 'challenging_009_fearful', label: '😨 Fearful', color: '#DC2626', gradient: ['#DC2626', '#B91C1C', '#991B1B'] as const },
    ]
  },
  curious: {
    title: 'Curious',
    icon: '🤔',
    moods: [
      { id: 'curious_001_curious', label: '🤔 Curious', color: '#14B8A6', gradient: ['#14B8A6', '#0D9488', '#0F766E'] as const },
      { id: 'curious_002_surprised', label: '😲 Surprised', color: '#FBBF24', gradient: ['#FBBF24', '#F59E0B', '#D97706'] as const },
      { id: 'curious_003_hopeful', label: '🌟 Hopeful', color: '#FBBF24', gradient: ['#FBBF24', '#F59E0B', '#D97706'] as const },
    ]
  },
  spiritual: {
    title: 'Spiritual',
    icon: '🕊️',
    moods: [
      { id: 'spiritual_001_inspired', label: '✨ Inspired', color: '#A78BFA', gradient: ['#A78BFA', '#8B5CF6', '#7C3AED'] as const },
      { id: 'spiritual_002_connected', label: '🔗 Connected', color: '#6EE7B7', gradient: ['#6EE7B7', '#34D399', '#10B981'] as const },
      { id: 'spiritual_003_faithful', label: '✝️ Faithful', color: '#F472B6', gradient: ['#F472B6', '#EC4899', '#DB2777'] as const },
    ]
  },
  health: {
    title: 'Health',
    icon: '💪',
    moods: [
      { id: 'health_001_healthy', label: '🍎 Healthy', color: '#6EE7B7', gradient: ['#6EE7B7', '#34D399', '#10B981'] as const },
      { id: 'health_002_rested', label: '😴 Rested', color: '#A78BFA', gradient: ['#A78BFA', '#8B5CF6', '#7C3AED'] as const },
      { id: 'health_003_balanced', label: '🧘 Balanced', color: '#F472B6', gradient: ['#F472B6', '#EC4899', '#DB2777'] as const },
    ]
  }
};

// Type for mood data
type MoodData = {
  id: string;
  label: string;
  color: string;
  gradient: readonly [string, string, string];
};

// Flatten all moods for easy access with proper typing
const buildAllMoods = (): MoodData[] => {
  const result: MoodData[] = [];
  const categories = Object.values(moodCategories || {});
  for (const category of categories) {
    const moods = (category as any)?.moods || [];
    for (const mood of moods) {
      result.push({
        ...mood,
        gradient: (mood.gradient as readonly [string, string, string])
      });
    }
  }
  return result;
};
const allMoods: MoodData[] = buildAllMoods();

interface MoodEntry {
  id: string;
  mood_id: string;
  mood_type: string;
  emoji: string;
  notes: string;
  created_at: any;
  intensity_rating?: number;
}

// Animation helper component
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function MoodTrackerScreen() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { saveMoodEntry, deleteMoodEntry, refetch } = useUnifiedMoodTracker();
  const { showInterstitialAd } = useInterstitialAds('mood');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [moodLoading, setMoodLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [overlayInteractive, setOverlayInteractive] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [weeklyTrends, setWeeklyTrends] = useState<any[]>([]);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (user && !authLoading) {
      fetchMoodHistory();
    } else if (!user && !authLoading) {
      setMoodHistory([]);
    }
  }, [user, isAuthenticated, authLoading]);

  useEffect(() => {
    if (modalVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 65,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setOverlayInteractive(true);
      });
    } else {
      setOverlayInteractive(false);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [modalVisible]);

  const fetchMoodHistory = async () => {
    try {
      // For guest users, we need to handle mood history differently
      if (!user) {
        setMoodHistory([]);
        return;
      }
      
      // If it's a guest user, we need to handle mood history differently
      if (user.isGuest) {
        // Guest users use local storage - for now, we'll show empty history
        // The mood entries are managed by the unified hook and will be displayed
        // through the moodStats that the hook provides
        setMoodHistory([]);
        return;
      }
      
      // For authenticated users, fetch from Firebase
      const moodsRef = collection(db, 'mood_entries');
      const q = query(
        moodsRef,
        where('user_id', '==', user.uid),
        orderBy('created_at', 'desc'),
        limit(20)
      );

      const querySnapshot = await getDocs(q);
      
      const mapped = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const moodId = data.mood_id || 'calm_003_content';
        const moodData = getMoodData(moodId);
        
        // Handle created_at properly - it might be a Date object or a number (timestamp)
        let createdAt;
        if (data.created_at instanceof Date) {
          createdAt = data.created_at;
        } else if (typeof data.created_at === 'number') {
          createdAt = new Date(data.created_at);
        } else if (data.created_at && typeof data.created_at.toDate === 'function') {
          createdAt = data.created_at.toDate();
        } else {
          createdAt = new Date();
        }
        
        return {
          id: doc.id,
          mood_id: moodId,
          mood_type: moodData.label.split(' ').slice(1).join(' ') || 'Unknown', // Get the text part after emoji
          emoji: moodData.label.split(' ')[0], // Use the emoji from the label
          notes: data.note || '',
          created_at: createdAt,
          intensity_rating: data.intensity_rating || null,
        };
      });

      setMoodHistory(mapped);
      
      if (mapped.length > 0) {
        generateWeeklyTrends(mapped);
      }
    } catch (error) {
      console.error('Error fetching mood history:', error);
    }
  };

  const generateWeeklyTrends = (entries: MoodEntry[]) => {
    const weeklyData = entries.reduce((acc, entry) => {
      const date = new Date(entry.created_at);
      const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const moodData = getMoodData(entry.mood_id);
      
      let moodScore = 5;
      if (moodData.label.includes('😊') || moodData.label.includes('😄') || moodData.label.includes('🙏')) {
        moodScore = 8;
      } else if (moodData.label.includes('😐') || moodData.label.includes('😌')) {
        moodScore = 5;
      } else {
        moodScore = 3;
      }
      
      if (!acc[dayOfWeek]) {
        acc[dayOfWeek] = { total: 0, count: 0, moods: [] };
      }
      acc[dayOfWeek].total += moodScore;
      acc[dayOfWeek].count += 1;
      acc[dayOfWeek].moods.push(moodData.label);
      
      return acc;
    }, {} as Record<number, { total: number; count: number; moods: string[] }>);

    const trends = Object.entries(weeklyData).map(([day, data]) => ({
      day: parseInt(day),
      averageMood: data.count > 0 ? Math.round((data.total / data.count) * 10) / 10 : 0,
      moodCount: data.count,
      commonMoods: data.moods.slice(0, 3)
    }));

    setWeeklyTrends(trends);
  };

  const saveMood = async () => {
    console.log('🔴 MOOD TRACKER: saveMood called, selectedMood:', selectedMood);
    
    if (!selectedMood) {
      Alert.alert('Select a Mood', 'Please select a mood before saving.');
      return;
    }

    if (authLoading || !user) {
      console.log('🔴 MOOD TRACKER: Auth issue - loading:', authLoading, 'user:', user);
      Alert.alert('Authentication Required', 'You need to be signed in to save moods.');
      return;
    }

    setMoodLoading(true);
    
    try {
      // Get the mood label from the selected mood ID
      const moodData = allMoods.find(m => m.id === selectedMood);
      if (!moodData) {
        console.log('🔴 MOOD TRACKER: Invalid mood selected:', selectedMood);
        Alert.alert('Error', 'Invalid mood selected.');
        return;
      }

      // Extract the mood label from the emoji + text format (e.g., "😊 Happy" -> "Happy")
      const moodLabel = moodData.label.split(' ').slice(1).join(' ');
      console.log('🔴 MOOD TRACKER: Mood label extracted:', moodLabel);
      
      // Use the hook's saveMoodEntry function which handles the authentication properly
      console.log('🔴 MOOD TRACKER: Calling saveMoodEntry with:', {
        mood: moodLabel,
        rating: 6,
        influences: [],
        note: notes.trim() || ''
      });
      
      const { data: savedEntry, error } = await saveMoodEntry(
        moodLabel,
        6, // Default intensity rating
        [], // Empty influences array for now
        notes.trim() || ''
      );

      console.log('🔴 MOOD TRACKER: saveMoodEntry response:', { savedEntry, error });

      if (error) {
        console.error('🔴 MOOD TRACKER: Error from saveMoodEntry:', error);
        throw new Error(error.message || 'Failed to save mood entry');
      }

      if (savedEntry) {
        console.log('🔴 MOOD TRACKER: Successfully saved mood entry:', savedEntry);
        // Refresh the mood data
        await refetch();
        
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: 1.05, duration: 100, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start();

        Alert.alert('Success', 'Your current mood has been recorded! 🎉');
        
        setSelectedMood(null);
        setNotes('');
        setModalVisible(false);
        fetchMoodHistory();
        
        emitMoodEntrySaved(savedEntry);
      } else {
        console.log('🔴 MOOD TRACKER: No saved entry returned');
      }
      
    } catch (error: any) {
      console.error('🔴 MOOD TRACKER: Error saving mood:', error);
      Alert.alert('Error', `Failed to save mood: ${error.message || 'Unknown error'}`);
    } finally {
      setMoodLoading(false);
    }
  };

    const deleteMood = async (id: string) => {
      setEntryToDelete(id);
      setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!entryToDelete || !user) {
      cancelDelete();
      return;
    }

    try {
      // Use the unified hook's deleteMoodEntry function which handles both guest and authenticated users
      const { error } = await deleteMoodEntry(entryToDelete);
      
      if (error) {
        throw new Error(error.message || 'Failed to delete mood entry');
      }
      
      Alert.alert('Success', 'Mood entry deleted successfully!');
      
      // Refresh the mood history
      await fetchMoodHistory();
      
      setDeleteModalVisible(false);
      setEntryToDelete(null);
    } catch (error: any) {
      console.error('Error deleting mood:', error);
      Alert.alert('Error', `Failed to delete mood entry: ${error.message || 'Unknown error'}`);
      setDeleteModalVisible(false);
      setEntryToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteModalVisible(false);
    setEntryToDelete(null);
  };

  const getMoodData = (moodId: string): MoodData => {
    return allMoods.find(mood => mood.id === moodId) || {
      id: 'unknown',
      label: '❓ Unknown',
      color: '#6B7280',
      gradient: ['#6B7280', '#4B5563', '#374151'] as readonly [string, string, string]
    };
  };

  const openNewMoodModal = () => {
    setOverlayInteractive(false);
    setModalVisible(true);
    setSelectedMood(null);
    setNotes('');
  };

  const closeModal = () => {
    Keyboard.dismiss();
    setModalVisible(false);
    setSelectedMood(null);
    setNotes('');
  };

  const MoodHistoryItem = ({ entry, index, onDelete }: { entry: MoodEntry, index: number, onDelete: (id: string) => void }) => {
    const moodData = getMoodData(entry.mood_id);
    const animValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(animValue, {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    }, []);

    return (
      <Animated.View
        style={[
          styles.historyItem,
          {
            opacity: animValue,
            transform: [
              {
                translateY: animValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={moodData.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.historyAccent}
        />
        <View style={styles.historyContent}>
          <View style={styles.historyLeft}>
            <View style={styles.historyMoodBadge}>
              <Text style={styles.historyMoodEmoji}>
                {moodData.label.split(' ')[0]}
              </Text>
            </View>
            <View style={styles.historyTextContent}>
              <Text style={styles.historyMoodLabel}>
                {moodData.label.split(' ')[1]}
              </Text>
              {entry.notes && (
                <Text style={styles.historyNotes} numberOfLines={2}>
                  {entry.notes}
                </Text>
              )}
              <View style={styles.historyMeta}>
                <Clock size={12} color={Colors.neutral[400]} />
                <Text style={styles.historyDate}>
                  {(() => {
                    const entryDate = new Date(entry.created_at);
                    const today = new Date();
                    const isToday = entryDate.toDateString() === today.toDateString();
                    const timeString = entryDate.toLocaleString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    });
                    return isToday ? `Today at ${timeString}` : entryDate.toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    });
                  })()}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => onDelete(entry.id)}
            style={styles.deleteButton}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Trash2 size={16} color={Colors.error[500]} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };
  
  if (authLoading || !user) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <BackgroundGradient>
          <View style={styles.headerCardContainer}>
            <LinearGradient
              colors={Colors.gradients.divineMorning}
              style={styles.headerCardGradient}
            >
              <View style={styles.headerCardContent}>
                <TouchableOpacity style={styles.headerCardBackButton} onPress={() => router.back()}>
                  <ArrowLeft size={24} color={Colors.white} />
                </TouchableOpacity>
                <View style={styles.headerCardIcon}>
                  <Smile size={32} color={Colors.white} />
                </View>
                <View style={styles.headerCardText}>
                  <Text style={styles.headerCardTitle}>My Mood Now</Text>
                  <Text style={styles.headerCardDescription}>Track your emotional journey</Text>
                  
                  <View style={styles.quickStatsContainer}>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>-</Text>
                      <Text style={styles.statLabel}>Entries</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>-</Text>
                      <Text style={styles.statLabel}>Avg Mood</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>-</Text>
                      <Text style={styles.statLabel}>Today</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity 
                  style={[styles.headerCardActionButton, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}
                  onPress={openNewMoodModal} 
                  activeOpacity={0.8}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Plus size={22} color={Colors.white} />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
          <View style={styles.section}>
            <View style={styles.emptyState}>
              <LinearGradient
                colors={Colors.gradients.lightGrey || ['#F9FAFB', '#F7F8F9', '#F5F6F7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.emptyStateIcon}
              >
                <Smile size={48} color={Colors.neutral[300]} />
              </LinearGradient>
              <Text style={styles.emptyStateTitle}>Sign in to continue</Text>
              <Text style={styles.emptyStateSubtext}>
                Please sign in to track and view your mood history
              </Text>
            </View>
          </View>
        </BackgroundGradient>
      </View>
    );
  }

  return (
    <AuthGuard
      message="Sign in to save and organize your mood entries. Your emotional journey will be securely stored and accessible across all your devices."
      showGuestWarning={true}
    >
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <View style={styles.headerSimple}>
        <View style={styles.headerSimpleContent}>
          <View style={styles.headerSimpleLeft}>
            <View style={styles.headerSimpleIcon}>
              <Smile size={28} color={Colors.primary[600]} />
            </View>
            <View>
              <Text style={styles.headerSimpleTitle}>Mood Tracker</Text>
              <Text style={styles.headerSimpleSubtitle}>
                Track your spiritual journey
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.headerSimpleAddButton}
            onPress={openNewMoodModal}
          >
            <Plus size={20} color={Colors.primary[600]} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Banner Ad below header */}
      <BannerAd placement="mood" />

      <BackgroundGradient>
        <View style={styles.headerCardContainer}>
          <View style={styles.headerCard}>
            <View style={styles.headerCardContent}>
              <View style={styles.headerCardIcon}>
                <Smile size={32} color={Colors.primary[600]} />
              </View>
              <View style={styles.headerCardText}>
                <Text style={[styles.headerCardTitle, { color: Colors.neutral[900] }]}>Daily Check-in</Text>
                <Text style={[styles.headerCardDescription, { color: Colors.neutral[700] }]}>How are you feeling today?</Text>
                
                <View style={styles.quickStatsContainer}>
                  <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: Colors.neutral[900] }]}>{moodHistory.length}</Text>
                    <Text style={[styles.statLabel, { color: Colors.neutral[700] }]}>Entries</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: Colors.neutral[900] }]}>
                      {(() => {
                        if (moodHistory.length === 0) return '0/10';
                        
                        const validEntries = moodHistory.filter(entry =>
                          entry.intensity_rating !== null && entry.intensity_rating !== undefined
                        );
                        
                        if (validEntries.length === 0) return '0/10';
                        
                        const totalRating = validEntries.reduce((sum, entry) =>
                          sum + (entry.intensity_rating || 0), 0
                        );
                        
                        const averageRating = Math.round(totalRating / validEntries.length);
                        return `${averageRating}/10`;
                      })()}
                    </Text>
                    <Text style={[styles.statLabel, { color: Colors.neutral[700] }]}>Avg Mood</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: Colors.neutral[900] }]}>
                      {(() => {
                        const today = new Date().toISOString().split('T')[0];
                        const hasEntryToday = moodHistory.some(entry =>
                          new Date(entry.created_at).toISOString().split('T')[0] === today
                        );
                        return hasEntryToday ? '✅' : '📝';
                      })()}
                    </Text>
                    <Text style={[styles.statLabel, { color: Colors.neutral[700] }]}>Today</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.headerCardActionButton, { backgroundColor: 'rgba(139, 92, 246, 0.2)' }]}
                onPress={openNewMoodModal}
                activeOpacity={0.8}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Plus size={22} color={Colors.primary[600]} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {weeklyTrends.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderRow}>
                <TrendingUp size={24} color={Colors.primary[600]} />
                <Text style={styles.sectionTitle}>Weekly Mood Trends</Text>
              </View>
            </View>
            
            <View style={styles.trendsContainer}>
              {weeklyTrends.map((trend, index) => (
                <View key={index} style={styles.trendItem}>
                  <Text style={styles.trendDay}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][trend.day]}
                  </Text>
                  <View style={styles.trendBarContainer}>
                    <LinearGradient
                      colors={trend.averageMood >= 6 ? 
                        ['#10B981', '#059669', '#047857'] : 
                        trend.averageMood >= 4 ? 
                        ['#F59E0B', '#D97706', '#B45309'] : 
                        ['#EF4444', '#DC2626', '#B91C1C']}
                      style={[
                        styles.trendBar,
                        { width: `${Math.min(trend.averageMood * 10, 100)}%` }
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    />
                  </View>
                  <Text style={styles.trendValue}>
                    {trend.averageMood.toFixed(1)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Mood History</Text>
          </View>
          
          { (moodHistory?.length ?? 0) === 0 ? (
            <View style={styles.emptyState}>
              <LinearGradient
                colors={Colors.gradients.lightGrey || ['#F9FAFB', '#F7F8F9', '#F5F6F7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.emptyStateIcon}
              >
                <Smile size={48} color={Colors.neutral[300]} />
              </LinearGradient>
              <Text style={styles.emptyStateTitle}>No mood entries yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Start tracking your emotional journey throughout the day
              </Text>
              <TouchableOpacity 
                onPress={openNewMoodModal}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <LinearGradient
                  colors={Colors.gradients.primary || ['#8B5CF6', '#6366F1', '#3B82F6']}
                  style={styles.emptyStateButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Plus size={20} color="white" />
                  <Text style={styles.emptyStateButtonText}>Add Your First Mood Now</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.historyContainer}>
              {(moodHistory || []).map((entry, index) => (
                <MoodHistoryItem key={entry.id} entry={entry} index={index} onDelete={deleteMood} />
              ))}
            </View>
          )}
        </View>
        
        <View style={styles.bottomSpacing} />
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="none"
        transparent={true}
        statusBarTranslucent={true}
        presentationStyle={Platform.OS === 'ios' ? 'overFullScreen' : undefined}
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={() => { if (overlayInteractive) closeModal(); }}>
          <Animated.View 
            style={[
              styles.modalOverlay,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <TouchableWithoutFeedback onPress={() => {}}>
              <Animated.View
                style={[
                  styles.modalContainer,
                  {
                    transform: [
                      { translateY: slideAnim },
                      { scale: scaleAnim },
                    ],
                  },
                ]}
              >
                <KeyboardAvoidingView
                  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                  style={styles.keyboardAvoid}
                  keyboardVerticalOffset={Platform.OS === 'ios' ? (isSmallScreen ? 20 : 0) : 20}
                >
                  <View style={styles.modalHandle} />
                  
                  <View style={styles.modalHeader}>
                    <View>
                      <Text style={styles.modalTitle}>How are you feeling right now?</Text>
                      <Text style={styles.modalSubtitle}>Select a mood that best describes your current state</Text>
                    </View>
                    <TouchableOpacity 
                      onPress={closeModal} 
                      style={styles.closeButton}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <X size={24} color={Colors.neutral[600]} />
                    </TouchableOpacity>
                  </View>

                  <ScrollView 
                    style={styles.modalScrollView} 
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.modalScrollContent}
                    bounces={false}
                    nestedScrollEnabled={true}
                  >
                    <View style={styles.modernMoodContainer}>
                      {selectedMood && (
                        <View style={styles.selectedMoodPreview}>
                          <LinearGradient
                            colors={getMoodData(selectedMood).gradient}
                            style={styles.previewGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                          >
                            <Text style={styles.previewEmoji} allowFontScaling={false}>
                              {getMoodData(selectedMood).label.split(' ')[0]}
                            </Text>
                            <Text style={styles.previewLabel}>
                              {getMoodData(selectedMood).label.split(' ').slice(1).join(' ')}
                            </Text>
                          </LinearGradient>
                        </View>
                      )}

                      <View style={styles.modernMoodGrid}>
                        <ScrollView
                          style={styles.categoriesScrollView}
                          showsVerticalScrollIndicator={false}
                          contentContainerStyle={styles.categoriesScrollContent}
                          bounces={true}
                          nestedScrollEnabled={true}
                        >
                          {Object.entries(moodCategories || {}).map(([key, category]) => (
                            <View key={key} style={styles.modernCategoryCard}>
                              <View style={styles.categoryCardHeader}>
                                <Text style={styles.categoryCardIcon} allowFontScaling={false}>{category.icon}</Text>
                                <Text style={styles.categoryCardTitle}>{category.title}</Text>
                              </View>
                              <View style={[
                                styles.categoryMoodGrid,
                                { 
                                  flexDirection: 'row',
                                  flexWrap: 'wrap',
                                  gap: getResponsiveSpacing(Spacing.sm, Spacing.md, Spacing.md),
                                  paddingTop: getResponsiveSpacing(Spacing.xs, Spacing.sm, Spacing.sm),
                                }
                              ]}>
                                {(category.moods || []).map(mood => (
                                  <TouchableOpacity
                                    key={mood.id}
                                    style={[
                                      styles.modernMoodButton,
                                      selectedMood === mood.id && styles.modernMoodButtonSelected,
                                      {
                                        width: `${100 / getGridColumns(category.moods.length)}%`,
                                        maxWidth: getResponsiveSpacing(100, 120, 140),
                                        marginBottom: getResponsiveSpacing(Spacing.sm, Spacing.md, Spacing.md),
                                      }
                                    ]}
                                    onPress={() => setSelectedMood(mood.id)}
                                    activeOpacity={0.7}
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                  >
                                    <Text 
                                      style={[
                                        styles.modernMoodEmoji,
                                        selectedMood === mood.id && styles.modernMoodEmojiSelected
                                      ]}
                                      allowFontScaling={false}
                                    >
                                      {mood.label.split(' ')[0]}
                                    </Text>
                                    <Text 
                                      style={[
                                        styles.modernMoodText,
                                        selectedMood === mood.id && styles.modernMoodTextSelected
                                      ]}
                                      allowFontScaling={false}
                                    >
                                      {mood.label.split(' ').slice(1).join(' ')}
                                    </Text>
                                  </TouchableOpacity>
                                ))}
                              </View>
                            </View>
                          ))}
                        </ScrollView>
                        <View style={styles.scrollIndicator} />
                      </View>
                      <View style={styles.modernNotesSection}>
                        <Text style={styles.modernNotesTitle}>Add a note (optional)</Text>
                        <View style={styles.modernNotesInputContainer}>
                          <TextInput
                            style={styles.modernNotesInput}
                            placeholder="What's happening right now? Any thoughts or reflections?"
                            value={notes}
                            onChangeText={setNotes}
                            multiline
                            numberOfLines={3}
                            placeholderTextColor={Colors.neutral[400]}
                            textAlignVertical="top"
                          />
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={saveMood}
                        disabled={!selectedMood || moodLoading}
                        activeOpacity={0.8}
                        style={[
                          styles.modernSaveButton,
                          !selectedMood && styles.modernSaveButtonDisabled
                        ]}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <LinearGradient
                          colors={selectedMood ? 
                            (selectedMood ? getMoodData(selectedMood).gradient : Colors.gradients.primary) : 
                            [Colors.neutral[300], Colors.neutral[400]]
                          }
                          style={styles.modernSaveButtonGradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        >
                          {moodLoading ? (
                            <ActivityIndicator size="small" color="white" />
                          ) : (
                            <>
                              <Text style={styles.modernSaveButtonText}>
                                {selectedMood ? 'Save My Mood' : 'Select a Mood'}
                              </Text>
                              {selectedMood && (
                                <Text style={styles.modernSaveButtonEmoji} allowFontScaling={false}>
                                  {getMoodData(selectedMood).label.split(' ')[0]}
                                </Text>
                              )}
                            </>
                          )}
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.modalBottomSpacing} />
                  </ScrollView>
                </KeyboardAvoidingView>
              </Animated.View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={deleteModalVisible}
        animationType="fade"
        transparent={true}
        statusBarTranslucent={true}
        onRequestClose={cancelDelete}
      >
        <TouchableWithoutFeedback onPress={cancelDelete}>
          <View style={styles.deleteModalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.deleteModalContainer}>
                <View style={styles.deleteModalContent}>
                  <View style={styles.deleteModalIcon}>
                    <Trash2 size={48} color={Colors.error[500]} />
                  </View>
                  <Text style={styles.deleteModalTitle}>Delete Mood Entry</Text>
                  <Text style={styles.deleteModalMessage}>
                    Are you sure you want to delete this mood entry? This action cannot be undone.
                  </Text>
                  <View style={styles.deleteModalButtons}>
                    <TouchableOpacity
                      style={styles.deleteModalCancelButton}
                      onPress={cancelDelete}
                    >
                      <Text style={styles.deleteModalCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteModalDeleteButton}
                      onPress={confirmDelete}
                    >
                      <Text style={styles.deleteModalDeleteText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      </BackgroundGradient>
    </View>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: (Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0) + Spacing.lg,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
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
  headerCardContainer: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 100 : (StatusBar.currentHeight || 0) + 60,
  },
  headerCardGradient: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  headerCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  headerCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  headerCardIcon: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.full,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.lg,
    ...Shadows.md,
  },
  headerCardText: {
    flex: 1,
  },
  headerCardTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[800],
  },
  headerCardDescription: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[600],
    marginTop: Spacing.xs,
  },
  headerCardActionButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  headerCardBackButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.sm,
  },
  heroAddButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  headerSimple: {
    paddingTop: Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight || 0) + 12,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
    ...Shadows.sm,
  },
  headerSimpleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerSimpleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  headerSimpleIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSimpleTitle: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
  },
  headerSimpleSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[600],
    marginTop: 2,
  },
  headerSimpleAddButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.xs,
  },
  headerAddButton: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.md,
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary[50],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.xl,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing['3xl'],
  },
  sectionHeader: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.semiBold,
    color: Colors.neutral[900],
  },
  addButton: {
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  addButtonGradient: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['5xl'],
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  emptyStateTitle: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.semiBold,
    color: Colors.neutral[700],
    marginBottom: Spacing.sm,
  },
  emptyStateSubtext: {
    fontSize: Typography.sizes.lg,
    color: Colors.neutral[500],
    marginBottom: Spacing['3xl'],
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.full,
  },
  emptyStateButtonText: {
    color: 'white',
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semiBold,
  },
  historyContainer: {
    gap: Spacing.md,
  },
  historyItem: {
    backgroundColor: 'white',
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  historyAccent: {
    height: 4,
    width: '100%',
  },
  historyContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  historyLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  historyMoodBadge: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.neutral[100],
  },
  historyMoodEmoji: {
    ...getEmojiStyle(24),
  },
  historyTextContent: {
    flex: 1,
  },
  historyMoodLabel: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semiBold,
    color: Colors.neutral[900],
    marginBottom: Spacing.xs,
  },
  historyNotes: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[600],
    marginBottom: Spacing.xs,
    lineHeight: Typography.sizes.base * Typography.lineHeights.normal,
  },
  historyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  historyDate: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[400],
  },
  deleteButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.error[50],
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.error[200],
  },
  bottomSpacing: {
    height: 120,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: BorderRadius['3xl'],
    borderTopRightRadius: BorderRadius['3xl'],
    maxHeight: isSmallScreen ? screenHeight * 0.9 : screenHeight * 0.95,
    minHeight: isSmallScreen ? screenHeight * 0.7 : screenHeight * 0.6,
    ...Shadows['2xl'],
  },
  keyboardAvoid: {
    flex: 1,
  },
  modalHandle: {
    width: getResponsiveSpacing(36, 40, 44),
    height: getResponsiveSpacing(3, 4, 4),
    backgroundColor: Colors.neutral[300],
    borderRadius: BorderRadius.full,
    alignSelf: 'center',
    marginTop: getResponsiveSpacing(Spacing.xs, Spacing.sm, Spacing.sm),
    marginBottom: getResponsiveSpacing(Spacing.sm, Spacing.md, Spacing.md),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: getResponsiveSpacing(Spacing.lg, Spacing.xl, Spacing['2xl']),
    paddingBottom: getResponsiveSpacing(Spacing.md, Spacing.lg, Spacing.lg),
  },
  modalTitle: {
    fontSize: getResponsiveFontSize(Typography.sizes.xl, Typography.sizes['2xl'], Typography.sizes['3xl']),
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    marginBottom: Spacing.xs,
    flex: 1,
    paddingRight: Spacing.md,
    lineHeight: getResponsiveFontSize(Typography.sizes.xl, Typography.sizes['2xl'], Typography.sizes['3xl']) * 1.2,
  },
  modalSubtitle: {
    fontSize: getResponsiveFontSize(Typography.sizes.sm, Typography.sizes.base, Typography.sizes.base),
    color: Colors.neutral[600],
    lineHeight: getResponsiveFontSize(Typography.sizes.sm, Typography.sizes.base, Typography.sizes.base) * 1.4,
  },
  closeButton: {
    padding: getResponsiveSpacing(Spacing.sm, Spacing.md, Spacing.md),
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral[100],
    minWidth: getResponsiveSpacing(40, 44, 48),
    minHeight: getResponsiveSpacing(40, 44, 48),
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    paddingBottom: getResponsiveSpacing(Spacing['2xl'], Spacing['3xl'], Spacing['4xl']),
  },
  
  categoriesContainer: {
    gap: Platform.OS === 'ios' ? Spacing.lg : Spacing.md,
  },
  categorySection: {
    marginBottom: Platform.OS === 'ios' ? Spacing.md : Spacing.sm,
  },
  categoryHeader: {
    paddingHorizontal: Platform.OS === 'ios' ? Spacing['2xl'] : Spacing.lg,
    marginBottom: Platform.OS === 'ios' ? Spacing.xs : 2,
  },
  categoryTitle: {
    fontSize: Platform.OS === 'ios' ? Typography.sizes.lg : Typography.sizes.base,
    fontWeight: Typography.weights.semiBold,
    color: Colors.neutral[700],
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Platform.OS === 'ios' ? Spacing['2xl'] : Spacing.lg,
    gap: Platform.OS === 'ios' ? 6 : 4,
    marginBottom: Platform.OS === 'ios' ? Spacing['2xl'] : Spacing.lg,
  },
  moodButton: {
    width: (screenWidth - (Platform.OS === 'ios' ? Spacing['2xl'] : Spacing.lg) * 2 - (Platform.OS === 'ios' ? Spacing.sm : Spacing.xs) * (7 - 1)) / 7,
    aspectRatio: 1,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: Platform.OS === 'ios' ? 45 : 40,
    minHeight: Platform.OS === 'ios' ? 45 : 40,
  },
  moodGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodGradientSelected: {
    borderWidth: 2,
    borderColor: 'white',
  },
  moodEmoji: {
    ...getEmojiStyle(22),
  },
  moodEmojiSelected: {
    ...getEmojiStyle(26),
  },
  moodLabel: {
    fontSize: Platform.OS === 'ios' ? Typography.sizes.xs : 10,
    fontWeight: Typography.weights.semiBold,
    color: 'white',
    textAlign: 'center',
  },
  moodLabelSelected: {
    fontSize: Platform.OS === 'ios' ? Typography.sizes.sm : Typography.sizes.xs,
  },
  moodTooltip: {
    position: 'absolute',
    bottom: -20,
    fontSize: 10,
    fontWeight: Typography.weights.medium,
    color: Colors.neutral[700],
    backgroundColor: Colors.neutral[100],
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: BorderRadius.sm,
    textAlign: 'center',
    minWidth: 30,
  },
  notesSection: {
    paddingHorizontal: Platform.OS === 'ios' ? Spacing['2xl'] : Spacing.lg,
    marginBottom: Platform.OS === 'ios' ? Spacing['3xl'] : Spacing['2xl'],
  },
  notesSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  notesSectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semiBold,
    color: Colors.neutral[700],
  },
  notesInputContainer: {
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    padding: Spacing.lg,
  },
  notesInput: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[900],
    minHeight: Platform.OS === 'ios' ? 100 : 80,
  },
  saveButton: {
    marginHorizontal: Platform.OS === 'ios' ? Spacing['2xl'] : Spacing.lg,
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    ...Shadows.md,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: Platform.OS === 'ios' ? Typography.sizes.lg : Typography.sizes.base,
    fontWeight: Typography.weights.semiBold,
    color: 'white',
    paddingVertical: Platform.OS === 'ios' ? Spacing.lg : Spacing.md,
    textAlign: 'center',
  },
  modalBottomSpacing: {
    height: getResponsiveSpacing(Spacing['2xl'], Spacing['3xl'], Spacing['4xl']),
  },

  // Modern Modal Styles
  modernMoodContainer: {
    paddingHorizontal: getResponsiveSpacing(Spacing.md, Spacing.lg, Spacing.lg),
    paddingTop: getResponsiveSpacing(Spacing.sm, Spacing.md, Spacing.md),
  },
  selectedMoodPreview: {
    marginBottom: getResponsiveSpacing(Spacing.lg, Spacing.xl, Spacing.xl),
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    ...Shadows.lg,
  },
  previewGradient: {
    paddingVertical: getResponsiveSpacing(Spacing.xl, Spacing['2xl'], Spacing['2xl']),
    paddingHorizontal: getResponsiveSpacing(Spacing.lg, Spacing.xl, Spacing.xl),
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewEmoji: {
    ...getEmojiStyle(42),
    marginBottom: Spacing.sm,
  },
  previewLabel: {
    fontSize: getResponsiveFontSize(Typography.sizes.lg, Typography.sizes.xl, Typography.sizes.xl),
    fontWeight: Typography.weights.bold,
    color: 'white',
    textAlign: 'center',
  },
  modernMoodGrid: {
    marginBottom: getResponsiveSpacing(Spacing.lg, Spacing.xl, Spacing.xl),
    flex: 1,
  },
  categoriesScrollView: {
    flex: 1,
  },
  categoriesScrollContent: {
    gap: getResponsiveSpacing(Spacing.xl, Spacing['2xl'], Spacing['2xl']),
    paddingBottom: getResponsiveSpacing(Spacing.lg, Spacing.xl, Spacing.xl),
  },
  scrollIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: 'transparent',
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  modernCategoryCard: {
    backgroundColor: 'white',
    borderRadius: BorderRadius.xl,
    padding: getResponsiveSpacing(Spacing.lg, Spacing.xl, Spacing.xl),
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: Colors.neutral[100],
    marginBottom: getResponsiveSpacing(Spacing.sm, Spacing.md, Spacing.md),
  },
  categoryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getResponsiveSpacing(Spacing.md, Spacing.lg, Spacing.lg),
    gap: Spacing.sm,
    paddingBottom: getResponsiveSpacing(Spacing.xs, Spacing.sm, Spacing.sm),
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  categoryCardIcon: {
    ...getEmojiStyle(20),
  },
  categoryCardTitle: {
    fontSize: getResponsiveFontSize(Typography.sizes.base, Typography.sizes.lg, Typography.sizes.lg),
    fontWeight: Typography.weights.semiBold,
    color: Colors.neutral[800],
  },
  categoryMoodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: getResponsiveSpacing(Spacing.md, Spacing.lg, Spacing.lg),
    paddingTop: getResponsiveSpacing(Spacing.sm, Spacing.md, Spacing.md),
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  modernMoodButton: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.lg,
    paddingVertical: getResponsiveSpacing(Spacing.sm, Spacing.md, Spacing.md),
    paddingHorizontal: getResponsiveSpacing(Spacing.xs, Spacing.sm, Spacing.sm),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...Shadows.xs,
    minHeight: getResponsiveSpacing(70, 80, 90),
    minWidth: getResponsiveSpacing(70, 80, 90),
  },
  modernMoodButtonSelected: {
    backgroundColor: Colors.primary[50],
    borderColor: Colors.primary[300],
    ...Shadows.sm,
  },
  modernMoodEmoji: {
    ...getEmojiStyle(26),
    marginBottom: Spacing.xs,
  },
  modernMoodEmojiSelected: {
    ...getEmojiStyle(30),
  },
  modernMoodText: {
    fontSize: getResponsiveFontSize(11, Typography.sizes.xs, Typography.sizes.xs),
    fontWeight: Typography.weights.medium,
    color: Colors.neutral[700],
    textAlign: 'center',
    lineHeight: getResponsiveFontSize(11, Typography.sizes.xs, Typography.sizes.xs) * 1.3,
    marginTop: getResponsiveSpacing(3, 4, 5),
  },
  modernMoodTextSelected: {
    color: Colors.primary[700],
    fontWeight: Typography.weights.semiBold,
  },
  modernNotesSection: {
    marginBottom: getResponsiveSpacing(Spacing.lg, Spacing.xl, Spacing.xl),
  },
  modernNotesTitle: {
    fontSize: getResponsiveFontSize(Typography.sizes.base, Typography.sizes.lg, Typography.sizes.lg),
    fontWeight: Typography.weights.semiBold,
    color: Colors.neutral[800],
    marginBottom: getResponsiveSpacing(Spacing.sm, Spacing.md, Spacing.md),
  },
  modernNotesInputContainer: {
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    padding: getResponsiveSpacing(Spacing.md, Spacing.lg, Spacing.lg),
  },
  modernNotesInput: {
    fontSize: getResponsiveFontSize(Typography.sizes.sm, Typography.sizes.base, Typography.sizes.base),
    color: Colors.neutral[900],
    lineHeight: getResponsiveFontSize(Typography.sizes.sm, Typography.sizes.base, Typography.sizes.base) * 1.5,
    minHeight: getResponsiveSpacing(80, 100, 120),
  },
  modernSaveButton: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  modernSaveButtonDisabled: {
    opacity: 0.5,
  },
  modernSaveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: getResponsiveSpacing(Spacing.md, Spacing.lg, Spacing.lg),
    paddingHorizontal: getResponsiveSpacing(Spacing.lg, Spacing.xl, Spacing.xl),
    gap: Spacing.sm,
    minHeight: getResponsiveSpacing(50, 56, 60),
  },
  modernSaveButtonText: {
    fontSize: getResponsiveFontSize(Typography.sizes.base, Typography.sizes.lg, Typography.sizes.lg),
    fontWeight: Typography.weights.semiBold,
    color: 'white',
  },
  modernSaveButtonEmoji: {
    ...getEmojiStyle(18),
  },
  
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteModalContainer: {
    backgroundColor: 'white',
    borderRadius: BorderRadius['2xl'],
    padding: Spacing['2xl'],
    margin: Spacing.xl,
    maxWidth: 400,
    width: '100%',
    ...Shadows['2xl'],
  },
  deleteModalContent: {
    alignItems: 'center',
  },
  deleteModalIcon: {
    marginBottom: Spacing.lg,
  },
  deleteModalTitle: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  deleteModalMessage: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[600],
    textAlign: 'center',
    marginBottom: Spacing['2xl'],
    lineHeight: Typography.sizes.base * 1.5,
  },
  deleteModalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },
  deleteModalCancelButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteModalCancelText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: Colors.neutral[700],
  },
  deleteModalDeleteButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.error[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteModalDeleteText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: 'white',
  },
  quickStatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.white,
    opacity: 0.8,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: Spacing.sm,
  },
  
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  toggleText: {
    fontSize: Typography.sizes.sm,
    color: Colors.primary[600],
    fontWeight: Typography.weights.medium,
  },
  insightsCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.md,
    marginBottom: Spacing.lg,
  },
  insightsGradient: {
    padding: Spacing.lg,
  },
  insightsContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  insightsText: {
    flex: 1,
    fontSize: Typography.sizes.base,
    color: 'white',
    fontWeight: Typography.weights.medium,
    lineHeight: Typography.sizes.base * 1.4,
  },

  trendsContainer: {
    backgroundColor: 'white',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.sm,
    gap: Spacing.md,
  },
  trendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  trendDay: {
    width: 40,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.neutral[700],
  },
  trendBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  trendBar: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  trendValue: {
    width: 30,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semiBold,
    color: Colors.neutral[700],
    textAlign: 'right',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 100 : (StatusBar.currentHeight || 0) + 60,
  },
  loadingText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.medium,
    color: Colors.neutral[700],
    marginTop: Spacing.md,
  },
});