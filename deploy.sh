#!/bin/bash
# deploy.sh

echo "Starting Legal Document Summarizer Deployment..."

# Install dependencies
pip install -r requirements.txt

# Create necessary directories
mkdir -p logs
mkdir -p uploaded_documents

# Set environment variables
export DATABASE_URL="sqlite:///./legal_summaries.db"
export MODEL_NAME="facebook/bart-large-cnn"

# Start the application
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload