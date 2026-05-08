from typing import Dict, Any

class ForensicService:
    def calculate_multimodal_score(
        self, 
        linguistic_risk: float, 
        metadata_risk: float, 
        integrity_risk: float
    ) -> Dict[str, Any]:
        """
        Calculates a final manipulation risk score out of 100.
        
        Args:
            linguistic_risk: 0-100 (60% weight) - From transcript similarity + fear detection
            metadata_risk: 0-100 (20% weight) - Authenticity (0=Original, 100=Edited/Stripped)
            integrity_risk: 0-100 (20% weight) - Media consistency (0=Consistent, 100=Anomalous)
            
        Returns:
            Dict containing score and verdict.
        """
        # Weighted calculation
        final_score = (linguistic_risk * 0.60) + (metadata_risk * 0.20) + (integrity_risk * 0.20)
        
        # Determine Verdict
        if final_score >= 75:
            verdict = "High-Risk Manipulation"
        elif final_score >= 40:
            verdict = "Suspicious"
        else:
            verdict = "Verified"
            
        return {
            "score": round(final_score, 2),
            "verdict": verdict,
            "breakdown": {
                "linguistic_contribution": round(linguistic_risk * 0.60, 2),
                "metadata_contribution": round(metadata_risk * 0.20, 2),
                "integrity_contribution": round(integrity_risk * 0.20, 2)
            }
        }
