import json
import os

import chromadb
from sentence_transformers import SentenceTransformer

from rag.tools.rag_config import (
    DB_FOLDER,
    DIR_TYPE_MAP,
    FILE_TYPES,
    MAX_CHUNK_SIZE,
    PROJECT_ROOT,
    RAG_DIRS,
)

# -----------------------------
# PERSISTENT METADATA
# -----------------------------
META_FILE = os.path.join(PROJECT_ROOT, "rag/tools/chroma_indexed.json")
if os.path.exists(META_FILE):
    indexed_files = json.load(open(META_FILE, "r"))
else:
    indexed_files = {}

# -----------------------------
# EMBEDDING MODEL
# -----------------------------
model = SentenceTransformer("all-MiniLM-L6-v2")


def embed_texts(texts):
    return [e.tolist() for e in model.encode(texts, show_progress_bar=False)]


# -----------------------------
# CHROMA CLIENT
# -----------------------------
client = chromadb.PersistentClient(path=DB_FOLDER)
collection = client.get_or_create_collection("monorepo_rag")

# -----------------------------
# FILTERING
# -----------------------------
SKIP_FILE_PATTERNS = [".d.ts", "node_modules", "dist", ".git"]
BOILERPLATE_KEYWORDS = [
    "ProjectLoadingStartEvent",
    "ProjectLoadingFinishEvent",
    "CompilerOptionsDiagnosticsRequest",
    "ProjectLanguageServiceStateEvent",
    "NavtoRequest",
    "FileSpan",
    "EventBody",
]


def should_skip_file(path):
    return any(pat in path for pat in SKIP_FILE_PATTERNS)


def should_skip_chunk(chunk):
    lines = chunk.splitlines()
    non_empty = [
        l.strip() for l in lines if l.strip() and not l.strip().startswith("//")
    ]
    if len(non_empty) < 2:
        return True
    if any(k in chunk for k in BOILERPLATE_KEYWORDS):
        return True
    return False


# -----------------------------
# FILE READING & CHUNKING
# -----------------------------
def read_files(base_dirs, file_types):
    files_content = []
    for base_dir in base_dirs:
        for root, _, files in os.walk(base_dir):
            for f in files:
                if any(f.endswith(ext) for ext in file_types):
                    path = os.path.join(root, f)
                    with open(path, "r", encoding="utf-8") as file:
                        content = file.read()
                    files_content.append((path, content))
    return files_content


def chunk_text(text, max_size=MAX_CHUNK_SIZE):
    lines = text.splitlines()
    chunks = []
    current_chunk = []
    current_len = 0
    for line in lines:
        current_len += len(line)
        current_chunk.append(line)
        if current_len >= max_size:
            chunks.append("\n".join(current_chunk))
            current_chunk = []
            current_len = 0
    if current_chunk:
        chunks.append("\n".join(current_chunk))
    return chunks


# -----------------------------
# INDEXING FUNCTION
# -----------------------------
def index_project():
    files = read_files(RAG_DIRS, FILE_TYPES)
    total_chunks = 0
    for path, content in files:
        if should_skip_file(path):
            continue
        mtime = os.path.getmtime(path)
        if path in indexed_files and indexed_files[path] == mtime:
            continue  # skip unchanged
        chunks = [c for c in chunk_text(content) if not should_skip_chunk(c)]
        if not chunks:
            continue
        embeddings = embed_texts(chunks)
        chunk_type = "unknown"
        for dir_key, type_name in DIR_TYPE_MAP.items():
            folder_path = os.path.join(PROJECT_ROOT, dir_key)
            if path.startswith(folder_path):
                chunk_type = type_name
                break
        for i, chunk in enumerate(chunks):
            collection.add(
                documents=[chunk],
                metadatas=[
                    {
                        "source": os.path.relpath(path, PROJECT_ROOT),
                        "chunk_index": i,
                        "type": chunk_type,
                    }
                ],
                ids=[f"{path}-{i}"],
                embeddings=[embeddings[i]],
            )
        indexed_files[path] = mtime
        total_chunks += len(chunks)
    # Save metadata
    with open(META_FILE, "w") as f:
        json.dump(indexed_files, f)
    print(f"Indexing complete. Added {total_chunks} chunks.")


# -----------------------------
# QUERY FUNCTION
# -----------------------------
def query_rag(query_text, top_k=5, type_filter=None):
    query_embedding = embed_texts([query_text])[0]
    results = collection.query(query_embeddings=[query_embedding], n_results=top_k)
    docs = results["documents"][0] if results["documents"] else []
    if type_filter:
        metadatas = results["metadatas"][0]
        filtered_docs = [
            doc for doc, meta in zip(docs, metadatas) if meta.get("type") == type_filter
        ]
        return filtered_docs
    return docs


# -----------------------------
# PROMPT HELPER FOR LLM
# -----------------------------
def build_prompt(user_request, top_k=5, type_filter=None):
    chunks = query_rag(user_request, top_k=top_k, type_filter=type_filter)
    if not chunks:
        return f"No project context found for request: {user_request}\n\n"
    context_text = "\n\n".join(chunks)
    prompt = f"""Project context (from RAG):

{context_text}

User request:
{user_request}
"""
    return prompt


# -----------------------------
# CLI (Optional)
# -----------------------------
if __name__ == "__main__":
    index_project()
    while True:
        query = input("\nEnter query (or 'exit'): ")
        if query.lower() == "exit":
            break
        type_filter = input(
            "Optional type filter (design, schema, domain, frontend, backend, architecture) or leave blank: "
        ).strip()
        type_filter = type_filter if type_filter else None
        top_chunks = query_rag(query, type_filter=type_filter)
        if not top_chunks:
            print("No relevant chunks found.")
        else:
            print("\nTop retrieved chunks:")
            for c in top_chunks:
                print("----")
                print(c)
