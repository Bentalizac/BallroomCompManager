# Automatic RAG Reindexing

The BallroomCompManager RAG system automatically reindexes when you commit changes, ensuring the semantic search stays up-to-date with your codebase.

## How It Works

### Git Pre-Commit Hook
When you run `git commit`, a pre-commit hook automatically:

1. **Detects relevant file changes** - Checks if your commit includes:
   - Markdown files (`.md`) - Documentation updates
   - TypeScript files (`.ts`, `.tsx`) - Code changes
   - Excludes: `node_modules`, `.next`, `dist`, `build`

2. **Runs RAG indexing** - If relevant files changed:
   - Activates the Python virtual environment
   - Runs incremental indexing (only updates changed files)
   - Shows progress with colored output

3. **Completes commit** - The commit proceeds regardless of indexing success
   - ✅ Success: Green checkmark, commit continues
   - ❌ Failure: Red warning, commit still continues (RAG just might be stale)

### Example Output

```bash
$ git commit -m "Add authentication documentation"

📚 Relevant files changed, reindexing RAG...
rag/design/adr-003-supabase-auth-jwt.md
shared/data/types/user.ts

🔄 Running RAG indexing...
🔄 Indexing documents...
✅ Indexed 342 chunks
✅ RAG reindexing completed successfully

[main abc1234] Add authentication documentation
 2 files changed, 150 insertions(+)
```

## Manual Reindexing

### Quick Script
```bash
# From project root
./rag/reindex.sh
```

This script:
- Checks for virtual environment (creates if missing)
- Activates the venv
- Runs the RAG indexing
- Shows colored status output

### Manual Method
```bash
cd rag/tools
source ../.venv/bin/activate
python rag_service.py
```

### Via MCP Tool
If you have the MCP server running, use the `rag_ingest` tool:
```json
{
  "force_rebuild": false  // or true for complete rebuild
}
```

## Customizing Behavior

### Disable Auto-Reindex
If you want to disable automatic reindexing:

```bash
# Rename the hook to disable it
mv .git/hooks/pre-commit .git/hooks/pre-commit.disabled

# Re-enable later
mv .git/hooks/pre-commit.disabled .git/hooks/pre-commit
```

### Change Trigger Files
Edit `.git/hooks/pre-commit` and modify the `grep` pattern:

```bash
# Current pattern (line 16)
RELEVANT_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(md|ts|tsx)$' | grep -vE 'node_modules|\.next|dist|build')

# Example: Only index on markdown changes
RELEVANT_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.md$' | grep -vE 'node_modules')
```

### Force Full Rebuild
To force a complete rebuild in the pre-commit hook, edit line 54:

```python
# Change from:
chunks = ingest_documents(RAG_DIRS, force_rebuild=False)

# To:
chunks = ingest_documents(RAG_DIRS, force_rebuild=True)
```

## Troubleshooting

### Hook Not Running
```bash
# Check if hook is executable
ls -la .git/hooks/pre-commit

# Should show: -rwxr-xr-x

# If not, make it executable
chmod +x .git/hooks/pre-commit
```

### Virtual Environment Errors
```bash
# Recreate the virtual environment
cd rag
rm -rf .venv
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Indexing Takes Too Long
If indexing is slowing down your commits:

1. **Use incremental indexing** (default) - Only indexes changed files
2. **Skip large commits** - Temporarily disable the hook for bulk changes
3. **Adjust chunk size** - Edit `rag/tools/rag_config.py`:
   ```python
   MAX_CHUNK_SIZE = 2000  # Increase for faster indexing, decrease for better search
   ```

### MCP Server Shows Stale Results
```bash
# Force rebuild from command line
cd rag/tools
source ../.venv/bin/activate
python rag_service.py

# Or use the quick script
./rag/reindex.sh
```

## Performance Tips

### Fast Commits
For quick commits without waiting for reindexing:
```bash
# Skip all hooks
git commit --no-verify -m "Quick fix"
```

### Batch Changes
If making many small commits, consider:
1. Make all your changes
2. Disable the hook temporarily
3. Commit all changes
4. Re-enable hook
5. Run manual reindex once

### CI/CD Integration
For continuous integration, add reindexing to your pipeline:

```yaml
# Example GitHub Actions
- name: Reindex RAG
  run: |
    cd rag
    source .venv/bin/activate
    ./reindex.sh
```

## File Locations

- **Pre-commit hook**: `.git/hooks/pre-commit`
- **Manual script**: `rag/reindex.sh`
- **RAG service**: `rag/tools/rag_service.py`
- **Configuration**: `rag/tools/rag_config.py`
- **Index storage**: `rag/tools/chroma_db/`
- **Index metadata**: `rag/tools/chroma_indexed.json`

## Benefits

✅ **Always up-to-date** - RAG automatically reflects your latest changes  
✅ **Zero overhead** - Only runs when relevant files change  
✅ **Non-blocking** - Commit proceeds even if indexing fails  
✅ **Incremental** - Fast updates, only indexes changed files  
✅ **Flexible** - Easy to disable, customize, or run manually  
✅ **Visible** - Clear colored output shows what's happening  

## See Also

- [RAG README](./README.md) - Main RAG documentation
- [RAG SETUP](./SETUP.md) - Initial setup guide for collaborators
- [Design Docs](./design/README.md) - What gets indexed
