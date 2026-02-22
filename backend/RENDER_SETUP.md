# 🚀 Render Deployment Quick Guide

## Prerequisites
- Google Cloud Project with Gmail, Drive, and Calendar APIs enabled
- Groq API key
- GitHub repository pushed

## Step-by-Step Setup

### 1️⃣ Create Service Account
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to: **IAM & Admin** → **Service Accounts**
3. Click **Create Service Account**
4. Name: `auto-kuttan-backend`
5. Click **Create and Continue** → **Done**

### 2️⃣ Enable APIs
Go to **APIs & Services** → **Library** and enable:
- ✅ Gmail API
- ✅ Google Drive API  
- ✅ Google Calendar API

### 3️⃣ Create Service Account Key
1. Click on your service account
2. Go to **Keys** tab
3. Click **Add Key** → **Create new key**
4. Choose **JSON** → **Create**
5. Save the downloaded JSON file

### 4️⃣ Share Google Drive Access
1. Open the JSON file and copy the `client_email`
2. Go to [Google Drive](https://drive.google.com)
3. Share your folder with the service account email
4. Give **Editor** permissions

### 5️⃣ Deploy on Render
1. Go to [render.com](https://render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub repo
4. Configure:
   ```
   Name: auto-kuttan-backend
   Root Directory: backend
   Environment: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn server:app --host 0.0.0.0 --port $PORT
   ```

### 6️⃣ Add Environment Variables
In Render dashboard → **Environment** tab:

**GROQ_API**
```
your-groq-api-key-here
```

**GOOGLE_SERVICE_ACCOUNT_JSON**
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "auto-kuttan-backend@project-id.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```
⚠️ Copy the ENTIRE JSON content from the downloaded file

### 7️⃣ Deploy
1. Click **Manual Deploy** → **Deploy latest commit**
2. Wait 2-3 minutes for build
3. Copy your backend URL: `https://auto-kuttan-backend.onrender.com`

### 8️⃣ Update Frontend
In `frontend/src/components/ChatPage.tsx`:
```typescript
const BASE_URL = 'https://auto-kuttan-backend.onrender.com';
```

Then redeploy frontend on Vercel.

## ✅ Test Your Deployment

Test these endpoints:
```bash
# Health check
curl https://auto-kuttan-backend.onrender.com/

# Test fetcher
curl -X POST https://auto-kuttan-backend.onrender.com/fetcher \
  -H "Content-Type: application/json" \
  -d '{"query": "list files in my drive"}'

# Test organizer (with file upload)
curl -X POST https://auto-kuttan-backend.onrender.com/organizer \
  -F "file=@test.pdf"
```

## 🐛 Troubleshooting

**Build fails:**
- Check Python version in `runtime.txt`
- Verify all dependencies in `requirements.txt`

**Service account error:**
- Verify JSON is valid (use JSONLint)
- Check APIs are enabled
- Confirm Drive folder is shared with service account email

**Timeout errors:**
- Render free tier may sleep after inactivity
- First request after sleep takes longer

## 📝 Important Notes

- Free tier on Render sleeps after 15 minutes of inactivity
- First request after sleep takes ~30 seconds
- Upgrade to paid plan for always-on service
- Service account doesn't require OAuth browser flow
- Keep your service account JSON secure (never commit to git)

## 🔒 Security Checklist

- ✅ Service account JSON added as environment variable (not in code)
- ✅ credentials.json and token.json in .gitignore
- ✅ GROQ_API key as environment variable
- ✅ CORS configured for your frontend domain only (in production)
- ✅ Service account has minimal required permissions

## 🎉 You're Done!

Your backend is now deployed and ready to use!
