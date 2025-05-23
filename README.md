# 🎮 EduPou - Interactive Educational Game for Kids

**EduPou** is a mobile educational game built with **React Native**, **Expo**, and **TypeScript**. Inspired by the classic *Pou* game, EduPou lets children play while learning to read, count, draw, and explore simulated rooms such as bedrooms, classrooms, and more.

---

## 🚀 Features

* 📚 Reading Room — Learn basic reading skills
* ➕ Math Room — Practice counting and simple arithmetic
* 🎨 Coloring Room — Draw and color to spark creativity
* 🍽️ Dining Room — Simulate mealtime experiences
* 🛏️ Bedroom — Interact with fun routines
* 🧭 Tab Navigation using `expo-router`

---

## 🧰 Tech Stack

* [React Native](https://reactnative.dev/)
* [Expo](https://expo.dev/)
* [expo-router](https://expo.github.io/router/)
* [TypeScript](https://www.typescriptlang.org/)

---

## 📁 Project Structure

```
EduPou/
├── app/
│   ├── (tabs)/                # Tab layout configuration
│   ├── _layout.tsx            # Stack layout wrapper
│   ├── +not-found.tsx         # 404 fallback screen
│   ├── Bedroom.tsx            # Bedroom screen
│   ├── ColoringRoom.tsx       # Drawing/coloring activity
│   ├── DiningRoom.tsx         # Dining simulation
│   ├── MathRoom.tsx           # Counting/math game
│   └── ReadingRoom.tsx        # Reading lesson
├── assets/                    # Images, sounds, fonts
├── components/                # Reusable UI components
├── constants/                 # App-wide constants
├── hooks/                     # Custom React hooks
├── scripts/                   # Build and helper scripts
├── utils/                     # Utility/helper functions
├── app.json                   # Expo configuration
├── eslint.config.js           # ESLint configuration
├── expo-env.d.ts              # Expo TypeScript types
├── package.json
└── README.md
```

---

## 🛠️ Getting Started

1. Clone the repo:

   ```bash
   git clone https://github.com/Asyabani/EduPou.git
   cd EduPou
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the app:

   ```bash
   npm start
   # or
   expo start
   ```

4. Open on a device:
   Download **Expo Go** on Android/iOS and scan the QR code from the terminal or browser.

---

## ➕ How to Add a New Room (Screen)

1. Create a new file in `app/` folder, e.g., `PlayRoom.tsx`
2. Add your screen content.
3. The new screen will automatically become a route!


---

## ❓ FAQ

**Q: Why use `expo-router`?**
A: It simplifies navigation by automatically mapping files to routes based on their folder structure.

**Q: What is `_layout.tsx`?**
A: It provides shared layout (e.g., tab navigation) for nested routes.

**Q: What is `+not-found.tsx`?**
A: Fallback screen shown when the route does not match any existing page.

---

## 📃 License

MIT License © 2025 \[Nurzaman Asyabani]
