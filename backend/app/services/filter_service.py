import re

def filter_academic_boilerplate(raw_text: str) -> str:
    """
    Strips non-functional academic headers, cover page text, faculty names,
    signatures, and certificates from raw extracted requirements documents.
    """
    if not raw_text:
        return ""

    lines = raw_text.split('\n')
    cleaned_lines = []

    # Patterns matching academic boilerplate lines
    patterns = [
        r"certificate",
        r"bonafide",
        r"department of computer science",
        r"dayalbagh educational institute",
        r"b\.voc",
        r"submitted in partial fulfillment",
        r"guided by:",
        r"submitted by:",
        r"signature of",
        r"internal examiner",
        r"external examiner",
        r"head of department",
        r"declaration by candidate",
        r"acknowledgement",
        r"table of contents"
    ]

    for line in lines:
        stripped = line.strip().lower()
        if not stripped or len(stripped) < 3:
            continue

        # Check if line matches any academic boilerplate pattern
        is_boilerplate = any(re.search(pat, stripped) for pat in patterns)

        # Filter out standalone page numbers or date stamps
        if re.match(r"^(page\s*\d+|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})$", stripped):
            is_boilerplate = True

        if not is_boilerplate:
            cleaned_lines.append(line)

    result = "\n".join(cleaned_lines)

    # Safety fallback: if filter stripped too much, retain original text
    if len(result.strip()) < 50:
        return raw_text

    return result