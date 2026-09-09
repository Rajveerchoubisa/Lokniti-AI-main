"""RAG chain used for precedent and similar-case questions.

The current project does not yet include a searchable case-law database, so
this chain analyses the uploaded judgment and identifies the legal principles,
authorities, and precedent relationships contained in that document. It does
not invent external citations.
"""

from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from rag_user import build_chat_model


def build_rag_chain():
    """Build the chain used when the router detects a precedent query."""
    llm = build_chat_model()

    prompt = ChatPromptTemplate.from_template(
        """
You are a careful Indian legal research assistant.

Analyse only the uploaded-document extract below. Identify any cases,
statutes, constitutional provisions, or legal principles that are expressly
mentioned and explain how they relate to the user's question.

Do not invent case names, citations, holdings, or facts. If the extract does
not contain enough information to identify a similar case or precedent, say:
"The uploaded document does not contain enough information to identify a
specific similar precedent."

Uploaded-document extract:
{query}

Question:
{question}
"""
    )

    return prompt | llm | StrOutputParser()
