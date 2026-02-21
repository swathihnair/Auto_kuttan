from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import os
import shutil
import re
from mcp_server.organizer import main as organizer_main
from mcp_server.agent import main as agent_main

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "user_upload"
DOWNLOAD_DIR = "download"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

class FetcherRequest(BaseModel):
    query: str

@app.post("/organizer")
async def organizer(file: UploadFile = File(...)):
    try:
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        result = await organizer_main(file_path)
        return result
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/fetcher")
async def fetcher(request: FetcherRequest):
    result = await agent_main(request.query)
    response_text = result.content
    
    print(f"AI Response: {response_text}")  # Debug log
    
    # Check if a file was downloaded (look for success indicators)
    download_keywords = ["downloaded successfully", "download complete", "file downloaded", "✅"]
    is_download = any(keyword in response_text.lower() or keyword in response_text for keyword in download_keywords)
    
    print(f"Is download: {is_download}")  # Debug log
    
    if is_download:
        # Try to find the filename from the download folder
        if os.path.exists(DOWNLOAD_DIR):
            files = os.listdir(DOWNLOAD_DIR)
            print(f"Files in download folder: {files}")  # Debug log
            if files:
                # Get the most recently modified file
                latest_file = max(files, key=lambda f: os.path.getmtime(os.path.join(DOWNLOAD_DIR, f)))
                print(f"Latest file: {latest_file}")  # Debug log
                return {
                    "result": response_text,
                    "download_available": True,
                    "filename": latest_file
                }
    
    return {"result": response_text}

@app.get("/download/{filename}")
async def download_file(filename: str):
    file_path = os.path.join(DOWNLOAD_DIR, filename)
    if os.path.exists(file_path):
        return FileResponse(
            path=file_path,
            filename=filename,
            media_type="application/octet-stream"
        )
    return {"error": "File not found"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
