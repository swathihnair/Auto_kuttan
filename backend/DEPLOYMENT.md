# Backend Deployment Guide

## 🚀 Deploy to Render (Recommended)

### Step 1: Prepare Your Repository
```bash
git add .
git commit -m "feat: add backend deployment config"
git push
```

### Step 2: Deploy on Render
1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name:** auto-kuttan-backend
   - **Root Directory:** `backend`
   - **Environment:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn server:app --host 0.0.0.0 --port $PORT`

### Step 3: Add Environment Variables
In Render dashboard, add:
- `GROQ_API` = your Groq API key
- `PYTHON_VERSION` = 3.12.0

### Step 4: Handle Google OAuth Credentials
⚠️ **Important:** You cannot use OAuth flow on serverless platforms!

**Solution Options:**

**Option A: Use Service Account (Recommended for production)**
1. Create a Service Account in Google Cloud Console
2. Download service account JSON
3. Add as environment variable: `GOOGLE_APPLICATION_CREDENTIALS`
4. Update code to use service account instead of OAuth

**Option B: Pre-generate tokens locally**
1. Run locally: `python mcp_server/mcp_server_helper/create_token.py`
2. Copy the generated `token.json` content
3. Add as environment variable in Render
4. Update code to read from environment variable

**Option C: Deploy on VM (Railway/DigitalOcean)**
- Use a VM where you can run OAuth flow once
- Keep the server running with persistent storage

---

## 🚂 Deploy to Railway

### Step 1: Install Railway CLI
```bash
npm install -g @railway/cli
```

### Step 2: Login and Deploy
```bash
cd backend
railway login
railway init
railway up
```

### Step 3: Add Environment Variables
```bash
railway variables set GROQ_API=your_api_key
```

---

## ⚡ Deploy to Vercel (Serverless)

### Step 1: Create vercel.json in backend folder
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.py"
    }
  ]
}
```

### Step 2: Deploy
```bash
cd backend
vercel --prod
```

⚠️ **Note:** Vercel has limitations with OAuth and file storage.

---

## 🔧 Update Frontend API URL

After deployment, update the frontend to use your backend URL:

In `frontend/src/components/ChatPage.tsx`:
```typescript
const BASE_URL = 'https://your-backend-url.onrender.com';
```

---

## 📝 Environment Variables Needed

- `GROQ_API` - Your Groq API key
- `GOOGLE_APPLICATION_CREDENTIALS` - Service account JSON (if using service account)
- `PORT` - Auto-set by platform

---

## ✅ Testing Deployment

After deployment, test these endpoints:
- `GET https://your-backend-url.onrender.com/` - Should return 404 (FastAPI default)
- `POST https://your-backend-url.onrender.com/fetcher` - Test with query
- `POST https://your-backend-url.onrender.com/organizer` - Test file upload

---

## 🐛 Common Issues

**Issue: OAuth not working**
- Solution: Use service account or pre-generated tokens

**Issue: File storage not persisting**
- Solution: Use cloud storage (S3, Google Cloud Storage) instead of local files

**Issue: Timeout errors**
- Solution: Increase timeout in platform settings or optimize agent response time

---

## 🔒 Security Checklist

- ✅ Never commit credentials.json or token.json
- ✅ Use environment variables for API keys
- ✅ Enable CORS only for your frontend domain
- ✅ Use HTTPS for all API calls
- ✅ Implement rate limiting
- ✅ Add authentication for production

---

## 📊 Monitoring

After deployment, monitor:
- Response times
- Error rates
- API usage
- Storage usage

Use platform-provided monitoring tools or integrate with services like:
- Sentry (error tracking)
- LogRocket (session replay)
- DataDog (monitoring)
