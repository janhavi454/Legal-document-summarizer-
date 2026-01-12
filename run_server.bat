call legal_summarizer_env\Scripts\activate.bat
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
