# Email AI Frontend

A React-based frontend for the Email AI application with a checkered background and color-changing title that responds to mouse movement.

## Features

- ✨ Checkered canvas background
- 🎨 Color-changing title based on mouse position
- 💬 Real-time chat interface
- 📎 File upload support
- 📥 Automatic file downloads
- 🎯 Built with React + Astro + Tailwind CSS

## Tech Stack

- **Framework**: Astro 5.16.8 with React integration
- **UI Library**: React 18
- **Styling**: Tailwind CSS 4.1.18
- **Language**: TypeScript

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

The app will be available at `http://localhost:4321`

## Build

```bash
npm run build
```

## Preview Production Build

```bash
npm run preview
```

## Backend Connection

The frontend connects to the backend API at `http://localhost:8000`. Make sure the backend server is running before using the app.

Backend endpoints:
- `POST /fetcher` - Send queries to the AI agent
- `POST /organizer` - Upload and organize files
- `GET /download/{filename}` - Download processed files
