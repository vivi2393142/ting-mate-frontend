# TingMate Frontend

<!-- TODO: add sections includes:
- functions/features
- dependencies -->

## Project Overview

**TingMate** is a daily support app designed for memory-impaired individuals and their caregivers, featuring an AI voice assistant to help manage reminders and tasks. The name "TingMate" reflects its role as a reliable companion for reminders and to-do tasks. This repository contains the frontend implementation, built with React Native and Expo.

## Project Structure

- `app`: Expo routing files for navigation (e.g., tabs for Home and Settings).
- `src/assets`: Fonts, images, and sound effects.
  - `sounds/`: Sound effect files downloaded from [Mixkit](https://mixkit.co/free-sound-effects/) for free use in commercial and personal projects.
- `src/components`: Reusable UI components, organized by Atomic Design (atoms, organisms) and screens (UI logic for each app page).
- `src/store`: State management (e.g., Redux, to be added later).
- `src/styles`: Global styles and themes (e.g., colors, typography).
- `src/hooks`: Custom hooks.
- `src/constants`: Constants for configuration.
- `src/types`: TypeScript type definitions.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.
