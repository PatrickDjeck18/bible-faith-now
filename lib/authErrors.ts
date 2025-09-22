// Authentication error handling utilities

export interface AuthError {
  message: string;
  code: string;
  userFriendlyMessage?: string;
}

export const getAuthErrorMessage = (error: any): AuthError => {
  const errorCode = error.code || error.message || 'unknown';

  const errorMessages: Record<string, string> = {
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password should be at least 6 characters long.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled.',
    'auth/account-exists-with-different-credential': 'Account exists with different credentials.',
    'auth/popup-closed-by-user': 'Sign-in was cancelled.',
    'auth/cancelled-popup-request': 'Sign-in request was cancelled.',
    'auth/popup-blocked': 'Sign-in popup was blocked by your browser.',
    'auth/unauthorized-domain': 'Domain not authorized for OAuth operations.',
    'cancelled': 'Sign-in was cancelled.',
    'in-progress': 'Sign-in is already in progress.',
    'play-services-not-available': 'Google Play Services not available.',
    'oauth-config-error': 'OAuth configuration error. Please check your settings.',
    'no-user': 'No user returned from authentication.',
  };

  const userFriendlyMessage = errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';

  return {
    message: error.message || userFriendlyMessage,
    code: errorCode,
    userFriendlyMessage,
  };
};

export const isAuthError = (error: any): error is AuthError => {
  return error && typeof error.code === 'string' && typeof error.message === 'string';
};