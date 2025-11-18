# MCP RAG Server Setup Guide

This guide will help you set up the BallroomCompManager RAG (Retrieval-Augmented Generation) MCP (Model Context Protocol) server on your machine.

## Prerequisites

- **Python 3.8+** (recommended: Python 3.10 or higher)
- **pip** (Python package manager)
- **Git** (to clone the repository)

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd BallroomCompManager
```

### 2. Set Up Python Virtual Environment

It's recommended to use a virtual environment to avoid dependency conflicts:

```bash
cd rag
python3 -m venv .venv
source .venv/bin/activate  # On macOS/Linux
# or
.venv\Scripts\activate     # On Windows
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

This will install:
- **chromadb** - Vector database for semantic search
- **sentence-transformers** - For embedding generation
- **mcp** - Model Context Protocol SDK

**Note:** First-time installation may take several minutes as it downloads machine learning models.

### 4. Index the Project (First Time Only)

Before running the MCP server, you need to build the initial search index:

```bash
# Make sure you're in the rag directory with venv activated
cd tools
python rag_service.py
```

You'll see output like:
```
Indexing files from: /path/to/BallroomCompManager/design
Indexing files from: /path/to/BallroomCompManager/shared
...
Indexed X documents with Y chunks
```

Once indexing completes, you can exit the interactive CLI (press Ctrl+C or type `exit`).

### 5. Test the MCP Server

Run the server directly to verify it works:

```bash
# From the rag directory
python run_mcp_server.py
```

The server communicates via stdio (standard input/output), so you won't see any visible output unless you send it MCP protocol messages. If no errors appear, it's working correctly. Press Ctrl+C to stop.

## Configuring Your MCP Client

### For Warp (warp.dev)

Add the following to your Warp MCP configuration file:

**Location:** `~/.warp/mcp_config.json` (or wherever Warp stores MCP configs)

```json
{
  "mcpServers": {
    "ballroom-rag": {
      "command": "python",
      "args": ["/absolute/path/to/BallroomCompManager/rag/run_mcp_server.py"],
      "env": {}
    }
  }
}
```

**Important:** Replace `/absolute/path/to/BallroomCompManager` with the actual absolute path on your machine.

To find your absolute path:
```bash
cd BallroomCompManager/rag
pwd
```

### For Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):

```json
{
  "mcpServers": {
    "ballroom-rag": {
      "command": "python",
      "args": ["/absolute/path/to/BallroomCompManager/rag/run_mcp_server.py"],
      "env": {}
    }
  }
}
```

### For Other MCP Clients

Follow your client's documentation for adding MCP servers. The server uses **stdio transport** and requires:
- **Command:** `python` (or `python3` depending on your system)
- **Args:** `["/absolute/path/to/BallroomCompManager/rag/run_mcp_server.py"]`

## Verifying the Setup

Once configured in your MCP client, you should have access to three tools:

1. **`rag_query`** - Search the codebase semantically
2. **`rag_ingest`** - Re-index files (if code changes)
3. **`rag_list`** - List all indexed documents

Test by asking your AI assistant: "Query the RAG system for authentication implementation" or use the tool directly.

## Troubleshooting

### "No module named 'chromadb'" or similar import errors

**Solution:** Activate your virtual environment:
```bash
cd rag
source .venv/bin/activate  # macOS/Linux
# or
.venv\Scripts\activate     # Windows
```

### "Permission denied" when running server

**Solution:** Make the script executable:
```bash
chmod +x run_mcp_server.py
```

### MCP client can't find the server

**Solution:** Verify the absolute path in your MCP config is correct:
```bash
cd BallroomCompManager/rag
pwd  # Copy this exact path
```

Update your MCP config with the full path including `/run_mcp_server.py` at the end.

### Empty search results or outdated results

**Solution:** Re-index the project:
```bash
cd rag/tools
python rag_service.py
```

Or use the `rag_ingest` tool with `force_rebuild: true` from your MCP client.

### Server starts but doesn't respond

**Solution:** Check that you're using the correct Python version:
```bash
python --version  # Should be 3.8+
```

If multiple Python versions exist, use the full path in your MCP config:
```json
{
  "command": "/usr/bin/python3",
  "args": ["/absolute/path/to/run_mcp_server.py"]
}
```

## Maintenance

### Updating the Index

When code changes significantly, re-run the indexing:
```bash
cd rag/tools
python rag_service.py
```

Or use the `rag_ingest` MCP tool from your client.

### Checking Indexed Content

To see what's currently indexed:
```bash
cd rag/tools
ls -lh chroma_db/           # Check database size
cat chroma_indexed.json     # View indexed file metadata
```

## What Gets Indexed?

The RAG system indexes:
- **Design docs** (`rag/design/*.md`) - Architecture and planning documents
- **Database schemas** (`rag/schema/*.md`) - Database structure documentation
- **Shared types** (`shared/**/*.ts`) - TypeScript types and enums
- **Backend code** (`server/src/**/*.ts`) - Express/tRPC server code
- **Frontend code** (`client/src/**/*.tsx`, `client/src/**/*.ts`) - Next.js components and pages

## Support

If you encounter issues not covered here:
1. Check the main README in `rag/README.md` for more technical details
2. Ensure all dependencies are installed: `pip list | grep -E "chromadb|sentence-transformers|mcp"`
3. Try rebuilding the index with `force_rebuild: true`

## Quick Reference

```bash
# Activate virtual environment
cd BallroomCompManager/rag
source .venv/bin/activate

# Install/update dependencies
pip install -r requirements.txt

# Index the project
cd tools && python rag_service.py

# Run the MCP server (for testing)
cd .. && python run_mcp_server.py

# Deactivate virtual environment when done
deactivate
```
