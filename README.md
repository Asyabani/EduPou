# 🎮 EduPou - Interactive Educational Game for Kids

**EduPou** is a mobile educational game built with **React Native**, **Expo**, and **TypeScript**. Inspired by the classic *Pou* game, EduPou enhances the experience by allowing children to play while learning how to read, count, draw, and explore simulated rooms like bedrooms, classrooms, and more.

---

## 🚀 Features

- 📚 **Reading Room** – Learn basic reading skills.
- ➕ **Math Room** – Practice counting and simple arithmetic.
- 🎨 **Coloring Room** – Draw and color to spark creativity.
- 🍽️ **Dining Room** – Simulate mealtime experiences.
- 🛏️ **Bedroom** – Interact with fun routines.
- 🧭 **Tab Navigation** – Easily switch between rooms using `expo-router`.

---

## ⚙️ Tech Stack

- **React Native** – Cross-platform mobile development
- **Expo** – Development and build tools
- **TypeScript** – Static type checking
- **expo-router** – File-based routing for navigation
- **Reusable Components** – Modular and scalable UI
- **Custom Hooks & Utils** – For clean and efficient logic

---

## 📁 Project Structure

\`\`\`
.
├── app/                    # Screens and navigation
│   ├── (tabs)/            # Tab layout configuration
│   ├── _layout.tsx        # Stack layout wrapper
│   ├── +not-found.tsx     # 404 fallback screen
│   ├── Bedroom.tsx        # Bedroom screen
│   ├── ColoringRoom.tsx   # Drawing/coloring activity
│   ├── DiningRoom.tsx     # Dining simulation
│   ├── MathRoom.tsx       # Counting/math game
│   └── ReadingRoom.tsx    # Reading lesson
│
├── assets/                # Images, sounds, fonts
├── components/            # Reusable UI components
├── constants/             # App-wide constants
├── hooks/                 # Custom React hooks
├── scripts/               # Build and helper scripts
├── utils/                 # Utility/helper functions
│
├── app.json               # Expo configuration
├── eslint.config.js       # ESLint configuration
├── expo-env.d.ts          # Expo TypeScript types
├── package.json
└── README.md
\`\`\`

---

## 🛠️ Getting Started

### 1. Clone the Repository

\`\`\`bash
git clone https://github.com/Asyabani/EduPou.git
cd EduPou
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
# or
yarn install
\`\`\`

### 3. Run the App

\`\`\`bash
npm start
# or
expo start
\`\`\`

### 4. Open on a Device

- Download **Expo Go** on Android or iOS.
- Scan the QR code shown in your terminal or browser.

---

## ➕ How to Add a New Room (Screen)

1. Create a new file in the `app/` directory, e.g. `PlayRoom.tsx`
2. Add your screen content.
3. It automatically becomes a route in the app!

\`\`\`tsx
// app/PlayRoom.tsx
import { Text, View } from 'react-native';

export default function PlayRoom() {
  return (
    <View>
      <Text>Welcome to Play Room!</Text>
    </View>
  );
}
\`\`\`

---

## ❓ FAQ

**Q: Why use \`expo-router\`?**  
A: It simplifies navigation by automatically mapping files to routes based on their location.

**Q: What is \`_layout.tsx\` used for?**  
A: It provides a shared layout (like navigation tabs) for nested routes.

**Q: What is \`+not-found.tsx\`?**  
A: A fallback screen shown when the route does not match any file.

---

## 📄 License

MIT License © 2025 [Nurzaman Asyabani]
