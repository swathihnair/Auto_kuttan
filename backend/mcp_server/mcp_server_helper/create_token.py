#!/usr/bin/env python3
"""
Token Creation Script for Google APIs (Gmail & Calendar)

This script handles the OAuth 2.0 authentication flow to create or refresh
the token.json file required for Google API access.

Required files:
- credentials.json: OAuth 2.0 credentials from Google Cloud Console

Scopes used:
- Gmail: Send emails
- Calendar: Create events and Meet links

Usage:
    python create_token.py
"""

import os
import json
import sys
from typing import List

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow

# Configuration
CREDENTIALS_FILE = "credentials.json"
TOKEN_FILE = "token.json"


SCOPES: List[str] = [
    "https://www.googleapis.com/auth/gmail.send",           
    "https://www.googleapis.com/auth/calendar.events",     
    "https://www.googleapis.com/auth/calendar",            
    "https://www.googleapis.com/auth/calendar.readonly",
    "https://www.googleapis.com/auth/drive"
]


def create_token(credentials_path: str = CREDENTIALS_FILE,
                token_path: str = TOKEN_FILE,
                scopes: List[str] = SCOPES) -> bool:
    """
    Create or refresh the OAuth token for Google APIs.

    Args:
        credentials_path: Path to the credentials.json file
        token_path: Path where token.json will be saved
        scopes: List of OAuth scopes to request

    Returns:
        True if successful, False otherwise
    """
    creds = None

    print("🔐 Starting Google API Authentication")
    print("=" * 50)

    if not os.path.exists(credentials_path):
        print(f"❌ Error: {credentials_path} not found!")
        print("\n📋 To get credentials.json:")
        print("1. Go to Google Cloud Console: https://console.cloud.google.com/")
        print("2. Create a new project or select existing one")
        print("3. Enable Gmail API and Google Calendar API")
        print("4. Go to 'Credentials' → 'Create Credentials' → 'OAuth 2.0 Client IDs'")
        print("5. Choose 'Desktop application' as application type")
        print("6. Download the JSON file and save it as 'credentials.json'")
        return False

    print(f"✅ Found credentials file: {credentials_path}")

    if os.path.exists(token_path):
        print(f"📁 Found existing token file: {token_path}")
        try:
            with open(token_path, "r") as token_file:
                token_data = json.load(token_file)
                creds = Credentials.from_authorized_user_info(token_data)

            print("🔄 Checking if token needs refresh...")

            if creds and creds.expired and creds.refresh_token:
                print("⏳ Token expired, attempting refresh...")
                creds.refresh(Request())
                print("✅ Token refreshed successfully!")
            elif creds and creds.valid:
                print("✅ Token is still valid!")
                return True
            else:
                print("⚠️  Token needs re-authentication")

        except (json.JSONDecodeError, KeyError) as e:
            print(f"⚠️  Invalid token file: {e}")
            creds = None
            
    if not creds or not creds.valid:
        print("🌐 Starting OAuth authentication flow...")
        print("📱 A browser window will open for authentication.")
        print("📝 Please complete the authorization process.")
        print("\n⚠️  Important: Make sure to allow all requested permissions")
        print("   for Gmail and Google Calendar access.\n")

        try:
            flow = InstalledAppFlow.from_client_secrets_file(credentials_path, scopes)
            creds = flow.run_local_server(port=0)
            print("✅ Authentication completed successfully!")

        except Exception as e:
            print(f"❌ Authentication failed: {e}")
            return False

    # Step 4: Save the credentials
    try:
        token_data = json.loads(creds.to_json())
        with open(token_path, "w") as token_file:
            json.dump(token_data, token_file, indent=2)

        print(f"💾 Token saved to: {token_path}")
        print("✅ Authentication setup complete!")

        # Display token info
        print("\n📊 Token Information:")
        print(f"   • Client ID: {creds.client_id[:20]}...")
        print(f"   • Scopes: {len(scopes)} permissions granted")
        print(f"   • Expires: {creds.expiry.strftime('%Y-%m-%d %H:%M:%S') if creds.expiry else 'N/A'}")

        return True

    except Exception as e:
        print(f"❌ Failed to save token: {e}")
        return False


def verify_token(token_path: str = TOKEN_FILE) -> bool:
    """
    Verify that the token file is valid and contains required scopes.

    Args:
        token_path: Path to the token.json file

    Returns:
        True if token is valid, False otherwise
    """
    if not os.path.exists(token_path):
        print(f"❌ Token file not found: {token_path}")
        return False

    try:
        with open(token_path, "r") as token_file:
            token_data = json.load(token_file)

        creds = Credentials.from_authorized_user_info(token_data)

        if not creds.valid:
            print("❌ Token is not valid")
            return False

        # Check if all required scopes are present
        token_scopes = set(creds.scopes or [])
        required_scopes = set(SCOPES)

        missing_scopes = required_scopes - token_scopes
        if missing_scopes:
            print(f"⚠️  Missing scopes: {missing_scopes}")
            return False

        print("✅ Token is valid and has all required scopes")
        return True

    except Exception as e:
        print(f"❌ Token verification failed: {e}")
        return False


def main():
    """Main function to run the token creation process."""
    print("🚀 Google API Token Creator")
    print("Project: Email-Calendar Integration")
    print("=" * 50)

    # Check current directory
    print(f"📂 Working directory: {os.getcwd()}")

    # Attempt to create/update token
    success = create_token()

    if success:
        print("\n🎉 Setup Complete!")
        print("You can now use the Google APIs in your application.")
        print("\n📝 Available APIs:")
        print("   • Gmail API (send emails)")
        print("   • Calendar API (create events & Meet links)")

        # Verify the token
        print("\n🔍 Verifying token...")
        verify_token()

    else:
        print("\n❌ Setup Failed!")
        print("Please check the error messages above and try again.")
        sys.exit(1)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Process interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
        sys.exit(1)