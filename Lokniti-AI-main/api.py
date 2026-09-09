from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import re

from ingest import save_file, extract_from_pdf, extract_from_image
from rag_user import build_user_rag
from rag import build_rag_chain
from router import route_query

app = FastAPI(title="Lokniti AI Research API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in os.getenv(
            "FRONTEND_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
        ).split(",")
        if origin.strip()
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CASE_RAG = build_rag_chain()
USER_SESSIONS = {}


class ChatRequest(BaseModel):
    session_id: str
    question: str


@app.post("/upload")
def upload(session_id: str, file: UploadFile = File(...)):
    path = save_file(file)

    if file.filename.endswith(".pdf"):
        docs = extract_from_pdf(path)
    else:
        docs = extract_from_image(path)

    USER_SESSIONS[session_id] = {
        "docs": docs,
        "rag": build_user_rag(docs)
    }

    return {"status": "uploaded"}


@app.post("/chat")
def chat(req: ChatRequest):
    if req.session_id not in USER_SESSIONS:
        return {"answer": "Please upload a document first."}

    intent = route_query(req.question)

    try:
        if intent == "USER_DOC_QA":
            rag = USER_SESSIONS[req.session_id]["rag"]
            raw = rag.invoke({"question": req.question})

        else:
            uploaded_text = "\n".join(
                d.page_content for d in USER_SESSIONS[req.session_id]["docs"]
            )[:4000]

            raw = CASE_RAG.invoke({
                "query": uploaded_text,
                "question": req.question
            })
    except Exception as exc:
        print(f"Chat model failed: {type(exc).__name__}: {exc}")
        raise HTTPException(
            status_code=503,
            detail="The AI model is temporarily busy. Please try again in a moment.",
        ) from exc

    # Some reasoning models wrap their entire response in <think> tags.  The
    # previous expression removed the tags *and everything inside them*, which
    # could turn a successful model response into an empty answer.  Keep the
    # model text and remove only the wrapper tags.
    clean = re.sub(r"</?think>", "", str(raw), flags=re.IGNORECASE).strip()
    if not clean:
        clean = (
            "The model returned an empty response. Please try asking the "
            "question in a different way."
        )
    return {"answer": clean}
