export const getFriendlyError = (code) => {
  switch (code) {
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please try again.';
    case 'auth/email-already-in-use':
      return 'Email already registered. Please login instead.';
    case 'auth/weak-password':
      return 'Password is too weak. Use at least 6 characters.';
    case 'auth/invalid-email':
      return 'Invalid email address format.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};
