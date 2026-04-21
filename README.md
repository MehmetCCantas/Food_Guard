# 🍲 Food Guard

<p align="center">
  <em>An innovative web platform dedicated to reducing food waste by connecting food donors with those in need.</em>
</p>

## ✨ Features

- **Real-Time Location Mapping:** Interactively view and manage food donation locations using advanced mapping features.
- **Donation Management:** Create, view, and manage food donation requests seamlessly.
- **Secure Authentication:** Robust user authentication system for donors and recipients.
- **Real-Time Communication:** Integrated chat and notification system for smooth coordination.
- **Admin Dashboard:** Comprehensive dashboard for managing users, listings, and analyzing platform impact.

## 🚀 Tech Stack

### Frontend
- **Framework:** Next.js (React)
- **Language:** TypeScript
- **Styling:** CSS Modules
- **Mapping:** Leaflet
- **State Management:** React Context API (Auth, Chat, Notifications)

### Backend
- **Framework:** NestJS
- **Language:** TypeScript
- **Architecture:** Modular REST/WebSocket App

## 📂 Repository Structure

This repository is structured as a monorepo containing both the frontend and backend applications to streamline development and deployment.

- `/src`: Contains the Next.js frontend application.
- `/foodguard-backend`: Contains the NestJS backend API.

## 🛠️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- npm or yarn

### 1. Frontend Setup
From the root of the repository, install dependencies and start the development server:
```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```
The frontend will be available at `http://localhost:3000`.

### 2. Backend Setup
Open a separate terminal window and navigate to the backend directory:
```bash
# Navigate to the backend directory
cd foodguard-backend

# Install dependencies
npm install

# Start the backend server
npm run start:dev
```
*(Make sure to review the `.env` configuration requirements inside the backend directory)*

## 🤝 Contributing
Contributions, issues, and feature requests are always welcome!
