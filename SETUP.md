# Email AI - Setup Guide

## Quick Start

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies (using uv):
```bash
uv sync
```

3. Set up Google Drive credentials:
   - Place your `credentials.json` in `backend/mcp_server/mcp_server_helper/`
   - Run the token creation script to authenticate

4. Start the backend server:
```bash
python server.py
```

The backend will run on `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:4321`

## Features

### Frontend Features
- ✨ **Checkered Background**: Dynamic canvas-based checkered pattern
- 🎨 **Color-Changing Title**: Title color changes based on mouse position
- 💬 **Real-time Chat**: Interactive chat interface with AI
- 📎 **File Upload**: Upload files for organization
- 📥 **Auto Downloads**: Automatic file downloads to browser

### Backend Features
- 🤖 **AI Agent**: Powered by Groq LLM
- 📁 **Google Drive Integration**: Fetch and organize files
- 📄 **PDF Processing**: Extract and process PDF content
- 🔐 **OAuth Authentication**: Secure Google Drive access

## Tech Stack

### Backend
- **Language**: Python 3.12+
- **Framework**: FastAPI
- **AI**: Agno + Groq
- **Google APIs**: google-api-python-client, google-auth
- **PDF**: PyPDF2
- **Server**: Uvicorn

### Frontend
- **Framework**: Astro 5.16.8
- **UI Library**: React 18
- **Styling**: Tailwind CSS 4.1.18
- **Language**: TypeScript

## API Endpoints

### POST /fetcher
Send queries to the AI agent
```json
{
  "query": "Download my latest document"
}
```

### POST /organizer
Upload files for organization
```
Content-Type: multipart/form-data
file: <file>
```

### GET /download/{filename}
Download processed files

## Development Tips

1. Make sure both backend and frontend servers are running
2. Backend must be on port 8000 for frontend to connect
3. Move your mouse around to see the title color change!
4. The checkered background is rendered on a canvas element

## Troubleshooting

- **CORS errors**: Backend has CORS enabled for all origins
- **File upload fails**: Check backend upload directory permissions
- **Google Drive auth**: Ensure credentials.json is properly configured
- **Port conflicts**: Change ports in respective config files if needed
