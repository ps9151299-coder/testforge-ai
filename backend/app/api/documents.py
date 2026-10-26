from fastapi import APIRouter, UploadFile, File, HTTPException
import io
from pypdf import PdfReader
import docx
from app.services.filter_service import filter_academic_boilerplate
from app.services.chunking_service import chunk_large_document

router = APIRouter(prefix="/documents", tags=["documents"])

@router.post("/upload")
async def upload_requirement_document(file: UploadFile = File(...)):
    filename = file.filename or "unknown"
    extracted_text = ""

    try:
        file_bytes = await file.read()

        if filename.endswith(".pdf"):
            reader = PdfReader(io.BytesIO(file_bytes))
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    extracted_text += text + "\n"

        elif filename.endswith(".docx"):
            doc = docx.Document(io.BytesIO(file_bytes))
            for para in doc.paragraphs:
                if para.text.strip():
                    extracted_text += para.text + "\n"

        elif filename.endswith(".txt"):
            extracted_text = file_bytes.decode("utf-8")

        else:
            raise HTTPException(
                status_code=400, 
                detail="Unsupported format. Only .pdf, .docx, and .txt files are supported."
            )

        if not extracted_text.strip():
            raise HTTPException(
                status_code=400,
                detail="Could not extract readable text from document. Ensure it is not a scanned image."
            )

        # 1. Apply Academic & Cover Page Filter
        cleaned_text = filter_academic_boilerplate(extracted_text)

        # 2. Apply Token-Aware Sliding Window Chunking for Large PRDs
        chunks = chunk_large_document(cleaned_text, max_chars_per_chunk=4000, overlap_chars=400)

        return {
            "status": "success",
            "filename": filename,
            "character_count": len(cleaned_text),
            "chunk_count": len(chunks),
            "chunks": chunks,
            "preview": cleaned_text[:350],
            "extracted_text": cleaned_text
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting text: {str(e)}")