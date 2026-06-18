# VAULTX Intelligence API

VAULTX is a full-stack intelligence application designed to verify claims, analyze risks, and synthesize evidence using advanced natural language processing (NLP) and large language models (LLMs).

## Project Structure

The project is divided into two main parts:
- **`backend/`**: A Python-based API server built with FastAPI.
- **`frontend/`**: A React-based web interface built with Vite and Tailwind CSS.

## Tech Stack

### Backend
- **Framework**: FastAPI
- **Database**: SQLite (via SQLAlchemy)
- **AI/ML**: OpenAI, Groq, Sentence-Transformers, Tavily-Python
- **Key Services**: Claim Extraction, Web Search Synthesis, Stance Analysis, Risk Analysis, and Media Extraction (Image/Audio/Video/URL).

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Data Visualization**: Recharts, React Simple Maps
- **HTTP Client**: Axios

## Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+

### Running the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Activate the virtual environment (if it exists) or create a new one:
   - **Windows**: `venv\Scripts\activate`
   - **Mac/Linux**: `source venv/bin/activate`
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up your `.env` file in the `backend/` directory with necessary API keys (e.g., OpenAI, Groq, Tavily).
5. Start the server:
   ```bash
   python main.py
   # Alternatively: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```
   The API will be available at `http://localhost:8000`. You can view the Swagger UI documentation at `http://localhost:8000/docs`.

### Running the Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will be accessible at `http://localhost:5173`.

## Features
- **Claim Verification**: Extracts claims from raw text and synthesizes evidence using parallel web search.
- **Risk Analysis**: Measures fear, urgency, and conspiracy levels to generate an overall risk score.
- **Media Extraction**: Extracts claims directly from images, audio, video files, or URLs.
- **Threat Detection**: Identifies potential threat tactics and techniques related to the analyzed claims.
- **Live Statistics**: Monitors total claims, average risk scores, category distributions, and system health.
