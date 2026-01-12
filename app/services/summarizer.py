from transformers import pipeline, AutoTokenizer
import asyncio

class LegalSummarizer:
    def __init__(self):
        # Initialize models for different document types
        self.models = {
            "legal": {
                "model": "facebook/bart-large-cnn",
                "tokenizer": AutoTokenizer.from_pretrained("facebook/bart-large-cnn"),
                "summarizer": pipeline("summarization", model="facebook/bart-large-cnn", device=-1)
            },
            "medical": {
                "model": "facebook/bart-large-cnn",  # Using BART for medical, can be replaced with medical-specific model
                "tokenizer": AutoTokenizer.from_pretrained("facebook/bart-large-cnn"),
                "summarizer": pipeline("summarization", model="facebook/bart-large-cnn", device=-1)
            },
            "general": {
                "model": "facebook/bart-large-cnn",  # Using BART for general
                "tokenizer": AutoTokenizer.from_pretrained("facebook/bart-large-cnn"),
                "summarizer": pipeline("summarization", model="facebook/bart-large-cnn", device=-1)
            }
        }
        self.max_input_length = 1024  # BART's max token length

    async def generate_summary(self, document_text: str, summary_length: str = "medium", document_type: str = "legal") -> str:
        return await self._generate_summary_transformers(document_text, summary_length, document_type)

    async def _generate_summary_transformers(self, document_text: str, summary_length: str, document_type: str) -> str:
        # Get model and tokenizer for the document type
        if document_type not in self.models:
            document_type = "general"  # Default to general

        model_name = self.models[document_type]["model"]
        tokenizer = self.models[document_type]["tokenizer"]
        summarizer = self.models[document_type]["summarizer"]

        # If text is too short, return as is
        if len(document_text.split()) < 10:
            return document_text

        length_params = {
            "short": {"max_length": 100, "min_length": 50},
            "medium": {"max_length": 200, "min_length": 100},
            "long": {"max_length": 250, "min_length": 100}
        }
        params = length_params.get(summary_length.lower(), length_params["medium"])

        input_ids = tokenizer.encode(document_text, return_tensors="pt")[0]
        if len(input_ids) > self.max_input_length:
            chunks = self._chunk_text_by_tokens(input_ids, self.max_input_length)
            chunk_summaries = []
            for chunk_ids in chunks:
                chunk_text = tokenizer.decode(chunk_ids, skip_special_tokens=True)
                chunk_summary = summarizer(chunk_text, **params, do_sample=False)[0]['summary_text']
                chunk_summaries.append(chunk_summary)
            combined_summary = ' '.join(chunk_summaries)
            combined_ids = tokenizer.encode(combined_summary, return_tensors="pt")[0]
            if len(combined_ids) > self.max_input_length:
                final_summary = summarizer(combined_summary, **params, do_sample=False)[0]['summary_text']
            else:
                final_summary = combined_summary
        else:
            summary_result = summarizer(document_text, **params, do_sample=False)
            final_summary = summary_result[0]['summary_text']

        return final_summary

    def _chunk_text_by_tokens(self, input_ids, max_length: int) -> list:
        chunks = []
        start = 0
        while start < len(input_ids):
            end = min(start + max_length, len(input_ids))
            chunks.append(input_ids[start:end])
            start = end
        return chunks
