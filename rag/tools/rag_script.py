import json
import os

import chromadb
from sentence_transformers import SentenceTransformer

# -----------------------------
# CONFIGURATION
# -----------------------------
# Project root is two levels up from this script
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))

# Persistent Chroma DB
DB_FOLDER = os.path.join(PROJECT_ROOT, "rag/tools/chroma_db")
os.makedirs(DB_FOLDER, exist_ok=True)

# Metadata for incremental indexing
META_FILE = os.path.join(PROJECT_ROOT, "rag/tools/chroma_indexed.json")

# Directories to include in RAG
RAG_DIRS = [
    "rag/design",
    "rag/schema",
    "rag/code",
    "rag/project-structure",
    "shared",
    "server/src",
    "client/src",
]

EXCLUDE_DIRS = ["node_modules", "dist", ".git"]
FILE_TYPES = [".ts", ".tsx", ".md"]
MAX_CHUNK_SIZE = 800

# Map directories to chunk types
DIR_TYPE_MAP = {
    "rag/design": "design",
    "rag/schema": "schema",
    "rag/code": "code",
    "rag/project-structure": "architecture",
    "shared": "domain",
    "server/src": "backend",
    "client/src": "frontend",
}


# -----------------------------
# HELPERS
# -----------------------------

SKIP_FILE_PATTERNS = [".d.ts", "node_modules", "dist", ".git"]


def should_skip_file(path: str) -> bool:
    return any(pat in path for pat in SKIP_FILE_PATTERNS)


def should_skip_chunk(chunk: str) -> bool:
    lines = chunk.splitlines()
    non_empty = [
        l.strip() for l in lines if l.strip() and not l.strip().startswith(("//", "*"))
    ]
    # Skip if chunk has less than 2 meaningful lines
    if len(non_empty) < 2:
        return True
    # Skip known TS boilerplate patterns
    boilerplate_keywords = [
        "ProjectLoadingStartEvent",
        "ProjectLoadingFinishEvent",
        "CompilerOptionsDiagnosticsRequest",
        "ProjectLanguageServiceStateEvent",
        "NavtoRequest",
        "FileSpan",
        "EventBody",
    ]
    if any(k in chunk for k in boilerplate_keywords):
        return True
    return False


def read_files(base_dirs, file_types):
    files_content = []
    for base_dir in base_dirs:
        full_base = os.path.join(PROJECT_ROOT, base_dir)
        if not os.path.exists(full_base):
            print(f"Warning: folder not found: {full_base}")
            continue
        for root, _, files in os.walk(full_base):
            if any(ex in root for ex in EXCLUDE_DIRS):
                continue
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


# Load embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")


def embed_texts(texts):
    return [e.tolist() for e in model.encode(texts, show_progress_bar=True)]


# -----------------------------
# LOAD METADATA
# -----------------------------
if os.path.exists(META_FILE):
    indexed_files = json.load(open(META_FILE, "r"))
else:
    indexed_files = {}

# -----------------------------
# INITIALIZE CHROMA CLIENT
# -----------------------------
client = chromadb.PersistentClient(path=DB_FOLDER)

# Create or get collection
collection = client.get_or_create_collection("monorepo_rag")

# -----------------------------
# INDEX FILES
# -----------------------------
files = read_files(RAG_DIRS, FILE_TYPES)
print(f"Found {len(files)} files to index...")

total_chunks = 0
for path, content in files:
    if should_skip_file(path):
        continue

    mtime = os.path.getmtime(path)
    if path in indexed_files and indexed_files[path] == mtime:
        continue  # skip unchanged files

    chunks = chunk_text(content)
    # Filter chunks
    filtered_chunks = [c for c in chunks if not should_skip_chunk(c)]
    if not filtered_chunks:
        continue

    embeddings = embed_texts(filtered_chunks)
    print(
        f"Indexing file: {os.path.relpath(path, PROJECT_ROOT)}, chunks: {len(filtered_chunks)}"
    )
    total_chunks += len(filtered_chunks)

    # Determine chunk type
    chunk_type = "unknown"
    for dir_key, type_name in DIR_TYPE_MAP.items():
        folder_path = os.path.join(PROJECT_ROOT, dir_key)
        if path.startswith(folder_path):
            chunk_type = type_name
            break

    for i, chunk in enumerate(filtered_chunks):
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


# Save metadata for incremental updates
with open(META_FILE, "w") as f:
    json.dump(indexed_files, f)

print(f"Indexing complete! Total chunks added: {total_chunks}")


# -----------------------------
# QUERY FUNCTION
# -----------------------------
def query_rag(query_text, top_k=5, type_filter=None):
    query_embedding = embed_texts([query_text])[0]
    results = collection.query(query_embeddings=[query_embedding], n_results=top_k)
    docs = results["documents"][0] if results["documents"] else []

    if type_filter:
        metadatas = results["metadatas"][0] if results["metadatas"] else []
        filtered_docs = [
            doc for doc, meta in zip(docs, metadatas) if meta.get("type") == type_filter
        ]
        return filtered_docs
    return docs


# -----------------------------
# INTERACTIVE CLI
# -----------------------------
if __name__ == "__main__":
    while True:
        query = input("\nEnter query (or 'exit'): ")
        if query.lower() == "exit":
            break
        type_filter = input(
            "Optional type filter (design, schema, domain, frontend, backend, architecture) or leave blank: "
        )
        type_filter = type_filter.strip() if type_filter else None
        top_chunks = query_rag(query, type_filter=type_filter)
        if not top_chunks:
            print("No relevant chunks found.")
        else:
            print("\nTop retrieved chunks:")
            for c in top_chunks:
                print("----")
                print(c)
