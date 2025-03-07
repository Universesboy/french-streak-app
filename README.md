# French Streak App

A web application to track your French language learning progress, maintain streaks, and record study time.

## Features

- **User Authentication**: Register and login to save your progress
- **Daily Check-ins**: Mark your daily French learning sessions
- **Streak Tracking**: Maintain and view your learning streaks
- **Study Timer**: Track the time you spend studying French
- **Statistics**: View detailed statistics about your learning habits
- **Persistent Data**: Your data is saved even when you close the app

## Technologies Used

- React
- TypeScript
- Material-UI
- Firebase Authentication
- Firestore Database
- date-fns for date manipulation
- recharts for data visualization

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a Firebase project and add your configuration to `src/utils/firebase.ts`
4. Run the development server:
   ```
   npm run dev
   ```

## Firebase Configuration

To use the authentication and data persistence features, you need to set up a Firebase project:

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Add a web app to your project
4. Enable Authentication (Email/Password)
5. Create a Firestore database
6. Copy your Firebase configuration to `src/utils/firebase.ts`

## Project Structure

- `src/components/`: React components
- `src/utils/`: Utility functions and Firebase configuration
- `src/assets/`: Static assets
- `public/`: Public files

## License

MIT
