from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.services.summarizer import LegalSummarizer
from app.services.document_processor import DocumentProcessor
import asyncio
import dotenv
from pypdf import PdfReader
from docx import Document
import io

app = FastAPI(title="Legal Document Summarizer API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class SummarizeTextRequest(BaseModel):
    text: str
    summary_length: str = "medium"
    document_type: str = "legal"

    def __init__(self, **data):
        super().__init__(**data)
        if self.summary_length not in ["short", "medium", "long"]:
            raise ValueError("summary_length must be one of: short, medium, long")

# Initialize services
summarizer = LegalSummarizer()
document_processor = DocumentProcessor()

@app.get("/")
async def root():
    return {"message": "Legal Document Summarizer API"}

@app.post("/summarize")
async def summarize_document(
    file: UploadFile = File(...),
    summary_length: str = "medium",
    document_type: str = "legal"
):
    try:
        # Read file content
        content = await file.read()
        filename = file.filename.lower()

        if filename.endswith('.pdf'):
            # Extract text from PDF
            pdf_reader = PdfReader(io.BytesIO(content))
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text()
        elif filename.endswith('.docx'):
            # Extract text from DOCX
            doc = Document(io.BytesIO(content))
            text = ""
            for para in doc.paragraphs:
                text += para.text + "\n"
        else:
            # Assume text file
            try:
                text = content.decode("utf-8")
            except UnicodeDecodeError:
                # If decoding fails, treat as binary or unsupported file
                raise HTTPException(status_code=400, detail="Unsupported file encoding or format")

        # Process document
        processed_text = await document_processor.process_document(text)

        # Generate summary
        summary = await summarizer.generate_summary(processed_text, summary_length, document_type)

        return JSONResponse(content={
            "summary": summary,
            "length": summary_length,
            "original_length": len(text)
        })

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print("Exception in /summarize:", traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/summarize/text")
async def summarize_text(request: SummarizeTextRequest):
    try:
        text = request.text
        summary_length = request.summary_length
        document_type = request.document_type

        if not text:
            raise HTTPException(status_code=422, detail="Text content is empty")

        # Process document
        processed_text = await document_processor.process_document(text)

        # Generate summary
        summary = await summarizer.generate_summary(processed_text, summary_length, document_type)

        return JSONResponse(content={
            "summary": summary,
            "length": summary_length,
            "original_length": len(text)
        })

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print("Exception in /summarize/text:", traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))
