#!/bin/bash
# Manual script to reindex the RAG system

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
RAG_DIR="$SCRIPT_DIR"

echo -e "${YELLOW}🔄 Reindexing RAG system...${NC}"

# Check if virtual environment exists
if [ ! -d "$RAG_DIR/.venv" ]; then
    echo -e "${RED}❌ Virtual environment not found${NC}"
    echo -e "${YELLOW}Setting up virtual environment...${NC}"
    python3 -m venv "$RAG_DIR/.venv"
    source "$RAG_DIR/.venv/bin/activate"
    pip install -r "$RAG_DIR/requirements.txt"
else
    source "$RAG_DIR/.venv/bin/activate"
fi

# Run indexing
cd "$RAG_DIR/tools" || exit 1

echo -e "${YELLOW}Indexing documents...${NC}"
python rag_service.py --non-interactive

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ RAG reindexing completed successfully${NC}"
else
    echo -e "${RED}❌ RAG reindexing failed${NC}"
    exit 1
fi

deactivate
