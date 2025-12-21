from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
import re

from ingest import save_file, extract_from_pdf, extract_from_image
from rag_user import build_user_rag
from rag import build_rag_chain
from router import route_query

app = FastAPI()

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

    clean = re.sub(r"<think>.*?</think>", "", raw, flags=re.DOTALL).strip()
    return {"answer": clean}
