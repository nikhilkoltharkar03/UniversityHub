// Helper to extract user profile data from Firebase user object
export const getUserProfileData = (user) => {
  if (!user) return null;
  
  let additionalData = {
    branch: '',
    year: '',
    rollNumber: ''
  };
  
  // Parse additional data from photoURL (our workaround storage)
  if (user.photoURL) {
    try {
      additionalData = JSON.parse(user.photoURL);
    } catch (error) {
      console.error('Failed to parse user data:', error);
    }
  }
  
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || 'User',
    branch: additionalData.branch || 'N/A',
    year: additionalData.year || 'N/A',
    rollNumber: additionalData.rollNumber || 'N/A',
    emailVerified: user.emailVerified,
    photoURL: user.photoURL // Keep original for updates
  };
};