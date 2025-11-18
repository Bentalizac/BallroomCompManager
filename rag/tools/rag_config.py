import os

# Project root (adjust if your monorepo root is different)
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))

# Chroma DB folder
DB_FOLDER = os.path.join(PROJECT_ROOT, "rag/tools/chroma_db")

# Paths to include in RAG
RAG_DIRS = [
    os.path.join(PROJECT_ROOT, "rag/design"),
    os.path.join(PROJECT_ROOT, "rag/schema"),
    os.path.join(PROJECT_ROOT, "rag/code"),
    os.path.join(PROJECT_ROOT, "rag/project-structure"),
    os.path.join(PROJECT_ROOT, "shared"),
    os.path.join(PROJECT_ROOT, "server/src"),
    os.path.join(PROJECT_ROOT, "client/src"),
]

# File types to index
FILE_TYPES = [".ts", ".tsx", ".md"]

# Max chunk size
MAX_CHUNK_SIZE = 800

# Directory to type mapping for filtering metadata
DIR_TYPE_MAP = {
    "rag/design": "design",
    "rag/schema": "schema",
    "shared": "domain",
    "server/src": "backend",
    "client/src": "frontend",
    "rag/project-structure": "architecture",
}
