
from mcp import  StdioServerParameters
from agno.agent import Agent
from agno.models.groq import Groq
from agno.tools.mcp import MCPTools
from dotenv import load_dotenv
import os
load_dotenv()
server_params = StdioServerParameters(
    command="uv",
    args=["run","mcp_server/mcp_drive.py"],
)

async def main(query: str):
    async with MCPTools(server_params=server_params,timeout_seconds=30.0) as mcp_tools:
            print(mcp_tools)
            agent = Agent(
                model=Groq(
                    id="openai/gpt-oss-120b",
                    api_key=os.getenv("GROQ_API"),
                ),
                tools=[mcp_tools],
                markdown=True,
                instructions="""
                            You are an AI assistant that helps users automate tasks using Google Drive and Gmail.

                            You have access to the following tools:

                            1. file_download: Download files from Google Drive by providing the file name.
                            2. send_email_google: Send files via Gmail by providing the filename and receiver's email address.

                            Use these tools to assist users with their requests related to file management and email sending.

                            When a user requests a task, determine if it requires downloading a file or sending an email, and use the appropriate tool accordingly.
            """
            )
            res = await agent.arun(query)
            return res
