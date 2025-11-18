#!/usr/bin/env python3
"""
Entry point for the BallroomCompManager RAG MCP Server.
Run this script to start the MCP server using stdio transport.
"""

import asyncio
import os
import sys

# Add the project root to the path so imports work correctly
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, project_root)

from rag.tools.mcp_server.server import main

# Import and run the server

if __name__ == "__main__":
    asyncio.run(main())
