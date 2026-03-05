Kolshi B Jam3etna

A university-focused mobile application that organizes student life by bringing academic services, a student marketplace, exchanges, events, and official university news into one platform.

The goal of the project is to replace scattered communication channels (such as WhatsApp groups and social media posts) with a structured and trusted digital ecosystem designed specifically for university communities.

The application works as a closed university environment, where users select their university during registration and only interact with content from their own campus.

Project Idea

Kolshi B Jam3etna aims to create a centralized digital hub for university students.

Instead of searching across different platforms for help, materials, or announcements, students can use a single application to access everything related to their university life.

The platform connects students with services, resources, and opportunities inside their campus community while maintaining a simple and organized experience.

Main Features
Academic Services

Students can request help with academic tasks such as tutoring, summaries, or project assistance. Other students can offer their expertise and respond to these requests.

Student Marketplace

A marketplace where students can buy and sell books, study materials, and other items commonly used within the university.

Exchange System

Students can exchange items such as textbooks or study materials with each other instead of selling them.

University Events

Student clubs and organizations can publish workshops, activities, and campus events. Students can view event details and register to attend.

University News

A dedicated section for official announcements such as scholarships, exchange programs, training opportunities, and important university updates.

Messaging System

Direct messaging allows users to communicate with each other regarding services, listings, or exchanges.

Notifications

The platform provides notifications for important updates such as new offers, messages, events, and announcements.

Tech Stack

React Native (Expo)

TypeScript

Context API

Modular architecture

Project Structure
App.tsx                   # App root (navigation + providers)
index.ts                  # Expo entry point
src/
├─ components/            # Reusable UI components
├─ contexts/              # App contexts and providers
├─ data/                  # Static data and maps
├─ hooks/                 # Custom hooks
├─ lib/                   # Environment and shared types
├─ locales/               # Translations
├─ screens/               # Application screens
├─ services/              # API and backend services
├─ styles/                # Design tokens (colors/spacing)
└─ utils/                 # Helper utilities
Getting Started

Install dependencies:

npm install

Start the development server:

npm run start

Run on Android:

npm run android

Run on iOS:

npm run ios

Run on Web:

npm run web
Environment Variables

Create a .env file based on .env.example and configure your API endpoint:

EXPO_PUBLIC_API_BASE_URL=https://api.example.com
Scripts
npm run start      # Start Expo dev server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on Web
npm run lint       # Run lint checks
Future Vision

The platform is designed to grow into a full university ecosystem that supports student collaboration, campus services, and academic opportunities within a unified digital environment.
