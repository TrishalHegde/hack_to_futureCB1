import os
import json
from openai import AsyncOpenAI
from typing import Dict, Any

class StanceService:
    def __init__(self):
        self.api_key = os.getenv("OPENROUTER_API_KEY")
        self.client = AsyncOpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=self.api_key,
        )
        self.model = "openai/gpt-4o-mini"

    async def analyze_stance(self, user_post: str, verified_claim: str) -> Dict[str, Any]:
        if not user_post or not verified_claim:
            return {
                "stance": "NEUTRAL",
                "reasoning": "Missing inputs",
                "emotional_tone": "Neutral",
                "confidence_score": 0.0
            }

        prompt = f"""
        You are a Disinformation Attribution Expert. You are provided with a 'User Post' and a 'Verified Claim' extracted from it.
        
        TASK:
        Determine if the user is SUPPORTING the claim (spreading it) or OPPOSING it (legitimate dissent/fact-checking).
        
        LOGIC:
        - If the user uses words like "Fake," "Don't believe," "Debunked," or expresses skepticism while quoting the claim, label as "DISSENT."
        - If the user presents the claim as a warning, news, or fact, label as "SUPPORT."
        
        OUTPUT FORMAT (JSON ONLY):
        {{
            "stance": "SUPPORT" | "DISSENT" | "NEUTRAL",
            "reasoning": "Short explanation of why this is dissent or support",
            "emotional_tone": "string (e.g., Alarmist, Sarcastic, Critical)",
            "confidence_score": 0.0 to 1.0
        }}
        
        User Post: {user_post}
        Verified Claim: {verified_claim}
        """

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"}
            )
            content = response.choices[0].message.content
            return json.loads(content)
        except Exception as e:
            print(f"Error analyzing stance: {e}")
            return {
                "stance": "NEUTRAL",
                "reasoning": f"Error occurred: {str(e)}",
                "emotional_tone": "Neutral",
                "confidence_score": 0.0
            }
