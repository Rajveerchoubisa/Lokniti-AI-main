from operator import itemgetter
import os

from dotenv import load_dotenv
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI


load_dotenv()


def get_google_api_key():
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key or api_key == "replace_with_your_new_google_api_key":
        raise RuntimeError(
            "GOOGLE_API_KEY is missing. Add a valid key to the project root .env file."
        )
    return api_key


def build_chat_model():
    """Use the newest model first and fall back when it is overloaded."""
    api_key = get_google_api_key()
    primary = ChatGoogleGenerativeAI(
        model="gemini-3.8-flash",
        google_api_key=api_key,
        temperature=0.0,
        timeout=90,
        max_retries=1,
    )
    fallback = ChatGoogleGenerativeAI(
        model="gemini-3.5-flash",
        google_api_key=api_key,
        temperature=0.0,
        timeout=90,
        max_retries=2,
    )
    return primary.with_fallbacks([fallback])


def build_user_rag(documents):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=2000, chunk_overlap=300
    )
    chunks = splitter.split_documents(documents)

    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    vectordb = FAISS.from_documents(chunks, embeddings)
    retriever = vectordb.as_retriever(search_kwargs={"k": 8})

    llm = build_chat_model()

    prompt = ChatPromptTemplate.from_template("""
You are a legal assistant.
Answer strictly from the uploaded document.

Context:
{context}

Question:
{question}

If answer not found, say:
"I’m not sure based on the uploaded document."
""")

    def format_docs(docs):
        return "\n\n".join(d.page_content for d in docs)

    chain = (
        {
            "context": itemgetter("question") | retriever | format_docs,
            "question": itemgetter("question"),
        }
        | prompt
        | llm
        | StrOutputParser()
    )

    return chain
