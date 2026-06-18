import re
from typing import Dict, Any

class RiskAnalyzer:
    # Cyber-Intelligence Risk Patterns
    FEAR_PATTERNS = [
        r"\bdanger\b", r"\balert\b", r"\bleaked\b", r"\bwarning\b", 
        r"\bdeath\b", r"\bkilled\b", r"\bpoison\b", r"\bhack\b",
        r"\bthreat\b", r"\bpanic\b", r"\bcrisis\b"
    ]
    
    URGENCY_PATTERNS = [
        r"\bforward immediately\b", r"\bshare now\b", r"\burgent\b", 
        r"\bbefore it's deleted\b", r"\bdon't wait\b", r"\bbreaking\b",
        r"\bmust read\b", r"\bpass this on\b"
    ]
    
    CONSPIRACY_PATTERNS = [
        r"\bhidden agenda\b", r"\bsecret\b", r"\bgovernment cover-up\b", 
        r"\bthey don't want you to know\b", r"\bdeep state\b", r"\bmanipulation\b",
        r"\billuminati\b", r"\btruth revealed\b"
    ]

    def analyze(self, text: str) -> Dict[str, Any]:
        text = text.lower()
        
        fear_matches = [p for p in self.FEAR_PATTERNS if re.search(p, text)]
        urgency_matches = [p for p in self.URGENCY_PATTERNS if re.search(p, text)]
        conspiracy_matches = [p for p in self.CONSPIRACY_PATTERNS if re.search(p, text)]
        
        # Calculate scores
        fear_score = min(len(fear_matches) * 20, 100)
        urgency_score = min(len(urgency_matches) * 25, 100)
        conspiracy_score = min(len(conspiracy_matches) * 30, 100)
        
        # Weighted Risk Score
        total_risk_score = (fear_score * 0.4) + (urgency_score * 0.3) + (conspiracy_score * 0.3)
        
        return {
            "risk_score": round(total_risk_score, 2),
            "metrics": {
                "fear_level": fear_score,
                "urgency_level": urgency_score,
                "conspiracy_level": conspiracy_score
            },
            "patterns_detected": fear_matches + urgency_matches + conspiracy_matches
        }
