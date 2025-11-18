#!/usr/bin/env python3
# rag/tools/mcp_server/server.py
import asyncio
import logging
from typing import Any, Optional

from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent

# Import handlers
from .handlers import handle_ingest, handle_list, handle_query

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create MCP server
app = Server("ballroom-rag-server")


@app.list_tools()
async def list_tools() -> list[Tool]:
    """List available RAG tools."""
    return [
        Tool(
            name="rag_query",
            description="Query the RAG system to retrieve relevant code and documentation chunks from the BallroomCompManager project. Returns top-k most relevant chunks based on semantic similarity.",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "The search query to find relevant project context",
                    },
                    "top_k": {
                        "type": "integer",
                        "description": "Number of chunks to return (default: 5)",
                        "default": 5,
                    },
                    "type_filter": {
                        "type": "string",
                        "description": "Optional filter by type: design, schema, domain, frontend, backend, architecture",
                        "enum": ["design", "schema", "domain", "frontend", "backend", "architecture"],
                    },
                },
                "required": ["query"],
            },
        ),
        Tool(
            name="rag_ingest",
            description="Index or re-index the project files into the RAG system. Use force_rebuild to clear existing index and rebuild from scratch.",
            inputSchema={
                "type": "object",
                "properties": {
                    "force_rebuild": {
                        "type": "boolean",
                        "description": "If true, clear existing index and rebuild from scratch (default: false)",
                        "default": False,
                    },
                },
            },
        ),
        Tool(
            name="rag_list",
            description="List all indexed documents in the RAG system with their metadata. Useful for understanding what content is currently indexed.",
            inputSchema={
                "type": "object",
                "properties": {},
            },
        ),
    ]


@app.call_tool()
async def call_tool(name: str, arguments: Any) -> list[TextContent]:
    """Handle tool calls."""
    try:
        if name == "rag_query":
            query = arguments.get("query")
            if not query:
                return [TextContent(type="text", text="Error: 'query' parameter is required")]
            
            top_k = int(arguments.get("top_k", 5))
            type_filter = arguments.get("type_filter")
            
            result = handle_query(query, top_k=top_k, type_filter=type_filter)
            
            # Format the response
            if result.get("ok") and result.get("chunks"):
                chunks = result["chunks"]
                response = f"Found {len(chunks)} relevant chunks:\n\n"
                for i, chunk in enumerate(chunks, 1):
                    response += f"--- Chunk {i} ---\n{chunk}\n\n"
                return [TextContent(type="text", text=response)]
            else:
                return [TextContent(type="text", text="No relevant chunks found.")]
        
        elif name == "rag_ingest":
            force_rebuild = arguments.get("force_rebuild", False)
            result = handle_ingest(force_rebuild=force_rebuild)
            
            if result.get("ok"):
                return [TextContent(type="text", text=result.get("message", "Indexing completed"))]
            else:
                return [TextContent(type="text", text=f"Error: {result.get('error', 'Unknown error')}")]
        
        elif name == "rag_list":
            result = handle_list()
            
            if result.get("ok"):
                count = result.get("count", 0)
                docs = result.get("documents", [])
                response = f"Total indexed documents: {count}\n\n"
                
                # Group by source file
                by_source = {}
                for doc in docs:
                    source = doc.get("meta", {}).get("source", "unknown")
                    if source not in by_source:
                        by_source[source] = 0
                    by_source[source] += 1
                
                response += "Documents by source:\n"
                for source, chunk_count in sorted(by_source.items()):
                    response += f"  {source}: {chunk_count} chunks\n"
                
                return [TextContent(type="text", text=response)]
            else:
                return [TextContent(type="text", text=f"Error: {result.get('error', 'Unknown error')}")]
        
        else:
            return [TextContent(type="text", text=f"Unknown tool: {name}")]
    
    except Exception as e:
        logger.error(f"Error calling tool {name}: {e}", exc_info=True)
        return [TextContent(type="text", text=f"Error: {str(e)}")]


async def main():
    """Run the MCP server using stdio transport."""
    async with stdio_server() as (read_stream, write_stream):
        await app.run(
            read_stream,
            write_stream,
            app.create_initialization_options()
        )


if __name__ == "__main__":
    asyncio.run(main())
