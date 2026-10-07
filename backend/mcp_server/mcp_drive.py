from mcp.server.fastmcp import FastMCP
import os
import io
import shutil
from mimetypes import MimeTypes
from googleapiclient.http import MediaIoBaseDownload, MediaFileUpload
from googleapiclient.discovery import Resource
from googleapiclient.discovery import build
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
import base64
import json
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
import os

# Get the base directory (backend folder)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_CREDENTIALS_PATH = os.path.join(BASE_DIR, "mcp_server/mcp_server_helper/credentials.json")
DEFAULT_TOKEN_PATH = os.path.join(BASE_DIR, "mcp_server/mcp_server_helper/token.json")
DOWNLOAD_DIR = os.path.join(BASE_DIR, "download")

SCOPES = [
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/drive"
]
mcp = FastMCP("Drive")


def get_credentials(credentials_path: str = DEFAULT_CREDENTIALS_PATH,
                   token_path: str = DEFAULT_TOKEN_PATH) -> Credentials:
    creds = None
    print(f"Looking for token at: {token_path}")
    print(f"Looking for credentials at: {credentials_path}")
    
    if os.path.exists(token_path):
        print(f"Token file found at {token_path}")
        with open(token_path, "r") as token_file:
            token_data = json.load(token_file)
            creds = Credentials.from_authorized_user_info(token_data, SCOPES)
    else:
        print(f"Token file NOT found at {token_path}")
    
    if not creds or not creds.valid:
        print(f"Credentials invalid or missing. Valid: {creds.valid if creds else 'None'}")
        if creds and creds.expired and creds.refresh_token:
            print("Refreshing expired token...")
            creds.refresh(Request())
            # Save refreshed token
            token_json = json.loads(creds.to_json())
            with open(token_path, "w") as token_file:
                json.dump(token_json, token_file)
            print("Token refreshed and saved!")
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
    else:
        print("Credentials are valid!")

    return creds

def get_file_id_by_name(file_name: str) -> str:
    service = build("drive", "v3", credentials=get_credentials())

    query = f"name='{file_name}' and trashed=false"
    results = service.files().list(
        q=query,
        fields="files(id, name)",
        pageSize=1
    ).execute()

    files = results.get("files", [])
    if not files:
        raise FileNotFoundError(f"No file found with name: {file_name}")

    return files[0]["id"]

@mcp.tool()
def file_download(file_name: str) -> str:
    """Download file from Google Drive by file name."""
    try:
        print(f"Attempting to download file: {file_name}")
        service = build("drive", "v3", credentials=get_credentials())
        print("Service built successfully")

        # ✅ get correct file id
        file_id = get_file_id_by_name(file_name)
        print("File ID:", file_id)

        request = service.files().get_media(fileId=file_id)
        fh = io.BytesIO()
        downloader = MediaIoBaseDownload(fh, request)

        done = False
        while not done:
            status, done = downloader.next_chunk()
            if status:
                print(f"Download Progress: {int(status.progress() * 100)}%")

        fh.seek(0)
        os.makedirs(DOWNLOAD_DIR, exist_ok=True)

        with open(os.path.join(DOWNLOAD_DIR, file_name), "wb") as f:
            shutil.copyfileobj(fh, f)

        print(f"File saved to: {os.path.join(DOWNLOAD_DIR, file_name)}")
        return "File downloaded successfully ✅"

    except Exception as e:
        import traceback
        print(f"Full error traceback:")
        traceback.print_exc()
        return f"Error downloading file: {e}"

@mcp.tool()
def send_email_google(filename: str, receiver_email: str) -> str:

    """
    Send file through Gmail
    Args:
        filename: Name of the file to be sent
        receiver_email: Email address of the receiver
    """

    file_path = os.path.join(DOWNLOAD_DIR, filename)

    if not os.path.exists(file_path):
        return "Error: File not found."

    creds = get_credentials()
    service = build("gmail", "v1", credentials=creds)

    sender = "me" 
    receiver = receiver_email

    msg = MIMEMultipart()
    msg["To"] = receiver
    msg["From"] = sender
    msg["Subject"] = "File Transfer Through Drive AI"

    body = "The file was sent using Google OAuth via Drive AI."
    msg.attach(MIMEText(body, "plain"))

    with open(file_path, "rb") as f:
        part = MIMEBase("application", "octet-stream")
        part.set_payload(f.read())

    encoders.encode_base64(part)
    part.add_header(
        "Content-Disposition",
        f'attachment; filename="{os.path.basename(file_path)}"'
    )
    msg.attach(part)

    raw_message = base64.urlsafe_b64encode(msg.as_bytes()).decode()

    try:
        service.users().messages().send(
            userId="me",
            body={"raw": raw_message}
        ).execute()

        return "Email sent successfully via Gmail API ✅"

    except Exception as e:
        return f"Error sending email: {e}"

    
if __name__ == "__main__":
    mcp.run(transport="stdio")