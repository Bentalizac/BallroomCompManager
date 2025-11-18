# rag/tools/mcp_server/handlers.py
import os
from typing import Any, Dict, List

# Import functions / objects from your existing rag_service module.
# Adjust the import path if rag_service.py lives elsewhere.
# If rag_service is at rag/tools/rag_service.py this import should work
# because this handlers module is under rag/tools/mcp_server/.
from ..rag_service import collection, index_project, query_rag  # type: ignore


def handle_ingest(force_rebuild: bool = False) -> Dict[str, Any]:
    """
    Trigger indexing. If force_rebuild=True, attempt to clear the collection
    before indexing (removes all existing docs from Chroma collection).
    """
    try:
        if force_rebuild:
            try:
                # delete all docs (collection.delete accepts ids or where clauses)
                # We'll call delete with no args if supported; otherwise delete by scanning
                existing = collection.get()
                ids = existing.get("ids", [])
                if ids:
                    collection.delete(ids=ids)
            except Exception as e:
                return {"ok": False, "error": f"Failed to clear collection: {str(e)}"}

        # Run the ingestion routine from rag_service
        index_project()
        # Return simple status
        return {"ok": True, "message": "Indexing completed successfully"}
    except Exception as e:
        return {"ok": False, "error": f"Indexing failed: {str(e)}"}


def handle_query(query: str, top_k: int = 5, type_filter: str = None) -> Dict[str, Any]:
    """
    Run a RAG query and return the results.
    """
    docs = query_rag(query, top_k=top_k, type_filter=type_filter)
    return {
        "ok": True,
        "query": query,
        "top_k": top_k,
        "type_filter": type_filter,
        "chunks": docs,
    }


def handle_list() -> Dict[str, Any]:
    """
    Return a list of document ids and metadata from the collection.
    """
    try:
        # ChromaDB always returns ids; explicitly request metadatas
        data = collection.get()
        ids = data.get("ids", [])
        metadatas = data.get("metadatas", [])
        # Return small summary
        summary = []
        for idx, meta in zip(ids, metadatas):
            summary.append({"id": idx, "meta": meta})
        return {"ok": True, "count": len(ids), "documents": summary}
    except Exception as e:
        return {"ok": False, "error": str(e)}
