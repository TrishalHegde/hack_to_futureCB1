from pydantic import BaseModel
from typing import List, Optional

class VerifyRequest(BaseModel):
    text: str

class Source(BaseModel):
    url: str
    title: str

class ThreatCard(BaseModel):
    tactic: str
    technique: str
    framework: str = "DISARM"

class VerifyResponse(BaseModel):
    verdict: str  # "TRUE", "LIKELY TRUE", "MIXED", "LIKELY FALSE", "FALSE", "UNVERIFIABLE"
    confidence: float
    reasoning: str
    sources: List[Source]
    threat_card: Optional[ThreatCard] = None
