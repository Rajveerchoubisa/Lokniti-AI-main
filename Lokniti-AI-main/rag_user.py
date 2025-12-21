from operator import itemgetter
from langchain_openai import ChatOpenAI
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

HF_TOKEN = "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"


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

    llm = ChatOpenAI(
        base_url="https://router.huggingface.co/v1",
        api_key=HF_TOKEN,
        model="deepseek-ai/DeepSeek-R1",
        temperature=0.0,
    )

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
