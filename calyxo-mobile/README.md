# Calyxo Mobile Application (Android & iOS)

Calyxo Mobile is an intelligent fitness, nutrition, and workout logging application powered by **React Native**, **Expo**, **Supabase**, and **Gemini AI**.

---

## 📱 Features

- **Cross-Platform**: Supports both **Android** (`.apk`/`.aab`) and **iOS** (`.ipa`/TestFlight/App Store).
- **Authentication**: Supabase Auth (Sign In, Registration, Guest Athlete Mode).
- **Daily Dashboard**: Real-time tracking of calories, water intake (with quick hydrate buttons), active minutes, calories burned, and macro nutrients (Protein, Carbs, Fats).
- **Food Tracker**: Custom meal logging with macro breakdown & Indian/healthy foods search database.
- **Workout Logger**: Strength/Cardio/HIIT/Yoga tracker with custom exercise sets, reps, weight logging, and an integrated Rest Interval Timer.
- **Calyxo AI Coach**: Interactive AI Assistant powered by Gemini API for personal fitness, nutrition, and workout advice.
- **Profile & Targets**: Dynamic daily calorie, water, weight, and fitness goal customizer.

---

## 🚀 How to Run locally

### 1. Install Dependencies
Navigate into the mobile directory and install npm packages:
```bash
cd calyxo-mobile
npm install
```

### 2. Start Expo Development Server
Run the Expo development server:
```bash
npx expo start
```

---

## 📱 Testing on Android & iOS

### Option A: Testing on Physical Devices (Expo Go App)
1. Install **Expo Go** from Google Play Store (Android) or Apple App Store (iOS).
2. Scan the QR code printed in your terminal or browser dashboard.

### Option B: Android Emulator
Make sure Android Studio is installed with an active Virtual Device (AVD), then run:
```bash
npx expo start --android
```

### Option C: iOS Simulator (macOS)
Make sure Xcode is installed, then run:
```bash
npx expo start --ios
```

---

## 📦 Building Native Applications (.APK / .AAB / .IPA)

Using Expo Application Services (EAS Build):

### 1. Install EAS CLI
```bash
npm install -g eas-cli
```

### 2. Build Android APK
```bash
eas build -p android --profile preview
```

### 3. Build iOS App (TestFlight / App Store)
```bash
eas build -p ios
```
