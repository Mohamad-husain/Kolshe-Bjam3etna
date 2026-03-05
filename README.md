# Kolshi B Jam3etna

A university-focused mobile application designed to organize student life by bringing academic services, a student marketplace, exchanges, university events, and official announcements into one platform.

The goal of the project is to replace scattered communication channels such as WhatsApp groups and social media posts with a structured and trusted digital ecosystem built specifically for university communities.

The application works as a **closed university environment**, meaning that users select their university during registration and interact only with content related to their campus.

---

## Project Idea

Kolshi B Jam3etna aims to create a centralized digital hub for university students.

Instead of searching across different platforms for help, materials, or announcements, students can use one application to access everything related to their university life.

The platform connects students with services, resources, and opportunities within their campus community while maintaining a simple and organized experience.

---

## Main Features

### Academic Services
Students can request academic help such as tutoring, project assistance, summaries, or homework support. Other students can offer their expertise and respond to these requests.

### Student Marketplace
A marketplace where students can buy and sell books, study materials, electronics, and other items commonly used within the university.

### Exchange System
Students can exchange items such as textbooks or study materials instead of selling them.

### University Events
Student clubs and organizations can publish workshops, activities, and campus events. Students can view event details and register to attend.

### University News
A dedicated section for official announcements such as scholarships, exchange programs, internships, and important academic updates.

### Messaging System
Direct messaging allows users to communicate regarding services, listings, or exchanges.

### Notifications
The platform sends notifications to inform users about important updates such as new offers, messages, upcoming events, and announcements.

---

## Tech Stack

- React Native (Expo)
- TypeScript
- Context API
- Modular Architecture

---

## Project Structure


App.tsx # App root (navigation + providers)
index.ts # Expo entry point

src/
├─ components/ # Reusable UI components
├─ contexts/ # App providers and contexts
├─ data/ # Static data
├─ hooks/ # Custom hooks
├─ lib/ # Shared types and env config
├─ locales/ # Translations
├─ screens/ # App screens
├─ services/ # API / backend services
├─ styles/ # Design tokens
└─ utils/ # Utilities


---

## Getting Started

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


---

## Environment Variables

Create a `.env` file based on `.env.example`:


EXPO_PUBLIC_API_BASE_URL=[https://documenter.getpostman.com/view/42948246/2sBXcKDKB8](https://documenter.getpostman.com/view/42948246/2sBXcKDKB8)


---

## Scripts


npm run start # Start Expo dev server
npm run android # Run on Android
npm run ios # Run on iOS
npm run web # Run on Web
npm run lint # Run lint checks


---

## Future Vision

The platform is designed to grow into a complete university ecosystem that supports student collaboration, campus services, and academic opportunities within a unified digital environment.
