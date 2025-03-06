# French Learning Streak App

A web application to track your French learning streak and earn rewards for consistent study habits.

## Features

- **Streak Tracking**: Track consecutive days of French learning
- **Reward System**: Earn increasing rewards for consistent learning
  - $1 for days 1-2
  - $2 for days 3-4
  - $3 for days 5-6, and so on
- **Daily Check-in**: Mark each day you've studied
- **Progress Visualization**: See your streak progress and rewards earned
- **Data Persistence**: Your streak data is saved across sessions using localStorage
- **Study History Calendar**: Review all your past study days with an interactive calendar
- **Performance Statistics**: Track your longest streak, total days studied, and study frequency
- **Study Timer**: Track your exact study time with start/stop functionality
- **Time Summaries**: See detailed breakdowns of your study time (daily, weekly, monthly, yearly)

### Key Implementation Features

- **Persistence**: Uses localStorage to save your progress across sessions, ensuring your streak and rewards are maintained even if you close your browser.

- **Study Confirmation**: A button to mark that you've studied French for the day, which disables itself after one click per day to prevent multiple check-ins.

- **Reminders**: The app assumes a separate backend sends WeChat reminders until you click the check-in button (not actually implemented in this frontend app).

- **Study History**: An interactive calendar that visualizes all your study days, allowing you to browse through months and see your progress over time.

- **Study Timer**: A timer feature that tracks exactly how long you study French, with an intuitive start/stop interface and visual progress indicator.

- **Time Tracking**: Comprehensive tracking and visualization of your study time, with detailed summaries by day, week, month, and year.

## Getting Started

### Prerequisites

- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)

### Installation

1. Clone the repository or download the source code
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

4. Start the development server:

```bash
npm run dev
```

5. Open your browser and navigate to the URL shown in your terminal (typically http://localhost:5173)

## Usage

- Click the "I Studied French Today" button each day after you've completed your French studies
- The button can only be clicked once per day
- If you miss a day, your streak will reset to zero
- As your streak grows, you'll earn higher rewards
- Navigate to the "History" tab to view your study calendar and performance statistics
- Use the Study Timer to track exactly how much time you spend learning French
- View your Time Summary for detailed breakdowns of your study habits over time

## Built With

- [React](https://reactjs.org/) - JavaScript library for building user interfaces
- [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript
- [Vite](https://vitejs.dev/) - Next generation frontend tooling
- [Material-UI](https://mui.com/) - React UI framework
- [date-fns](https://date-fns.org/) - JavaScript date utility library

## License

This project is licensed under the MIT License
