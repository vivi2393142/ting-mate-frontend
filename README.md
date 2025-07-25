# TingMate Frontend

<!-- TODO: add logo-->
<p align="center">
   <a href="https://vivi2393142.github.io/ting-mate-frontend/">
      <img src="./src/assets/images/adaptive-icon.png" alt="Logo" width="200">
   </a>
</p>

**Ting Mate** is a mobile app designed to simplify daily task management for memory-impaired individuals and their caregivers. The interface emphasizes clarity, low cognitive effort, and minimal input, making it easier for users to manage tasks independently or with assistance.

In addition to task support, Ting Mate provides collaborative features such as shared logs, notes, and location tracking, enabling caregivers to coordinate more effectively. The name "Ting Mate" reflects its role as a dependable companion for reminders and task tracking.

This repository contains the frontend implementation, built with React Native and Expo.

## App Overview and Key Features

### Core Features

#### Task Management and Voice Interaction

- Create, complete, update, and query tasks using voice or touch
- Recurring and time-based reminders
- AI assistant designed for accessibility

<!-- [GIF Placeholder] -->

#### Voice Interaction

- AI assistant designed for accessibility
- Commands are processed by a backend API using speech-text and LLM-powered parsing

<!-- [GIF Placeholder] -->

#### Caregiver Collaboration

- Share task logs and notes among linked caregiver accounts
- Visual indication of status, time, and updates

<!-- [GIF Placeholder] -->

#### Location-aware Safe Zone Detection

- Set a safe area using address + radius input
- Detect when the user is outside the zone via background geofencing

<!-- [GIF Placeholder] -->

#### Emergency Contact

- Trigger emergency calls or WhatsApp to preset contacts
- Customizable list stored in user settings

<!-- [GIF Placeholder] -->

#### Notification

- Task reminders are delivered through scheduled local notifications, even when the app is closed.
- When the user is online, real-time updates (such as caregiver-triggered events) via SSEare pushed instantly through a live connection.

<!-- [GIF Placeholder] -->

#### Account Modes and Onboarding

- Anonymous usage or linked account pairing
- First-time user tutorial with contextual walkthrough

<!-- [GIF Placeholder] -->

### Future Work

- Integration of offline fallback mode
- Additional languages and accessibility profiles
- Server-side analytics and caregiver alert features
<!-- TODO -->

## Development Stack and Setup

### Project Structure

- `app`: Expo routing files for navigation (e.g., tabs for Home and Settings).
- `src/assets`: Fonts, images, and sound effects.
  - `sounds/`: Sound effect files downloaded from [Mixkit](https://mixkit.co/free-sound-effects/) for free use in commercial and personal projects.
- `src/components`: Reusable UI components, organized by Atomic Design (atoms, organisms) and screens (UI logic for each app page).
- `src/store`: State management (e.g., Redux, to be added later).
- `src/styles`: Global styles and themes (e.g., colors, typography).
- `src/hooks`: Custom hooks.
- `src/constants`: Constants for configuration.
- `src/types`: TypeScript type definitions.

### Get started

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
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

### Packages and Tools Used

- React Native with Expo
- Expo Router (file-based navigation)
- React Native Paper (UI components)
- Zustand (state management)
- React Native Maps
- Expo Location and Task Manager
- Expo Notifications
- Linking API for phone and WhatsApp triggers
- TypeScript

### Additional Resources

- [Backend API Repository](https://vivi2393142.github.io/ting-mate-backend/)
     <!--  (link to be added) -->

  Contains the FastAPI backend for handling task data, user sessions, location tracking, and voice assistant integration.

- [AI-Based User Research and Evaluation](https://vivi2393142.github.io/ting-mate-ai-research/)
   <!-- (link to be added) -->
  This project includes a novel and deliberate use of AI personas and LLM-assisted simulations to conduct both requirement interviews and usability evaluations. This approach was designed to explore the feasibility of AI-assisted user research, particularly in contexts where access to real users (e.g., memory-impaired individuals) is limited.
