export const translations = {
  // Translations for English
  header: {
    home: 'Home',
    analyzeProfile: 'Analyze Profile',
    trackOrder: 'Track Order',
    tickets: 'Tickets'
  },
  home: {
    banner: {
      title: 'Instagram Profile Analysis',
      subtitle: 'Discover powerful insights about your profile',
      searchPlaceholder: 'Enter your Instagram username',
      searchButton: 'Analyze Profile'
    },
    features: {
      title: 'How It Works',
      steps: [
        {
          title: 'Enter Profile',
          description: 'Type the Instagram username you want to analyze'
        },
        {
          title: 'Detailed Analysis',
          description: 'Receive comprehensive insights about the selected profile'
        },
        {
          title: 'Personalized Report',
          description: 'Generate a complete report for growth strategies'
        }
      ]
    }
  },
  loading: {
    checking: 'Searching for your profile...',
    validating: 'Checking if your profile is public...',
    fetching: 'Loading profile information...',
    private: 'Private profile detected',
    error: 'Error processing profile'
  },
  privateProfile: {
    title: 'Private Profile',
    description: 'Your profile is set to private. To continue the analysis, you need to make your profile public temporarily.',
    startTimer: 'Start Countdown',
    cancel: 'Cancel',
    waitMessage: 'Wait',
    tryAgain: 'Try Again'
  },
  errors: {
    profileNotFound: 'Profile not found',
    internalError: 'Internal error processing profile'
  },
  profileAnalysis: {
    tabs: {
      posts: 'Posts',
      reels: 'Reels'
    },
    metrics: {
      followers: 'Followers',
      following: 'Following',
      posts: 'Posts'
    }
  }
};
