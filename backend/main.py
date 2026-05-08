from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from models.domain import VerifyRequest, VerifyResponse, Source, ThreatCard
from services.nlp_service import NLPService
from services.search_service import SearchService
from services.llm_service import LLMService
from services.stance_service import StanceService

app = FastAPI(title="Anveshak AI API")

# Configure CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For MVP
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Services
search_service = SearchService()
llm_service = LLMService()
# Stance service will take a few seconds to load the model on first boot
stance_service = StanceService()

@app.post("/api/verify", response_model=VerifyResponse)
async def verify_claim(request: VerifyRequest):
    raw_text = request.text
    
    # 1. Normalize and Transliterate
    normalized_text = NLPService.normalize_text(raw_text)
    
    # 2. Extract Claim
    extraction = await llm_service.extract_claim(normalized_text)
    claim = extraction.get("claim", normalized_text)
    
    # 3. Parallel Web Search
    search_results = await search_service.parallel_search(claim)
    
    # 4. Evidence Synthesis
    synthesis = await llm_service.synthesize_evidence(claim, search_results)
    
    # 5. Check Dissent
    is_dissent = stance_service.is_legitimate_dissent(claim, raw_text)
    
    # Build Sources List
    sources = []
    # Deduplicate urls
    seen_urls = set()
    for res in search_results:
        url = res.get("url", "")
        if url and url not in seen_urls:
            sources.append(Source(url=url, title=res.get("title", "Source")))
            seen_urls.add(url)
    
    threat_card = None
    if synthesis.get("threat_tactic") and synthesis.get("threat_tactic") != "None":
        threat_card = ThreatCard(
            tactic=synthesis.get("threat_tactic"),
            technique=synthesis.get("threat_technique", "Unknown")
        )
        
    verdict = synthesis.get("verdict", "UNVERIFIABLE")
    if is_dissent and verdict in ["FALSE", "LIKELY FALSE"]:
        # The user might be criticizing a false claim rather than spreading it.
        # But this is just MVP heuristic
        pass
        
    return VerifyResponse(
        verdict=verdict,
        confidence=float(synthesis.get("confidence", 0.0)),
        reasoning=synthesis.get("reasoning", "Analysis complete."),
        sources=sources[:5],  # Limit to top 5
        threat_card=threat_card
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
