def route_query(question: str):
    q = question.lower()

    if "similar" in q or "precedent" in q or "cases like" in q:
        return "CASE_SIMILARITY"
    else:
        return "USER_DOC_QA"
