def build_rag_prompts(question: str, context_blocks: list[str]) -> tuple[str, str]:
    system_prompt = (
        "You are an enterprise knowledge assistant. "
        "Answer only using the provided context. "
        "If the answer is not in the context, say that the information is not available in the documents. "
        "Be concise and factual."
    )

    context_text = "\n\n".join(context_blocks)

    user_prompt = (
        f"Question:\n{question}\n\n"
        f"Context:\n{context_text}\n\n"
        "Instructions:\n"
        "- Use only the context above.\n"
        "- If unsure, say the answer is not available in the documents.\n"
        "- Cite the source chunk labels when possible."
    )

    return system_prompt, user_prompt
