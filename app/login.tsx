import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Mail, Eye, EyeOff, Lock, ArrowRight, User } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/DesignTokens';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

// Modern Components
import ModernAuthCard from '@/components/auth/ModernAuthCard';
import FloatingLabelInput from '@/components/auth/FloatingLabelInput';
import ModernButton from '@/components/auth/ModernButton';
import SocialLoginButton from '@/components/auth/SocialLoginButton';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const { signInWithEmail, signInAsGuest } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const isEmailValid = email.length > 0 && !emailError;
  const isPasswordValid = password.length >= 6 && !passwordError;
  const isFormValid = isEmailValid && isPasswordValid;

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (password: string) => {
    if (!password.trim()) {
      setPasswordError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) {
      validateEmail(text);
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (passwordError) {
      validatePassword(text);
    }
  };

  const handleSignIn = async () => {
    const emailOk = validateEmail(email);
    const passOk = validatePassword(password);
    if (!emailOk || !passOk) return;

    try {
      setLoading(true);
      const { data, error } = await signInWithEmail(email.trim(), password);
      
      if (error) {
        // Use the improved error handling from authErrors
        Alert.alert('Sign In Error', error.userFriendlyMessage || error.message || 'Failed to sign in. Please try again.');
      } else if (data?.user) {
        console.log('Sign in successful, user:', data.user.uid);
        // Redirect to main app after successful sign-in
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      Alert.alert('Connection Error', 'Unable to connect to the server. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    router.push('/signup');
  };

  const handleGuestLogin = async () => {
    try {
      setLoading(true);
      const { data, error } = await signInAsGuest();
      
      if (error) {
        Alert.alert('Guest Login Error', error.userFriendlyMessage || error.message || 'Failed to login as guest. Please try again.');
      } else if (data?.user) {
        console.log('Guest login successful, user:', data.user.uid);
        // Redirect to main app after successful guest login
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Guest login error:', error);
      Alert.alert('Connection Error', 'Unable to connect to the server. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    Alert.alert('Coming Soon', `${provider} login will be available soon!`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          contentInsetAdjustmentBehavior="automatic"
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Text style={styles.welcomeText}>Welcome back to</Text>
            <Text style={styles.appName}>Daily Bread</Text>
            <Text style={styles.tagline}>
              Continue your spiritual journey with AI-powered Bible study and guidance
            </Text>
          </View>

          {/* Login Form */}
          <View style={styles.formSection}>
            <ModernAuthCard>
              <Text style={styles.formTitle}>Sign In</Text>
              <Text style={styles.formSubtitle}>
                Enter your credentials to access your account
              </Text>
              
              {/* Email Input */}
              <FloatingLabelInput
                label="Email Address"
                value={email}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                returnKeyType="next"
                error={emailError}
                icon={<Mail size={20} color={Colors.neutral[600]} />}
              />

              {/* Password Input */}
              <FloatingLabelInput
                label="Password"
                value={password}
                onChangeText={handlePasswordChange}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password"
                returnKeyType="go"
                onSubmitEditing={handleSignIn}
                error={passwordError}
                icon={<Lock size={20} color={Colors.neutral[600]} />}
                rightIcon={
                  showPassword ? (
                    <EyeOff size={20} color={Colors.neutral[600]} />
                  ) : (
                    <Eye size={20} color={Colors.neutral[600]} />
                  )
                }
                onRightIconPress={() => setShowPassword(!showPassword)}
              />

                {/* Sign In Button */}
                <ModernButton
                  title="Sign In"
                  onPress={handleSignIn}
                  loading={loading}
                  disabled={!isFormValid || loading}
                  rightIcon={<ArrowRight size={20} color="white" />}
                  style={styles.signInButton}
                />

                {/* Guest Login Button */}
                <ModernButton
                  title="Continue as Guest"
                  onPress={handleGuestLogin}
                  loading={loading}
                  variant="outline"
                  icon={<User size={20} color={Colors.primary[600]} />}
                  style={styles.guestButton}
                />

                {/* Divider */}
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or continue with</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Social Login Buttons */}
                <View style={styles.socialContainer}>
                  {/* Social login buttons removed */}
                 </View>

                {/* Sign Up Link */}
                <View style={styles.signUpContainer}>
                  <Text style={styles.signUpText}>Don't have an account? </Text>
                  <TouchableOpacity onPress={handleSignUp} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={styles.signUpLink}>Create Account</Text>
                  </TouchableOpacity>
                </View>
            </ModernAuthCard>
          </View>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  
  // Hero Section
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing['3xl'],
    minHeight: height * 0.35,
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: Typography.sizes.xl,
    color: Colors.neutral[600],
    marginBottom: Spacing.xs,
    fontWeight: Typography.weights.medium,
    textAlign: 'center',
  },
  appName: {
    fontSize: Typography.sizes['5xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    marginBottom: Spacing.lg,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: Typography.sizes.lg,
    color: Colors.neutral[600],
    textAlign: 'center',
    lineHeight: Typography.sizes.lg * 1.5,
    paddingHorizontal: Spacing.lg,
    fontWeight: Typography.weights.regular,
  },

  // Form Section
  formSection: {
    flex: 1,
    paddingBottom: Spacing.xl,
  },
  formTitle: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  formSubtitle: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[600],
    textAlign: 'center',
    marginBottom: Spacing['2xl'],
    lineHeight: Typography.sizes.base * 1.5,
  },
  signInButton: {
    marginBottom: Spacing.md,
  },
  guestButton: {
    marginBottom: Spacing.lg,
  },
  
  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.neutral[200],
  },
  dividerText: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[500],
    marginHorizontal: Spacing.lg,
    fontWeight: Typography.weights.medium,
  },
  
  // Social Login
  socialContainer: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  
  // Sign Up Link
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  signUpText: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[600],
    fontWeight: Typography.weights.regular,
  },
  signUpLink: {
    fontSize: Typography.sizes.base,
    color: Colors.primary[600],
    fontWeight: Typography.weights.bold,
  },
  
  bottomSpacing: {
    height: Spacing['2xl'],
  },
});
