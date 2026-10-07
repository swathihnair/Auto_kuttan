
import os
import io
import json
import base64
import shutil
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from mimetypes import MimeTypes
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build, Resource
from googleapiclient.errors import HttpError
from googleapiclient.http import MediaIoBaseDownload, MediaFileUpload
from pydantic import BaseModel,Field
from mcp.server.fastmcp import FastMCP
from agno.agent import Agent
from agno.models.groq import Groq
from PyPDF2 import PdfReader
from dotenv import load_dotenv
load_dotenv()
DEFAULT_CREDENTIALS_PATH = "mcp_server/mcp_server_helper/credentials.json"
DEFAULT_TOKEN_PATH = "mcp_server/mcp_server_helper/token.json"

SCOPES = [
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/drive"
]

class FolderSelecter(BaseModel):
    folder_name: str = Field(description="Name of the folder to select")
    folder_id: str = Field(description="ID of the folder to select")
def extract_pdf_text(pdf_path: str) -> str:
    reader = PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""
    return text.strip()

def folder_selector_ai(
    pdf_path: str,
    folders: list[dict]
) -> FolderSelecter:
    pdf_text = extract_pdf_text(pdf_path)

    # Get API key from environment
    groq_api_key = os.getenv("GROQ_API_KEY") or os.getenv("GROQ_API")
    print(f"DEBUG: GROQ_API_KEY from env: {'SET' if os.getenv('GROQ_API_KEY') else 'NOT SET'}")
    print(f"DEBUG: GROQ_API from env: {'SET' if os.getenv('GROQ_API') else 'NOT SET'}")
    print(f"DEBUG: Final API key: {'SET' if groq_api_key else 'NOT SET'}")
    
    if not groq_api_key:
        raise ValueError("GROQ_API_KEY not set. Please set the GROQ_API_KEY environment variable.")

    agent = Agent(
        model=Groq(
            id="openai/gpt-oss-120b",
            api_key=groq_api_key,
        ),
        markdown=False,
        output_schema=FolderSelecter,   
        instructions="""
                    You are an AI assistant that selects the most appropriate Google Drive folder
                    based on the content of a PDF.

                    Rules:
                    - Analyze the PDF text
                    - Compare it with folder names
                    - Choose the BEST matching folder
                    - Respond ONLY using the given JSON schema
                    """
            )

    prompt = f"""
                PDF CONTENT:
                ----------------
                {pdf_text[:4000]}

                AVAILABLE FOLDERS:
                ------------------
                {json.dumps(folders, indent=2)}

                Select the best folder.
                """

    result = agent.run(prompt)
    
    # Check if result.content is a FolderSelecter object or needs to be parsed
    if isinstance(result.content, FolderSelecter):
        return result.content
    elif isinstance(result.content, dict):
        return FolderSelecter(**result.content)
    else:
        # If AI didn't return proper format, use first folder as fallback
        print(f"Warning: AI returned unexpected format: {result.content}")
        if folders and len(folders) > 0:
            return FolderSelecter(folder_name=folders[0]['name'], folder_id=folders[0]['id'])
        raise ValueError("No folders available and AI response invalid")

def get_credentials(credentials_path: str = DEFAULT_CREDENTIALS_PATH,
                   token_path: str = DEFAULT_TOKEN_PATH) -> Credentials:
    creds = None
    
    # First, try to get token from environment variable (for production)
    token_json_env = os.getenv("GOOGLE_TOKEN_JSON")
    if token_json_env:
        print("Using token from environment variable")
        try:
            token_data = json.loads(token_json_env)
            creds = Credentials.from_authorized_user_info(token_data, SCOPES)
        except json.JSONDecodeError as e:
            print(f"Failed to parse token from environment: {e}")
    
    # If not in environment, try local file
    if not creds and os.path.exists(token_path):
        with open(token_path, "r") as token_file:
            token_data = json.load(token_file)
            creds = Credentials.from_authorized_user_info(token_data, SCOPES)
    
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
            # Save refreshed token
            token_json = json.loads(creds.to_json())
            with open(token_path, "w") as token_file:
                json.dump(token_json, token_file)
        else:
            if not os.path.exists(credentials_path):
                raise FileNotFoundError(
                    f"Credentials file not found at {credentials_path}. "
                    "Please download your OAuth credentials from Google Cloud Console."
                )

            flow = InstalledAppFlow.from_client_secrets_file(credentials_path, SCOPES)
            creds = flow.run_local_server(port=0)
            token_json = json.loads(creds.to_json())
            with open(token_path, "w") as token_file:
                json.dump(token_json, token_file)

    return creds
def file_listing():
    """List all files in Google Drive (limited to 5 files)."""
    try:
        service=build('drive', 'v3', credentials=get_credentials())

        result = service.files().list(
            q="mimeType='application/vnd.google-apps.folder' and trashed=false",
            pageSize=5,
            fields="files(id, name)"
        ).execute()

        folder_list = result.get('files', [])
        print(folder_list)
        return folder_list
    except Exception as e:
        print(f"Error listing folders: {e}")
        return f"Error: {e}"
def file_upload(filepath: str, folder_id: str=None) -> str:
    try:
        service = build('drive', 'v3', credentials=get_credentials())

        if not os.path.exists(filepath):
            print("File does not exist.")
            return "Error: File not found."

        name = os.path.basename(filepath)
        mimetype = MimeTypes().guess_type(name)[0] or 'application/octet-stream'

        file_metadata = {
            'name': name,
            'parents': [folder_id]  
        }

        media = MediaFileUpload(filepath, mimetype=mimetype)

        file = service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id, name, parents'
        ).execute()

        print(f"File Uploaded: {file.get('id')} to folder {folder_id}")
        return f"File uploaded successfully. ID: {file.get('id')}"

    except Exception as e:
        print(f"Error during file upload: {e}")
        return f"Error: {e}"


async def main(pdf_path: str):
    file_listing()
    res=folder_selector_ai(
        pdf_path=pdf_path,
        folders=file_listing()
    )
    file_upload(
        filepath=pdf_path,
        folder_id=res.folder_id
    )
    return {"status":"completed"}