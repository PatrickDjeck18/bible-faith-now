
/**
 * Enhanced Bible Quiz Questions with Advanced Randomization
 * Integrates with the quizRandomization system for better question distribution
 */

import { QuizQuestion, QuizCategory, QUIZ_QUESTIONS } from './QuizQuestions';
import {
  getWeightedRandomQuestions,
  getQuestionsForLevelWithRandomization,
  loadUsedQuestionIds,
  saveUsedQuestionIds,
  updateQuestionStats,
  loadQuestionStats,
  shuffleArray
} from '@/utils/quizRandomization';

// Re-export types for compatibility
export { QuizQuestion, QuizCategory };

/**
 * Enhanced question selection with persistent tracking
 */
export const getEnhancedRandomQuestions = async (
  count: number,
  filters?: {
    category?: QuizCategory;
    difficulty?: 'easy' | 'medium' | 'hard';
    testament?: 'old' | 'new' | 'both';
  },
  level?: number
): Promise<QuizQuestion[]> => {
  // Load tracking data
  const usedQuestionIds = await loadUsedQuestionIds();
  const questionStats = await loadQuestionStats();

  // Filter questions based on provided filters
  let filteredQuestions = [...QUIZ_QUESTIONS];
  
  if (filters) {
    if (filters.category) {
      filteredQuestions = filteredQuestions.filter(q => q.category === filters.category);
    }
    if (filters.difficulty) {
      filteredQuestions = filteredQuestions.filter(q => q.difficulty === filters.difficulty);
    }
    if (filters.testament) {
      filteredQuestions = filteredQuestions.filter(q => 
        q.testament === filters.testament || q.testament === 'both'
      );
    }
  }

  // Use level-based selection if level is provided
  if (level !== undefined) {
    return getQuestionsForLevelWithRandomization(
      filteredQuestions,
      level,
      count,
      usedQuestionIds,
      questionStats
    );
  }

  // Use weighted random selection for general case
  return getWeightedRandomQuestions(
    filteredQuestions,
    count,
    usedQuestionIds,
    questionStats
  );
};

/**
 * Enhanced level-based question selection
 */
export const getEnhancedQuestionsForLevel = async (
  level: number,
  filters?: {
    category?: QuizCategory;
    testament?: 'old' | 'new' | 'both';
  }
): Promise<QuizQuestion[]> => {
  const { LEVEL_SYSTEM } = await import('./QuizQuestions');
  const levelConfig = LEVEL_SYSTEM.find((l: any) => l.level === level) || LEVEL_SYSTEM[0];
  
  return getEnhancedRandomQuestions(
    levelConfig.questionsCount,
    {
      ...filters,
      difficulty: levelConfig.difficulty === 'mixed' ? undefined : levelConfig.difficulty
    },
    level
  );
};

/**
 * Track question usage for better randomization
 */
export const trackQuestionUsage = async (
  questionId: string,
  question: QuizQuestion,
  wasCorrect: boolean
): Promise<void> => {
  // Update question statistics
  await updateQuestionStats(questionId, question, wasCorrect);
  
  // Update used question IDs for current session
  const usedQuestionIds = await loadUsedQuestionIds();
  usedQuestionIds.add(questionId);
  await saveUsedQuestionIds(usedQuestionIds);
};

/**
 * Get questions optimized for learning (focus on weak areas)
 */
