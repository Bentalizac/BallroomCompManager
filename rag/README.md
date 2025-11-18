# BallroomCompManager RAG MCP Server

This directory contains a Retrieval-Augmented Generation (RAG) system exposed as a Model Context Protocol (MCP) server for the BallroomCompManager project.

## Overview

The RAG system indexes project files (TypeScript, TSX, Markdown) and provides semantic search capabilities through an MCP server. This allows AI assistants and tools to query the codebase for relevant context.

## Architecture

- **`tools/rag_service.py`**: Core RAG functionality (indexing, chunking, querying)
- **`tools/rag_config.py`**: Configuration for paths, file types, and chunk sizes
- **`tools/mcp_server/server.py`**: MCP server implementation using stdio transport
- **`tools/mcp_server/handlers.py`**: Request handlers for RAG operations
- **`run_mcp_server.py`**: Entry point script to start the server

## Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Index the project (first time setup):
```bash
cd tools
python rag_service.py
# Exit the interactive CLI after indexing completes
```

## Running the MCP Server

The MCP server communicates via stdio (standard input/output) following the Model Context Protocol specification.

### Direct execution:
```bash
python rag/run_mcp_server.py
```

### Configure in your MCP client:

Add to your MCP client configuration (e.g., Warp, Claude Desktop, etc.):

```json
{
  "mcpServers": {
    "ballroom-rag": {
      "command": "python",
      "args": ["/Users/samuelellsworth/Documents/Sandbox/BallroomCompManager/rag/run_mcp_server.py"],
      "env": {}
    }
  }
}
```

## Available Tools

### `rag_query`
Query the RAG system to retrieve relevant code and documentation chunks.

**Parameters:**
- `query` (required): Search query text
- `top_k` (optional): Number of results to return (default: 5)
- `type_filter` (optional): Filter by type: `design`, `schema`, `domain`, `frontend`, `backend`, `architecture`

**Example:**
```json
{
  "query": "How does authentication work?",
  "top_k": 5,
  "type_filter": "backend"
}
```

### `rag_ingest`
Index or re-index project files into the RAG system.

**Parameters:**
- `force_rebuild` (optional): Clear existing index and rebuild from scratch (default: false)

**Example:**
```json
{
  "force_rebuild": true
}
```

### `rag_list`
List all indexed documents with their metadata.

**Parameters:** None

## Indexed Content

The RAG system indexes the following directories:
- `rag/design/` - Design documents (type: `design`)
- `rag/schema/` - Database schemas (type: `schema`)
- `rag/project-structure/` - Architecture docs (type: `architecture`)
- `shared/` - Shared TypeScript types (type: `domain`)
- `server/src/` - Backend code (type: `backend`)
- `client/src/` - Frontend code (type: `frontend`)

**File types:** `.ts`, `.tsx`, `.md`

## Persistent Storage

- **ChromaDB**: Stored in `tools/chroma_db/`
- **Index metadata**: Stored in `tools/chroma_indexed.json` (tracks file modification times for incremental updates)

## Automatic Reindexing

The RAG system automatically reindexes when you commit changes to relevant files (`.md`, `.ts`, `.tsx`).

### Git Pre-Commit Hook
A pre-commit hook is installed at `.git/hooks/pre-commit` that:
- Detects changes to documentation or TypeScript files
- Automatically reindexes the RAG before the commit completes
- Shows colored output indicating indexing progress
- Won't block commits if indexing fails (shows warning instead)

### Manual Reindexing
You can also manually reindex at any time:

```bash
# Quick reindex script
./rag/reindex.sh

# Or manually:
cd rag/tools
python rag_service.py
```

## Development

### Standalone RAG usage (without MCP):
```bash
cd tools
python rag_service.py
```

This provides an interactive CLI for testing queries directly.

### Adding new directories to index:

Edit `tools/rag_config.py`:
```python
RAG_DIRS = [
    # ... existing dirs
    os.path.join(PROJECT_ROOT, "new/directory"),
]

DIR_TYPE_MAP = {
    # ... existing mappings
    "new/directory": "custom_type",
}
```

## Troubleshooting

### Import errors
Ensure you're running from the project root and the Python path is set correctly.

### Empty query results
Run `rag_ingest` with `force_rebuild: true` to re-index all files.

### Performance issues
Adjust `MAX_CHUNK_SIZE` in `rag_config.py` to balance between chunk granularity and query performance.
