import re
from typing import List

def chunk_large_document(text: str, max_chars_per_chunk: int = 4000, overlap_chars: int = 400) -> List[str]:
    """
    Sliding window chunker for large PRDs (30+ pages).
    Splits text across paragraph boundaries or sentence breaks to preserve semantic context,
    with configurable character overlap to prevent requirement splitting across token edges.
    """
    if not text or len(text) <= max_chars_per_chunk:
        return [text] if text else []

    # Prefer paragraph breaks first, fallback to newlines
    paragraphs = re.split(r'(\n\s*\n)', text)
    chunks: List[str] = []
    current_chunk = ""

    for segment in paragraphs:
        if len(current_chunk) + len(segment) <= max_chars_per_chunk:
            current_chunk += segment
        else:
            if current_chunk.strip():
                chunks.append(current_chunk.strip())
                # Add sliding overlap from end of current chunk
                overlap_text = current_chunk[-overlap_chars:] if len(current_chunk) > overlap_chars else ""
                current_chunk = overlap_text + segment
            else:
                # Fallback for single massive blocks with no paragraph breaks
                sub_start = 0
                while sub_start < len(segment):
                    sub_end = sub_start + max_chars_per_chunk
                    chunks.append(segment[sub_start:sub_end].strip())
                    sub_start = sub_end - overlap_chars

    if current_chunk.strip():
        chunks.append(current_chunk.strip())

    return chunks