export const getLearningOptimizedQuestions = async (
  count: number,
  focusAreas?: {
    categories?: QuizCategory[];
    difficulties?: ('easy' | 'medium' | 'hard')[];
  }
): Promise<QuizQuestion[]> => {
  const questionStats = await loadQuestionStats();
  const usedQuestionIds = await loadUsedQuestionIds();
  
  // Filter questions based on focus areas
  let filteredQuestions = [...QUIZ_QUESTIONS];
  
  if (focusAreas?.categories) {
    filteredQuestions = filteredQuestions.filter(q =>
      focusAreas.categories!.includes(q.category)
    );
  }
  
  if (focusAreas?.difficulties) {
    filteredQuestions = filteredQuestions.filter(q =>
      focusAreas.difficulties!.includes(q.difficulty)
    );
  }

  // Prioritize questions with low accuracy
  const weightedQuestions = filteredQuestions.map(question => {
    const stats = questionStats[question.id];
    let weight = 1;

    if (stats) {
      const accuracy = stats.totalAnswers > 0 ? stats.correctAnswers / stats.totalAnswers : 0.5;
      // Higher weight for lower accuracy (focus on weak areas)
      weight = 1 - accuracy;
      
      // Reduce weight for recently used questions
      const daysSinceLastUse = (Date.now() - stats.lastUsed) / (24 * 60 * 60 * 1000);
      if (daysSinceLastUse < 7) {
        weight *= 0.5;
      }
    }

    return { question, weight };
  });

  // Sort by weight and select top questions
  weightedQuestions.sort((a, b) => b.weight - a.weight);
  
  const selectedQuestions = weightedQuestions
    .slice(0, Math.min(count * 2, weightedQuestions.length)) // Get more than needed for variety
    .map(item => item.question);

  // Final shuffle and limit to requested count
  return shuffleArray(selectedQuestions).slice(0, count);
};

/**
 * Get mixed difficulty questions with balanced distribution
 */
export const getBalancedMixedQuestions = async (
  count: number,
  difficultyDistribution: { easy: number; medium: number; hard: number } = { easy: 0.4, medium: 0.4, hard: 0.2 }
): Promise<QuizQuestion[]> => {
  const usedQuestionIds = await loadUsedQuestionIds();
  const questionStats = await loadQuestionStats();

  // Calculate counts for each difficulty
  const easyCount = Math.floor(count * difficultyDistribution.easy);
  const mediumCount = Math.floor(count * difficultyDistribution.medium);
  const hardCount = count - easyCount - mediumCount;

  // Get questions for each difficulty
  const easyQuestions = getWeightedRandomQuestions(
    QUIZ_QUESTIONS.filter(q => q.difficulty === 'easy'),
    easyCount,
    usedQuestionIds,
    questionStats
  );

  const mediumQuestions = getWeightedRandomQuestions(
    QUIZ_QUESTIONS.filter(q => q.difficulty === 'medium'),
    mediumCount,
    usedQuestionIds,
    questionStats
  );

  const hardQuestions = getWeightedRandomQuestions(
    QUIZ_QUESTIONS.filter(q => q.difficulty === 'hard'),
    hardCount,
    usedQuestionIds,
    questionStats
  );

  // Combine and shuffle
  const allQuestions = [...easyQuestions, ...mediumQuestions, ...hardQuestions];
  return shuffleArray(allQuestions);
};

/**
 * Get category-specific questions with variety
 */
export const getCategoryQuestionsWithVariety = async (
  category: QuizCategory,
  count: number,
  difficulty?: 'easy' | 'medium' | 'hard' | 'mixed'
): Promise<QuizQuestion[]> => {
  const usedQuestionIds = await loadUsedQuestionIds();
  const questionStats = await loadQuestionStats();

  let filteredQuestions = QUIZ_QUESTIONS.filter(q => q.category === category);
  
  if (difficulty && difficulty !== 'mixed') {
    filteredQuestions = filteredQuestions.filter(q => q.difficulty === difficulty);
  }

  return getWeightedRandomQuestions(
    filteredQuestions,
    count,
    usedQuestionIds,
    questionStats
  );
};

/**
 * Reset question tracking for a fresh start
 */
export const resetQuestionTracking = async (): Promise<void> => {
  const { resetQuestionTracking: resetTracking } = await import('@/utils/quizRandomization');
  await resetTracking();
};

// Re-export level system from original file for compatibility
export {
  LEVEL_SYSTEM,
  getCurrentLevel,
  getNextLevel,
  getProgressToNextLevel
} from './QuizQuestions';