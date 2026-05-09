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

class RiskMetrics(BaseModel):
    fear_level: float
    urgency_level: float
    conspiracy_level: float
    total_risk_score: float

class VerifyResponse(BaseModel):
    verdict: str  # "TRUE", "LIKELY TRUE", "MIXED", "LIKELY FALSE", "FALSE", "UNVERIFIABLE"
    confidence: float
    reasoning: str
    translated_text: Optional[str] = None
    category: str = "General"
    risk_metrics: Optional[RiskMetrics] = None
    sources: List[Source]
    threat_card: Optional[ThreatCard] = None
    stance: Optional[str] = None
    emotional_tone: Optional[str] = None
