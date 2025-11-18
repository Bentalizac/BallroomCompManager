# rag_query_helper.py
import sys

from rag_service import build_prompt


def main():
    if len(sys.argv) < 2:
        print("Usage: python rag_query_helper.py '<user request>' [type_filter]")
        sys.exit(1)

    user_request = sys.argv[1]
    type_filter = sys.argv[2] if len(sys.argv) > 2 else None

    prompt = build_prompt(user_request, top_k=5, type_filter=type_filter)
    print(prompt)


if __name__ == "__main__":
    main()
